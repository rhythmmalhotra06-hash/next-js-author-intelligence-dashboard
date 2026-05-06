/**
 * Airtable Schema — Canonical Field & Table ID Reference
 *
 * RULES:
 * - Every Airtable API call MUST reference IDs from this file, never field/table names.
 * - Field names in Airtable can change at any time. IDs cannot. This file is the contract.
 * - When a field is renamed in Airtable, update the COMMENT here — the ID stays the same.
 * - When adding a new field to code, add it here first, then reference the constant.
 *
 * VERIFICATION STATUS:
 * ✅ VERIFIED   — ID pulled directly from Airtable REST API (/meta/bases/:id/tables).
 * ⚠️  NEEDS_VERIFY — Table or field ID not yet confirmed via API.
 *                    Do NOT ship code that reads from NEEDS_VERIFY fields without confirming.
 *
 * ARCHITECTURE NOTE — Shared Tables:
 * Speaking & Influence, Manifesting, and AI Mastery all return the SAME table IDs for
 * their Lessons table (tblxZy7RMJ2naoHhS) and Session Feedback table (tblIVJT8HaiLcrx62).
 * These are cross-base shared/synced tables. The TABLE_ID is identical across all three bases,
 * but FIELD IDs differ — each base has its own view of the shared table, with different subsets
 * of fields and different IDs for fields added in each base context. Code must use the correct
 * field IDs for the base it is querying, even though the table ID is the same.
 *
 * Last verified: 2026-05-04
 * Verified by: Airtable REST API /meta/bases/:id/tables (PAT auth)
 */

// =============================================================================
// BASE IDs
// =============================================================================

export const BASE_IDS = {
  SPEAKING:         'appKlfvxdXofNlFfk', // ✅ Speaking & Influence Mastery
  MANIFESTING:      'appRBp4Lhmtf6im3W', // ✅ Manifesting Mastery
  AI_MASTERY:       'appHS19yXObg8sHZv', // ✅ AI Mastery
  ENTREPRENEURSHIP: 'appJVtywkn9mTFbLs', // ✅ Entrepreneurship Mastery
  SPIRITUAL:        'appsRrP9oJQMD5nZU', // ✅ Spiritual Mastery
  SOCIAL:           'appf3Molaaw26nIH8', // ✅ Social Mastery
  FINANCE:          'appgZyJyIam1yPgOx', // ✅ Finance & Author base
};

// Convenience array for iterating all 6 mastery bases
export const MASTERY_BASE_IDS = [
  BASE_IDS.SPEAKING,
  BASE_IDS.MANIFESTING,
  BASE_IDS.AI_MASTERY,
  BASE_IDS.ENTREPRENEURSHIP,
  BASE_IDS.SPIRITUAL,
  BASE_IDS.SOCIAL,
];

// =============================================================================
// SPEAKING & INFLUENCE MASTERY  (appKlfvxdXofNlFfk)
// ✅ All IDs verified — PRD field reference + Airtable API (2026-05-04)
// NOTE: tblxZy7RMJ2naoHhS and tblIVJT8HaiLcrx62 are shared across
//       Speaking, Manifesting, and AI Mastery bases. Field IDs differ per base.
// =============================================================================

export const SPEAKING = {

  LESSONS: {
    TABLE_ID:         'tblxZy7RMJ2naoHhS', // ✅ 📗 Lessons (shared table — same ID in Manifesting + AI Mastery)
    LESSON_TITLE:     'fldV2EULr68GXKJS1', // ✅ Lesson Title
    SPEAKER:          'fldTcENZo3emsSz3p', // ✅ Speaker (linked record → Speakers table)
    ATTENDEES:        'fldFcRtvZHHO7qQvE', // ✅ Attendees (live headcount)
    AVG_RATING:       'fldHL2YJDPy0bywDX', // ✅ Avg Rating (rollup from Session Feedback)
    NUM_RATINGS:      'fldhi6fUR8ILI99yk', // ✅ # Ratings (rollup — sample size)
    REC_VIEWS_1W:     'fldSG2wzVP4qsl5Jd', // ✅ Rec. Views (1 week)
    REC_VIEWS_4W:     'fldN90svvI2VMiZ3P', // ✅ Rec. Views (after 4 weeks)
    ENROLLED:         'fldkTETbjHFWZ0Ljp', // ✅ Enrolled (cohort size)
    TYPE:             'fldioHdWx7jJJDGFT', // ✅ Type (lesson / Q&A / hotseat / workshop)
    MODULE:           'fldiaV5la37eaNJuE', // ✅ Module (linked record)
    YEAR_COHORT:      'fldzsqcM0etLPYxxA', // ✅ Year (Cohort)
    TRANSCRIPT:       'fldhXtb5dyPE1e1Qe', // ✅ Transcript (attachment — used in Phase 4)
  },

  // ---------------------------------------------------------------------------
  // 📆 Schedule  (tblHLAkRhmpMcNC84)
  // Per-session slots — the authoritative level for session performance metrics.
  // Session Feedback links to Schedule (not Lessons), so AVR_RATING and
  // FEEDBACK_ROLLUP here are the most accurate per-session aggregates.
  // ---------------------------------------------------------------------------
  SCHEDULE: {
    TABLE_ID:         'tblHLAkRhmpMcNC84', // ✅ 📆 Schedule
    ORDER:            'fldqseOU4gXyzIWZX', // ✅ Order (session number + cohort year)
    LESSON:           'fldSZYEI69VtEL6bd', // ✅ Lesson (multipleRecordLinks → 📗 Lessons)
    SPEAKER:          'fldCiGj9Kphal5zKh', // ✅ Speaker (multipleLookupValues from Lesson)
    DATE_TIME:        'fldT35BrhJjtuFlvW', // ✅ Date & Time [Pacific Time]
    ZOOM_LINK:        'fldxwDKcIauDkNrW0', // ✅ Zoom link
    AVR_RATING:       'fld3QlXMyTPb8CaHw', // ✅ AVR Rating (rollup avg — authoritative per-session score)
    COUNT_RATINGS:    'fldpzhmzFrGgLHptS', // ✅ COUNT Ratings (rollup count — feedback sample size)
    FEEDBACK_ROLLUP:  'fldkqZBVEbZB5JKmD', // ✅ Feedback Rollup (rollup — all raw feedback text concatenated)
    YEAR_COHORT:      'fldObVqWg30Gaka5L', // ✅ Year (Cohort) (singleSelect)
    ATTENDEES:        'fldnLOhdtPfO54wOb', // ✅ Attendees (number)
    REC_VIEWS_1W:     'fldR9DtMRJn39qIgC', // ✅ Rec. Views (1 week) (number)
    REC_VIEWS_4W:     'fld85mMe6sBQVpKHi', // ✅ Rec Views End (after 4 weeks) (number)
    ENROLLED:         'fldGarxYXA0FK25Ic', // ✅ Enrolled (from Lesson) (multipleLookupValues)
    FEEDBACK_FORM_URL:'fldhJQSfaU2MM5iTD', // ✅ Feedback Form URL (formula)
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tblIVJT8HaiLcrx62', // ✅ 📩 Lesson Feedback (shared table — same ID in Manifesting + AI Mastery)
    RATING:           'fldqg7Oe7AeNZEruc', // ✅ Rating (1–10)
    FEEDBACK_TEXT:    'flddAP3X5OGwMbIA2', // ✅ Feedback (rich text — NLP source)
    SPEAKER:          'fldB8uZjz2X99B1QB', // ✅ Speaker (lookup)
    FOLLOW_UP_NEEDED: 'fldgZbARNY5VHAes8', // ✅ Follow-up Needed (bool)
    FEEDBACK_CALC:    'fldpVhE6iYiA9wXE5', // ✅ Feedback Calculation (formula)
  },

  // ---------------------------------------------------------------------------
  // 📋 Workshop Live Feedback  (tblNNXgnbOuPsMaQG)
  // In-person workshop responses (Amsterdam MVU, Aug 2025). 21 records.
  // Distinct from session feedback — captures NPS/CSAT/Expectations and
  // confidence change (Before → After) for the live workshop format.
  // ---------------------------------------------------------------------------
  WORKSHOP_FEEDBACK: {
    TABLE_ID:           'tblNNXgnbOuPsMaQG', // ✅ 📋 Workshop Live Feedback
    NAME:               'fldrhPmg0N90TzbdD', // ✅ Name (respondent)
    NPS:                'fldSTGkz4WtM1F8N5', // ✅ NPS (1–10)
    CSAT:               'fldDsHD5epZUAVGe1', // ✅ CSAT (1–5)
    EXPECTATIONS_MET:   'fldR7gz1Jr5T9GHya', // ✅ Expectations met (1–5)
    BREAKOUT_SCORE:     'fldqGljB7F3XE21sh', // ✅ Score: Breakout rooms (1–5)
    CONFIDENCE_BEFORE:  'fld1AGrU3NTIwoO5C', // ✅ Confidence: Before (1–5)
    CONFIDENCE_AFTER:   'fldIprFPTw9JT58SD', // ✅ Confidence: After (1–5)
    BREAKTHROUGH:       'fldcGkkOmRk9qzPj4', // ✅ Breakthrough (multilineText)
    IMPROVEMENTS:       'fldz7atVdzG1mjmx9', // ✅ Improvements (multilineText)
    INPERSON_VS_VIRTUAL:'fld8W3E93kX2A507m', // ✅ In-person vs Virtual (multilineText)
  },

  // ---------------------------------------------------------------------------
  // 🙋‍♀️ Student Onboarding Survey  (tbl3pUVsIlo3tnbYW)
  // Pre-program baseline — 160 responses (2025 cohort).
  // Used for Goal Alignment Delta in Sprint 5 (AI analysis layer).
  // ---------------------------------------------------------------------------
  STUDENT_ONBOARDING: {
    TABLE_ID:            'tbl3pUVsIlo3tnbYW', // ✅ 🙋‍♀️ Student Onboarding Survey
    NAME:                'fldKD6ETDq5EMLYiM', // ✅ Name
    GENDER:              'fldqEYZWzyzp36WnG', // ✅ Gender (singleSelect)
    AGE_GROUP:           'fldBJEzhVkdJlikqO', // ✅ Age Group (singleSelect)
    FOCUS:               'fldyiGBtZTQJ5ARV5', // ✅ Focus / speaking ambition (singleSelect)
    TECHNIQUES:          'fldJDBTxfja2ysuss', // ✅ Techniques / current speaking contexts (multipleSelects)
    GOALS:               'fld286Y2OHwqgnytJ', // ✅ Goals (multilineText — free text)
    CONFIDENCE:          'fldZ9QA5Nx8EfK4zi', // ✅ Confidence (rating — baseline)
    COMFORT:             'fld9aEix634xOz4KL', // ✅ Comfort (rating — baseline)
    LOW_CONFIDENCE_IN:   'flds8j3qvdbQy54OE', // ✅ Low confidence in (multipleSelects)
    WANTS_TO_LEARN:      'fldRReZ0TEy5xF8YR', // ✅ Wants to learn (multipleSelects)
    YEAR:                'fldki0HimBlszNihg', // ✅ Year (singleSelect)
  },

};

// =============================================================================
// MANIFESTING MASTERY  (appRBp4Lhmtf6im3W)
// ✅ All IDs verified from Airtable REST API (2026-05-04)
// SHARES Lessons (tblxZy7RMJ2naoHhS) and Session Feedback (tblIVJT8HaiLcrx62)
// with Speaking & AI Mastery — same table IDs, different field IDs for most fields.
// =============================================================================

export const MANIFESTING = {

  LESSONS: {
    TABLE_ID:         'tblxZy7RMJ2naoHhS', // ✅ 📗 Lessons (shared — same ID as Speaking & AI Mastery)
    LESSON_TITLE:     'fldV2EULr68GXKJS1', // ✅ Lesson Title (same field ID as Speaking)
    SPEAKER:          'fldTcENZo3emsSz3p', // ✅ Speaker (same field ID as Speaking)
    ATTENDEES:        'fldWb6yahESIAnSdh', // ✅ Attendees
    AVG_RATING:       'fldVwu0BkBGWhcjrv', // ✅ Avg Rating (rollup)
    NUM_RATINGS:      'fldZyfiKwxEY6Zd12', // ✅ # Ratings (rollup)
    REC_VIEWS_1W:     'fld8jdUs1LjCjXLPv', // ✅ Rec. Views (1 week)
    REC_VIEWS_4W:     'fldOar3pw57wtfwd5', // ✅ Rec. Views (after 4 weeks)
    ENROLLED:         null,                 // not on Lessons — available via Schedule table (tblHLAkRhmpMcNC84 fldBre7ZpRnhOy9Gs)
    TYPE:             'fldwqQkWKR038SpI0', // ✅ Type (singleSelect)
    MODULE:           'fldiaV5la37eaNJuE', // ✅ Module (same field ID as Speaking)
    YEAR_COHORT:      'fldfBwBmRO7sTjpEQ', // ✅ Year (Cohort) — multipleSelects (differs from Speaking singleSelect)
    TRANSCRIPT:       'fldNLrDD7vHePaScc', // ✅ Transcript
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tblIVJT8HaiLcrx62', // ✅ 📩 Lesson Feedback (shared — same ID as Speaking & AI Mastery)
    RATING:           'fldqg7Oe7AeNZEruc', // ✅ Rating (same field ID as Speaking)
    FEEDBACK_TEXT:    'flddAP3X5OGwMbIA2', // ✅ Feedback text (same field ID as Speaking)
    SPEAKER:          'fldB8uZjz2X99B1QB', // ✅ Speaker lookup (same field ID as Speaking)
    FOLLOW_UP_NEEDED: 'fldWKFawXWeh7fkIt', // ✅ Follow up Needed (different from Speaking)
    FEEDBACK_CALC:    'fldjuvqT2KzhULrLl', // ✅ Feedback Calculation (formula)
  },

  STUDENT_ONBOARDING: {
    TABLE_ID:         'tbl3pUVsIlo3tnbYW', // ✅ 🙋‍♀️ Student Survey
  },

};

// =============================================================================
// AI MASTERY  (appHS19yXObg8sHZv)
// ✅ All IDs verified from Airtable REST API (2026-05-04)
// SHARES Lessons (tblxZy7RMJ2naoHhS) and Session Feedback (tblIVJT8HaiLcrx62)
// with Speaking & Manifesting — same table IDs, different field IDs for most fields.
// =============================================================================

export const AI_MASTERY = {

  LESSONS: {
    TABLE_ID:         'tblxZy7RMJ2naoHhS', // ✅ 📗 Lessons (shared — same ID as Speaking & Manifesting)
    LESSON_TITLE:     'fldV2EULr68GXKJS1', // ✅ Lesson Title (same field ID as Speaking)
    SPEAKER:          'fldTcENZo3emsSz3p', // ✅ Speaker (same field ID as Speaking)
    ATTENDEES:        'fldARu9KpzJhaerFY', // ✅ Attendees
    AVG_RATING:       'fldZ3io58cZhAMdm1', // ✅ Avg Rating (rollup)
    NUM_RATINGS:      'fldrWDJMK1rGhckYR', // ✅ # Ratings (rollup)
    REC_VIEWS_1W:     'fld34BF8gdpIkXvxr', // ✅ Rec. Views (1 week)
    REC_VIEWS_4W:     'fld9jVFG7OkegZcaQ', // ✅ Rec. Views (after 4 weeks)
    ENROLLED:         null,                 // not on Lessons — available via Schedule table
    TYPE:             'fldH8nvBUgeOZYavz', // ✅ Type (singleSelect)
    MODULE:           'fldia4QzQEVchB0Ri', // ✅ Module
    YEAR_COHORT:      'fldWppuoAQYMP64vL', // ✅ Year (Cohort) — singleSelect
    TRANSCRIPT:       'fldhXtb5dyPE1e1Qe', // ✅ Transcript (same field ID as Speaking)
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tblIVJT8HaiLcrx62', // ✅ 📩 Lesson Feedback (shared — same ID as Speaking & Manifesting)
    RATING:           'fldqg7Oe7AeNZEruc', // ✅ Rating (same field ID as Speaking)
    FEEDBACK_TEXT:    'flddAP3X5OGwMbIA2', // ✅ Feedback text (same field ID as Speaking)
    SPEAKER:          'fldB8uZjz2X99B1QB', // ✅ Speaker lookup (same field ID as Speaking)
    FOLLOW_UP_NEEDED: 'fldgZbARNY5VHAes8', // ✅ Follow up Needed (same field ID as Speaking)
  },

  STUDENT_ONBOARDING: {
    TABLE_ID:         'tblDd1q6KNPPVT9RY', // ✅ Onboarding Survey 2025 & 2026
  },

};

// =============================================================================
// ENTREPRENEURSHIP MASTERY  (appJVtywkn9mTFbLs)
// ✅ All IDs verified from Airtable REST API (2026-05-04)
// NOTE: REC_VIEWS_1W is a multipleLookupValues field (lookup from Schedule),
//       not a direct number. Aggregate queries should account for this.
// =============================================================================

export const ENTREPRENEURSHIP = {

  LESSONS: {
    TABLE_ID:         'tblV7Z54v3bPdKfgC', // ✅ 📗 Lessons
    LESSON_TITLE:     'fldzRGW8KTOOArw4v', // ✅ Lesson Title (singleLineText)
    SPEAKER:          'fldBDHmH9LZoyOmnE', // ✅ Speaker (multipleRecordLinks)
    ATTENDEES:        'fldyVqL5BrQg2T9we', // ✅ Attendees (number)
    AVG_RATING:       'fldEqaJeFPknEgbiM', // ✅ Avg Rating (rollup)
    NUM_RATINGS:      'fldNPTbU559OaO5p4', // ✅ # Ratings (rollup)
    REC_VIEWS_1W:     'fldWvh92xtJfjDe9g', // ✅ Rec. Views (1 week) — multipleLookupValues from Schedule
    REC_VIEWS_4W:     'fldfARGn08NNlo5Rj', // ✅ Rec. Views (after 4 weeks) (number)
    ENROLLED:         null,                 // not on Lessons — available via Schedule table (tblUrAqZ6NdpheM35 fldvssEm7PwwoVXyt)
    TYPE:             'fldJypjg6rbfzIAmL', // ✅ Type (singleSelect)
    MODULE:           'fldtb2VSRzG3VMBUY', // ✅ Module (multipleRecordLinks)
    YEAR_COHORT:      'fldsF5mvWMTUb5jNP', // ✅ Year (Cohort) (singleSelect)
    TRANSCRIPT:       'fldtN0CiAHD8ByZOE', // ✅ Transcript (multipleAttachments)
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tblUmVkpP2SDu3x6y', // ✅ 📩 Lesson Feedback
    RATING:           'fldCHjfvfsOFhgruI', // ✅ Rating
    FEEDBACK_TEXT:    'fldp11uedGgo4NIAy', // ✅ Feedback (richText)
    SPEAKER:          'fldNzGqAHUx1rd1Q7', // ✅ Speaker (multipleLookupValues)
    FOLLOW_UP_NEEDED: 'fldQgymMi21t5GbjG', // ✅ Follow up Needed (checkbox)
    FEEDBACK_CALC:    'fldtGVcBUdLSa30Jf', // ✅ Feedback Calculation (formula)
  },

  STUDENT_ONBOARDING: {
    TABLE_ID:         'tbl7Xjs6Uh9RdyVzX', // ✅ 🙋‍♀️ Student Onboarding Survey
  },

};

// =============================================================================
// SPIRITUAL MASTERY  (appsRrP9oJQMD5nZU)
// ✅ All IDs verified from Airtable REST API (2026-05-04)
// =============================================================================

export const SPIRITUAL = {

  LESSONS: {
    TABLE_ID:         'tblBGieEss6v1T51S', // ✅ 📗 Lessons
    LESSON_TITLE:     'fldk5SRk6C9i572Vf', // ✅ Lesson Title (singleLineText)
    SPEAKER:          'fld2DKeH8wDA6zJL3', // ✅ Speaker (multipleRecordLinks)
    ATTENDEES:        'fldm3GZNKCRoABsBL', // ✅ Attendees (number)
    AVG_RATING:       'fldFwvtDKkBBUAe2o', // ✅ Avg Rating (rollup)
    NUM_RATINGS:      'fldlLPJf1zb7FW5z1', // ✅ # Ratings (rollup)
    REC_VIEWS_1W:     'flddqj1i6mdMSfzHB', // ✅ Rec. Views (1 week) (number)
    REC_VIEWS_4W:     'fldARzNmXTVVA3iyg', // ✅ Rec. Views (after 4 weeks) (number)
    ENROLLED:         'fldKKa0LeVguVISEj', // ✅ Enrolled (formula)
    TYPE:             'fldB2BawWz191Y1qv', // ✅ Type (singleSelect)
    MODULE:           'fld73Em4vEH84z9fQ', // ✅ Module (multipleRecordLinks)
    YEAR_COHORT:      'fld2qDOsPZtckL1dA', // ✅ Year (Cohort) (singleSelect)
    TRANSCRIPT:       'fldwaXJ3AgXncuWBH', // ✅ Transcript (multipleAttachments)
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tblGPsCjMehbf659x', // ✅ 📩 Lesson Feedback
    RATING:           'fldLku4L8VTfSUav9', // ✅ Rating (rating field type)
    FEEDBACK_TEXT:    'fld7N2t0yV2mesya9', // ✅ Feedback (multilineText)
    SPEAKER:          'fld5EMsljP2EvNgtq', // ✅ Speaker (multipleLookupValues)
    FOLLOW_UP_NEEDED: 'fldrCbgV3dQzfZzpa', // ✅ Follow up Needed (checkbox)
    FEEDBACK_CALC:    'fldHKaZboZxn3PIl1', // ✅ Feedback Calculation (formula)
  },

  STUDENT_ONBOARDING: {
    TABLE_ID:         'tblmh3m9VRk4RJ1pF', // ✅ 🙋‍♀️ Student Onboarding Survey
  },

};

// =============================================================================
// SOCIAL MASTERY  (appf3Molaaw26nIH8)
// ✅ All IDs verified from Airtable REST API (2026-05-04)
// NOTE: There are two Lessons tables in this base. tbl0zcp1iWABLmkQ3 is the
//       active 📗 Lessons table. tblv5vla5JXBTH5wd is a legacy flat copy — do not use.
// =============================================================================

export const SOCIAL = {

  LESSONS: {
    TABLE_ID:         'tbl0zcp1iWABLmkQ3', // ✅ 📗 Lessons (active table — NOT tblv5vla5JXBTH5wd)
    LESSON_TITLE:     'fld3q4lUz5K9sVmDU', // ✅ Lesson Title (multilineText)
    SPEAKER:          'fld07kwIyxcbNtFXA', // ✅ Speaker (multipleRecordLinks)
    ATTENDEES:        'fldKPYsWIb2SSxzuM', // ✅ Attendees (number)
    AVG_RATING:       'fldWSmQm6QFoPWlOu', // ✅ Avg Rating (rollup)
    NUM_RATINGS:      'fldo8v1Ydl5vTzvmW', // ✅ # Ratings (rollup)
    REC_VIEWS_1W:     'fldBjWryhHXP6OARm', // ✅ Rec. Views (1 week) (number)
    REC_VIEWS_4W:     'fldzH0KrtPWiL70bE', // ✅ Rec. Views (after 4 weeks) (number)
    ENROLLED:         null,                 // not on Lessons — available via Schedule table (tblpcaLTHz72os6oY fldJ955E1mSt2CSQu)
    TYPE:             'fldYpG9o696endpFK', // ✅ Type (singleSelect)
    MODULE:           'fldeNGkuRdjrYlzHc', // ✅ Module (multipleRecordLinks)
    YEAR_COHORT:      'flda51Os2ISo8zX6N', // ✅ Year (Cohort) (singleSelect)
    TRANSCRIPT:       'fldckZ3npDGp6Argg', // ✅ Transcript (multipleAttachments)
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         'tbllqw1Po59KSMYfU', // ✅ 📩 Lesson Feedback
    RATING:           'fldKU47CtYZJ2Z2s8', // ✅ Rating (rating field type)
    FEEDBACK_TEXT:    'fldUgRA0vZTlTjxdO', // ✅ Feedback (multilineText)
    SPEAKER:          'fldzLSm4l0YkodaD4', // ✅ Speaker (multipleLookupValues)
    FOLLOW_UP_NEEDED: 'flde7inNkzJl8RRxR', // ✅ Follow up Needed (checkbox)
    FEEDBACK_CALC:    'fldahdo8C8GzhLkF5', // ✅ Feedback Calculation (formula)
  },

  STUDENT_ONBOARDING: {
    TABLE_ID:         'tblp0D3GT8jqet6gO', // ✅ 👯‍♀️ Student Onboarding Survey
  },

};

// =============================================================================
// FINANCE & AUTHOR BASE  (appgZyJyIam1yPgOx)
// ✅ All IDs verified from Airtable MCP (2026-05-04)
// =============================================================================

export const FINANCE = {

  // ---------------------------------------------------------------------------
  // 💜 Authors  (tblAV7GcgFFjH3pHg)
  // Central author entity — primary join key to mastery speaker records is Name
  // ---------------------------------------------------------------------------
  AUTHORS: {
    TABLE_ID:                   'tblAV7GcgFFjH3pHg', // ✅
    NAME:                       'fld5brGnw8y3tX8WE', // ✅ Name — PRIMARY JOIN KEY to mastery speaker records
    DEAL_STATUS:                'fldTVUd0UjNZBP0yo', // ✅ Deal Status (singleSelect)
    YEAR_OF_ONBOARDING:         'fldRRQdzR7JMd8HMy', // ✅ Year of Onboarding (singleSelect)
    MV_SCORE:                   'fldOIEcy9lOuVNzfu', // ✅ MV Score (number)
    FINAL_WEIGHTED_SCORE:       'fld9N8OGpevTcy16S', // ✅ Final Weighted Score (number)
    AUTHOR_TIER:                'fldN2tXImqAuJ0EvG', // ✅ Author Tier (multilineText)
    SELECTION_RECOMMENDATION:   'fldIPfxf1K2y4bsGh', // ✅ Selection Recommendation (multilineText)
    FAME_OF_TEACHER:            'fldGsul8jtIn1GqNy', // ✅ Fame Of Teacher (rating)
    INSTAGRAM_FOLLOWERS:        'fldU8OWdyud68k5ao', // ✅ Instagram Followers (number)
    YOUTUBE_SUBSCRIBERS:        'fldANBGUesyOc4D5s', // ✅ YouTube Subscribers (number)
    TIKTOK_FOLLOWERS:           'fldoL6rOtFsQOg1Tk', // ✅ TikTok Followers (number)
    EMAIL_LIST_SIZE:            'fldqBPhRazqqmzvd5', // ✅ Email List Size (number)
    TOTAL_SOCIAL_REACH:         'fldvguW0OGwlpwb2Y', // ✅ Total Social Reach (number)
    GROWTH_90D_PCT:             'fldWm4OsQeodtTZY5', // ✅ 90d Growth % (percent)
    ENGAGEMENT_RATE:            'fldhJ513dpWQYVOsP', // ✅ Engagement Rate (percent)
    LINKEDIN_FOLLOWERS:         'fldpH9tAvr6fhsDzC', // ✅ Linkedin Followers (number)
    SCORE_VALUES_ALIGNMENT:     'fldjIG6mBfbR0H5kQ', // ✅ R – Values Alignment Score
    SCORE_PRODUCTION_QUALITY:   'fldP6Ugn99XA5nG9V', // ✅ N – Production Quality Score
    SCORE_COMMUNITY_STRENGTH:   'fldTqDeIr5ZBCA1CT', // ✅ N – Community Strength Score
    SCORE_REVENUE_POTENTIAL:    'fldA08lKWbV8kzSGB', // ✅ I – Revenue Potential Score
    SCORE_CURRICULUM_FIT:       'fldIQSaImFY7CT9jS', // ✅ I – Curriculum Fit Score
    SCORE_GROWTH_VELOCITY:      'fldA54lw3RRZb8Fg7', // ✅ I – Growth Velocity Score
    SCORE_ENGAGEMENT_QUALITY:   'fldSC9it6CryGqRZY', // ✅ I – Engagement Quality Score
    REQUIRED_GATE_STATUS:       'fldFBf4djZAogaJf7', // ✅ Required Gate Status (multilineText)
    AUTHOR_X_EVENT:             'fldfG2c3QGhKA7lus', // ✅ Author x Event (multipleRecordLinks)
    AUTHOR_ENTITIES:            'fldmCqYHuozJiJYeB', // ✅ Author Entities (multipleRecordLinks — WIP)
  },

  // ---------------------------------------------------------------------------
  // ⭐️ Author x Event  (tblgq4Ta5X9N3wyqm)
  // Per-engagement cost record — fee + expenses per speaker engagement
  // ---------------------------------------------------------------------------
  AUTHOR_X_EVENT: {
    TABLE_ID:       'tblgq4Ta5X9N3wyqm', // ✅
    NAME:           'fld9B9IuWRmTmmgP0', // ✅ Name (multilineText — primary field)
    STATUS:         'fldTygmw5sY5GItSm', // ✅ Status (singleSelect)
    AUTHOR:         'fldA2fORnIhIJjXVh', // ✅ Author (multipleRecordLinks → Authors)
    CALENDAR_EVENT: 'fldpDxObURsFVD9Kb', // ✅ Calendar (Event) (multipleRecordLinks)
    FEE:            'fldsHVNglcW7nMTa1', // ✅ Fee (currency — confirmed speaker fee)
    PROJECTED_FEE:  'fldlynINnqHq94RMt', // ✅ Projected Fee (currency)
    OTHER_EXPENSES: 'fldHTdbgILq74rIqx', // ✅ Other Expenses (currency — travel, accommodation)
    TOTAL_COST:     'fldw2ZnTql86mmJVy', // ✅ Total Cost (currency — fee + expenses)
    CONTRACT:       'fldmD5hQRjsaozBZJ', // ✅ Contract (multipleAttachments)
  },

  // ---------------------------------------------------------------------------
  // Author Entities  (tbli5GhmDuR155bO0)
  // Legal entity layer — rolled-up actual financials per author entity
  // ---------------------------------------------------------------------------
  AUTHOR_ENTITIES: {
    TABLE_ID:                   'tbli5GhmDuR155bO0', // ✅
    ENTITY_ID:                  'fldKY51tmCJu434Q4', // ✅ Entity ID (autoNumber — primary)
    NAME:                       'fldgciPQdTYMP5uRl', // ✅ Name (formula — Author x Entity Name)
    AUTHOR_ENTITY_NAME:         'fldJ5hCr9JuMXXuGI', // ✅ Author Entity Name (AI-extracted)
    AUTHOR:                     'fldCwUp8W6WhyDVoM', // ✅ Author (multipleRecordLinks → Authors)
    FEE_2026_ACTUAL:            'flds0gjNMqUctMg0C', // ✅ 2026 Actual Speaker Fee Amount (rollup)
    ROYALTIES_2026_ACTUAL:      'fldCpirjRxclwWy4T', // ✅ 2026 Actual Royalties Amount (rollup)
    FEE_2025_ACTUAL:            'fldFLu6IB11sqpyIV', // ✅ 2025 Actual Speaker Fee Amount (rollup)
    ROYALTIES_2025_ACTUAL:      'flduvu5wgNDZhMlTC', // ✅ 2025 Actual Royalties Amount (rollup)
    CONTRACT:                   'fldPAN52rdYAhT7TS', // ✅ Contract (multipleAttachments)
    CONTRACT_SUMMARY:           'fldn7VN7b6GxtoBr7', // ✅ Contract Summary (AI-extracted)
    ACTUAL_TRANSACTIONS:        'fldxIdlZSGcLU1xDd', // ✅ Actual Transactions 2 (multipleRecordLinks)
  },

  // ---------------------------------------------------------------------------
  // Actual Transactions  (tbluv0jndDIHaTRZA)
  // Invoice-level financial records — source of truth for confirmed payments
  // ---------------------------------------------------------------------------
  ACTUAL_TRANSACTIONS: {
    TABLE_ID:           'tbluv0jndDIHaTRZA', // ✅
    TRANSACTION_ID:     'fldt1jpQu9DIEuZKc', // ✅ Transaction ID (autoNumber — primary)
    INVOICE_NUMBER:     'fldKv8RKbsCDWdWtz', // ✅ Invoice Number (singleLineText)
    INVOICE_DATE:       'fldIFKgiy2jmTq8JT', // ✅ Invoice Date (date)
    CURRENCY:           'fldFQL5pRlFof8fVR', // ✅ Currency (singleSelect)
    INVOICE_AMOUNT:     'fldfxvxm35njUGKY3', // ✅ Invoice Amount (currency)
    NET_AMOUNT:         'fldYHy72BTqWsuHgs', // ✅ Net Amount (currency)
    BILL_STATUS:        'fldWiVA8LWaFlHPZq', // ✅ Bill Status (singleSelect)
    PAYMENT_STATUS:     'fldf9mSaUsoH3qYiT', // ✅ Payment Status (singleSelect)
    GL_EXPENSE_CODE:    'fldbmXK9Syc7OlnHw', // ✅ GL Expense Code (multipleRecordLinks) — fee vs royalties
    PRODUCT_CODE:       'fldM4P5m6hJbrk2ps', // ✅ Product Code (multipleRecordLinks) — maps to mastery
    INVOICE_YEAR:       'fldNtu1HoLUA3cbCb', // ✅ Invoice Year (formula — extracted from Invoice Date)
    AUTHOR_ENTITY:      'fldwYprCUx0zmVVDZ', // ✅ Author Entity (multipleRecordLinks)
    AUTHOR_LOOKUP:      'fldDl2XtLBB64y7xv', // ✅ Author (from Author Entity) (multipleLookupValues)
    BILL_MEMO:          'fldoi3VMOSTdIFq1q', // ✅ Bill Memo (multilineText)
  },

  // ---------------------------------------------------------------------------
  // Product Code  (tblxpmoOGCyJhZt12)
  // Maps financial transactions to mastery programs
  // ---------------------------------------------------------------------------
  PRODUCT_CODE: {
    TABLE_ID:           'tblxpmoOGCyJhZt12', // ✅
    PRODUCT_NAME:       'fldE9lb1RIuzXsITi', // ✅ Product Name (multilineText — primary)
    PRODUCT_CODE:       'fldTPDFVyFFO6UwSB', // ✅ Product Code (singleLineText)
    FEE_2025:           'fldXbo6QhARYCgkc3', // ✅ 2025 Speaker Fee (rollup)
    FEE_2026:           'fldFpbSV1wCrEMLsx', // ✅ 2026 Speaker Fee (rollup)
    ROYALTIES_2025:     'fldKuhmxEhC8BhutA', // ✅ 2025 Royalties (rollup)
    ROYALTIES_2026:     'fldMY4VhneOkZbTDE', // ✅ 2026 Royalties (rollup)
    BUSINESS_UNIT:      'fldV7liryI93Cj8gu', // ✅ Business Unit (singleLineText)
    ACTUAL_TRANSACTIONS:'fldM6p9x4Jyhb0h4s', // ✅ Actual Transactions (multipleRecordLinks)
  },

};

// =============================================================================
// CROSS-BASE LOOKUP — schema map indexed by base ID
// Useful for iterating all mastery bases without per-base conditional logic.
// Usage: MASTERY_SCHEMA[BASE_IDS.SPEAKING].LESSONS.AVG_RATING
// =============================================================================

export const MASTERY_SCHEMA = {
  [BASE_IDS.SPEAKING]:         SPEAKING,
  [BASE_IDS.MANIFESTING]:      MANIFESTING,
  [BASE_IDS.AI_MASTERY]:       AI_MASTERY,
  [BASE_IDS.ENTREPRENEURSHIP]: ENTREPRENEURSHIP,
  [BASE_IDS.SPIRITUAL]:        SPIRITUAL,
  [BASE_IDS.SOCIAL]:           SOCIAL,
};

// =============================================================================
// HELPER — build a fields array for Airtable API calls
// Usage: fields(SPEAKING.LESSONS, ['LESSON_TITLE', 'SPEAKER', 'ATTENDEES'])
// Returns: ['fldV2EULr68GXKJS1', 'fldTcENZo3emsSz3p', 'fldFcRtvZHHO7qQvE']
// =============================================================================

export function fields(tableSchema, keys) {
  return keys.map(k => {
    const id = tableSchema[k];
    if (!id) throw new Error(`Field "${k}" is null (NEEDS_VERIFY) — populate airtable-schema.js before use`);
    return id;
  });
}

// =============================================================================
// HELPER — guard against null IDs at runtime
// Throws early if any NEEDS_VERIFY field is used before being populated.
// Usage: assertVerified(MANIFESTING.LESSONS.TABLE_ID, 'MANIFESTING.LESSONS.TABLE_ID')
// =============================================================================

export function assertVerified(id, label) {
  if (!id) throw new Error(`Airtable schema not verified: ${label} is null. Populate airtable-schema.js first.`);
  return id;
}
