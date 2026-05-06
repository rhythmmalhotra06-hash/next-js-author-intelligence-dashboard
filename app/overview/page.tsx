export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { fetchAllMasteriesData } from "@/lib/multi-mastery-airtable";
import { fetchFinanceData } from "@/lib/finance-airtable";
import { buildUnifiedAuthorTable, joinFinanceToAuthors, computeTopicTaxonomy } from "@/lib/signals";
import { loadEnrichedAuthors, applyEnrichedOverlay, loadAITopics } from "@/lib/ai-cache";
import { OverviewClient } from "@/components/overview/OverviewClient";

export default async function OverviewPage() {
  // Capture fetch start time before hitting Airtable (not server render time)
  const fetchedAt = new Date().toISOString();

  // 1. Fetch all raw data from Airtable
  const [allData, rawFinance] = await Promise.all([
    fetchAllMasteriesData(),
    fetchFinanceData()
  ]);

  // 2. Build the unified author table (joins across programs)
  const { unified, unresolvedMatches } = await buildUnifiedAuthorTable(allData);

  // 2b. Overlay AI signals from the pre-baked cache (Sprint 5).
  const enrichedOverlay = loadEnrichedAuthors();
  const enriched = applyEnrichedOverlay(unified, enrichedOverlay);

  // 3. Join with finance data (Actual Transactions)
  const { unifiedWithFinance, unmatched, matchRate } = joinFinanceToAuthors(
    enriched,
    rawFinance.authorTotals
  );

  // 4. Topic taxonomy: prefer AI-derived topics from the pre-baked cache
  // (`scripts/build-ai-cache.ts`); fall back to the cheap module-based
  // aggregation when the cache is missing.
  const allLessons = allData.flatMap(d => d.lessons);
  const aiTopics = loadAITopics();
  const topics = aiTopics ?? computeTopicTaxonomy(allLessons);
  const topicsSource: "module" | "ai" = aiTopics ? "ai" : "module";

  return (
    <Suspense fallback={null}>
      <OverviewClient
        authors={unifiedWithFinance}
        unresolvedMatches={unresolvedMatches}
        unmatched={unmatched}
        financeMatchRate={matchRate}
        topics={topics}
        topicsSource={topicsSource}
        fetchedAt={fetchedAt}
      />
    </Suspense>
  );
}
