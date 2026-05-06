export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchMasteryData } from "@/lib/multi-mastery-airtable";
import { fetchOnboardingGoals } from "@/lib/airtable";
import {
  computeCurriculumFit,
  computeAuthorCraft,
  detectDivergence,
  rankTop5Bottom5,
} from "@/lib/signals";
import { enrichCurriculumSlotsWithAI } from "@/lib/ai-enrichment";
import { MASTERY_LABELS, MasteryKey } from "@/types/speaking";
import { MASTERY_SCHEMAS } from "@/lib/airtable-schema";
import { MasteryDrillDownTable } from "@/components/mastery/MasteryDrillDownTable";
import { AuthorCraftTable } from "@/components/speaking/AuthorCraftTable";
import { CurriculumFitTable } from "@/components/speaking/CurriculumFitTable";
import { LessonsTable } from "@/components/speaking/LessonsTable";
import { TopBottomFive } from "@/components/speaking/TopBottomFive";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tooltip } from "@/components/ui/Tooltip";
import { formatTimestamp } from "@/lib/format";

export default async function MasteryPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!Object.keys(MASTERY_LABELS).includes(key)) {
    notFound();
  }

  const masteryKey = key as MasteryKey;
  const schema = MASTERY_SCHEMAS.find(s => s.key === masteryKey);

  if (!schema) {
    notFound();
  }

  // Capture fetch start time before hitting Airtable
  const fetchedAt = new Date().toISOString();

  const data = await fetchMasteryData(schema);

  if (!data) {
    notFound();
  }

  const taggedLessons = data.lessons.map(l => ({ ...l, masteryKey }));
  const slots = computeCurriculumFit(taggedLessons);

  // Goal Alignment Delta — Speaking only (has transcripts + onboarding survey)
  if (masteryKey === "speaking") {
    try {
      const surveyGoals = await fetchOnboardingGoals();
      await enrichCurriculumSlotsWithAI(slots, surveyGoals);
    } catch (err) {
      console.error("[mastery-page] goal-alignment enrichment failed:", err);
    }
  }

  const authorCraft    = computeAuthorCraft(data.lessons, data.feedback);
  const divergenceFlags = detectDivergence(authorCraft, slots);
  const top5bottom5    = rankTop5Bottom5(authorCraft);

  const highCraftLowFit = divergenceFlags.filter(f => f.direction === "high-craft-low-fit");
  const lowCraftHighFit = divergenceFlags.filter(f => f.direction === "low-craft-high-fit");
  const flaggedAuthors  = authorCraft.filter(a => a.ratingFloorFlag);

  const label = MASTERY_LABELS[masteryKey];

  return (
    <main className="of-page">
      {/* Page header */}
      <div className="of-page__header">
        <div>
          <Breadcrumb crumbs={[{ label: "Overview", href: "/overview" }, { label }]} />
          <p className="of-page__eyebrow">{label}</p>
          <h1 className="of-page__title">Mastery Intelligence</h1>
          <p className="of-page__subtitle">
            Author craft, curriculum fit &amp; lesson performance
          </p>
        </div>
        <div className="of-table__muted" style={{ fontSize: 12, textAlign: "right" }} suppressHydrationWarning>
          Last updated: {formatTimestamp(fetchedAt)}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="of-metrics">
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--purple" />
            Total lessons
            <Tooltip text="All distinct lesson records for this mastery program, across all years and cohorts." />
          </div>
          <div className="of-metric__value">{data.lessons.length}</div>
          <div className="of-metric__sub">{label}</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--blue" />
            Authors profiled
            <Tooltip text="Authors with at least 2 sessions — minimum threshold for computing reliable craft signals like rewatch rate and rating trends." />
          </div>
          <div className="of-metric__value">{authorCraft.length}</div>
          <div className="of-metric__sub">With ≥ 2 sessions</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--red" />
            Rating floor flags
            <Tooltip text="Authors whose average session rating falls below 4.0. These authors are highlighted in the craft table and may need coaching or content review." />
          </div>
          <div className="of-metric__value">{flaggedAuthors.length}</div>
          <div className="of-metric__sub">Avg rating below 4.0</div>
        </div>
        <div className="of-metric">
          <div className="of-metric__label">
            <div className="of-metric__dot of-metric__dot--orange" />
            Divergence flags
            <Tooltip text="Authors where craft signals (rating, rewatch) and curriculum fit (attendance) point in opposite directions — e.g. strong content but low attendance, or vice versa." />
          </div>
          <div className="of-metric__value">{divergenceFlags.length}</div>
          <div className="of-metric__sub">Craft ≠ fit signal</div>
        </div>
      </div>

      {/* Divergence callouts */}
      {highCraftLowFit.length > 0 && (
        <div className="of-section">
          <div className="of-callout of-callout--info">
            <div className="of-callout__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="of-callout__body">
              <div className="of-callout__title">High craft · Low curriculum fit</div>
              <div>Strong content, but attendance or slot fit is underperforming: {highCraftLowFit.map(f => f.authorName).join(", ")}</div>
            </div>
          </div>
        </div>
      )}
      {lowCraftHighFit.length > 0 && (
        <div className="of-section">
          <div className="of-callout of-callout--warn">
            <div className="of-callout__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="of-callout__body">
              <div className="of-callout__title">Low craft · High curriculum fit</div>
              <div>High attendance but weaker content signals — review for content improvement: {lowCraftHighFit.map(f => f.authorName).join(", ")}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 / Bottom 5 */}
      <div className="of-section">
        <h2 className="of-section__title">Top 5 / Bottom 5 by rewatch rate</h2>
        <TopBottomFive data={top5bottom5} />
      </div>

      {/* Author craft signals */}
      <div className="of-section">
        <AuthorCraftTable profiles={authorCraft} />
      </div>

      {/* Curriculum fit */}
      <div className="of-section">
        <CurriculumFitTable slots={slots} />
      </div>

      {/* Lesson performance 2025 vs 2026 */}
      <div className="of-section">
        <div className="of-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Lesson Performance (2025 vs 2026)</h2>
          <MasteryDrillDownTable slots={slots} />
        </div>
      </div>

      {/* All lessons */}
      <div className="of-section">
        <h2 className="of-section__title">All lessons</h2>
        <LessonsTable lessons={data.lessons} />
      </div>
    </main>
  );
}
