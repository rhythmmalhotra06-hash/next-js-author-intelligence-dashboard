export const dynamic = "force-dynamic"; // always fetch live Airtable data at request time

import { fetchAllSpeakingData } from "@/lib/airtable";
import { computeAuthorCraft, computeCurriculumFit, detectDivergence, rankTop5Bottom5 } from "@/lib/signals";
import { LessonsTable } from "@/components/speaking/LessonsTable";
import { AuthorCraftTable } from "@/components/speaking/AuthorCraftTable";
import { CurriculumFitTable } from "@/components/speaking/CurriculumFitTable";
import { TopBottomFive } from "@/components/speaking/TopBottomFive";
import { WorkshopFeedbackPanel } from "@/components/speaking/WorkshopFeedbackPanel";
import { ScheduleTable } from "@/components/speaking/ScheduleTable";
import type { SpeakingDashboardData } from "@/types/speaking";

async function loadDashboard(): Promise<SpeakingDashboardData | { error: string }> {
  try {
    const { lessons, feedback, schedule, workshopFeedback, onboardingCount } =
      await fetchAllSpeakingData();

    const authorCraft     = computeAuthorCraft(lessons, feedback);
    const curriculumFit   = computeCurriculumFit(lessons);
    const divergenceFlags = detectDivergence(authorCraft, curriculumFit);
    const top5bottom5     = rankTop5Bottom5(authorCraft);

    return {
      lessons,
      authorCraft,
      curriculumFit,
      divergenceFlags,
      top5bottom5,
      schedule,
      workshopFeedback,
      onboardingCount,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default async function SpeakingPage() {
  const data = await loadDashboard();

  // Error state
  if ("error" in data) {
    return (
      <main className="of-page">
        <div className="of-callout of-callout--error">
          <div className="of-callout__body">
            <div className="of-callout__title">Could not load data</div>
            <div>{data.error}</div>
            {data.error.includes("AIRTABLE_PAT") && (
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

  const {
    lessons,
    authorCraft,
    curriculumFit,
    divergenceFlags,
    top5bottom5,
    schedule,
    workshopFeedback,
    onboardingCount,
    fetchedAt,
  } = data;

  const highCraftLowFit  = divergenceFlags.filter((f) => f.direction === "high-craft-low-fit");
  const lowCraftHighFit  = divergenceFlags.filter((f) => f.direction === "low-craft-high-fit");
  const flaggedAuthors   = authorCraft.filter((a) => a.ratingFloorFlag);

  return (
    <main className="of-page">
        {/* Page header */}
        <div className="of-page__header">
          <div>
            <p className="of-page__eyebrow">Speaking &amp; Influence</p>
            <h1 className="of-page__title">Speaker Intelligence</h1>
            <p className="of-page__subtitle">
              Author craft and curriculum fit signals — live data
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
            </div>
            <div className="of-metric__value">{lessons.length}</div>
            <div className="of-metric__sub">Speaking &amp; Influence</div>
          </div>
          <div className="of-metric">
            <div className="of-metric__label">
              <div className="of-metric__dot of-metric__dot--blue" />
              Authors profiled
            </div>
            <div className="of-metric__value">{authorCraft.length}</div>
            <div className="of-metric__sub">With ≥ 2 sessions</div>
          </div>
          <div className="of-metric">
            <div className="of-metric__label">
              <div className="of-metric__dot of-metric__dot--red" />
              Rating floor flags
            </div>
            <div className="of-metric__value">{flaggedAuthors.length}</div>
            <div className="of-metric__sub">Avg rating below 4.0</div>
          </div>
          <div className="of-metric">
            <div className="of-metric__label">
              <div className="of-metric__dot of-metric__dot--orange" />
              Divergence flags
            </div>
            <div className="of-metric__value">{divergenceFlags.length}</div>
            <div className="of-metric__sub">Craft vs. fit mismatch</div>
          </div>
          <div className="of-metric">
            <div className="of-metric__label">
              <div className="of-metric__dot of-metric__dot--blue" />
              Onboarding responses
            </div>
            <div className="of-metric__value">{onboardingCount}</div>
            <div className="of-metric__sub">Student baseline survey</div>
          </div>
        </div>

        {/* Divergence callouts */}
        {divergenceFlags.length > 0 && (
          <div className="of-section">
            {highCraftLowFit.length > 0 && (
              <div className="of-callout of-callout--info">
                <svg className="of-callout__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 5v3M8 11v.5" strokeLinecap="round" />
                </svg>
                <div className="of-callout__body">
                  <div className="of-callout__title">High craft, low attendance</div>
                  <div>
                    {highCraftLowFit.map((f) => f.authorName).join(", ")} have strong rewatch
                    rates but below-median attendance. Curriculum slot placement may be the issue.
                  </div>
                </div>
              </div>
            )}
            {lowCraftHighFit.length > 0 && (
              <div className="of-callout of-callout--warn">
                <svg className="of-callout__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2L15 14H1L8 2z" strokeLinejoin="round" />
                  <path d="M8 7v3M8 12v.5" strokeLinecap="round" />
                </svg>
                <div className="of-callout__body">
                  <div className="of-callout__title">High attendance, low rewatch</div>
                  <div>
                    {lowCraftHighFit.map((f) => f.authorName).join(", ")} fill seats but see
                    below-median rewatch engagement. Worth reviewing content quality.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top 5 / Bottom 5 */}
        <div className="of-section">
          <h2 className="of-section__title">Top 5 / Bottom 5 by rewatch rate</h2>
          <TopBottomFive data={top5bottom5} />
        </div>

        {/* Author Craft table */}
        <div className="of-section">
          <h2 className="of-section__title">Author craft signals</h2>
          <AuthorCraftTable profiles={authorCraft} />
        </div>

        {/* Curriculum Fit table */}
        <div className="of-section">
          <h2 className="of-section__title">Curriculum fit</h2>
          <CurriculumFitTable slots={curriculumFit} />
        </div>

        {/* Live session performance (Schedule) */}
        <div className="of-section">
          <h2 className="of-section__title">Live session performance</h2>
          <p className="of-page__subtitle" style={{ marginBottom: 12 }}>
            Per-session slots — AVR Rating sourced from Schedule rollup (authoritative).
            {" "}{schedule.filter((s) => s.avrRating !== null).length} of {schedule.length} sessions have ratings.
          </p>
          <ScheduleTable schedule={schedule} />
        </div>

        {/* Amsterdam workshop feedback */}
        {workshopFeedback.responseCount > 0 && (
          <div className="of-section">
            <h2 className="of-section__title">Amsterdam workshop · Aug 2025</h2>
            <WorkshopFeedbackPanel summary={workshopFeedback} subtitle="Amsterdam in-person workshop · August 2025" />
          </div>
        )}

        {/* All Lessons table */}
        <div className="of-section">
          <h2 className="of-section__title">All lessons</h2>
          <LessonsTable lessons={lessons} />
        </div>
    </main>
  );
}
