import { analyzeFeedbackBatch, analyzeTranscript, computeGoalAlignment } from "./ai-analysis";
import type {
  UnifiedAuthorProfile,
  CurriculumFitSlot,
  MasteryFeedbackRecord,
  MasteryLessonRecord,
  SpeakerEntity,
  MasteryKey,
  TopicTaxonomy,
} from "@/types/speaking";
import { normaliseName } from "./signals";

// Sprint 5 thresholds — split per AC.
const TRANSFORMATION_RATE_MIN_FEEDBACK = 10; // AC1: Speaking & Influence only
const QUALITATIVE_CARD_MIN_FEEDBACK = 3;     // AC2: any masteries

// Cap parallel Claude calls so one refresh doesn't fan out 100x.
const MAX_CONCURRENT_AI_CALLS = 1; // Groq free tier: serial calls to stay under TPM

interface BundleByMastery {
  masteryKey: MasteryKey;
  lessons: MasteryLessonRecord[];
  feedback: MasteryFeedbackRecord[];
  speakers: SpeakerEntity[];
}

async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}

/**
 * Enrich unified author profiles with AI-derived signals.
 * - Transformation rate (Sprint 5 AC1) gated to Speaking & Influence with ≥10 feedback.
 * - Qualitative themes (Sprint 5 AC2) for any author with ≥5 feedback across all masteries.
 * Mutates `unified` in place; returns it for chaining.
 */
export async function enrichUnifiedAuthorsWithAI(
  unified: UnifiedAuthorProfile[],
  allData: BundleByMastery[]
): Promise<UnifiedAuthorProfile[]> {
  // Build per-author feedback indices once: total across all masteries, plus
  // a Speaking-only slice for the AC1 gate.
  const allFeedbackByKey = new Map<string, MasteryFeedbackRecord[]>();
  const speakingFeedbackByKey = new Map<string, MasteryFeedbackRecord[]>();

  for (const bundle of allData) {
    for (const fb of bundle.feedback) {
      for (const rawName of fb.speakerNames ?? []) {
        const key = normaliseName(rawName);
        if (!key) continue;
        if (!allFeedbackByKey.has(key)) allFeedbackByKey.set(key, []);
        allFeedbackByKey.get(key)!.push(fb);
        if (bundle.masteryKey === "speaking") {
          if (!speakingFeedbackByKey.has(key)) speakingFeedbackByKey.set(key, []);
          speakingFeedbackByKey.get(key)!.push(fb);
        }
      }
    }
  }

  await pool(unified, MAX_CONCURRENT_AI_CALLS, async (author) => {
    const allFeedback = allFeedbackByKey.get(author.normalisedKey) ?? [];
    const allTexts = allFeedback
      .map(f => f.feedbackText)
      .filter((t): t is string => !!t && t.trim().length > 0);

    // AC2 — qualitative card threshold: ≥5 feedback across any masteries.
    if (allTexts.length < QUALITATIVE_CARD_MIN_FEEDBACK) return;

    const analysis = await analyzeFeedbackBatch(allTexts);
    author.aiAnalyzed = true;
    author.qualitativeIntelligence = analysis;

    // AC1 — transformation rate: Speaking & Influence only, ≥10 feedback in
    // that mastery. Otherwise leave `transformationRate` null.
    const speakingTexts = (speakingFeedbackByKey.get(author.normalisedKey) ?? [])
      .map(f => f.feedbackText)
      .filter((t): t is string => !!t && t.trim().length > 0);

    if (speakingTexts.length >= TRANSFORMATION_RATE_MIN_FEEDBACK) {
      // If the Speaking-only batch is identical to the cross-mastery batch
      // (e.g. author only teaches Speaking), reuse the rate. Otherwise do a
      // second pass scoped to Speaking.
      if (speakingTexts.length === allTexts.length) {
        author.transformationRate = analysis.transformationRate;
      } else {
        const speakingAnalysis = await analyzeFeedbackBatch(speakingTexts);
        author.transformationRate = speakingAnalysis.transformationRate;
      }
    } else {
      author.transformationRate = null;
    }
  });

  return unified;
}

/**
 * Topic Taxonomy AI fill-in (Sprint 5 AC4).
 *
 * For each lesson with a transcript, runs `analyzeTranscript` to extract
 * topic tags, aggregates by topic across the full dataset, and joins per-
 * topic transformation rate from the already-enriched author profiles.
 *
 * Both AI calls go through the filesystem cache in ai-analysis.ts, so
 * repeat runs over the same transcripts are free.
 *
 * Cap (TOPIC_TAXONOMY_LESSON_LIMIT) bounds the cold-pre-bake cost — a fresh
 * dataset analyses up to N transcripts; subsequent ones are picked up from
 * the cache. Pre-bake via `scripts/build-ai-cache.ts`.
 */
const TOPIC_TAXONOMY_LESSON_LIMIT = 80;

export async function enrichTopicTaxonomy(
  lessons: MasteryLessonRecord[],
  enrichedAuthors: UnifiedAuthorProfile[]
): Promise<TopicTaxonomy[]> {
  // Authors are looked up by normalised speaker name to read the per-author
  // transformation rate that PR-8 already computed.
  const authorByKey = new Map<string, UnifiedAuthorProfile>();
  for (const a of enrichedAuthors) authorByKey.set(a.normalisedKey, a);

  const candidates = lessons
    .filter(l => !!l.lessonTranscript && l.lessonTranscript.trim().length > 200)
    .slice(0, TOPIC_TAXONOMY_LESSON_LIMIT);

  if (candidates.length === 0) return [];

  // topic → aggregator
  const byTopic = new Map<string, {
    lessonCount: number;
    speakers: Map<string, number>;
    rates: number[]; // transformation rates from authors who taught this topic
  }>();

  await pool(candidates, MAX_CONCURRENT_AI_CALLS, async (lesson) => {
    let topics: string[] = [];
    try {
      const analysis = await analyzeTranscript(lesson.lessonTranscript!);
      topics = analysis.topics ?? [];
    } catch (err) {
      console.error(`[topic-taxonomy] analyzeTranscript failed for ${lesson.id}:`, err);
      return;
    }

    for (const topic of topics) {
      const norm = topic.trim();
      if (!norm) continue;
      let entry = byTopic.get(norm);
      if (!entry) {
        entry = { lessonCount: 0, speakers: new Map(), rates: [] };
        byTopic.set(norm, entry);
      }
      entry.lessonCount += 1;
      for (const rawName of lesson.speakerNames) {
        entry.speakers.set(rawName, (entry.speakers.get(rawName) ?? 0) + 1);
        const author = authorByKey.get(normaliseName(rawName));
        if (author?.transformationRate != null) {
          entry.rates.push(author.transformationRate);
        }
      }
    }
  });

  return Array.from(byTopic.entries())
    .map(([topic, { lessonCount, speakers, rates }]) => ({
      topic,
      lessonCount,
      transformationRate: rates.length > 0
        ? rates.reduce((a, b) => a + b, 0) / rates.length
        : null,
      topAuthors: Array.from(speakers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    }))
    .sort((a, b) => b.lessonCount - a.lessonCount)
    .slice(0, 10);
}

/**
 * Goal Alignment Delta for curriculum slots (Sprint 5 AC3).
 *
 * For each slot with a transcript, runs `analyzeTranscript` to extract topic
 * tags, then `computeGoalAlignment` against the onboarding-survey "Wants to
 * Learn" / "Goals" answers to produce a delta label and score.
 *
 * Both ai-analysis functions have a filesystem JSON cache, so repeat calls
 * with the same input are free. We still cap the cold-render fan-out at
 * MAX_GOAL_ALIGNMENT_SLOTS so a fresh dataset doesn't spend $5 on first load
 * — pre-bake via `scripts/build-ai-cache.ts` (extension pending) when you
 * want every slot covered.
 */
const MAX_GOAL_ALIGNMENT_SLOTS = 5;

export async function enrichCurriculumSlotsWithAI(
  slots: CurriculumFitSlot[],
  surveyGoals: string[] = []
): Promise<CurriculumFitSlot[]> {
  // Process newest cohort first so reviewers see current-year alignment.
  const candidates = slots
    .filter(s => !!s.lessonTranscript && s.lessonTranscript.trim().length > 200)
    .sort((a, b) => (b.yearCohort ?? "").localeCompare(a.yearCohort ?? ""))
    .slice(0, MAX_GOAL_ALIGNMENT_SLOTS);

  if (surveyGoals.length === 0 || candidates.length === 0) {
    return slots;
  }

  await pool(candidates, MAX_CONCURRENT_AI_CALLS, async (slot) => {
    try {
      const transcriptAnalysis = await analyzeTranscript(slot.lessonTranscript!);
      if (!transcriptAnalysis.topics || transcriptAnalysis.topics.length === 0) return;
      const alignment = await computeGoalAlignment(surveyGoals, transcriptAnalysis.topics);
      slot.aiGoalAlignment = alignment;
    } catch (err) {
      console.error(`[goal-alignment] Failed for slot ${slot.lessonId}:`, err);
    }
  });

  return slots;
}
