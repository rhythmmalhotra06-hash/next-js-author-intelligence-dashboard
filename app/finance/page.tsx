export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { fetchAllMasteriesData } from "@/lib/multi-mastery-airtable";
import { fetchFinanceDashboardData } from "@/lib/finance-dashboard-airtable";
import { buildUnifiedAuthorTable, buildFinanceDashboardRows } from "@/lib/signals";
import { loadEnrichedAuthors, applyEnrichedOverlay } from "@/lib/ai-cache";
import { FinanceClient } from "./FinanceClient";

export default async function FinancePage() {
  const fetchedAt = new Date().toISOString();

  try {
    const [rawFinance, allData] = await Promise.all([
      fetchFinanceDashboardData(),
      fetchAllMasteriesData(),
    ]);

    const { unified } = await buildUnifiedAuthorTable(allData);
    const enrichedOverlay = loadEnrichedAuthors();
    const enriched = applyEnrichedOverlay(unified, enrichedOverlay);

    const dashboardData = buildFinanceDashboardRows(rawFinance, enriched);

    return (
      <Suspense fallback={null}>
        <FinanceClient data={{ ...dashboardData, fetchedAt }} />
      </Suspense>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="of-page">
        <div className="of-callout of-callout--error">
          <div className="of-callout__body">
            <div className="of-callout__title">Could not load finance data</div>
            <div>{message}</div>
            {message.includes("AIRTABLE_PAT") && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                Create a <code>.env.local</code> file with{" "}
                <code>AIRTABLE_PAT=your_token</code> and restart the server.
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
}
