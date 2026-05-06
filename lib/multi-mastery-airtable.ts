import { fetchAllRecords } from "@/lib/airtable";
import { MASTERY_SCHEMAS, type MasterySchemaConfig } from "@/lib/airtable-schema";
import { resolveTranscriptText } from "@/lib/transcripts";
import type { MasteryKey, MasteryLessonRecord, MasteryFeedbackRecord, SpeakerEntity } from "@/types/speaking";

// ---------------------------------------------------------------------------
// Field value extractors — duplicated here to stay independent of airtable.ts
// internals; airtable.ts keeps these private.
// ---------------------------------------------------------------------------

function asNumber(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }
  if (Array.isArray(val) && val.length > 0) return asNumber(val[0]);
  return null;
}

function asString(val: unknown): string | null {
  if (typeof val === "string") return val.trim() || null;
  // multipleSelects returns an array of strings — take the first element
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string")
    return (val[0] as string).trim() || null;
  return null;
}

function asBoolean(val: unknown): boolean {
  return val === true || val === 1 || val === "true";
}

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
// Speaker name lookup
// ---------------------------------------------------------------------------

async function fetchSpeakerEntities(
  baseId: string,
  schema: MasterySchemaConfig["speakers"]
): Promise<{ map: Map<string, string>; entities: SpeakerEntity[] }> {
  const fields = [schema.NAME];
  if (schema.MASTERY_LESSONS) fields.push(schema.MASTERY_LESSONS);
  if (schema.SUMMIT_SESSIONS) fields.push(schema.SUMMIT_SESSIONS);

  const raw = await fetchAllRecords<Record<string, unknown>>(baseId, schema.TABLE_ID, {
    fields,
  });
  
  const map = new Map<string, string>();
  const entities: SpeakerEntity[] = [];

  for (const r of raw) {
    const name = asString(r.fields[schema.NAME]);
    if (name) {
      map.set(r.id, name);
      
      const masteryLessonIds = schema.MASTERY_LESSONS && r.fields[schema.MASTERY_LESSONS] 
        ? (r.fields[schema.MASTERY_LESSONS] as string[]) 
        : [];
      const summitSessionIds = schema.SUMMIT_SESSIONS && r.fields[schema.SUMMIT_SESSIONS] 
        ? (r.fields[schema.SUMMIT_SESSIONS] as string[]) 
        : [];

      entities.push({
        id: r.id,
        name,
        masteryLessonIds,
        summitSessionIds,
      });
    }
  }
  return { map, entities };
}

// ---------------------------------------------------------------------------
// Single-mastery data fetch
// ---------------------------------------------------------------------------

export async function fetchMasteryData(schema: MasterySchemaConfig): Promise<{
  masteryKey: MasteryKey;
  lessons: MasteryLessonRecord[];
  feedback: MasteryFeedbackRecord[];
  speakers: SpeakerEntity[];
}> {
  // TRANSCRIPT field is only present in the Speaking schema today
  // (Phase 4 PRD: confirmed for Speaking, partial for Manifesting, TBD elsewhere).
  const transcriptField = (schema.lessons as { TRANSCRIPT?: string }).TRANSCRIPT;

  const lessonFields = [
    schema.lessons.LESSON_TITLE,
    schema.lessons.SPEAKER,
    schema.lessons.ATTENDEES,
    schema.lessons.AVG_RATING,
    schema.lessons.NUM_RATINGS,
    schema.lessons.REC_VIEWS_1W,
    schema.lessons.REC_VIEWS_4W,
    schema.lessons.TYPE,
    schema.lessons.YEAR_COHORT,
    // Only include ENROLLED if the field exists for this mastery
    ...(schema.lessons.ENROLLED ? [schema.lessons.ENROLLED] : []),
    ...(transcriptField ? [transcriptField] : []),
  ];

  const feedbackFields = [
    schema.feedback.RATING,
    schema.feedback.FEEDBACK_TEXT,
    schema.feedback.SPEAKER,
    schema.feedback.FOLLOW_UP_NEEDED,
  ];

  const [rawLessons, rawFeedback, { map: speakerLookup, entities: speakerEntities }] = await Promise.all([
    fetchAllRecords<Record<string, unknown>>(schema.baseId, schema.lessons.TABLE_ID, {
      fields: lessonFields,
    }),
    fetchAllRecords<Record<string, unknown>>(schema.baseId, schema.feedback.TABLE_ID, {
      fields: feedbackFields,
    }),
    fetchSpeakerEntities(schema.baseId, schema.speakers),
  ]);

  const lessons: MasteryLessonRecord[] = await Promise.all(
    rawLessons.map(async (r) => {
      const f = r.fields;
      return {
        id:           r.id,
        masteryKey:   schema.key,
        lessonTitle:  asString(f[schema.lessons.LESSON_TITLE]) ?? "(Untitled)",
        speakerNames: resolveLinkedNames(f[schema.lessons.SPEAKER], speakerLookup),
        attendees:    asNumber(f[schema.lessons.ATTENDEES]),
        avgRating:    asNumber(f[schema.lessons.AVG_RATING]),
        numRatings:   asNumber(f[schema.lessons.NUM_RATINGS]),
        recViews1w:   asNumber(f[schema.lessons.REC_VIEWS_1W]),
        recViews4w:   asNumber(f[schema.lessons.REC_VIEWS_4W]),
        enrolled:     schema.lessons.ENROLLED ? asNumber(f[schema.lessons.ENROLLED]) : null,
        type:         asString(f[schema.lessons.TYPE]),
        module:       null, // module linking not implemented for non-Speaking masteries
        yearCohort:   asString(f[schema.lessons.YEAR_COHORT]),
        lessonTranscript: transcriptField ? await resolveTranscriptText(f[transcriptField]) : null,
      };
    })
  );

  const feedback: MasteryFeedbackRecord[] = rawFeedback.map((r) => {
    const f = r.fields;
    return {
      id:             r.id,
      masteryKey:     schema.key,
      rating:         asNumber(f[schema.feedback.RATING]),
      feedbackText:   asString(f[schema.feedback.FEEDBACK_TEXT]),
      speakerNames:   resolveLinkedNames(f[schema.feedback.SPEAKER], speakerLookup),
      followUpNeeded: asBoolean(f[schema.feedback.FOLLOW_UP_NEEDED]),
    };
  });

  return { masteryKey: schema.key, lessons, feedback, speakers: speakerEntities };
}

// ---------------------------------------------------------------------------
// Fetch all 6 masteries in parallel
// ---------------------------------------------------------------------------

export async function fetchAllMasteriesData(): Promise<
  { masteryKey: MasteryKey; lessons: MasteryLessonRecord[]; feedback: MasteryFeedbackRecord[]; speakers: SpeakerEntity[] }[]
> {
  return Promise.all(
    MASTERY_SCHEMAS.map(async (schema) => {
      try {
        return await fetchMasteryData(schema);
      } catch (err) {
        console.error(`[fetch] Failed ${schema.key}:`, err);
        return { masteryKey: schema.key, lessons: [], feedback: [], speakers: [] };
      }
    })
  );
}
