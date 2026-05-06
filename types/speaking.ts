// Raw Airtable record shapes — field values keyed by field ID
export interface AirtableLessonFields {
  [fieldId: string]: unknown;
}

export interface AirtableRecord<T = AirtableLessonFields> {
  id: string;
  fields: T;
  createdTime: string;
}

// Normalised lesson — field IDs resolved to named properties
export interface LessonRecord {
  id: string;
  lessonTitle: string;
  speakerNames: string[];  // resolved from linked record
  attendees: number | null;
  avgRating: number | null;
  numRatings: number | null;
  recViews1w: number | null;
  recViews4w: number | null;
  enrolled: number | null;
  type: string | null;
  module: string | null;
  yearCohort: string | null;
  lessonTranscript: string | null;  // Speaking only; other masteries always null
  aiGoalAlignment?: AIGoalAlignment | null;
}

// Normalised feedback record
export interface FeedbackRecord {
  id: string;
  rating: number | null;
  feedbackText: string | null;
  speakerNames: string[];
  followUpNeeded: boolean;
}

// Computed Author Craft profile — aggregated across all sessions for an author
export interface AuthorCraftProfile {
  authorName: string;
  sessionCount: number;
  avgRating: number | null;
  rewatchRate: number | null;      // Rec Views 1w ÷ Enrolled
  rewatchLongTail: number | null;  // Rec Views 4w ÷ Rec Views 1w
  followUpRate: number | null;     // % feedback with followUpNeeded = true
  ratingFloorFlag: boolean;        // avgRating < 4.0
  feedbackCount: number;
  
  // AI analysis fields
  aiAnalyzed: boolean;
  transformationRate: number | null;
  qualitativeIntelligence: AIFeedbackAnalysis | null;
}

// Computed Curriculum Fit slot
export interface CurriculumFitSlot {
  lessonId: string;
  lessonTitle: string;
  speakerNames: string[];
  module: string | null;
  yearCohort: string | null;
  type: string | null;
  attendees: number | null;
  enrolled: number | null;
  attendanceRate: number | null;   // Attendees ÷ Enrolled
  avgRating: number | null;
  rewatchRate: number | null;
  masteryKey?: string;
  lessonTranscript?: string | null;
  aiGoalAlignment?: AIGoalAlignment | null;
}

// Divergence flag — craft and fit signals point in opposite directions
export type DivergenceDirection = "high-craft-low-fit" | "low-craft-high-fit";

export interface DivergenceFlag {
  authorName: string;
  direction: DivergenceDirection;
  craftSignal: number | null;     // rewatch rate used as primary craft signal
  fitSignal: number | null;       // attendance rate used as primary fit signal
  lessonTitles: string[];
}

// Top 5 / Bottom 5 by rewatch rate
export interface RankedAuthor {
  rank: number;
  authorName: string;
  rewatchRate: number;
  avgRating: number | null;
  sessionCount: number;
}

export interface Top5Bottom5 {
  top: RankedAuthor[];
  bottom: RankedAuthor[];
}

// Per-session schedule slot — authoritative performance level
// (Session Feedback links to Schedule slots, not Lessons directly)
export interface ScheduleRecord {
  id: string;
  order: string | null;
  speakerNames: string[];
  dateTime: string | null;
  zoomLink: string | null;
  avrRating: number | null;
  countRatings: number | null;
  feedbackRollup: string[];  // array of individual feedback strings
  yearCohort: string | null;
  attendees: number | null;
  recViews1w: number | null;
  recViews4w: number | null;
  enrolled: number | null;
}

// Individual workshop feedback response (Amsterdam MVU, Aug 2025)
export interface WorkshopFeedbackRecord {
  id: string;
  name: string | null;
  nps: number | null;            // 1–10
  csat: number | null;           // 1–5
  expectationsMet: number | null; // 1–5
  breakoutScore: number | null;  // 1–5
  confidenceBefore: number | null; // 1–5
  confidenceAfter: number | null;  // 1–5
  breakthrough: string | null;
  improvements: string | null;
  inpersonVsVirtual: string | null;
}

// Aggregated workshop feedback summary for the panel
export interface WorkshopFeedbackSummary {
  responseCount: number;
  avgNps: number | null;
  avgCsat: number | null;
  avgExpectationsMet: number | null;
  avgBreakoutScore: number | null;
  avgConfidenceBefore: number | null;
  avgConfidenceAfter: number | null;
  confidenceDelta: number | null;  // After − Before
  records: WorkshopFeedbackRecord[];
}

// Full computed dataset passed to the Speaking page
export interface SpeakingDashboardData {
  lessons: LessonRecord[];
  authorCraft: AuthorCraftProfile[];
  curriculumFit: CurriculumFitSlot[];
  divergenceFlags: DivergenceFlag[];
  top5bottom5: Top5Bottom5;
  schedule: ScheduleRecord[];
  workshopFeedback: WorkshopFeedbackSummary;
  onboardingCount: number;
  fetchedAt: string;
}

// =============================================================================
// AI ANALYSIS TYPES (Sprint 5)
// =============================================================================

export interface AIFeedbackAnalysis {
  transformationRate: number; // 0.0 to 1.0 representing percentage of feedback containing transformation language
  topPraiseThemes: string[]; // e.g. ["Clarity of explanation", "Actionable frameworks"]
  topCriticismThemes: string[]; // e.g. ["Rushed delivery", "Too theoretical"]
  recommendScore: number | null;
}

export interface AITranscriptAnalysis {
  topics: string[];
  teachingTechniques: string[];
  interactionStyle: string;
  actionabilityScore: number;
}

export interface AIGoalAlignment {
  deltaLabel: string; // e.g. "Missed: Advanced tactics"
  score: number;
}

// For the Overview dashboard
export interface TopicTaxonomy {
  topic: string;
  lessonCount: number;
  transformationRate: number | null;
  topAuthors?: string[];
  insights?: string;
  curriculumSuggestions?: string[];
}

// =============================================================================
// CROSS-MASTERY TYPES  (Sprint 2)
// =============================================================================

export type MasteryKey = "speaking" | "manifesting" | "ai_mastery" | "entrepreneurship" | "spiritual" | "social";

export const MASTERY_LABELS: Record<MasteryKey, string> = {
  speaking:        "Speaking & Influence",
  manifesting:     "Manifesting",
  ai_mastery:      "AI Mastery",
  entrepreneurship:"Entrepreneurship",
  spiritual:       "Spiritual",
  social:          "Social",
};

export const MASTERY_COLORS: Record<MasteryKey, string> = {
  speaking:        "mv-badge--purple",
  manifesting:     "mv-badge--blue",
  ai_mastery:      "mv-badge--teal",
  entrepreneurship:"mv-badge--orange",
  spiritual:       "mv-badge--gold",
  social:          "mv-badge--green",
};

export interface SpeakerEntity {
  id: string;
  name: string;
  masteryLessonIds: string[];
  summitSessionIds: string[];
}

// LessonRecord tagged with which mastery it came from
export interface MasteryLessonRecord extends LessonRecord {
  masteryKey: MasteryKey;
}

// FeedbackRecord tagged with which mastery it came from
export interface MasteryFeedbackRecord extends FeedbackRecord {
  masteryKey: MasteryKey;
}

// Craft signals for a single author within a single mastery
export interface PerMasterySignals {
  masteryKey:      MasteryKey;
  sessionCount:    number;
  feedbackCount:   number;
  avgRating:       number | null;
  rewatchRate:     number | null;
  rewatchLongTail: number | null;
  followUpRate:    number | null;
  ratingFloorFlag: boolean;
}

// Unified author row — merged across all masteries this author has taught in
export interface UnifiedAuthorProfile {
  authorName:        string;         // display name (first occurrence)
  normalisedKey:     string;         // normalised key used for dedup
  masteries:         MasteryKey[];   // distinct masteries this author appears in
  crossProgramCount: number;         // masteries.length
  perMastery:        PerMasterySignals[];
  // Aggregate signals across all masteries
  overallRewatchRate:   number | null; // avg of per-mastery rewatch rates
  overallAvgRating:     number | null;
  ratingConsistency:    number | null; // std dev of avgRating across masteries (null if <2 masteries with data)
  overallRatingFloor:   boolean;       // true if any mastery has a rating floor flag
  // Sprint 4 — pre-aggregated for instant client-side filtering
  years:             string[];        // distinct yearCohort values across all lessons (e.g. ["2025", "2026"])
  sessionTypes:      string[];        // distinct normalised session types (e.g. ["lesson", "qa", "hotseat"])
  sessionCount2026:  number;          // sessions taught in 2026 cohort
  summitSessionCount: number;         // sum of summit sessions across all masteries
  divergenceDirection?: DivergenceDirection | null; // set when craft and fit signals diverge
  cohortTrajectory?: "up" | "down" | "flat" | null; // compares 2026 vs 2025 rewatch rate

  // Sprint 3 — populated by joinFinanceToAuthors when a Finance match exists
  finance?:             AuthorFinanceData;
  transactions?:        FinanceTransactionDetail[];
  // Convenience getter mirrored to top level so the table can sort on it
  totalCost2026?:       number | null;
  costPerSession2026?:  number | null;

  // Sprint 5 — AI Analysis
  aiAnalyzed?: boolean;
  transformationRate?: number | null;
  qualitativeIntelligence?: AIFeedbackAnalysis | null;
}

// A single observable cross-mastery pattern
export interface CrossMasteryPattern {
  description:  string;   // plain-English finding
  masteryCount: number;   // how many masteries the pattern spans
  evidence:     string;   // supporting numbers
}

// An unresolved author name pair — two raw name variants that couldn't be auto-merged
export interface UnresolvedNameMatch {
  variants: string[];       // raw name strings that conflicted
  masteries: MasteryKey[];  // which masteries each variant came from
}

// Full dataset for the Cross-Mastery Overview page
export interface CrossMasteryDashboardData {
  unified:          UnifiedAuthorProfile[];
  unresolvedMatches:UnresolvedNameMatch[];
  patterns:         CrossMasteryPattern[];
  totalLessons:     number;
  fetchedAt:        string;
}

// =============================================================================
// SORT + BUSINESS INSIGHTS  (Sprint 2 enhancement)
// =============================================================================

// Columns of the unified author table that support click-to-sort
export type SortKey =
  | "authorName"
  | "crossProgramCount"
  | "overallRewatchRate"
  | "overallAvgRating"
  | "ratingConsistency"
  | "totalCost2026";

export type SortDirection = "asc" | "desc";

// Quick-filter buckets for cross-program count
export type CrossProgramFilter = "all" | "1" | "2+" | "3+";

// Year filter values — "all" or a specific cohort year string
export type YearFilter = "all" | "2024" | "2025" | "2026";

// Session-type filter — normalised lowercase values
export type SessionTypeFilter = "all" | "lesson" | "qa" | "hotseat" | "workshop";

// One ranked author entry inside an insight category
export interface RankedInsightAuthor {
  authorName:    string;
  normalisedKey: string;
  primaryMetric: string;       // formatted display value (e.g. "rating 4.62", "8 sessions")
  detail:        string;       // one-line context, e.g. "Speaking · 5 sessions"
}

// Five business-decision categories shown as ranked author cards
export type BusinessInsightCategory =
  | "top_performers"
  | "hidden_gems"
  | "at_risk"
  | "inconsistent"
  | "volume_leaders"
  | "anchor_speakers"
  | "develop_or_replace";

export interface BusinessInsight {
  category:    BusinessInsightCategory;
  title:       string;          // e.g. "Top Performers"
  action:      string;          // imperative, e.g. "Scale these"
  description: string;          // one-line explanation of the rule
  authors:     RankedInsightAuthor[];   // top 5; may be empty
}

// =============================================================================
// FINANCE OVERLAY  (Sprint 3 — reworked to use Actual Transactions)
// =============================================================================

// One author's Speaker Fee totals sourced from Actual Transactions.
// Royalties are excluded here — they will appear in a dedicated Royalties dashboard.
export interface AuthorFinanceData {
  /** Display name as it appeared in the AUTHOR_LOOKUP field */
  authorDisplayName:  string;
  /** Sum of Speaker Fee transactions for Mastery products in 2025 */
  speakerFeeTotal2025: number | null;
  /** Sum of Speaker Fee transactions for Mastery products in 2026 */
  speakerFeeTotal2026: number | null;
  /** Cost per session in 2025 */
  costPerSession2025: number | null;
  /** Cost per session in 2026 */
  costPerSession2026: number | null;
}

// One individual transaction shown in the finance detail panel
export interface FinanceTransactionDetail {
  id:            string;
  invoiceNumber: string | null;
  invoiceDate:   string | null;
  invoiceAmount: number | null;
  invoiceYear:   string | null;
  billMemo:      string | null;
  productName:   string | null;
}

// =============================================================================
// FINANCE INTELLIGENCE DASHBOARD  (Author Finance page)
// =============================================================================

// Extracted terms from the contract summary text (regex-based, best-effort)
export interface ContractTerms {
  royaltyPct:  number | null;  // e.g. 15 for "15%"
  renewalDate: string | null;  // ISO date string if found
  feeAmount:   number | null;  // fixed fee amount if mentioned
}

// One flag surfaced in the Analysis & Flags panel
export interface FinanceFlag {
  type:
    | "high_cost_low_craft"
    | "fee_trajectory_anomaly"
    | "renewal_alert"
    | "unmatched_entity"
    | "stuck_payment"
    | "fx_exposure";
  authorName: string;
  detail:     string;   // plain-English description shown in the panel
  severity:   "high" | "medium" | "low";
}

// One row in the Finance Intelligence table — one row per Author Entity
export interface FinanceDashboardRow {
  // From Author Entities
  authorEntityId:   string;
  authorName:       string;          // display name (formula field)
  entityName:       string | null;   // AI-extracted legal entity name
  contractType:     string | null;   // "Royalty" | "Fixed Fee" | null (singleSelect)
  contractSummary:  string | null;   // AI-generated text from Airtable
  contractTerms:    ContractTerms;   // regex-extracted from contractSummary
  fee2025:          number | null;
  royalties2025:    number | null;
  fee2026:          number | null;
  royalties2026:    number | null;
  totalPaid2025:    number | null;   // fee2025 + royalties2025
  totalPaid2026:    number | null;   // fee2026 + royalties2026
  feeTrajectory:    "Increasing" | "Stable" | "Decreasing" | null;

  // From Actual Transactions (all GL codes, all years)
  glCodes:      string[];            // distinct GL codes across all transactions
  productCodes: string[];            // distinct product/mastery names
  transactions: FinanceDashboardTransaction[];

  // Computed rollups from transactions
  spendBreakdown:  SpendBreakdown;
  paymentPipeline: PaymentPipeline;

  // Per-engagement detail from Author x Event
  engagements:     EngagementRollup;

  // Computed decision recommendation (anchor / invest / renegotiate / develop / watch)
  decision:        DecisionRecommendation;

  // Joined from unified author profiles (optional — null when no craft data)
  craftSignal:    number | null;     // overallRewatchRate
  feedbackScore:  number | null;     // overallAvgRating
  sessionCount:   number;
  masteries:      string[];
  normalisedKey:  string;            // for craft join
}

// =============================================================================
// AUTHOR X EVENT  (per-engagement detail from the Finance base)
// =============================================================================

export interface AuthorEngagement {
  id:             string;
  name:           string | null;        // e.g. "Mastery Q4 2025"
  status:         string | null;        // singleSelect — Confirmed / Pending / etc.
  authorName:     string | null;        // matched to author entity
  engagementType: string | null;        // Workshop / Lesson / Hot-seat / etc.
  calendarEvent:  string | null;
  fee:            number | null;
  projectedFee:   number | null;
  variance:       number | null;        // fee - projectedFee (null if either missing)
  otherExpenses:  number | null;
  totalCost:      number | null;
  notes:          string | null;
  hasContract:    boolean;
  sessions:       string | null;        // raw rollup string from Airtable
}

// Per-author rollup of engagements — attached to FinanceDashboardRow
export interface EngagementRollup {
  list:                 AuthorEngagement[];
  totalFee:             number;
  totalProjected:       number;
  totalVariance:        number;          // sum of (fee - projected) where both present
  varianceTxnCount:     number;          // engagements where variance > 0 (over-runs)
  engagementTypeCounts: Record<string, number>;
}

// =============================================================================
// DECISION RECOMMENDATIONS  (per-author action call)
// =============================================================================

export type DecisionAction = "anchor" | "invest" | "renegotiate" | "develop" | "watch";

export interface DecisionRecommendation {
  action:     DecisionAction;
  rationale:  string;          // one-line explanation
  confidence: "high" | "medium" | "low";
  drivers:    string[];        // 2-3 specific metrics that drove the call
}

// =============================================================================
// STRATEGIC INSIGHTS  (page-level cards above the table)
// =============================================================================

export interface SpendConcentration {
  topNCount:    number;        // typically 10
  topNTotal:    number;        // sum of top N authors' 2026 spend
  grandTotal:   number;
  topNPct:      number;        // topNTotal / grandTotal
  topNAuthors:  Array<{ authorName: string; amount: number }>;
}

export interface RenewalQueueItem {
  authorName:    string;
  daysUntil:     number;
  totalPaid2026: number | null;
  contractType:  string | null;
}

export interface DecisionCohort {
  count:        number;
  totalSpend:   number;        // 2026 spend
  authors:      Array<{ authorName: string; amount: number; rationale: string }>;
}

export interface VarianceSummary {
  totalActual:           number;
  totalProjected:        number;
  totalVariance:         number;        // actual - projected
  overrunEngagements:    number;        // engagements where variance > 0
  worstOverruns:         Array<{ authorName: string; engagementName: string; variance: number }>;
}

export interface StrategicInsights {
  spendConcentration:   SpendConcentration;
  renewalQueue:         RenewalQueueItem[];
  renegotiateCohort:    DecisionCohort;
  investCohort:         DecisionCohort;
  varianceSummary:      VarianceSummary;
}

export interface FinanceAttachment {
  id:       string;
  url:      string;
  filename: string;
  type:     string | null;
  size:     number | null;
}

// Transaction record used in the Finance Dashboard (rich — pulls AI summary + lifecycle)
export interface FinanceDashboardTransaction {
  id:                    string;
  invoiceNumber:         string | null;
  invoiceDate:           string | null;
  invoiceYear:           string | null;
  currency:              string | null;
  invoiceAmount:         number | null;
  netAmount:             number | null;

  // Payment lifecycle
  billStatus:            string | null;
  billApprovedOn:        string | null;
  paymentStatus:         string | null;
  paymentInitiatedDate:  string | null;
  paymentCompletionDate: string | null;

  // Categorisation
  glCode:        string | null;
  accountCode:   string | null;
  department:    string | null;
  productName:   string | null;
  lineTagProject:string | null;

  // Notes + AI
  billMemo:           string | null;
  attachmentSummary:  string | null;   // Airtable AI summary of the attached invoice
  attachments:        FinanceAttachment[];
}

// Per-author rollup of where the spend went
export interface SpendBreakdownEntry {
  category: string;
  amount:   number;
  pct:      number;     // share of total spend
  count:    number;     // number of transactions
}

export interface SpendBreakdown {
  byGlCode:     SpendBreakdownEntry[];
  byProduct:    SpendBreakdownEntry[];
  byDepartment: SpendBreakdownEntry[];
}

// Payment pipeline view for an author — money in flight
export interface PaymentPipeline {
  pendingApproval:  { count: number; amount: number };  // bill draft / not yet approved
  approvedNotPaid:  { count: number; amount: number };  // approved but payment not initiated/completed
  inTransit:        { count: number; amount: number };  // payment initiated but not completed
  completed:        { count: number; amount: number };  // payment completed
  avgDaysToPay:     number | null;                       // mean days invoice → completion (where both exist)
  stuckCount:       number;                              // approved >60d ago but not completed
  currencies:       string[];                            // distinct currencies seen
}

// Full dataset passed to the Finance page client component
export interface FinanceDashboardData {
  rows:         FinanceDashboardRow[];
  flags:        FinanceFlag[];
  insights:     StrategicInsights;
  unmatchedEntities: string[];   // Author Entity names with no craft profile match
  fetchedAt:    string;
}

// Author present in unified table but with no Finance match
export interface UnmatchedAuthor {
  authorName:    string;
  normalisedKey: string;
  sessionCount:  number;
  masteries:     MasteryKey[];
}

// Result of the finance join — fed to the page
export interface FinanceJoinResult {
  unifiedWithFinance: UnifiedAuthorProfile[];
  unmatched:          UnmatchedAuthor[];
  matchRate:          number;        // 0–1, share of authors matched
  matchedCount:       number;
  totalCount:         number;
}
