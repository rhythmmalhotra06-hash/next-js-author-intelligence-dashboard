"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type {
  UnifiedAuthorProfile,
  UnresolvedNameMatch,
  UnmatchedAuthor,
  TopicTaxonomy,
  SortKey,
  SortDirection,
  MasteryKey,
  YearFilter,
  SessionTypeFilter,
  CrossProgramFilter,
} from "@/types/speaking";
import { UnifiedAuthorTable } from "./UnifiedAuthorTable";
import { TableControls } from "./TableControls";
import { BusinessInsights } from "./BusinessInsights";
import { MasteryFilter } from "./MasteryFilter";
import { SummaryMetrics } from "./SummaryMetrics";
import { UnmatchedAuthorsList } from "./UnmatchedAuthorsList";
import { FinanceDetailPanel } from "./FinanceDetailPanel";
import { MethodologyCard } from "./MethodologyCard";
import { TopBottomFive } from "@/components/speaking/TopBottomFive";
import { TopicTaxonomyPanel } from "./TopicTaxonomyPanel";
import { computeBusinessInsights, rankUnifiedTop5Bottom5 } from "@/lib/signals";
import { formatTimestamp } from "@/lib/format";
import Link from "next/link";

const ALL_MASTERIES: MasteryKey[] = [
  "speaking",
  "manifesting",
  "ai_mastery",
  "entrepreneurship",
  "spiritual",
  "social",
];

const PAGE_SIZE = 25;

interface Props {
  authors: UnifiedAuthorProfile[];
  unresolvedMatches: UnresolvedNameMatch[];
  unmatched: UnmatchedAuthor[];
  topics: TopicTaxonomy[];
  topicsSource: "module" | "ai";
  financeMatchRate: number;
  fetchedAt: string;
}

export function OverviewClient({ authors, unresolvedMatches, unmatched, topics, topicsSource, financeMatchRate, fetchedAt }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize filter state from URL params (persists across refreshes)
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [crossProgramFilter, setCrossProgramFilter] = useState<CrossProgramFilter>(
    () => (searchParams.get("cp") as CrossProgramFilter) ?? "all"
  );
  const [minRating, setMinRating] = useState(() => searchParams.get("mr") ?? "");
  const [minRewatch, setMinRewatch] = useState(() => searchParams.get("rw") ?? "");
  const [maxConsistency, setMaxConsistency] = useState(() => searchParams.get("mc") ?? "");
  const [yearFilter, setYearFilter] = useState<YearFilter>(
    () => (searchParams.get("yr") as YearFilter) ?? "all"
  );
  const [sessionTypeFilter, setSessionTypeFilter] = useState<SessionTypeFilter>(
    () => (searchParams.get("fmt") as SessionTypeFilter) ?? "all"
  );
  const [selectedMasteries, setSelectedMasteries] = useState<MasteryKey[]>(() => {
    const m = searchParams.get("m");
    if (!m) return ALL_MASTERIES;
    const keys = m.split(",").filter(k => ALL_MASTERIES.includes(k as MasteryKey)) as MasteryKey[];
    return keys.length > 0 ? keys : ALL_MASTERIES;
  });

  const [sortKey, setSortKey] = useState<SortKey>("authorName");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [selectedAuthor, setSelectedAuthor] = useState<UnifiedAuthorProfile | null>(null);
  const [page, setPage] = useState(0);

  // Sync filter state back to URL (debounced for search input)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (crossProgramFilter !== "all") params.set("cp", crossProgramFilter);
      if (minRating) params.set("mr", minRating);
      if (minRewatch) params.set("rw", minRewatch);
      if (maxConsistency) params.set("mc", maxConsistency);
      if (yearFilter !== "all") params.set("yr", yearFilter);
      if (sessionTypeFilter !== "all") params.set("fmt", sessionTypeFilter);
      if (selectedMasteries.length !== ALL_MASTERIES.length) {
        params.set("m", selectedMasteries.join(","));
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? "?" + qs : ""), { scroll: false });
    }, 300);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [searchQuery, crossProgramFilter, minRating, minRewatch, maxConsistency, yearFilter, sessionTypeFilter, selectedMasteries, pathname, router]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, crossProgramFilter, minRating, minRewatch, maxConsistency, yearFilter, sessionTypeFilter, selectedMasteries]);

  const filteredAuthors = useMemo(() => {
    return authors.filter(a => {
      const matchesSearch = a.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCP = true;
      if (crossProgramFilter === "1") matchesCP = a.crossProgramCount === 1;
      else if (crossProgramFilter === "2+") matchesCP = a.crossProgramCount >= 2;
      else if (crossProgramFilter === "3+") matchesCP = a.crossProgramCount >= 3;

      const matchesMastery = selectedMasteries.length === ALL_MASTERIES.length
        || a.masteries.some(m => selectedMasteries.includes(m));

      const matchesYear = yearFilter === "all" || a.years.includes(yearFilter);
      const matchesType = sessionTypeFilter === "all" || a.sessionTypes.includes(sessionTypeFilter);

      const rating = parseFloat(minRating);
      const matchesRating = isNaN(rating) || (a.overallAvgRating !== null && a.overallAvgRating >= rating);

      const rewatch = parseFloat(minRewatch) / 100;
      const matchesRewatch = isNaN(rewatch) || (a.overallRewatchRate !== null && a.overallRewatchRate >= rewatch);

      const consistency = parseFloat(maxConsistency);
      const matchesConsistency = isNaN(consistency) || (a.ratingConsistency !== null && a.ratingConsistency <= consistency);

      return matchesSearch && matchesCP && matchesMastery && matchesYear && matchesType && matchesRating && matchesRewatch && matchesConsistency;
    });
  }, [authors, searchQuery, crossProgramFilter, selectedMasteries, minRating, minRewatch, maxConsistency, yearFilter, sessionTypeFilter]);

  // Topic taxonomy — filter + recount based on selected masteries, then re-rank
  // and slice to top 10. Topics without per-mastery breakdown (older AI cache)
  // pass through with their original count when no filter is active.
  const filteredTopics = useMemo(() => {
    const allSelected = selectedMasteries.length === ALL_MASTERIES.length;
    const recounted = topics
      .map(t => {
        if (allSelected) return t;
        if (!t.lessonsByMastery) {
          // No breakdown available — drop it from a filtered view rather than
          // misrepresent it as belonging to the selected mastery.
          return null;
        }
        const filteredCount = selectedMasteries.reduce(
          (acc, m) => acc + (t.lessonsByMastery![m] ?? 0),
          0
        );
        if (filteredCount === 0) return null;
        return { ...t, lessonCount: filteredCount };
      })
      .filter((t): t is TopicTaxonomy => t !== null);
    return recounted
      .sort((a, b) => b.lessonCount - a.lessonCount)
      .slice(0, 10);
  }, [topics, selectedMasteries]);

  const sortedAuthors = useMemo(() => {
    return [...filteredAuthors].sort((a, b) => {
      let vA: unknown = a[sortKey as keyof UnifiedAuthorProfile];
      let vB: unknown = b[sortKey as keyof UnifiedAuthorProfile];

      if (sortKey === "totalCost2026") {
        vA = a.totalCost2026 ?? -1;
        vB = b.totalCost2026 ?? -1;
      } else if (sortKey === "totalCost2025") {
        vA = a.finance?.speakerFeeTotal2025 ?? -1;
        vB = b.finance?.speakerFeeTotal2025 ?? -1;
      }

      if (vA === vB) return 0;
      if (vA === null || vA === undefined) return 1;
      if (vB === null || vB === undefined) return -1;

      const res = (vA as number | string) < (vB as number | string) ? -1 : 1;
      return sortDir === "asc" ? res : -res;
    });
  }, [filteredAuthors, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedAuthors.length / PAGE_SIZE);
  const pagedAuthors = sortedAuthors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const insights = useMemo(() => computeBusinessInsights(filteredAuthors), [filteredAuthors]);
  const top5bottom5 = useMemo(() => rankUnifiedTop5Bottom5(filteredAuthors), [filteredAuthors]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setCrossProgramFilter("all");
    setMinRating("");
    setMinRewatch("");
    setMaxConsistency("");
    setYearFilter("all");
    setSessionTypeFilter("all");
    setSelectedMasteries(ALL_MASTERIES);
    setPage(0);
  };

  // Compute active filter count for the badge
  const activeFilterCount = [
    searchQuery !== "",
    crossProgramFilter !== "all",
    minRating !== "",
    minRewatch !== "",
    maxConsistency !== "",
    yearFilter !== "all",
    sessionTypeFilter !== "all",
    selectedMasteries.length !== ALL_MASTERIES.length,
  ].filter(Boolean).length;

  // Authors with qualitative AI intelligence
  const [qiSortKey, setQiSortKey] = useState<"authorName" | "transformationRate">("transformationRate");
  const [qiSortDir, setQiSortDir] = useState<SortDirection>("desc");

  const onQiSort = (key: "authorName" | "transformationRate") => {
    if (qiSortKey === key) {
      setQiSortDir(qiSortDir === "asc" ? "desc" : "asc");
    } else {
      setQiSortKey(key);
      setQiSortDir(key === "transformationRate" ? "desc" : "asc");
    }
  };

  const aiAuthors = useMemo(() => {
    const base = filteredAuthors.filter(a => a.aiAnalyzed && a.qualitativeIntelligence);
    return [...base].sort((a, b) => {
      let vA: string | number;
      let vB: string | number;
      if (qiSortKey === "authorName") {
        vA = a.authorName.toLowerCase();
        vB = b.authorName.toLowerCase();
      } else {
        vA = a.transformationRate ?? -1;
        vB = b.transformationRate ?? -1;
      }
      if (vA === vB) return 0;
      const res = vA < vB ? -1 : 1;
      return qiSortDir === "asc" ? res : -res;
    });
  }, [filteredAuthors, qiSortKey, qiSortDir]);

  return (
    <div className="of-page">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="of-page__header">
        <div>
          <p className="of-page__eyebrow">Cross-Mastery Intelligence</p>
          <h1 className="of-page__title">Author Intelligence</h1>
          <p className="of-page__subtitle">
            Performance, finance &amp; AI signals across all Mindvalley programs
          </p>
        </div>
        <div suppressHydrationWarning style={{ textAlign: "right", fontSize: 12 }} className="of-table__muted">
          Last refreshed: {formatTimestamp(fetchedAt)}
        </div>
      </div>

      {/* ── 1. Mastery filter — top of page ───────────────── */}
      <div className="of-section">
        <MasteryFilter selected={selectedMasteries} onFilterChange={setSelectedMasteries} />
      </div>

      {/* ── 2. Summary KPI cards ──────────────────────────── */}
      <div className="of-section">
        <SummaryMetrics authors={filteredAuthors} financeMatchRate={financeMatchRate} />
      </div>

      {/* ── 3. Business intelligence ──────────────────────── */}
      <div className="of-section">
        <h2 className="of-section__title">Business Intelligence</h2>
        <BusinessInsights insights={insights} />
      </div>

      {/* ── 4. Top 5 / Bottom 5 ───────────────────────────── */}
      <div className="of-section">
        <h2 className="of-section__title">Top 5 / Bottom 5 by rewatch rate</h2>
        <TopBottomFive data={top5bottom5} />
      </div>

      {/* ── 5. Qualitative AI feedback ────────────────────── */}
      {aiAuthors.length > 0 && (
        <div className="of-section">
          <h2 className="of-section__title">Qualitative Feedback Signals</h2>
          <div className="of-table-wrap">
            <table className="of-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className={`of-th--sortable${qiSortKey === "authorName" ? " of-th--sortable--active" : ""}`}
                      onClick={() => onQiSort("authorName")}
                    >
                      Author
                      <span className="of-th-arrow">{qiSortKey === "authorName" ? (qiSortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th>Top praise themes</th>
                  <th>Top criticism themes</th>
                  <th style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className={`of-th--sortable${qiSortKey === "transformationRate" ? " of-th--sortable--active" : ""}`}
                      onClick={() => onQiSort("transformationRate")}
                    >
                      Transformation rate
                      <span className="of-th-arrow">{qiSortKey === "transformationRate" ? (qiSortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {aiAuthors.map(a => (
                  <tr key={a.normalisedKey}>
                    <td style={{ fontWeight: 500 }}>
                      <Link
                        href={`/author/${encodeURIComponent(a.normalisedKey)}`}
                        style={{ color: "var(--mv-brand-content)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {a.authorName}
                      </Link>
                    </td>
                    <td style={{ color: "var(--mv-green-content)" }}>
                      {(a.qualitativeIntelligence?.topPraiseThemes ?? []).slice(0, 2).join(" · ") || "—"}
                    </td>
                    <td style={{ color: "var(--mv-orange-content)" }}>
                      {(a.qualitativeIntelligence?.topCriticismThemes ?? []).slice(0, 2).join(" · ") || "—"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {a.transformationRate !== null && a.transformationRate !== undefined
                        ? `${(Math.min(a.transformationRate, 1) * 100).toFixed(0)}%`
                        : <span className="of-table__muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="of-table__muted" style={{ fontSize: 11, padding: "6px 20px 12px" }}>
              Themes extracted by Claude from student feedback. Transformation rate = share of feedback indicating measurable life change.
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Topic taxonomy ─────────────────────────────── */}
      <div className="of-section">
        <h2 className="of-section__title">Topic Taxonomy</h2>
        <TopicTaxonomyPanel topics={filteredTopics} source={topicsSource} />
      </div>

      {/* ── 7. Author directory (with sticky filter bar) ──── */}
      <div className="of-section">
        <h2 className="of-section__title">Author Directory</h2>
        <p className="of-page__subtitle" style={{ marginTop: -6, marginBottom: 12, fontSize: 12 }}>
          Speaker Fee 2025 / 2026 columns show <strong>Mastery speaker fees only</strong>.
          Royalties are tracked on the Finance page and not included here.
        </p>

        <div style={{ marginBottom: 16 }}>
          <TableControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            crossProgramFilter={crossProgramFilter}
            onCrossProgramChange={setCrossProgramFilter}
            minRating={minRating}
            onMinRatingChange={setMinRating}
            minRewatch={minRewatch}
            onMinRewatchChange={setMinRewatch}
            maxConsistency={maxConsistency}
            onMaxConsistencyChange={setMaxConsistency}
            yearFilter={yearFilter}
            onYearChange={setYearFilter}
            sessionTypeFilter={sessionTypeFilter}
            onSessionTypeChange={setSessionTypeFilter}
            onReset={handleReset}
            totalCount={authors.length}
            filteredCount={filteredAuthors.length}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {selectedAuthor && (
          <div style={{ marginBottom: 16 }}>
            <FinanceDetailPanel author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />
          </div>
        )}

        <UnifiedAuthorTable
          authors={pagedAuthors}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          onCostClick={setSelectedAuthor}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <span className="of-table__muted" style={{ fontSize: 12 }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="mv-btn mv-btn--ghost mv-btn--sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
            >
              ← Prev
            </button>
            <button
              className="mv-btn mv-btn--ghost mv-btn--sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── 8. Unmatched + methodology + timestamp ────────── */}
      <div className="of-section">
        <UnmatchedAuthorsList unmatched={unmatched} />
      </div>

      <div className="of-section">
        <MethodologyCard />
      </div>
    </div>
  );
}
