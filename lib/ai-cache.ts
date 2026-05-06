import fs from "fs";
import path from "path";
import type { UnifiedAuthorProfile, TopicTaxonomy } from "@/types/speaking";

const ENRICHED_AUTHORS_FILE = path.join(process.cwd(), ".cache", "enriched-authors.json");
const TOPICS_FILE = path.join(process.cwd(), ".cache", "topics.json");

// Map keyed by normalisedKey → AI fields. Pages merge these onto the freshly
// computed unified table at request time so AI signals survive Airtable
// refreshes without needing another Claude run.
export interface EnrichedAuthorOverlay {
  aiAnalyzed: boolean;
  transformationRate: number | null;
  qualitativeIntelligence: UnifiedAuthorProfile["qualitativeIntelligence"];
}

export function loadEnrichedAuthors(): Record<string, EnrichedAuthorOverlay> {
  try {
    if (!fs.existsSync(ENRICHED_AUTHORS_FILE)) return {};
    return JSON.parse(fs.readFileSync(ENRICHED_AUTHORS_FILE, "utf-8"));
  } catch (err) {
    console.error("Failed to load enriched-authors cache:", err);
    return {};
  }
}

export function saveEnrichedAuthors(authors: UnifiedAuthorProfile[]): void {
  const overlay: Record<string, EnrichedAuthorOverlay> = {};
  for (const a of authors) {
    if (!a.aiAnalyzed) continue;
    overlay[a.normalisedKey] = {
      aiAnalyzed: true,
      transformationRate: a.transformationRate ?? null,
      qualitativeIntelligence: a.qualitativeIntelligence ?? null,
    };
  }
  const dir = path.dirname(ENRICHED_AUTHORS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ENRICHED_AUTHORS_FILE, JSON.stringify(overlay, null, 2), "utf-8");
}

// Returns null when no AI-derived topic cache is present so the caller can
// fall back to the cheap module-based aggregation.
export function loadAITopics(): TopicTaxonomy[] | null {
  try {
    if (!fs.existsSync(TOPICS_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(TOPICS_FILE, "utf-8"));
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (err) {
    console.error("Failed to load topics cache:", err);
    return null;
  }
}

export function saveAITopics(topics: TopicTaxonomy[]): void {
  const dir = path.dirname(TOPICS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2), "utf-8");
}

export function applyEnrichedOverlay(
  authors: UnifiedAuthorProfile[],
  overlay: Record<string, EnrichedAuthorOverlay>
): UnifiedAuthorProfile[] {
  return authors.map(a => {
    const e = overlay[a.normalisedKey];
    if (!e) return a;
    return {
      ...a,
      aiAnalyzed: e.aiAnalyzed,
      transformationRate: e.transformationRate,
      qualitativeIntelligence: e.qualitativeIntelligence,
    };
  });
}
