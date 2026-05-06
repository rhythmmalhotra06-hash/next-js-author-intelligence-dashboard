/**
 * Pre-bake the AI enrichment cache.
 *
 * Run via:  npx tsx scripts/build-ai-cache.ts
 *
 * Why: page renders should not trigger Claude calls — they would fan out one
 * call per author on every refresh. This script runs the pipeline once,
 * writes .cache/enriched-authors.json, and the pages overlay that file at
 * request time.
 */

import "dotenv/config";
import { fetchAllMasteriesData } from "@/lib/multi-mastery-airtable";
import { buildUnifiedAuthorTable } from "@/lib/signals";
import { enrichUnifiedAuthorsWithAI, enrichTopicTaxonomy } from "@/lib/ai-enrichment";
import { saveEnrichedAuthors, saveAITopics } from "@/lib/ai-cache";

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not set — analysis will use mock fallbacks.");
  }

  console.log("[ai-cache] Fetching all masteries from Airtable...");
  const allData = await fetchAllMasteriesData();

  console.log("[ai-cache] Building unified author table...");
  const { unified } = await buildUnifiedAuthorTable(allData);

  console.log(`[ai-cache] Enriching ${unified.length} authors with Claude...`);
  await enrichUnifiedAuthorsWithAI(unified, allData);

  const analysed = unified.filter(a => a.aiAnalyzed).length;
  console.log(`[ai-cache] AI-analysed ${analysed}/${unified.length} authors (rest below feedback threshold).`);

  saveEnrichedAuthors(unified);
  console.log("[ai-cache] Wrote .cache/enriched-authors.json");

  console.log("[ai-cache] Building topic taxonomy from transcripts...");
  const allLessons = allData.flatMap(d => d.lessons);
  const topics = await enrichTopicTaxonomy(allLessons, unified);
  if (topics.length > 0) {
    saveAITopics(topics);
    console.log(`[ai-cache] Wrote .cache/topics.json (${topics.length} topics)`);
  } else {
    console.log("[ai-cache] No topics extracted — overview will fall back to module aggregation");
  }
}

main().catch((err) => {
  console.error("[ai-cache] Failed:", err);
  process.exit(1);
});
