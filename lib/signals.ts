import {
  MasteryKey,
  MasteryLessonRecord,
  MasteryFeedbackRecord,
  LessonRecord,
  FeedbackRecord,
  AuthorCraftProfile,
  CurriculumFitSlot,
  DivergenceFlag,
  UnifiedAuthorProfile,
  UnresolvedNameMatch,
  PerMasterySignals,
  DivergenceDirection,
  Top5Bottom5,
  RankedAuthor,
  SpeakerEntity,
  AuthorFinanceData,
  FinanceJoinResult,
  UnmatchedAuthor,
  BusinessInsight,
  RankedInsightAuthor,
  TopicTaxonomy,
  MASTERY_LABELS,
  FinanceDashboardRow,
  FinanceFlag,
  ContractTerms,
  FinanceDashboardData,
  FinanceDashboardTransaction,
  SpendBreakdown,
  SpendBreakdownEntry,
  PaymentPipeline,
  AuthorEngagement,
  EngagementRollup,
  DecisionRecommendation,
  DecisionAction,
  StrategicInsights,
  RenewalQueueItem,
  DecisionCohort,
} from "@/types/speaking";
import type { RawAuthorTransactionTotals } from "@/lib/finance-airtable";
import type { RawFinanceDashboardData } from "@/lib/finance-dashboard-airtable";

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

// Common honorifics stripped before comparing names so "Dr. Jane Smith" merges
// with "Jane Smith" (Sprint 2 AC6).
const HONORIFIC_PATTERN = /^(?:dr|mr|mrs|ms|prof|professor|sir|dame)\b\.?\s+/;

export function normaliseName(raw: string): string {
  if (!raw) return "";
  let s = raw.toLowerCase().trim();
  // Strip honorifics repeatedly in case the source has multiple ("Prof. Dr. ...")
  while (HONORIFIC_PATTERN.test(s)) {
    s = s.replace(HONORIFIC_PATTERN, "");
  }
  return s
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein with a max-distance early termination — keeps the O(n²) duplicate
// scan cheap when most pairs are obviously different.
function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function isLikelyDuplicate(a: string, b: string): boolean {
  if (a === b) return false;
  if (a.length >= 6 && b.length >= 6 && levenshtein(a, b, 2) <= 2) return true;
  const tokA = new Set(a.split(" ").filter(t => t.length >= 2));
  const tokB = new Set(b.split(" ").filter(t => t.length >= 2));
  if (tokA.size >= 2 && tokB.size >= 2) {
    let shared = 0;
    for (const t of tokA) if (tokB.has(t)) shared++;
    if (shared >= 2) return true;
  }
  return false;
}

function avgOfNullable(vals: (number | null)[]): number | null {
  const filtered = vals.filter((v): v is number => v !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

function stdDev(vals: (number | null)[]): number | null {
  const filtered = vals.filter((v): v is number => v !== null);
  if (filtered.length < 2) return null;
  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const squareDiffs = filtered.map(v => Math.pow(v - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

// ---------------------------------------------------------------------------
// Signal Builders
// ---------------------------------------------------------------------------

export async function buildUnifiedAuthorTable(
  allData: { 
    masteryKey: MasteryKey; 
    lessons: MasteryLessonRecord[]; 
    feedback: MasteryFeedbackRecord[]; 
    speakers: SpeakerEntity[] 
  }[]
): Promise<{ unified: UnifiedAuthorProfile[]; unresolvedMatches: UnresolvedNameMatch[] }> {
  
  const authorsByNormalisedName = new Map<string, {
    displayName: string;
    variants: Set<string>;
    masteries: Set<MasteryKey>;
    lessons: MasteryLessonRecord[];
    feedback: MasteryFeedbackRecord[];
    summitSessionCount: number;
  }>();

  // 1. Group raw data by normalised author name
  for (const bundle of allData) {
    const { masteryKey, lessons, feedback, speakers } = bundle;
    
    // First, process speakers to get summit session counts
    const speakerMap = new Map<string, SpeakerEntity>();
    for (const s of speakers) {
      speakerMap.set(s.name, s);
    }

    for (const lesson of lessons) {
      for (const rawName of lesson.speakerNames) {
        const key = normaliseName(rawName);
        if (!key) continue;

        if (!authorsByNormalisedName.has(key)) {
          authorsByNormalisedName.set(key, {
            displayName: rawName,
            variants: new Set([rawName]),
            masteries: new Set(),
            lessons: [],
            feedback: [],
            summitSessionCount: 0
          });
        }
        
        const entry = authorsByNormalisedName.get(key)!;
        entry.variants.add(rawName);
        entry.masteries.add(masteryKey);
        entry.lessons.push(lesson);
        
        // Add summit sessions if speaker matches
        const speaker = speakerMap.get(rawName);
        if (speaker) {
          entry.summitSessionCount += (speaker.summitSessionIds?.length || 0);
        }
      }
    }

    // Attach feedback to authors
    for (const fb of feedback) {
      for (const rawName of fb.speakerNames) {
        const key = normaliseName(rawName);
        if (!key) continue;
        const entry = authorsByNormalisedName.get(key);
        if (entry) {
          entry.feedback.push(fb);
          entry.masteries.add(masteryKey);
        }
      }
    }
  }

  const unified: UnifiedAuthorProfile[] = [];

  // 2. Compute per-mastery and overall signals
  for (const [key, entry] of authorsByNormalisedName.entries()) {
    const perMastery: PerMasterySignals[] = [];
    const masteries = Array.from(entry.masteries);

    for (const mKey of masteries) {
      const mLessons = entry.lessons.filter(l => l.masteryKey === mKey);
      const mFeedback = entry.feedback.filter(f => f.masteryKey === mKey);
      
      const sessionCount = mLessons.length;
      const feedbackCount = mFeedback.length;
      const avgRating = avgOfNullable(mLessons.map(l => l.avgRating));
      
      const rewatchRate = avgOfNullable(mLessons.map(l => 
        l.enrolled && l.enrolled > 0 && l.recViews1w !== null ? l.recViews1w / l.enrolled : null
      ));
      
      const rewatchLongTail = avgOfNullable(mLessons.map(l => 
        l.recViews1w && l.recViews1w > 0 && l.recViews4w !== null ? l.recViews4w / l.recViews1w : null
      ));

      const followUpRate = feedbackCount > 0 
        ? mFeedback.filter(f => f.followUpNeeded).length / feedbackCount 
        : null;

      perMastery.push({
        masteryKey: mKey,
        sessionCount,
        feedbackCount,
        avgRating,
        rewatchRate,
        rewatchLongTail,
        followUpRate,
        ratingFloorFlag: avgRating !== null && avgRating < 4.0
      });
    }

    const overallAvgRating = avgOfNullable(perMastery.map(p => p.avgRating));
    const overallRewatchRate = avgOfNullable(perMastery.map(p => p.rewatchRate));
    const ratingConsistency = stdDev(perMastery.map(p => p.avgRating));
    const overallRatingFloor = perMastery.some(p => p.ratingFloorFlag);

    // Sprint 4 aggregations
    const years = Array.from(new Set(entry.lessons.map(l => l.yearCohort).filter((y): y is string => !!y)));
    const sessionTypes = Array.from(new Set(entry.lessons.map(l => l.type?.toLowerCase()).filter((t): t is string => !!t)));
    const sessionCount2026 = entry.lessons.filter(l => l.yearCohort === "2026").length;

    // Divergence logic
    let divergenceDirection: DivergenceDirection | null = null;
    const craft = overallRewatchRate; // Primary craft signal
    const fit = avgOfNullable(entry.lessons.map(l => 
      l.enrolled && l.enrolled > 0 && l.attendees !== null ? l.attendees / l.enrolled : null
    )); // Primary fit signal

    if (craft !== null && fit !== null) {
      if (craft > 0.6 && fit < 0.4) divergenceDirection = "high-craft-low-fit";
      if (craft < 0.4 && fit > 0.6) divergenceDirection = "low-craft-high-fit";
    }

    // Trajectory
    const rewatch2025 = avgOfNullable(entry.lessons.filter(l => l.yearCohort === "2025").map(l => 
      l.enrolled && l.enrolled > 0 && l.recViews1w !== null ? l.recViews1w / l.enrolled : null
    ));
    const rewatch2026 = avgOfNullable(entry.lessons.filter(l => l.yearCohort === "2026").map(l => 
      l.enrolled && l.enrolled > 0 && l.recViews1w !== null ? l.recViews1w / l.enrolled : null
    ));
    
    let cohortTrajectory: "up" | "down" | "flat" | null = null;
    if (rewatch2025 !== null && rewatch2026 !== null) {
      const diff = rewatch2026 - rewatch2025;
      if (diff > 0.05) cohortTrajectory = "up";
      else if (diff < -0.05) cohortTrajectory = "down";
      else cohortTrajectory = "flat";
    }

    unified.push({
      authorName: entry.displayName,
      normalisedKey: key,
      masteries,
      crossProgramCount: masteries.length,
      perMastery,
      overallRewatchRate,
      overallAvgRating,
      ratingConsistency,
      overallRatingFloor,
      years,
      sessionTypes,
      sessionCount2026,
      summitSessionCount: entry.summitSessionCount,
      divergenceDirection,
      cohortTrajectory,
      aiAnalyzed: false // Will be updated by Sprint 5 logic if enabled
    });
  }

  // Detect near-duplicate keys that escaped exact-match dedup.
  // Cap to avoid O(n²) blowing up on very large datasets.
  const MAX_UNRESOLVED = 50;
  const keys = Array.from(authorsByNormalisedName.keys());
  const unresolvedMatches: UnresolvedNameMatch[] = [];
  outer: for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (!isLikelyDuplicate(keys[i], keys[j])) continue;
      const entryA = authorsByNormalisedName.get(keys[i])!;
      const entryB = authorsByNormalisedName.get(keys[j])!;
      const masterySet = new Set<MasteryKey>([...entryA.masteries, ...entryB.masteries]);
      unresolvedMatches.push({
        variants: [entryA.displayName, entryB.displayName],
        masteries: Array.from(masterySet),
      });
      if (unresolvedMatches.length >= MAX_UNRESOLVED) break outer;
    }
  }

  return { unified, unresolvedMatches };
}

// ---------------------------------------------------------------------------
// Finance Joins
// ---------------------------------------------------------------------------

export function joinFinanceToAuthors(
  unified: UnifiedAuthorProfile[],
  authorTotals: RawAuthorTransactionTotals[]
): FinanceJoinResult {

  const financeMap = new Map<string, RawAuthorTransactionTotals>();
  for (const f of authorTotals) {
    const key = normaliseName(f.authorName);
    if (key) financeMap.set(key, f);
  }

  let matchedCount = 0;
  const unifiedWithFinance = unified.map(author => {
    const rawFinance = financeMap.get(author.normalisedKey);
    if (rawFinance) {
      matchedCount++;

      const fee2026 = rawFinance.speakerFeeTotal2026;
      const fee2025 = rawFinance.speakerFeeTotal2025;

      const costPerSession2026 = author.sessionCount2026 > 0 && fee2026 !== null
        ? fee2026 / author.sessionCount2026
        : null;

      const finance: AuthorFinanceData = {
        authorDisplayName: rawFinance.authorName,
        speakerFeeTotal2025: fee2025,
        speakerFeeTotal2026: fee2026,
        costPerSession2025: null,
        costPerSession2026
      };

      return {
        ...author,
        finance,
        transactions: rawFinance.transactions,
        totalCost2026: fee2026,
        costPerSession2026: costPerSession2026
      };
    }
    return author;
  });

  const unmatched: UnmatchedAuthor[] = unified
    .filter(a => !financeMap.has(a.normalisedKey))
    .map(a => ({
      authorName: a.authorName,
      normalisedKey: a.normalisedKey,
      sessionCount: a.perMastery.reduce((acc, p) => acc + p.sessionCount, 0),
      masteries: a.masteries
    }));

  return {
    unifiedWithFinance,
    unmatched,
    matchedCount,
    totalCount: unified.length,
    matchRate: unified.length > 0 ? matchedCount / unified.length : 0
  };
}

// ---------------------------------------------------------------------------
// Business Insights
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Curriculum Fit
// ---------------------------------------------------------------------------

export function computeCurriculumFit(
  lessons: (LessonRecord | MasteryLessonRecord)[]
): CurriculumFitSlot[] {
  return lessons.map(l => ({
    lessonId: l.id,
    lessonTitle: l.lessonTitle,
    speakerNames: l.speakerNames,
    module: l.module,
    yearCohort: l.yearCohort,
    type: l.type,
    attendees: l.attendees,
    enrolled: l.enrolled,
    attendanceRate: l.enrolled && l.enrolled > 0 && l.attendees !== null ? l.attendees / l.enrolled : null,
    avgRating: l.avgRating,
    rewatchRate: l.enrolled && l.enrolled > 0 && l.recViews1w !== null ? l.recViews1w / l.enrolled : null,
    masteryKey: "masteryKey" in l ? l.masteryKey : undefined,
    lessonTranscript: l.lessonTranscript ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Author Craft (Speaking page)
// ---------------------------------------------------------------------------

const CRAFT_MIN_SESSIONS = 2;
const RATING_FLOOR = 4.0;

export function computeAuthorCraft(
  lessons: LessonRecord[],
  feedback: FeedbackRecord[]
): AuthorCraftProfile[] {
  const byAuthor = new Map<string, {
    displayName: string;
    lessons: LessonRecord[];
    feedback: FeedbackRecord[];
  }>();

  for (const lesson of lessons) {
    for (const rawName of lesson.speakerNames) {
      const key = normaliseName(rawName);
      if (!key) continue;
      let entry = byAuthor.get(key);
      if (!entry) {
        entry = { displayName: rawName, lessons: [], feedback: [] };
        byAuthor.set(key, entry);
      }
      entry.lessons.push(lesson);
    }
  }

  for (const fb of feedback) {
    for (const rawName of fb.speakerNames) {
      const key = normaliseName(rawName);
      if (!key) continue;
      const entry = byAuthor.get(key);
      if (entry) entry.feedback.push(fb);
    }
  }

  const profiles: AuthorCraftProfile[] = [];
  for (const entry of byAuthor.values()) {
    if (entry.lessons.length < CRAFT_MIN_SESSIONS) continue;

    const avgRating = avgOfNullable(entry.lessons.map(l => l.avgRating));
    const rewatchRate = avgOfNullable(entry.lessons.map(l =>
      l.enrolled && l.enrolled > 0 && l.recViews1w !== null
        ? l.recViews1w / l.enrolled
        : null
    ));
    const rewatchLongTail = avgOfNullable(entry.lessons.map(l =>
      l.recViews1w && l.recViews1w > 0 && l.recViews4w !== null
        ? l.recViews4w / l.recViews1w
        : null
    ));
    const followUpRate = entry.feedback.length > 0
      ? entry.feedback.filter(f => f.followUpNeeded).length / entry.feedback.length
      : null;

    profiles.push({
      authorName: entry.displayName,
      sessionCount: entry.lessons.length,
      avgRating,
      rewatchRate,
      rewatchLongTail,
      followUpRate,
      ratingFloorFlag: avgRating !== null && avgRating < RATING_FLOOR,
      feedbackCount: entry.feedback.length,
      aiAnalyzed: false,
      transformationRate: null,
      qualitativeIntelligence: null,
    });
  }

  profiles.sort((a, b) => a.authorName.localeCompare(b.authorName));
  return profiles;
}

// ---------------------------------------------------------------------------
// Top / Bottom 5 by rewatch rate
// ---------------------------------------------------------------------------

export function rankTop5Bottom5(craft: AuthorCraftProfile[]): Top5Bottom5 {
  const ranked = craft
    .filter((p): p is AuthorCraftProfile & { rewatchRate: number } => p.rewatchRate !== null)
    .map(p => ({
      authorName: p.authorName,
      rewatchRate: p.rewatchRate,
      avgRating: p.avgRating,
      sessionCount: p.sessionCount,
    }));

  const top: RankedAuthor[] = [...ranked]
    .sort((a, b) => b.rewatchRate - a.rewatchRate)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p }));

  const bottom: RankedAuthor[] = [...ranked]
    .sort((a, b) => a.rewatchRate - b.rewatchRate)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p }));

  return { top, bottom };
}

// Cross-mastery variant: rank by overall rewatch rate aggregated across all
// masteries the author has taught in. Powers the Top/Bottom 5 panel on the
// Overview page where authors are unified, not single-mastery.
export function rankUnifiedTop5Bottom5(unified: UnifiedAuthorProfile[]): Top5Bottom5 {
  const ranked = unified
    .filter((p): p is UnifiedAuthorProfile & { overallRewatchRate: number } => p.overallRewatchRate !== null)
    .map(p => ({
      authorName: p.authorName,
      rewatchRate: p.overallRewatchRate,
      avgRating: p.overallAvgRating,
      sessionCount: p.perMastery.reduce((acc, pm) => acc + pm.sessionCount, 0),
    }));

  const top: RankedAuthor[] = [...ranked]
    .sort((a, b) => b.rewatchRate - a.rewatchRate)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p }));

  const bottom: RankedAuthor[] = [...ranked]
    .sort((a, b) => a.rewatchRate - b.rewatchRate)
    .slice(0, 5)
    .map((p, i) => ({ rank: i + 1, ...p }));

  return { top, bottom };
}

// ---------------------------------------------------------------------------
// Divergence Detection
// ---------------------------------------------------------------------------

const DIVERGENCE_HIGH = 0.6;
const DIVERGENCE_LOW = 0.4;

export function detectDivergence(
  craft: AuthorCraftProfile[],
  fit: CurriculumFitSlot[]
): DivergenceFlag[] {
  const attendanceByAuthor = new Map<string, { rates: number[]; lessonTitles: string[] }>();
  for (const slot of fit) {
    if (slot.attendanceRate === null) continue;
    for (const speakerName of slot.speakerNames) {
      const key = normaliseName(speakerName);
      if (!key) continue;
      let entry = attendanceByAuthor.get(key);
      if (!entry) {
        entry = { rates: [], lessonTitles: [] };
        attendanceByAuthor.set(key, entry);
      }
      entry.rates.push(slot.attendanceRate);
      entry.lessonTitles.push(slot.lessonTitle);
    }
  }

  const flags: DivergenceFlag[] = [];
  for (const profile of craft) {
    if (profile.rewatchRate === null) continue;
    const key = normaliseName(profile.authorName);
    const att = attendanceByAuthor.get(key);
    if (!att || att.rates.length === 0) continue;

    const avgAttendance = att.rates.reduce((a, b) => a + b, 0) / att.rates.length;
    const rewatch = profile.rewatchRate;

    let direction: DivergenceDirection | null = null;
    if (rewatch > DIVERGENCE_HIGH && avgAttendance < DIVERGENCE_LOW) {
      direction = "high-craft-low-fit";
    } else if (rewatch < DIVERGENCE_LOW && avgAttendance > DIVERGENCE_HIGH) {
      direction = "low-craft-high-fit";
    }
    if (!direction) continue;

    flags.push({
      authorName: profile.authorName,
      direction,
      craftSignal: rewatch,
      fitSignal: avgAttendance,
      lessonTitles: att.lessonTitles,
    });
  }
  return flags;
}

// ---------------------------------------------------------------------------
// Topic Taxonomy (skeleton — AI fill-in lands in Phase C)
// ---------------------------------------------------------------------------

// Aggregates lessons by Module as a proxy for "topics taught" until the AI
// topic-extraction pipeline runs. transformationRate stays null here; the AI
// pass overlays it later.
export function computeTopicTaxonomy(lessons: MasteryLessonRecord[]): TopicTaxonomy[] {
  const byTopic = new Map<string, { count: number; speakers: Map<string, number> }>();
  for (const l of lessons) {
    // Module is the preferred topic bucket; fall back to mastery label so non-
    // Speaking masteries (where module linking isn't implemented yet) still
    // contribute to the taxonomy until the AI topic extractor lands.
    const topic = l.module ?? MASTERY_LABELS[l.masteryKey];
    let entry = byTopic.get(topic);
    if (!entry) {
      entry = { count: 0, speakers: new Map() };
      byTopic.set(topic, entry);
    }
    entry.count += 1;
    for (const speaker of l.speakerNames) {
      entry.speakers.set(speaker, (entry.speakers.get(speaker) || 0) + 1);
    }
  }

  return Array.from(byTopic.entries())
    .map(([topic, { count, speakers }]) => ({
      topic,
      lessonCount: count,
      transformationRate: null,
      topAuthors: Array.from(speakers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    }))
    .sort((a, b) => b.lessonCount - a.lessonCount)
    .slice(0, 10);
}

export function computeBusinessInsights(authors: UnifiedAuthorProfile[]): BusinessInsight[] {
  const topPerformers: RankedInsightAuthor[] = authors
    .filter(a => a.overallAvgRating !== null && a.overallAvgRating >= 4.7)
    .sort((a, b) => (b.overallAvgRating || 0) - (a.overallAvgRating || 0))
    .slice(0, 5)
    .map(a => ({
      authorName: a.authorName,
      normalisedKey: a.normalisedKey,
      primaryMetric: `Rating ${a.overallAvgRating?.toFixed(2)}`,
      detail: `${a.masteries.length} programs`
    }));

  const atRisk: RankedInsightAuthor[] = authors
    .filter(a => a.overallRatingFloor || (a.overallAvgRating !== null && a.overallAvgRating < 4.2))
    .sort((a, b) => (a.overallAvgRating || 5) - (b.overallAvgRating || 5))
    .slice(0, 5)
    .map(a => ({
      authorName: a.authorName,
      normalisedKey: a.normalisedKey,
      primaryMetric: `Rating ${a.overallAvgRating?.toFixed(2)}`,
      detail: a.overallRatingFloor ? "Rating Floor Triggered" : "Low average"
    }));

  const volumeLeaders: RankedInsightAuthor[] = authors
    .sort((a, b) => {
      const aCount = a.perMastery.reduce((acc, p) => acc + p.sessionCount, 0);
      const bCount = b.perMastery.reduce((acc, p) => acc + p.sessionCount, 0);
      return bCount - aCount;
    })
    .slice(0, 5)
    .map(a => ({
      authorName: a.authorName,
      normalisedKey: a.normalisedKey,
      primaryMetric: `${a.perMastery.reduce((acc, p) => acc + p.sessionCount, 0)} sessions`,
      detail: `${a.masteries.length} programs`
    }));

  return [
    {
      category: "top_performers",
      title: "Top Performers",
      action: "Scale these",
      description: "Highest average ratings across all programs.",
      authors: topPerformers
    },
    {
      category: "at_risk",
      title: "At Risk",
      action: "Review or Coach",
      description: "Low ratings or rating floor triggered.",
      authors: atRisk
    },
    {
      category: "volume_leaders",
      title: "Volume Leaders",
      action: "Reward / Retain",
      description: "Most sessions taught in the dataset.",
      authors: volumeLeaders
    }
  ];
}
// =============================================================================
// FINANCE INTELLIGENCE DASHBOARD  (Author Finance page)
// =============================================================================

// ---------------------------------------------------------------------------
// Contract term extraction — regex-based, best-effort
// ---------------------------------------------------------------------------

export function extractContractTerms(summary: string | null): ContractTerms {
  if (!summary) return { royaltyPct: null, renewalDate: null, feeAmount: null };

  // Royalty %: "15%", "15 percent", "royalty of 15"
  const royaltyMatch = summary.match(/royalt(?:y|ies)[^\d]*(\d{1,3})(?:\.\d+)?%?/i)
    ?? summary.match(/(\d{1,3})(?:\.\d+)?%\s*royalt/i);
  const royaltyPct = royaltyMatch ? parseFloat(royaltyMatch[1]) : null;

  // Fee amount: "$10,000" or "USD 10,000" or "fee of $10,000"
  const feeMatch = summary.match(/(?:fee|amount)[^\d$]*\$?([\d,]+(?:\.\d+)?)/i)
    ?? summary.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  const feeAmount = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, "")) : null;

  // Renewal / expiry date: looks for ISO dates, US dates, or month-year patterns
  const datePatterns = [
    /(?:renewal|expir(?:y|es?|ation)|valid\s+until|term\s+ends?)[^\d]*(\d{4}-\d{2}-\d{2})/i,
    /(?:renewal|expir(?:y|es?|ation)|valid\s+until|term\s+ends?)[^\d]*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
  ];
  let renewalDate: string | null = null;
  for (const pat of datePatterns) {
    const m = summary.match(pat);
    if (m) { renewalDate = m[1]; break; }
  }

  return { royaltyPct, renewalDate, feeAmount };
}

// ---------------------------------------------------------------------------
// Fee trajectory
// ---------------------------------------------------------------------------

function computeFeeTrajectory(
  total2025: number | null,
  total2026: number | null
): FinanceDashboardRow["feeTrajectory"] {
  if (total2025 === null || total2026 === null) return null;
  if (total2025 === 0) return total2026 > 0 ? "Increasing" : "Stable";
  const delta = (total2026 - total2025) / total2025;
  if (delta > 0.05)  return "Increasing";
  if (delta < -0.05) return "Decreasing";
  return "Stable";
}

// ---------------------------------------------------------------------------
// Spend breakdown — group transactions by category
// ---------------------------------------------------------------------------

function groupSpend(
  txList: FinanceDashboardTransaction[],
  pickKey: (tx: FinanceDashboardTransaction) => string | null
): SpendBreakdownEntry[] {
  const totals = new Map<string, { amount: number; count: number }>();
  let grandTotal = 0;

  for (const tx of txList) {
    const key = pickKey(tx);
    if (!key) continue;
    const amt = tx.invoiceAmount ?? 0;
    if (!totals.has(key)) totals.set(key, { amount: 0, count: 0 });
    const e = totals.get(key)!;
    e.amount += amt;
    e.count  += 1;
    grandTotal += amt;
  }

  return Array.from(totals.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      pct: grandTotal > 0 ? amount / grandTotal : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function computeSpendBreakdown(txList: FinanceDashboardTransaction[]): SpendBreakdown {
  return {
    byGlCode:     groupSpend(txList, (tx) => tx.glCode),
    byProduct:    groupSpend(txList, (tx) => tx.productName),
    byDepartment: groupSpend(txList, (tx) => tx.department),
  };
}

// ---------------------------------------------------------------------------
// Payment pipeline — money in flight per author
// ---------------------------------------------------------------------------

function isCompleted(tx: FinanceDashboardTransaction): boolean {
  if (tx.paymentCompletionDate) return true;
  const status = (tx.paymentStatus ?? "").toLowerCase();
  return status.includes("completed") || status.includes("paid");
}

function isInTransit(tx: FinanceDashboardTransaction): boolean {
  if (isCompleted(tx)) return false;
  if (tx.paymentInitiatedDate) return true;
  const status = (tx.paymentStatus ?? "").toLowerCase();
  return status.includes("initiated") || status.includes("processing") || status.includes("transit");
}

function isApprovedNotPaid(tx: FinanceDashboardTransaction): boolean {
  if (isCompleted(tx) || isInTransit(tx)) return false;
  if (tx.billApprovedOn) return true;
  const billStatus = (tx.billStatus ?? "").toLowerCase();
  return billStatus.includes("approved");
}

function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function computePaymentPipeline(txList: FinanceDashboardTransaction[]): PaymentPipeline {
  const pipeline: PaymentPipeline = {
    pendingApproval: { count: 0, amount: 0 },
    approvedNotPaid: { count: 0, amount: 0 },
    inTransit:       { count: 0, amount: 0 },
    completed:       { count: 0, amount: 0 },
    avgDaysToPay:    null,
    stuckCount:      0,
    currencies:      [],
  };

  const daysToPay: number[] = [];
  const currencySet = new Set<string>();
  const now = Date.now();

  for (const tx of txList) {
    const amt = tx.invoiceAmount ?? 0;

    if (tx.currency) currencySet.add(tx.currency);

    if (isCompleted(tx)) {
      pipeline.completed.count  += 1;
      pipeline.completed.amount += amt;
      const d = daysBetween(tx.invoiceDate, tx.paymentCompletionDate);
      if (d !== null && d >= 0) daysToPay.push(d);
    } else if (isInTransit(tx)) {
      pipeline.inTransit.count  += 1;
      pipeline.inTransit.amount += amt;
    } else if (isApprovedNotPaid(tx)) {
      pipeline.approvedNotPaid.count  += 1;
      pipeline.approvedNotPaid.amount += amt;

      // Stuck: approved >60 days ago, not paid
      if (tx.billApprovedOn) {
        const approved = new Date(tx.billApprovedOn).getTime();
        if (!isNaN(approved) && (now - approved) > 60 * 24 * 60 * 60 * 1000) {
          pipeline.stuckCount += 1;
        }
      }
    } else {
      pipeline.pendingApproval.count  += 1;
      pipeline.pendingApproval.amount += amt;
    }
  }

  pipeline.avgDaysToPay = daysToPay.length
    ? daysToPay.reduce((a, b) => a + b, 0) / daysToPay.length
    : null;
  pipeline.currencies = Array.from(currencySet).sort();

  return pipeline;
}

// ---------------------------------------------------------------------------
// Engagement rollup — Author x Event detail
// ---------------------------------------------------------------------------

export function computeEngagementRollup(list: AuthorEngagement[]): EngagementRollup {
  let totalFee = 0;
  let totalProjected = 0;
  let totalVariance = 0;
  let varianceTxnCount = 0;
  const typeCounts: Record<string, number> = {};

  for (const e of list) {
    if (e.fee !== null) totalFee += e.fee;
    if (e.projectedFee !== null) totalProjected += e.projectedFee;
    if (e.variance !== null) {
      totalVariance += e.variance;
      if (e.variance > 0) varianceTxnCount += 1;
    }
    const type = e.engagementType ?? "(unspecified)";
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
  }

  return {
    list,
    totalFee,
    totalProjected,
    totalVariance,
    varianceTxnCount,
    engagementTypeCounts: typeCounts,
  };
}

// ---------------------------------------------------------------------------
// Decision recommendation — anchor / invest / renegotiate / develop / watch
// ---------------------------------------------------------------------------
// Two-axis classifier: cost (relative to median) × performance (rewatch + rating).
// We use the dataset medians as the threshold so decisions are calibrated to the
// portfolio, not absolute numbers.

interface DecisionContext {
  medianTotalPaid:   number;
  medianCraftSignal: number;
}

function deriveDecisionContext(rows: { totalPaid2026: number | null; craftSignal: number | null }[]): DecisionContext {
  const paid = rows.map(r => r.totalPaid2026).filter((v): v is number => v !== null && v > 0).sort((a, b) => a - b);
  const craft = rows.map(r => r.craftSignal).filter((v): v is number => v !== null).sort((a, b) => a - b);
  return {
    medianTotalPaid:   paid.length  ? paid[Math.floor(paid.length / 2)]   : 0,
    medianCraftSignal: craft.length ? craft[Math.floor(craft.length / 2)] : 0,
  };
}

export function computeDecision(
  row: { totalPaid2026: number | null; craftSignal: number | null; feedbackScore: number | null; sessionCount: number; feeTrajectory: string | null; contractType: string | null },
  ctx: DecisionContext
): DecisionRecommendation {
  // Insufficient data — can't make a call
  if (row.totalPaid2026 === null || row.craftSignal === null || row.sessionCount === 0) {
    const drivers: string[] = [];
    if (row.totalPaid2026 === null) drivers.push("no 2026 spend data");
    if (row.craftSignal === null)   drivers.push("no rewatch data");
    if (row.sessionCount === 0)     drivers.push("no sessions logged");
    return {
      action:     "watch",
      rationale:  "Insufficient data to recommend an action — collect more performance signal before next negotiation.",
      confidence: "low",
      drivers,
    };
  }

  const isHighCost = row.totalPaid2026 > ctx.medianTotalPaid;
  const passesCraft = row.craftSignal > ctx.medianCraftSignal;
  const passesRating = (row.feedbackScore ?? 0) >= 4.0;
  const isHighPerf = passesCraft && passesRating;

  const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const fmtUSD = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  if (isHighPerf && !isHighCost) {
    return {
      action: "invest",
      rationale: "Below-median cost with above-median rewatch and a passing rating. Lock in early — consider a longer renewal or modest raise before market repricing.",
      confidence: "high",
      drivers: [
        `2026 spend ${fmtUSD(row.totalPaid2026)} (below median ${fmtUSD(ctx.medianTotalPaid)})`,
        `Rewatch ${fmtPct(row.craftSignal)} (above median ${fmtPct(ctx.medianCraftSignal)})`,
        `Avg rating ${(row.feedbackScore ?? 0).toFixed(2)}`,
      ],
    };
  }

  if (isHighPerf && isHighCost) {
    return {
      action: "anchor",
      rationale: "Top-tier performance backs the spend. Renew at current terms — quantify irreplaceability (what would replacement cost?) before any cuts.",
      confidence: "high",
      drivers: [
        `2026 spend ${fmtUSD(row.totalPaid2026)} (above median)`,
        `Rewatch ${fmtPct(row.craftSignal)} + rating ${(row.feedbackScore ?? 0).toFixed(2)}`,
        row.contractType ? `Contract: ${row.contractType}` : "",
      ].filter(Boolean),
    };
  }

  if (!isHighPerf && isHighCost) {
    const trajectoryFlag = row.feeTrajectory === "Increasing" ? " Spend is increasing YoY — escalate." : "";
    const reasons: string[] = [];
    if (!passesCraft) reasons.push(`Rewatch ${fmtPct(row.craftSignal)} (below median ${fmtPct(ctx.medianCraftSignal)})`);
    if (!passesRating && row.feedbackScore !== null) reasons.push(`Avg rating ${row.feedbackScore.toFixed(2)} (below 4.0)`);
    return {
      action: "renegotiate",
      rationale: `Above-median cost without backing performance. Push for fee reduction, scope cut, or shift toward royalty-only.${trajectoryFlag}`,
      confidence: row.feeTrajectory === "Increasing" ? "high" : "medium",
      drivers: [
        `2026 spend ${fmtUSD(row.totalPaid2026)} (above median)`,
        ...reasons,
      ],
    };
  }

  return {
    action: "develop",
    rationale: "Low cost matches low usage / signal. Coach to higher craft or replace with a higher-tier author for this slot.",
    confidence: "medium",
    drivers: [
      `2026 spend ${fmtUSD(row.totalPaid2026)} (below median)`,
      `Rewatch ${fmtPct(row.craftSignal)} (below median)`,
      row.feedbackScore !== null ? `Avg rating ${row.feedbackScore.toFixed(2)}` : "",
    ].filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Strategic insights — page-level rollups
// ---------------------------------------------------------------------------

export function computeStrategicInsights(rows: FinanceDashboardRow[]): StrategicInsights {
  // 1. Spend Concentration — top 10 authors as share of total 2026 spend
  const totalSpend2026 = rows.reduce((s, r) => s + (r.totalPaid2026 ?? 0), 0);
  const topN = 10;
  const sortedBySpend = [...rows]
    .filter(r => r.totalPaid2026 !== null && r.totalPaid2026 > 0)
    .sort((a, b) => (b.totalPaid2026 ?? 0) - (a.totalPaid2026 ?? 0));
  const topNRows = sortedBySpend.slice(0, topN);
  const topNTotal = topNRows.reduce((s, r) => s + (r.totalPaid2026 ?? 0), 0);

  // 2. Renewal Queue — within 90 days
  const now = Date.now();
  const renewalQueue: RenewalQueueItem[] = [];
  for (const r of rows) {
    if (!r.contractTerms.renewalDate) continue;
    const renewal = new Date(r.contractTerms.renewalDate).getTime();
    if (isNaN(renewal)) continue;
    const days = Math.ceil((renewal - now) / (1000 * 60 * 60 * 24));
    if (days < 0 || days > 90) continue;
    renewalQueue.push({
      authorName:    r.authorName,
      daysUntil:     days,
      totalPaid2026: r.totalPaid2026,
      contractType:  r.contractType,
    });
  }
  renewalQueue.sort((a, b) => a.daysUntil - b.daysUntil);

  // 3. Renegotiate cohort
  const renegotiateRows = rows.filter(r => r.decision.action === "renegotiate");
  const renegotiateCohort: DecisionCohort = {
    count: renegotiateRows.length,
    totalSpend: renegotiateRows.reduce((s, r) => s + (r.totalPaid2026 ?? 0), 0),
    authors: renegotiateRows
      .sort((a, b) => (b.totalPaid2026 ?? 0) - (a.totalPaid2026 ?? 0))
      .slice(0, 5)
      .map(r => ({
        authorName: r.authorName,
        amount:     r.totalPaid2026 ?? 0,
        rationale:  r.decision.rationale,
      })),
  };

  // 4. Invest cohort
  const investRows = rows.filter(r => r.decision.action === "invest");
  const investCohort: DecisionCohort = {
    count: investRows.length,
    totalSpend: investRows.reduce((s, r) => s + (r.totalPaid2026 ?? 0), 0),
    authors: investRows
      .sort((a, b) => (b.craftSignal ?? 0) - (a.craftSignal ?? 0))
      .slice(0, 5)
      .map(r => ({
        authorName: r.authorName,
        amount:     r.totalPaid2026 ?? 0,
        rationale:  r.decision.rationale,
      })),
  };

  // 5. Variance to Budget — Σ(fee − projected) across all engagements
  let totalActual = 0;
  let totalProjected = 0;
  let overrunEngagements = 0;
  const overrunCandidates: Array<{ authorName: string; engagementName: string; variance: number }> = [];

  for (const r of rows) {
    totalActual    += r.engagements.totalFee;
    totalProjected += r.engagements.totalProjected;
    overrunEngagements += r.engagements.varianceTxnCount;
    for (const e of r.engagements.list) {
      if (e.variance !== null && e.variance > 0) {
        overrunCandidates.push({
          authorName: r.authorName,
          engagementName: e.name ?? "(unnamed engagement)",
          variance: e.variance,
        });
      }
    }
  }
  overrunCandidates.sort((a, b) => b.variance - a.variance);

  return {
    spendConcentration: {
      topNCount:   topNRows.length,
      topNTotal,
      grandTotal:  totalSpend2026,
      topNPct:     totalSpend2026 > 0 ? topNTotal / totalSpend2026 : 0,
      topNAuthors: topNRows.map(r => ({ authorName: r.authorName, amount: r.totalPaid2026 ?? 0 })),
    },
    renewalQueue,
    renegotiateCohort,
    investCohort,
    varianceSummary: {
      totalActual,
      totalProjected,
      totalVariance: totalActual - totalProjected,
      overrunEngagements,
      worstOverruns: overrunCandidates.slice(0, 5),
    },
  };
}

// ---------------------------------------------------------------------------
// Main join function
// ---------------------------------------------------------------------------

export function buildFinanceDashboardRows(
  raw: RawFinanceDashboardData,
  unified: UnifiedAuthorProfile[]
): FinanceDashboardData {
  // Build a lookup: normalisedKey → unified profile
  const profileByKey = new Map<string, UnifiedAuthorProfile>();
  for (const p of unified) profileByKey.set(p.normalisedKey, p);

  // Also build a lookup by raw display name normalised — for looser matching
  const profileByDisplayKey = new Map<string, UnifiedAuthorProfile>();
  for (const p of unified) {
    profileByDisplayKey.set(normaliseName(p.authorName), p);
  }

  const unmatchedEntities: string[] = [];

  // Build initial rows WITHOUT decision (we need dataset medians first)
  const partialRows = raw.entities.map((entity) => {
    const txList = raw.txByEntityId.get(entity.id) ?? [];
    const engagementList = raw.engagementsByEntityId.get(entity.id) ?? [];

    // Derive distinct GL codes and product names from transactions
    const glCodesSet    = new Set<string>();
    const productSet    = new Set<string>();
    for (const tx of txList) {
      if (tx.glCode)     glCodesSet.add(tx.glCode);
      if (tx.productName) productSet.add(tx.productName);
    }

    const totalPaid2025 = (entity.fee2025 ?? 0) + (entity.royalties2025 ?? 0) || null;
    const totalPaid2026 = (entity.fee2026 ?? 0) + (entity.royalties2026 ?? 0) || null;

    // Try to match with a craft profile
    const nameKey = normaliseName(entity.name);
    const profile = profileByKey.get(nameKey)
      ?? profileByDisplayKey.get(nameKey)
      ?? null;

    if (!profile) unmatchedEntities.push(entity.name);

    const sessionCount = profile
      ? profile.perMastery.reduce((acc, p) => acc + p.sessionCount, 0)
      : 0;

    const costPerSession2026 =
      sessionCount > 0 && totalPaid2026 !== null
        ? totalPaid2026 / sessionCount
        : null;

    return {
      authorEntityId:  entity.id,
      authorName:      entity.name,
      entityName:      entity.entityName,
      contractType:    entity.contractType,
      contractSummary: entity.contractSummary,
      contractTerms:   extractContractTerms(entity.contractSummary),
      fee2025:         entity.fee2025,
      royalties2025:   entity.royalties2025,
      fee2026:         entity.fee2026,
      royalties2026:   entity.royalties2026,
      totalPaid2025,
      totalPaid2026,
      feeTrajectory:   computeFeeTrajectory(totalPaid2025, totalPaid2026),
      glCodes:         Array.from(glCodesSet),
      productCodes:    Array.from(productSet),
      transactions:    txList,
      spendBreakdown:  computeSpendBreakdown(txList),
      paymentPipeline: computePaymentPipeline(txList),
      engagements:     computeEngagementRollup(engagementList),
      craftSignal:     profile?.overallRewatchRate ?? null,
      feedbackScore:   profile?.overallAvgRating ?? null,
      sessionCount,
      masteries:       profile ? profile.masteries.map(k => MASTERY_LABELS[k]) : [],
      normalisedKey:   profile?.normalisedKey ?? nameKey,
      ...(costPerSession2026 !== null ? { costPerSession2026 } : {}),
    };
  });

  // Compute decision context (medians) from the partial dataset, then attach decisions
  const ctx = deriveDecisionContext(partialRows);
  const rows: FinanceDashboardRow[] = partialRows.map((r) => ({
    ...r,
    decision: computeDecision(r, ctx),
  } as FinanceDashboardRow));

  // Sort by Total Paid 2026 descending (default table order)
  rows.sort((a, b) => (b.totalPaid2026 ?? 0) - (a.totalPaid2026 ?? 0));

  const flags = computeFinanceFlags(rows);
  const insights = computeStrategicInsights(rows);

  return { rows, flags, insights, unmatchedEntities, fetchedAt: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// Finance flags computation
// ---------------------------------------------------------------------------

function computeFinanceFlags(rows: FinanceDashboardRow[]): FinanceFlag[] {
  const flags: FinanceFlag[] = [];

  // Mastery avg cost for "above average cost" threshold
  const paidValues2026 = rows.map(r => r.totalPaid2026).filter((v): v is number => v !== null);
  const avgPaid2026 = paidValues2026.length
    ? paidValues2026.reduce((a, b) => a + b, 0) / paidValues2026.length
    : 0;

  // Median craft signal
  const craftValues = rows.map(r => r.craftSignal).filter((v): v is number => v !== null).sort((a, b) => a - b);
  const medianCraft = craftValues.length
    ? craftValues[Math.floor(craftValues.length / 2)]
    : null;

  const now = new Date();

  for (const row of rows) {
    // High-cost / low-craft
    if (
      row.totalPaid2026 !== null &&
      row.totalPaid2026 > avgPaid2026 * 1.5 &&
      medianCraft !== null &&
      row.craftSignal !== null &&
      row.craftSignal < medianCraft
    ) {
      flags.push({
        type:       "high_cost_low_craft",
        authorName: row.authorName,
        detail:     `Paid $${row.totalPaid2026.toLocaleString()} in 2026 (${((row.totalPaid2026 / avgPaid2026 - 1) * 100).toFixed(0)}% above avg) with rewatch rate ${(row.craftSignal * 100).toFixed(1)}% (below median ${(medianCraft * 100).toFixed(1)}%)`,
        severity:   "high",
      });
    }

    // Fee trajectory anomaly: >20% increase 2025→2026
    if (
      row.feeTrajectory === "Increasing" &&
      row.totalPaid2025 !== null &&
      row.totalPaid2026 !== null &&
      row.totalPaid2025 > 0
    ) {
      const pctIncrease = ((row.totalPaid2026 - row.totalPaid2025) / row.totalPaid2025) * 100;
      if (pctIncrease >= 20) {
        flags.push({
          type:       "fee_trajectory_anomaly",
          authorName: row.authorName,
          detail:     `Spend increased ${pctIncrease.toFixed(0)}% from 2025 ($${row.totalPaid2025.toLocaleString()}) to 2026 ($${row.totalPaid2026.toLocaleString()})`,
          severity:   pctIncrease >= 50 ? "high" : "medium",
        });
      }
    }

    // Stuck payment: bill approved >60 days but payment not completed
    if (row.paymentPipeline.stuckCount > 0) {
      flags.push({
        type:       "stuck_payment",
        authorName: row.authorName,
        detail:     `${row.paymentPipeline.stuckCount} payment${row.paymentPipeline.stuckCount === 1 ? " is" : "s are"} approved but not completed after 60+ days · $${row.paymentPipeline.approvedNotPaid.amount.toLocaleString()} sitting unpaid`,
        severity:   row.paymentPipeline.stuckCount >= 3 ? "high" : "medium",
      });
    }

    // FX exposure: paid in multiple currencies
    if (row.paymentPipeline.currencies.length > 1) {
      flags.push({
        type:       "fx_exposure",
        authorName: row.authorName,
        detail:     `Paid across ${row.paymentPipeline.currencies.length} currencies (${row.paymentPipeline.currencies.join(", ")}) — review FX impact before next negotiation`,
        severity:   "low",
      });
    }

    // Renewal alert: renewal date within 90 days
    if (row.contractTerms.renewalDate) {
      try {
        const renewal = new Date(row.contractTerms.renewalDate);
        const daysUntil = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 90) {
          flags.push({
            type:       "renewal_alert",
            authorName: row.authorName,
            detail:     `Contract renews in ${daysUntil} day${daysUntil === 1 ? "" : "s"} (${row.contractTerms.renewalDate})`,
            severity:   daysUntil <= 30 ? "high" : "medium",
          });
        }
      } catch {
        // unparseable date — skip
      }
    }
  }

  // Sort: high severity first
  flags.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return flags;
}
