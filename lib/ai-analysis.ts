import OpenAI from "openai";
import fs from "fs";
import path from "path";
import type {
  AIFeedbackAnalysis,
  AITranscriptAnalysis,
  AIGoalAlignment,
} from "@/types/speaking";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

// llama-3.1-8b-instant via Groq: higher free-tier TPM limit (20k vs 12k on 70B), fast.
const MODEL = "llama-3.1-8b-instant";

// ---------------------------------------------------------------------------
// Filesystem JSON cache — same exact batch → skip the API entirely.
// ---------------------------------------------------------------------------

const CACHE_DIR = path.join(process.cwd(), ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "ai-analysis.json");

interface AICache {
  feedbacks: Record<string, AIFeedbackAnalysis>;
  transcripts: Record<string, AITranscriptAnalysis>;
  goals: Record<string, AIGoalAlignment>;
}

function loadCache(): AICache {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(CACHE_FILE)) return { feedbacks: {}, transcripts: {}, goals: {} };
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return { feedbacks: {}, transcripts: {}, goals: {} };
  }
}

function saveCache(cache: AICache) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

function hashStrings(strings: string[]): string {
  const str = strings.join("|||");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

function extractJson<T>(text: string): T {
  const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(jsonStr) as T;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      const isRateLimit = status === 429;
      if (isRateLimit && attempt < retries) {
        const delay = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s, 40s
        console.warn(`Rate limited — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error("withRetry: exhausted retries");
}

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const FEEDBACK_SYSTEM = `You are an expert educational data analyst evaluating speaker effectiveness from student feedback.

For each batch of student feedback responses you receive, return a JSON object strictly matching this schema:
{
  "transformationRate": number,    // 0.0-1.0 — share of responses using "transformation language" (e.g. "I learned", "I applied", "This changed how I...", "I realised", "I'm doing differently")
  "topPraiseThemes": string[],     // top 3 most common themes of praise (concise phrases, e.g. "Clarity of explanation", "Actionable frameworks")
  "topCriticismThemes": string[],  // top 2 most common themes of constructive criticism or complaints
  "recommendScore": number         // 0-10 overall sentiment score
}

Output only the JSON object. No prose, no markdown fences.`;

const TRANSCRIPT_SYSTEM = `You are an expert curriculum analyst evaluating teaching transcripts.

For each transcript you receive, return a JSON object strictly matching this schema:
{
  "topics": string[],              // top 3-5 distinct topics covered
  "teachingTechniques": string[],  // up to 3 techniques used (e.g. "Socratic questioning", "Personal anecdote", "Live demonstration")
  "interactionStyle": string,      // one short phrase describing the interaction style
  "actionabilityScore": number     // 1-10 — how immediately actionable is the content
}

Output only the JSON object. No prose, no markdown fences.`;

const GOAL_ALIGNMENT_SYSTEM = `You are a curriculum-fit analyst comparing what students wanted to learn against what was actually taught.

For each pair of (student goals, taught topics) you receive, return a JSON object strictly matching this schema:
{
  "deltaLabel": string,  // 3-5 word label of the largest gap. Format: "Missed: [topic]" or "Exceeded: [topic]" or "Aligned"
  "score": number        // 0-100 alignment score
}

Output only the JSON object. No prose, no markdown fences.`;

// ---------------------------------------------------------------------------
// Analyzers
// ---------------------------------------------------------------------------

export async function analyzeFeedbackBatch(feedbacks: string[]): Promise<AIFeedbackAnalysis> {
  if (!feedbacks || feedbacks.length === 0) {
    return { transformationRate: 0, topPraiseThemes: [], topCriticismThemes: [], recommendScore: null };
  }

  const validFeedbacks = feedbacks.filter(f => f && f.trim().length > 0);
  if (validFeedbacks.length === 0) {
    return { transformationRate: 0, topPraiseThemes: [], topCriticismThemes: [], recommendScore: null };
  }

  const batch = validFeedbacks.slice(0, 20);
  const cacheKey = hashStrings(batch);
  const cache = loadCache();
  if (cache.feedbacks[cacheKey]) return cache.feedbacks[cacheKey];

  if (!process.env.GROQ_API_KEY) {
    console.warn("No OPENAI_API_KEY found, returning mock feedback analysis.");
    return {
      transformationRate: 0.65,
      topPraiseThemes: ["Actionable frameworks", "High energy delivery", "Clear storytelling"],
      topCriticismThemes: ["Felt rushed at the end", "Wanted more Q&A time"],
      recommendScore: 8.5,
    };
  }

  const userMessage = `Feedback batch (${batch.length} responses):\n\n${batch
    .map((f, i) => `[${i + 1}] ${f}`)
    .join("\n\n")}`;

  try {
    const response = await withRetry(() => openai.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: FEEDBACK_SYSTEM },
        { role: "user", content: userMessage },
      ],
    }));

    const text = response.choices[0].message.content ?? "";
    const result = extractJson<AIFeedbackAnalysis>(text);
    cache.feedbacks[cacheKey] = result;
    saveCache(cache);
    return result;
  } catch (err) {
    console.error("Groq API Error (Feedback):", err);
    return { transformationRate: 0, topPraiseThemes: ["Error analyzing themes"], topCriticismThemes: [], recommendScore: null };
  }
}

export async function analyzeTranscript(transcript: string): Promise<AITranscriptAnalysis> {
  if (!transcript || transcript.trim().length === 0) {
    return { topics: [], teachingTechniques: [], interactionStyle: "Unknown", actionabilityScore: 0 };
  }

  const cacheKey = hashStrings([transcript]);
  const cache = loadCache();
  if (cache.transcripts[cacheKey]) return cache.transcripts[cacheKey];

  if (!process.env.GROQ_API_KEY) {
    return {
      topics: ["Storytelling", "Public Speaking"],
      teachingTechniques: ["Case studies", "Live demonstrations"],
      interactionStyle: "Highly interactive",
      actionabilityScore: 8,
    };
  }

  const userMessage = `Transcript:\n\n${transcript.substring(0, 15000)}`;

  try {
    const response = await withRetry(() => openai.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRANSCRIPT_SYSTEM },
        { role: "user", content: userMessage },
      ],
    }));

    const text = response.choices[0].message.content ?? "";
    const result = extractJson<AITranscriptAnalysis>(text);
    cache.transcripts[cacheKey] = result;
    saveCache(cache);
    return result;
  } catch (err) {
    console.error("Groq API Error (Transcript):", err);
    return { topics: [], teachingTechniques: [], interactionStyle: "Error", actionabilityScore: 0 };
  }
}

export async function computeGoalAlignment(
  surveyGoals: string[],
  transcriptTopics: string[]
): Promise<AIGoalAlignment> {
  const cacheKey = hashStrings([...surveyGoals, "||VS||", ...transcriptTopics]);
  const cache = loadCache();
  if (cache.goals[cacheKey]) return cache.goals[cacheKey];

  if (!process.env.GROQ_API_KEY) {
    return { deltaLabel: "Missed: Advanced Strategy", score: 70 };
  }

  const userMessage = `Student goals:\n${surveyGoals.join(", ")}\n\nTaught topics:\n${transcriptTopics.join(", ")}`;

  try {
    const response = await withRetry(() => openai.chat.completions.create({
      model: MODEL,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: GOAL_ALIGNMENT_SYSTEM },
        { role: "user", content: userMessage },
      ],
    }));

    const text = response.choices[0].message.content ?? "";
    const result = extractJson<AIGoalAlignment>(text);
    cache.goals[cacheKey] = result;
    saveCache(cache);
    return result;
  } catch (err) {
    console.error("Groq API Error (Goal Alignment):", err);
    return { deltaLabel: "Error computing alignment", score: 0 };
  }
}
