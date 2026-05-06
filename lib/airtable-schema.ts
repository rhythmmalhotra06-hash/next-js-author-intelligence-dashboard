/**
 * Airtable Schema — TypeScript version of /airtable-schema.js
 *
 * RULES: All Airtable API calls MUST use field IDs from this file.
 * Field names in Airtable can change; IDs cannot.
 *
 * Verification status:
 * All Speaking IDs verified via Airtable REST API on 2026-05-04.
 * All cross-mastery IDs (Manifesting, AI Mastery, Entrepreneurship, Spiritual, Social)
 * verified via Airtable MCP on 2026-05-04.
 * STUDENT_ONBOARDING table ID is null (NEEDS_VERIFY) — not used in Sprint 1.
 */

// =============================================================================
// BASE IDs
// =============================================================================

export const BASE_IDS = {
  SPEAKING:         "appKlfvxdXofNlFfk",
  MANIFESTING:      "appRBp4Lhmtf6im3W",
  AI_MASTERY:       "appHS19yXObg8sHZv",
  ENTREPRENEURSHIP: "appJVtywkn9mTFbLs",
  SPIRITUAL:        "appsRrP9oJQMD5nZU",
  SOCIAL:           "appf3Molaaw26nIH8",
  FINANCE:          "appgZyJyIam1yPgOx",
} as const;

// =============================================================================
// SPEAKING & INFLUENCE MASTERY  (appKlfvxdXofNlFfk)
// NOTE: tblxZy7RMJ2naoHhS and tblIVJT8HaiLcrx62 are shared/synced tables.
//       Same TABLE_ID across Speaking, Manifesting, AI Mastery.
//       Field IDs differ per base — always use this base's field IDs.
// =============================================================================

export const SPEAKING = {
  LESSONS: {
    TABLE_ID:      "tblxZy7RMJ2naoHhS",
    LESSON_TITLE:  "fldV2EULr68GXKJS1",
    SPEAKER:       "fldTcENZo3emsSz3p",
    ATTENDEES:     "fldFcRtvZHHO7qQvE",
    AVG_RATING:    "fldHL2YJDPy0bywDX",
    NUM_RATINGS:   "fldhi6fUR8ILI99yk",
    REC_VIEWS_1W:  "fldSG2wzVP4qsl5Jd",
    REC_VIEWS_4W:  "fldN90svvI2VMiZ3P",
    ENROLLED:      "fldkTETbjHFWZ0Ljp",
    TYPE:          "fldioHdWx7jJJDGFT",
    MODULE:        "fldiaV5la37eaNJuE",
    YEAR_COHORT:   "fldzsqcM0etLPYxxA",
    TRANSCRIPT:    "fldhXtb5dyPE1e1Qe",
  },

  // Per-session slots — authoritative source for AVR Rating and Feedback Rollup.
  // Session Feedback links to Schedule (not Lessons), so rollups here are accurate.
  SCHEDULE: {
    TABLE_ID:         "tblHLAkRhmpMcNC84",
    ORDER:            "fldqseOU4gXyzIWZX",
    LESSON:           "fldSZYEI69VtEL6bd",
    SPEAKER:          "fldCiGj9Kphal5zKh",
    DATE_TIME:        "fldT35BrhJjtuFlvW",
    ZOOM_LINK:        "fldxwDKcIauDkNrW0",
    AVR_RATING:       "fld3QlXMyTPb8CaHw",
    COUNT_RATINGS:    "fldpzhmzFrGgLHptS",
    FEEDBACK_ROLLUP:  "fldkqZBVEbZB5JKmD",
    YEAR_COHORT:      "fldObVqWg30Gaka5L",
    ATTENDEES:        "fldnLOhdtPfO54wOb",
    REC_VIEWS_1W:     "fldR9DtMRJn39qIgC",
    REC_VIEWS_4W:     "fld85mMe6sBQVpKHi",
    ENROLLED:         "fldGarxYXA0FK25Ic",
    FEEDBACK_FORM_URL:"fldhJQSfaU2MM5iTD",
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tblIVJT8HaiLcrx62",
    RATING:           "fldqg7Oe7AeNZEruc", // Rating (1–10)
    FEEDBACK_TEXT:    "flddAP3X5OGwMbIA2",
    SPEAKER:          "fldB8uZjz2X99B1QB",
    FOLLOW_UP_NEEDED: "fldgZbARNY5VHAes8",
    FEEDBACK_CALC:    "fldpVhE6iYiA9wXE5",
  },

  // In-person workshop feedback — 21 responses from Amsterdam MVU, Aug 2025.
  // NPS 1–10; CSAT, Expectations, Breakout, Confidence Before/After all 1–5.
  WORKSHOP_FEEDBACK: {
    TABLE_ID:           "tblNNXgnbOuPsMaQG",
    NAME:               "fldrhPmg0N90TzbdD",
    NPS:                "fldSTGkz4WtM1F8N5",
    CSAT:               "fldDsHD5epZUAVGe1",
    EXPECTATIONS_MET:   "fldR7gz1Jr5T9GHya",
    BREAKOUT_SCORE:     "fldqGljB7F3XE21sh",
    CONFIDENCE_BEFORE:  "fld1AGrU3NTIwoO5C",
    CONFIDENCE_AFTER:   "fldIprFPTw9JT58SD",
    BREAKTHROUGH:       "fldcGkkOmRk9qzPj4",
    IMPROVEMENTS:       "fldz7atVdzG1mjmx9",
    INPERSON_VS_VIRTUAL:"fld8W3E93kX2A507m",
  },

  // Pre-program baseline survey — 160 responses (2025 cohort).
  // Full Goal Alignment Delta analysis deferred to Sprint 5.
  STUDENT_ONBOARDING: {
    TABLE_ID:           "tbl3pUVsIlo3tnbYW",
    NAME:               "fldKD6ETDq5EMLYiM",
    GENDER:             "fldqEYZWzyzp36WnG",
    AGE_GROUP:          "fldBJEzhVkdJlikqO",
    FOCUS:              "fldyiGBtZTQJ5ARV5",
    TECHNIQUES:         "fldJDBTxfja2ysuss",
    GOALS:              "fld286Y2OHwqgnytJ",
    CONFIDENCE:         "fldZ9QA5Nx8EfK4zi",
    COMFORT:            "fld9aEix634xOz4KL",
    LOW_CONFIDENCE_IN:  "flds8j3qvdbQy54OE",
    WANTS_TO_LEARN:     "fldRReZ0TEy5xF8YR",
    YEAR:               "fldki0HimBlszNihg",
  },

  // Lookup tables — used to resolve linked record IDs to display names
  SPEAKERS: {
    TABLE_ID:        "tblp41QdehEIDh5KF",
    NAME:            "fldU78RLC8lE56fBW",
    MASTERY_LESSONS: "fldmzre5NaaDeHmUM",
    SUMMIT_SESSIONS: "fldpy06DkKaPKvrqj",
  },

  // Lessons.Module field links to the Parts table (🏁), not the Modules table.
  // Verified via meta API: fldiaV5la37eaNJuE.options.linkedTableId = tbl3kewb2Z7fEIkFl
  PARTS: {
    TABLE_ID:  "tbl3kewb2Z7fEIkFl",
    NAME:      "fldy6GLlcf4C6KaeZ",
  },
} as const;

// =============================================================================
// MANIFESTING MASTERY  (appRBp4Lhmtf6im3W)
// NOTE: LESSONS table tblxZy7RMJ2naoHhS is a synced table (same TABLE_ID as
//       SPEAKING.LESSONS). Field IDs differ — always use this base's IDs.
//       YEAR_COHORT is multipleSelects (array) — fetcher takes arr[0].
//       ENROLLED has no equivalent field in this base — returns null.
// =============================================================================

export const MANIFESTING = {
  LESSONS: {
    TABLE_ID:     "tblxZy7RMJ2naoHhS", // synced
    LESSON_TITLE: "fldV2EULr68GXKJS1",
    SPEAKER:      "fldTcENZo3emsSz3p",
    ATTENDEES:    "fldWb6yahESIAnSdh",
    AVG_RATING:   "fldVwu0BkBGWhcjrv",
    NUM_RATINGS:  "fldZyfiKwxEY6Zd12",
    REC_VIEWS_1W: "fld8jdUs1LjCjXLPv",
    REC_VIEWS_4W: "fldOar3pw57wtfwd5",
    ENROLLED:     null as string | null,   // field does not exist in this base
    TYPE:         "fldwqQkWKR038SpI0",
    YEAR_COHORT:  "fldfBwBmRO7sTjpEQ",    // multipleSelects — take arr[0]
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tblRWx0o51zbS6f5B",
    RATING:           "fld6qxA2nYD3umTEz",
    FEEDBACK_TEXT:    "fldCMmTmqtJsr89Em",
    SPEAKER:          "fldDU9rRVEoSj8ieH",
    FOLLOW_UP_NEEDED: "fldM7VY0fH8CvYIx5",
  },

  SPEAKERS: {
    TABLE_ID:        "tblp41QdehEIDh5KF",
    NAME:            "fldU78RLC8lE56fBW",
    MASTERY_LESSONS: "fldLo0DnFCLcDhILw",
    SUMMIT_SESSIONS: "fldOPVGFCipTvDzAR",
  },
} as const;

// =============================================================================
// AI MASTERY  (appHS19yXObg8sHZv)
// NOTE: LESSONS tblxZy7RMJ2naoHhS and FEEDBACK tblIVJT8HaiLcrx62 are synced
//       tables. FEEDBACK field IDs are identical to SPEAKING.SESSION_FEEDBACK
//       (same physical table). ENROLLED has no field in this base.
// =============================================================================

export const AI_MASTERY = {
  LESSONS: {
    TABLE_ID:     "tblxZy7RMJ2naoHhS", // synced
    LESSON_TITLE: "fldV2EULr68GXKJS1",
    SPEAKER:      "fldTcENZo3emsSz3p",
    ATTENDEES:    "fldARu9KpzJhaerFY",
    AVG_RATING:   "fldZ3io58cZhAMdm1",
    NUM_RATINGS:  "fldrWDJMK1rGhckYR",
    REC_VIEWS_1W: "fld34BF8gdpIkXvxr",
    REC_VIEWS_4W: "fld9jVFG7OkegZcaQ",
    ENROLLED:     null as string | null,  // field does not exist in this base
    TYPE:         "fldH8nvBUgeOZYavz",
    YEAR_COHORT:  "fldWppuoAQYMP64vL",
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tblIVJT8HaiLcrx62", // synced — same field IDs as SPEAKING
    RATING:           "fldqg7Oe7AeNZEruc",
    FEEDBACK_TEXT:    "flddAP3X5OGwMbIA2",
    SPEAKER:          "fldB8uZjz2X99B1QB",
    FOLLOW_UP_NEEDED: "fldgZbARNY5VHAes8",
  },

  SPEAKERS: {
    TABLE_ID:        "tblfsxOXt8CbXtNZv",
    NAME:            "fldw3ftqTu2jqZwSb",
    MASTERY_LESSONS: null as string | null,
    SUMMIT_SESSIONS: null as string | null,
  },
} as const;

// =============================================================================
// ENTREPRENEURSHIP MASTERY  (appJVtywkn9mTFbLs)
// NOTE: REC_VIEWS_1W is multipleLookupValues — handled by asNumber(arr[0]).
// =============================================================================

export const ENTREPRENEURSHIP = {
  LESSONS: {
    TABLE_ID:     "tblV7Z54v3bPdKfgC",
    LESSON_TITLE: "fldzRGW8KTOOArw4v",
    SPEAKER:      "fldBDHmH9LZoyOmnE",
    ATTENDEES:    "fldyVqL5BrQg2T9we",
    AVG_RATING:   "fldEqaJeFPknEgbiM",
    NUM_RATINGS:  "fldNPTbU559OaO5p4",
    REC_VIEWS_1W: "fldWvh92xtJfjDe9g",  // multipleLookupValues — asNumber(arr[0])
    REC_VIEWS_4W: "fldfARGn08NNlo5Rj",
    ENROLLED:     null as string | null,  // no enrolled/members field in this base
    TYPE:         "fldJypjg6rbfzIAmL",
    YEAR_COHORT:  "fldsF5mvWMTUb5jNP",
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tblUmVkpP2SDu3x6y",
    RATING:           "fldCHjfvfsOFhgruI",
    FEEDBACK_TEXT:    "fldp11uedGgo4NIAy",
    SPEAKER:          "fldNzGqAHUx1rd1Q7",
    FOLLOW_UP_NEEDED: "fldQgymMi21t5GbjG",
  },

  SPEAKERS: {
    TABLE_ID:        "tblT6MDrb3s3X6ysV",
    NAME:            "fld8chRPwTLIDgRut",
    MASTERY_LESSONS: null as string | null,
    SUMMIT_SESSIONS: null as string | null,
  },
} as const;

// =============================================================================
// SPIRITUAL MASTERY  (appsRrP9oJQMD5nZU)
// NOTE: ENROLLED field ID coincidentally matches ENTREPRENEURSHIP — both
//       are fldKKa0LeVguVISEj. Field IDs are scoped to the table, not base,
//       so this is just a coincidence; always look up by mastery schema.
// =============================================================================

export const SPIRITUAL = {
  LESSONS: {
    TABLE_ID:     "tblBGieEss6v1T51S",
    LESSON_TITLE: "fldk5SRk6C9i572Vf",
    SPEAKER:      "fld2DKeH8wDA6zJL3",
    ATTENDEES:    "fldm3GZNKCRoABsBL",
    AVG_RATING:   "fldFwvtDKkBBUAe2o",
    NUM_RATINGS:  "fldlLPJf1zb7FW5z1",
    REC_VIEWS_1W: "flddqj1i6mdMSfzHB",
    REC_VIEWS_4W: "fldARzNmXTVVA3iyg",
    ENROLLED:     "fldKKa0LeVguVISEj",
    TYPE:         "fldB2BawWz191Y1qv",
    YEAR_COHORT:  "fld2qDOsPZtckL1dA",
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tblGPsCjMehbf659x",
    RATING:           "fldLku4L8VTfSUav9",
    FEEDBACK_TEXT:    "fld7N2t0yV2mesya9",
    SPEAKER:          "fld5EMsljP2EvNgtq",
    FOLLOW_UP_NEEDED: "fldrCbgV3dQzfZzpa",
  },

  SPEAKERS: {
    TABLE_ID:        "tbl612zs9OGp7hH3B",
    NAME:            "fldmpBx1WCizRDbjt",
    MASTERY_LESSONS: null as string | null,
    SUMMIT_SESSIONS: "fldYFGL8VzTXd0j86",
  },
} as const;

// =============================================================================
// SOCIAL MASTERY  (appf3Molaaw26nIH8)
// NOTE: ENROLLED has no equivalent field in this base — returns null.
// =============================================================================

export const SOCIAL = {
  LESSONS: {
    TABLE_ID:     "tbl0zcp1iWABLmkQ3",
    LESSON_TITLE: "fld3q4lUz5K9sVmDU",
    SPEAKER:      "fld07kwIyxcbNtFXA",
    ATTENDEES:    "fldKPYsWIb2SSxzuM",
    AVG_RATING:   "fldWSmQm6QFoPWlOu",
    NUM_RATINGS:  "fldo8v1Ydl5vTzvmW",
    REC_VIEWS_1W: "fldBjWryhHXP6OARm",
    REC_VIEWS_4W: "fldzH0KrtPWiL70bE",
    ENROLLED:     null as string | null,  // field does not exist in this base
    TYPE:         "fldYpG9o696endpFK",
    YEAR_COHORT:  "flda51Os2ISo8zX6N",
  },

  SESSION_FEEDBACK: {
    TABLE_ID:         "tbllqw1Po59KSMYfU",
    RATING:           "fldKU47CtYZJ2Z2s8",
    FEEDBACK_TEXT:    "fldUgRA0vZTlTjxdO",
    SPEAKER:          "fldzLSm4l0YkodaD4",
    FOLLOW_UP_NEEDED: "flde7inNkzJl8RRxR",
  },

  SPEAKERS: {
    TABLE_ID:        "tblgvPP22bkR4i25f",
    NAME:            "fldzOc5IoYpcjzUkH",
    MASTERY_LESSONS: null as string | null,
    SUMMIT_SESSIONS: null as string | null,
  },
} as const;

// =============================================================================
// FINANCE BASE  (appgZyJyIam1yPgOx)
// Verified via REST API on 2026-05-04. Fee/royalty totals are Airtable rollups
// already computed on the Author Entities table, so we read them directly
// rather than re-aggregating Actual Transactions.
// =============================================================================

export const FINANCE = {
  AUTHOR_ENTITIES: {
    TABLE_ID:                "tbli5GhmDuR155bO0",
    NAME:                    "fldgciPQdTYMP5uRl",  // formula
    AUTHOR_ENTITY_NAME:      "fldJ5hCr9JuMXXuGI",  // aiText (alternative match key)
    CODE:                    "fldeCrlykg9eteReY",
    AUTHOR:                  "fldCwUp8W6WhyDVoM",  // multipleRecordLinks → Author
    CONTRACT_TYPE:           "fldf693gRQFLklU94",  // singleSelect — "Royalty" | "Fixed Fee" etc.
    CONTRACT_SUMMARY:        "fldn7VN7b6GxtoBr7",  // aiText — Airtable AI summary of contract
    FEE_2025:                "fldFLu6IB11sqpyIV",  // rollup (currency)
    ROYALTIES_2025:          "flduvu5wgNDZhMlTC",  // rollup (currency)
    FEE_2026:                "flds0gjNMqUctMg0C",  // rollup (currency)
    ROYALTIES_2026:          "fldCpirjRxclwWy4T",  // rollup (currency)
  },

  // Per-engagement detail — drives the inline finance breakdown panel
  AUTHOR_X_EVENT: {
    TABLE_ID:        "tblgq4Ta5X9N3wyqm",
    NAME:            "fld9B9IuWRmTmmgP0",  // multilineText (primary)
    STATUS:          "fldTygmw5sY5GItSm",  // singleSelect
    AUTHOR:          "fldA2fORnIhIJjXVh",  // multipleRecordLinks → 💜Authors (cellFormat=string returns name)
    CALENDAR_EVENT:  "fldpDxObURsFVD9Kb",  // multipleRecordLinks → Calendar
    FEE:             "fldsHVNglcW7nMTa1",  // currency
    PROJECTED_FEE:   "fldlynINnqHq94RMt",  // currency
    ENGAGEMENT_TYPE: "fld3TyOyJVV9ZKAfd",  // singleLineText
    OTHER_EXPENSES:  "fldHTdbgILq74rIqx",  // currency
    TOTAL_COST:      "fldw2ZnTql86mmJVy",  // currency
    CONTRACT:        "fldmD5hQRjsaozBZJ",  // multipleAttachments
    NOTES:           "fldXkYZhgNIUtFXIS",  // multilineText
    SESSIONS:        "fld3ACITR1QhWnKHZ",  // singleLineText (rollup-ish)
    ENGAGEMENT:      "fldRFJ6FPIuIo9xjj",  // singleLineText
  },

  // ---------------------------------------------------------------------------
  // Actual Transactions  (tbluv0jndDIHaTRZA)
  // Invoice-level source of truth for confirmed payments.
  // Filter by: PRODUCT_CODE name contains "mastery" AND GL_EXPENSE_CODE = "Speaker Fee"
  // ---------------------------------------------------------------------------
  ACTUAL_TRANSACTIONS: {
    TABLE_ID:                "tbluv0jndDIHaTRZA",
    TRANSACTION_ID:          "fldt1jpQu9DIEuZKc",  // autoNumber — primary
    AUTHOR_ENTITY_NAME:      "fld7QV6paxUZlrEay",  // singleLineText — direct text, no lookup needed
    INVOICE_NUMBER:          "fldKv8RKbsCDWdWtz",  // singleLineText
    INVOICE_DATE:            "fldIFKgiy2jmTq8JT",  // date
    CURRENCY:                "fldFQL5pRlFof8fVR",  // singleSelect (USD, etc.)
    INVOICE_AMOUNT:          "fldfxvxm35njUGKY3",  // currency
    NET_AMOUNT:              "fldYHy72BTqWsuHgs",  // currency
    BILL_STATUS:             "fldWiVA8LWaFlHPZq",  // singleSelect
    BILL_APPROVED_ON:        "fldIMBMhtWvdT0OME",  // date
    PAYMENT_STATUS:          "fldf9mSaUsoH3qYiT",  // singleSelect
    PAYMENT_INITIATED_DATE:  "fldysKI1ZSDzBeRwG",  // date
    PAYMENT_COMPLETION_DATE: "fldrdi36mEITORZej",  // date
    GL_EXPENSE_CODE:         "fldbmXK9Syc7OlnHw",  // multipleRecordLinks → GL Expense Code — use cellFormat string
    ACCOUNT_CODE:            "fldoGDLLpAGqpprSa",  // multipleLookupValues from GL Expense Code
    DEPARTMENT:              "fldY6rxjjow44yIIt",  // multipleRecordLinks → Department
    PRODUCT_CODE:            "fldM4P5m6hJbrk2ps",  // multipleRecordLinks → Product Code — use cellFormat string
    PRODUCT_NAME:            "fldKniwYnylrsk8rT",  // multipleLookupValues from Product Code
    LINE_TAG_PROJECT:        "fldHDi8TtFhbzrKdL",  // singleSelect
    INVOICE_YEAR:            "fldNtu1HoLUA3cbCb",  // formula — year extracted from Invoice Date
    AUTHOR_ENTITY:           "fldwYprCUx0zmVVDZ",  // multipleRecordLinks → Author Entity
    AUTHOR_LOOKUP:           "fldDl2XtLBB64y7xv",  // multipleLookupValues — Author display name
    BILL_MEMO:               "fldoi3VMOSTdIFq1q",  // multilineText
    ATTACHMENT_SUMMARY:      "fldAzGQOWTW3qMzdy",  // aiText — Airtable AI summary of attachments
    ATTACHMENTS:             "fldcuL2WboSpxP7fx",  // multipleAttachments
  },

  // ---------------------------------------------------------------------------
  // Product Code  (tblxpmoOGCyJhZt12)
  // Maps financial transactions to mastery programs.
  // Filter on PRODUCT_NAME containing "mastery" (case-insensitive).
  // ---------------------------------------------------------------------------
  PRODUCT_CODE: {
    TABLE_ID:     "tblxpmoOGCyJhZt12",
    PRODUCT_NAME: "fldE9lb1RIuzXsITi",  // multilineText — primary
    PRODUCT_CODE: "fldTPDFVyFFO6UwSB",  // singleLineText
  },
} as const;

// =============================================================================
// MASTERY_SCHEMAS — iterable map for multi-mastery fetcher
// =============================================================================

export type MasteryKey = "speaking" | "manifesting" | "ai_mastery" | "entrepreneurship" | "spiritual" | "social";

export interface MasterySchemaConfig {
  key:     MasteryKey;
  baseId:  string;
  lessons: {
    TABLE_ID:     string;
    LESSON_TITLE: string;
    SPEAKER:      string;
    ATTENDEES:    string;
    AVG_RATING:   string;
    NUM_RATINGS:  string;
    REC_VIEWS_1W: string;
    REC_VIEWS_4W: string;
    ENROLLED:     string | null;
    TYPE:         string;
    YEAR_COHORT:  string;
  };
  feedback: {
    TABLE_ID:         string;
    RATING:           string;
    FEEDBACK_TEXT:    string;
    SPEAKER:          string;
    FOLLOW_UP_NEEDED: string;
  };
  speakers: {
    TABLE_ID:        string;
    NAME:            string;
    MASTERY_LESSONS: string | null;
    SUMMIT_SESSIONS: string | null;
  };
}

export const MASTERY_SCHEMAS: MasterySchemaConfig[] = [
  {
    key:      "speaking",
    baseId:   BASE_IDS.SPEAKING,
    lessons:  SPEAKING.LESSONS,
    feedback: SPEAKING.SESSION_FEEDBACK,
    speakers: SPEAKING.SPEAKERS,
  },
  {
    key:      "manifesting",
    baseId:   BASE_IDS.MANIFESTING,
    lessons:  MANIFESTING.LESSONS,
    feedback: MANIFESTING.SESSION_FEEDBACK,
    speakers: MANIFESTING.SPEAKERS,
  },
  {
    key:      "ai_mastery",
    baseId:   BASE_IDS.AI_MASTERY,
    lessons:  AI_MASTERY.LESSONS,
    feedback: AI_MASTERY.SESSION_FEEDBACK,
    speakers: AI_MASTERY.SPEAKERS,
  },
  {
    key:      "entrepreneurship",
    baseId:   BASE_IDS.ENTREPRENEURSHIP,
    lessons:  ENTREPRENEURSHIP.LESSONS,
    feedback: ENTREPRENEURSHIP.SESSION_FEEDBACK,
    speakers: ENTREPRENEURSHIP.SPEAKERS,
  },
  {
    key:      "spiritual",
    baseId:   BASE_IDS.SPIRITUAL,
    lessons:  SPIRITUAL.LESSONS,
    feedback: SPIRITUAL.SESSION_FEEDBACK,
    speakers: SPIRITUAL.SPEAKERS,
  },
  {
    key:      "social",
    baseId:   BASE_IDS.SOCIAL,
    lessons:  SOCIAL.LESSONS,
    feedback: SOCIAL.SESSION_FEEDBACK,
    speakers: SOCIAL.SPEAKERS,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build a field IDs array for Airtable API `fields` parameter.
 * Throws if any referenced key has a null ID (NEEDS_VERIFY).
 *
 * Usage: fieldIds(SPEAKING.LESSONS, ["LESSON_TITLE", "SPEAKER", "ATTENDEES"])
 */
export function fieldIds<T extends Record<string, string | null>>(
  tableSchema: T,
  keys: (keyof T)[]
): string[] {
  return keys.map((k) => {
    const id = tableSchema[k];
    if (!id) throw new Error(`Airtable field "${String(k)}" is null (NEEDS_VERIFY) — populate airtable-schema.ts before use`);
    return id as string;
  });
}

/**
 * Guard against null IDs at runtime.
 * Throws early if a NEEDS_VERIFY field is used before being populated.
 */
export function assertVerified(id: string | null, label: string): string {
  if (!id) throw new Error(`Airtable schema not verified: ${label} is null`);
  return id;
}
