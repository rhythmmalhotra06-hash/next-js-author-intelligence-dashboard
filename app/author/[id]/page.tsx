export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchAllMasteriesData } from "@/lib/multi-mastery-airtable";
import { fetchFinanceData } from "@/lib/finance-airtable";
import { buildUnifiedAuthorTable, joinFinanceToAuthors } from "@/lib/signals";
import { loadEnrichedAuthors, applyEnrichedOverlay } from "@/lib/ai-cache";
import { AuthorProfileView } from "@/components/author/AuthorProfileView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatTimestamp } from "@/lib/format";

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  // 1. Fetch all data to build the profile
  const [allData, rawFinance] = await Promise.all([
    fetchAllMasteriesData(),
    fetchFinanceData()
  ]);

  // 2. Build the unified table
  const { unified } = await buildUnifiedAuthorTable(allData);

  // 2b. Overlay AI signals from the pre-baked cache (Sprint 5).
  const enrichedOverlay = loadEnrichedAuthors();
  const enriched = applyEnrichedOverlay(unified, enrichedOverlay);

  // 3. Join with finance
  const { unifiedWithFinance } = joinFinanceToAuthors(
    enriched,
    rawFinance.authorTotals
  );

  // 4. Find the specific author
  const author = unifiedWithFinance.find(a => a.normalisedKey === decodedId);

  if (!author) {
    notFound();
  }

  const fetchedAt = new Date().toISOString();

  return (
    <div className="of-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Breadcrumb crumbs={[{ label: "Overview", href: "/overview" }, { label: author.authorName }]} />
        <div
          className="of-table__muted"
          style={{ fontSize: 12 }}
          suppressHydrationWarning
        >
          Last updated: {formatTimestamp(fetchedAt)}
        </div>
      </div>
      <AuthorProfileView author={author} />
    </div>
  );
}