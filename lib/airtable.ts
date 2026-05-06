import type { AirtableRecord } from "@/types/speaking";
import { BASE_IDS, SPEAKING, fieldIds } from "@/lib/airtable-schema";
import { resolveTranscriptText } from "@/lib/transcripts";
import type {
  LessonRecord,
  FeedbackRecord,
  ScheduleRecord,
  WorkshopFeedbackRecord,
  WorkshopFeedbackSummary,
} from "@/types/speaking";

const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

function pat(): string {
  const token = process.env.AIRTABLE_PAT;
  if (!token) throw new Error("AIRTABLE_PAT environment variable is not set");
  return token;
}

// ---------------------------------------------------------------------------
// In-memory record cache — survives across requests in the same Node process.
// next: { revalidate } only works in production builds; this covers dev mode.
// TTL matches the production revalidate window (5 min).
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000;
const recordCache = new Map<string, { records: unknown[]; expiresAt: number }>();

function getCached<T>(key: string): T[] | null {
  const entry = recordCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.records as T[];
}

function setCached<T>(key: string, records: T[]): void {
  recordCache.set(key, { records, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Core paginated fetcher
// Always uses returnFieldsByFieldId=true so fields object is keyed by field ID.
// ---------------------------------------------------------------------------

interface FetchOptions {
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
}

async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, init);
    if (res.status === 429 && attempt < retries) {
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "5", 10);
      const delay = (retryAfter || 5) * 1000;
      console.warn(`Airtable 429 — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    return res;
  }
  throw new Error(`fetchWithRetry: exhausted retries for ${url}`);
}

export async function fetchAllRecords<F = Record<string, unknown>>(
  baseId: string,
  tableId: string,
  options: FetchOptions = {}
): Promise<AirtableRecord<F>[]> {
  const cacheKey = `${baseId}:${tableId}:${JSON.stringify(options)}`;
  const cached = getCached<AirtableRecord<F>>(cacheKey);
  if (cached) return cached;

  const results: AirtableRecord<F>[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    // Always request fields keyed by field ID (not name) — critical for schema safety
    params.set("returnFieldsByFieldId", "true");

    if (options.fields) {
      options.fields.forEach((f) => params.append("fields[]", f));
    }
    if (options.filterByFormula) {
      params.set("filterByFormula", options.filterByFormula);
    }
    if (options.maxRecords) {
      params.set("maxRecords", String(options.maxRecords));
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        params.append(`sort[${i}][field]`, s.field);
        params.append(`sort[${i}][direction]`, s.direction ?? "asc");
      });
    }
    if (offset) {
      params.set("offset", offset);
    }

    const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}?${params.toString()}`;
    const res = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${pat()}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable API error ${res.status} for ${tableId}: ${body}`);
    }

    const data = (await res.json()) as {
      records: AirtableRecord<F>[];
      offset?: string;
    };

    results.push(...data.records);
    offset = data.offset;
  } while (offset);

  setCached(cacheKey, results);
  return results;
}

// ---------------------------------------------------------------------------
// Name lookup helpers — resolve linked record IDs to display names
// ---------------------------------------------------------------------------

async function fetchNameLookup(baseId: string, tableId: string, nameFieldId: string): Promise<Map<string, string>> {
  const raw = await fetchAllRecords<Record<string, unknown>>(baseId, tableId, {
    fields: [nameFieldId],
  });
  const map = new Map<string, string>();
  for (const r of raw) {
    const name = asString(r.fields[nameFieldId]);
    if (name) map.set(r.id, name);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Field value extractors — handle Airtable type quirks
// ---------------------------------------------------------------------------

function asNumber(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }
  // multipleLookupValues returns an array — take the first numeric value
  if (Array.isArray(val) && val.length > 0) return asNumber(val[0]);
  return null;
}

function asString(val: unknown): string | null {
  if (typeof val === "string") return val.trim() || null;
  return null;
}

function asBoolean(val: unknown): boolean {
  return val === true || val === 1 || val === "true";
}

// Resolve an array of linked record IDs to display names using the lookup map.
// Omits IDs not found in the lookup (avoids leaking raw Airtable record IDs to UI).
function resolveLinkedNames(val: unknown, lookup: Map<string, string>): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((item) => {
      const id = typeof item === "string" ? item : null;
      if (!id) return null;
      return lookup.get(id) ?? null;
    })
    .filter((n): n is string => n !== null);
}

// ---------------------------------------------------------------------------
// Field ID arrays — built once at module load
// ---------------------------------------------------------------------------

const LESSON_FIELDS = fieldIds(SPEAKING.LESSONS, [
  "LESSON_TITLE",
  "SPEAKER",
  "ATTENDEES",
  "AVG_RATING",
  "NUM_RATINGS",
  "REC_VIEWS_1W",
  "REC_VIEWS_4W",
  "ENROLLED",
  "TYPE",
  "MODULE",
  "YEAR_COHORT",
  "TRANSCRIPT",
]);

const FEEDBACK_FIELDS = fieldIds(SPEAKING.SESSION_FEEDBACK, [
  "RATING",
  "FEEDBACK_TEXT",
  "SPEAKER",
  "FOLLOW_UP_NEEDED",
]);

const SCHEDULE_FIELDS = fieldIds(SPEAKING.SCHEDULE, [
  "ORDER",
  "SPEAKER",
  "DATE_TIME",
  "ZOOM_LINK",
  "AVR_RATING",
  "COUNT_RATINGS",
  "FEEDBACK_ROLLUP",
  "YEAR_COHORT",
  "ATTENDEES",
  "REC_VIEWS_1W",
  "REC_VIEWS_4W",
  "ENROLLED",
]);

const WORKSHOP_FIELDS = fieldIds(SPEAKING.WORKSHOP_FEEDBACK, [
  "NAME",
  "NPS",
  "CSAT",
  "EXPECTATIONS_MET",
  "BREAKOUT_SCORE",
  "CONFIDENCE_BEFORE",
  "CONFIDENCE_AFTER",
  "BREAKTHROUGH",
  "IMPROVEMENTS",
  "INPERSON_VS_VIRTUAL",
]);

// ---------------------------------------------------------------------------
// Schedule fetcher
// ---------------------------------------------------------------------------

export async function fetchScheduleData(
  speakerLookup: Map<string, string>
): Promise<ScheduleRecord[]> {
  const raw = await fetchAllRecords<Record<string, unknown>>(
    BASE_IDS.SPEAKING,
    SPEAKING.SCHEDULE.TABLE_ID,
    { fields: SCHEDULE_FIELDS }
  );

  return raw.map((r) => {
    const f = r.fields;

    // FEEDBACK_ROLLUP is a rollup of rich text — Airtable returns it as an array of strings
    const rollupRaw = f[SPEAKING.SCHEDULE.FEEDBACK_ROLLUP];
    const feedbackRollup: string[] = Array.isArray(rollupRaw)
      ? rollupRaw.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [];

    // SPEAKER is a multipleLookupValues — resolve linked record IDs to names via lookup
    const speakerNames = resolveLinkedNames(f[SPEAKING.SCHEDULE.SPEAKER], speakerLookup);

    // ENROLLED is multipleLookupValues — take first numeric value
    const enrolledRaw = f[SPEAKING.SCHEDULE.ENROLLED];
    const enrolled = Array.isArray(enrolledRaw) && enrolledRaw.length > 0
      ? asNumber(enrolledRaw[0])
      : asNumber(enrolledRaw);

    return {
      id:             r.id,
      order:          asString(f[SPEAKING.SCHEDULE.ORDER]),
      speakerNames,
      dateTime:       asString(f[SPEAKING.SCHEDULE.DATE_TIME]),
      zoomLink:       asString(f[SPEAKING.SCHEDULE.ZOOM_LINK]),
      avrRating:      asNumber(f[SPEAKING.SCHEDULE.AVR_RATING]),
      countRatings:   asNumber(f[SPEAKING.SCHEDULE.COUNT_RATINGS]),
      feedbackRollup,
      yearCohort:     (() => {
        const yc = f[SPEAKING.SCHEDULE.YEAR_COHORT];
        if (yc && typeof yc === "object" && "name" in yc) return (yc as { name: string }).name;
        return asString(yc);
      })(),
      attendees:      asNumber(f[SPEAKING.SCHEDULE.ATTENDEES]),
      recViews1w:     asNumber(f[SPEAKING.SCHEDULE.REC_VIEWS_1W]),
      recViews4w:     asNumber(f[SPEAKING.SCHEDULE.REC_VIEWS_4W]),
      enrolled,
    };
  });
}

// ---------------------------------------------------------------------------
// Workshop Live Feedback fetcher
// ---------------------------------------------------------------------------

function avgNonNull(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? nums.reduce((s, v) => s + v, 0) / nums.length : null;
}

export async function fetchWorkshopFeedback(): Promise<WorkshopFeedbackSummary> {
  const raw = await fetchAllRecords<Record<string, unknown>>(
    BASE_IDS.SPEAKING,
    SPEAKING.WORKSHOP_FEEDBACK.TABLE_ID,
    { fields: WORKSHOP_FIELDS }
  );

  const records: WorkshopFeedbackRecord[] = raw.map((r) => {
    const f = r.fields;
    return {
      id:               r.id,
      name:             asString(f[SPEAKING.WORKSHOP_FEEDBACK.NAME]),
      nps:              asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.NPS]),
      csat:             asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.CSAT]),
      expectationsMet:  asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.EXPECTATIONS_MET]),
      breakoutScore:    asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.BREAKOUT_SCORE]),
      confidenceBefore: asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.CONFIDENCE_BEFORE]),
      confidenceAfter:  asNumber(f[SPEAKING.WORKSHOP_FEEDBACK.CONFIDENCE_AFTER]),
      breakthrough:     asString(f[SPEAKING.WORKSHOP_FEEDBACK.BREAKTHROUGH]),
      improvements:     asString(f[SPEAKING.WORKSHOP_FEEDBACK.IMPROVEMENTS]),
      inpersonVsVirtual:asString(f[SPEAKING.WORKSHOP_FEEDBACK.INPERSON_VS_VIRTUAL]),
    };
  });

  const avgConfidenceBefore = avgNonNull(records.map((r) => r.confidenceBefore));
  const avgConfidenceAfter  = avgNonNull(records.map((r) => r.confidenceAfter));

  return {
    responseCount:       records.length,
    avgNps:              avgNonNull(records.map((r) => r.nps)),
    avgCsat:             avgNonNull(records.map((r) => r.csat)),
    avgExpectationsMet:  avgNonNull(records.map((r) => r.expectationsMet)),
    avgBreakoutScore:    avgNonNull(records.map((r) => r.breakoutScore)),
    avgConfidenceBefore,
    avgConfidenceAfter,
    confidenceDelta:
      avgConfidenceBefore !== null && avgConfidenceAfter !== null
        ? avgConfidenceAfter - avgConfidenceBefore
        : null,
    records,
  };
}

// ---------------------------------------------------------------------------
// Onboarding count fetcher — Sprint 1: just the count; full data in Sprint 5
// ---------------------------------------------------------------------------

export async function fetchOnboardingCount(): Promise<number> {
  const url = `${AIRTABLE_API_BASE}/${BASE_IDS.SPEAKING}/${SPEAKING.STUDENT_ONBOARDING.TABLE_ID}?maxRecords=1&returnFieldsByFieldId=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${pat()}`, "Content-Type": "application/json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { offset?: string };
  // Airtable doesn't return a total count directly; we fetch pageSize=100 and use the offset
  // heuristic. For a true count, fetch all pages. Since 160 records fit in one page, we fetch all.
  const allRecords = await fetchAllRecords<Record<string, unknown>>(
    BASE_IDS.SPEAKING,
    SPEAKING.STUDENT_ONBOARDING.TABLE_ID,
    { fields: [SPEAKING.STUDENT_ONBOARDING.NAME] }
  );
  void data; // suppress unused warning
  return allRecords.length;
}

// Pulls the GOALS and WANTS_TO_LEARN free-text answers from the Speaking
// onboarding survey. Used by Sprint 5 AC3 (Goal Alignment Delta) to compare
// what students said they wanted to learn against what was actually taught.
export async function fetchOnboardingGoals(): Promise<string[]> {
  const records = await fetchAllRecords<Record<string, unknown>>(
    BASE_IDS.SPEAKING,
    SPEAKING.STUDENT_ONBOARDING.TABLE_ID,
    {
      fields: [
        SPEAKING.STUDENT_ONBOARDING.GOALS,
        SPEAKING.STUDENT_ONBOARDING.WANTS_TO_LEARN,
      ],
    }
  );
  const goals: string[] = [];
  for (const r of records) {
    const g = asString(r.fields[SPEAKING.STUDENT_ONBOARDING.GOALS]);
    const w = asString(r.fields[SPEAKING.STUDENT_ONBOARDING.WANTS_TO_LEARN]);
    if (g) goals.push(g);
    if (w) goals.push(w);
  }
  return goals;
}

// ---------------------------------------------------------------------------
// Top-level data fetcher — fetches everything in parallel with shared lookups
// ---------------------------------------------------------------------------

export async function fetchAllSpeakingData(): Promise<{
  lessons: LessonRecord[];
  feedback: FeedbackRecord[];
  schedule: ScheduleRecord[];
  workshopFeedback: WorkshopFeedbackSummary;
  onboardingCount: number;
}> {
  // Fetch lookup tables and raw records in parallel — speakers shared across both
  const [rawLessons, rawFeedback, speakerLookup, moduleLookup, workshopFeedback, onboardingCount] =
    await Promise.all([
      fetchAllRecords<Record<string, unknown>>(
        BASE_IDS.SPEAKING,
        SPEAKING.LESSONS.TABLE_ID,
        { fields: LESSON_FIELDS }
      ),
      fetchAllRecords<Record<string, unknown>>(
        BASE_IDS.SPEAKING,
        SPEAKING.SESSION_FEEDBACK.TABLE_ID,
        { fields: FEEDBACK_FIELDS }
      ),
      fetchNameLookup(BASE_IDS.SPEAKING, SPEAKING.SPEAKERS.TABLE_ID, SPEAKING.SPEAKERS.NAME),
      fetchNameLookup(BASE_IDS.SPEAKING, SPEAKING.PARTS.TABLE_ID, SPEAKING.PARTS.NAME),
      fetchWorkshopFeedback(),
      fetchOnboardingCount(),
    ]);

  // Schedule needs the speakerLookup — fetch after lookup is ready
  const schedule = await fetchScheduleData(speakerLookup);

  const lessons: LessonRecord[] = await Promise.all(
    rawLessons.map(async (r) => {
      const f = r.fields;
      return {
        id:           r.id,
        lessonTitle:  asString(f[SPEAKING.LESSONS.LESSON_TITLE]) ?? "(Untitled)",
        speakerNames: resolveLinkedNames(f[SPEAKING.LESSONS.SPEAKER], speakerLookup),
        attendees:    asNumber(f[SPEAKING.LESSONS.ATTENDEES]),
        avgRating:    asNumber(f[SPEAKING.LESSONS.AVG_RATING]),
        numRatings:   asNumber(f[SPEAKING.LESSONS.NUM_RATINGS]),
        recViews1w:   asNumber(f[SPEAKING.LESSONS.REC_VIEWS_1W]),
        recViews4w:   asNumber(f[SPEAKING.LESSONS.REC_VIEWS_4W]),
        enrolled:     asNumber(f[SPEAKING.LESSONS.ENROLLED]),
        type:         asString(f[SPEAKING.LESSONS.TYPE]),
        module:       resolveLinkedNames(f[SPEAKING.LESSONS.MODULE], moduleLookup)[0] ?? null,
        yearCohort:   asString(f[SPEAKING.LESSONS.YEAR_COHORT]),
        lessonTranscript: await resolveTranscriptText(f[SPEAKING.LESSONS.TRANSCRIPT]),
      };
    })
  );

  const feedback: FeedbackRecord[] = rawFeedback.map((r) => {
    const f = r.fields;
    return {
      id:             r.id,
      rating:         asNumber(f[SPEAKING.SESSION_FEEDBACK.RATING]),
      feedbackText:   asString(f[SPEAKING.SESSION_FEEDBACK.FEEDBACK_TEXT]),
      speakerNames:   resolveLinkedNames(f[SPEAKING.SESSION_FEEDBACK.SPEAKER], speakerLookup),
      followUpNeeded: asBoolean(f[SPEAKING.SESSION_FEEDBACK.FOLLOW_UP_NEEDED]),
    };
  });

  return { lessons, feedback, schedule, workshopFeedback, onboardingCount };
}
