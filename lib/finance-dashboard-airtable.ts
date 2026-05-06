import { BASE_IDS, FINANCE } from "@/lib/airtable-schema";
import type {
  FinanceDashboardTransaction,
  FinanceAttachment,
  AuthorEngagement,
} from "@/types/speaking";

// ---------------------------------------------------------------------------
// Shared fetch infrastructure (mirrors finance-airtable.ts pattern)
// ---------------------------------------------------------------------------

interface FetchOptions {
  fields?: string[];
  filterByFormula?: string;
  maxRecords?: number;
  cellFormat?: "json" | "string";
}

interface RawRecord {
  id: string;
  fields: Record<string, unknown>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { records: RawRecord[]; expiresAt: number }>();

// Per-base request gate — Airtable rate-limits at 5 req/sec/base.
// We serialize requests to the same base and enforce ≥250ms gap (4 req/sec).
const baseGate = new Map<string, Promise<void>>();
const MIN_INTERVAL_MS = 250;

async function withBaseGate<T>(baseId: string, fn: () => Promise<T>): Promise<T> {
  const prev = baseGate.get(baseId) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  baseGate.set(baseId, prev.then(() => next));
  await prev;
  try {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    if (elapsed < MIN_INTERVAL_MS) {
      await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed));
    }
    return result;
  } finally {
    release();
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url: string, pat: string): Promise<Response> {
  // Up to 5 retries on 429 with exponential backoff: 500ms, 1s, 2s, 4s, 8s
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });
    if (res.status !== 429) return res;
    const wait = 500 * Math.pow(2, attempt);
    console.warn(`[finance] 429 from Airtable — backing off ${wait}ms (attempt ${attempt + 1}/5)`);
    await sleep(wait);
  }
  // Final attempt — let the caller handle a non-429 (or a final 429) response
  return fetch(url, {
    headers: { Authorization: `Bearer ${pat}`, "Content-Type": "application/json" },
    next: { revalidate: 300 },
  });
}

async function fetchAll(
  baseId: string,
  tableId: string,
  options: FetchOptions = {}
): Promise<RawRecord[]> {
  const cacheKey = `fd:${baseId}:${tableId}:${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.records;

  const pat = process.env.AIRTABLE_PAT;
  if (!pat) throw new Error("AIRTABLE_PAT environment variable is not set");

  const results: RawRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();
    const cellFormat = options.cellFormat ?? "json";
    params.set("cellFormat", cellFormat);
    params.set("returnFieldsByFieldId", "true");
    if (cellFormat === "string") {
      params.set("timeZone", "UTC");
      params.set("userLocale", "en-us");
    }
    if (options.fields) options.fields.forEach((f) => params.append("fields[]", f));
    if (options.filterByFormula) params.set("filterByFormula", options.filterByFormula);
    if (options.maxRecords) params.set("maxRecords", String(options.maxRecords));
    if (offset) params.set("offset", offset);

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`;

    const res = await withBaseGate(baseId, () => fetchOnce(url, pat));

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable API error ${res.status} for ${tableId}: ${body}`);
    }

    const data = (await res.json()) as { records: RawRecord[]; offset?: string };
    results.push(...data.records);
    offset = data.offset;
  } while (offset);

  cache.set(cacheKey, { records: results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}

// ---------------------------------------------------------------------------
// Field extractors
// ---------------------------------------------------------------------------

function asStr(val: unknown): string | null {
  if (typeof val === "string") return val.trim() || null;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string")
    return (val[0] as string).trim() || null;
  return null;
}

function asNum(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[$,]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  if (Array.isArray(val) && val.length > 0) return asNum(val[0]);
  return null;
}

// When cellFormat=string, linked record arrays come back as plain strings.
function asStrArray(val: unknown): string[] {
  if (typeof val === "string") return val.trim() ? [val.trim()] : [];
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function sanitize(raw: string): string {
  return raw.replace(/^"+/, "").replace(/"+$/, "").trim();
}

// Attachment field can be a JSON array or a stringified filename list (when
// cellFormat=string). Normalise to an array of FinanceAttachment.
function parseAttachments(val: unknown): FinanceAttachment[] {
  if (!val) return [];

  // JSON array of attachment objects
  if (Array.isArray(val)) {
    return val.flatMap((item) => {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const id = typeof o.id === "string" ? o.id : null;
        const url = typeof o.url === "string" ? o.url : "";
        const filename = typeof o.filename === "string" ? o.filename : "(unnamed)";
        const type = typeof o.type === "string" ? o.type : null;
        const size = typeof o.size === "number" ? o.size : null;
        if (!id) return [];
        return [{ id, url, filename, type, size }];
      }
      // fallback: a bare filename string
      if (typeof item === "string" && item.trim()) {
        return [{ id: item, url: "", filename: item.trim(), type: null, size: null }];
      }
      return [];
    });
  }

  // cellFormat=string: comma-joined list of filenames (no URLs)
  if (typeof val === "string" && val.trim()) {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((filename, i) => ({
        id: `att-${i}-${filename}`,
        url: "",
        filename,
        type: null,
        size: null,
      }));
  }

  return [];
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface RawAuthorEntity {
  id:             string;
  name:           string;       // formula: "Author x Author Entity Name"
  entityName:     string | null;
  authorName:     string | null;  // resolved via AUTHOR linked record (cellFormat=string)
  contractType:   string | null;
  contractSummary:string | null;
  fee2025:        number | null;
  royalties2025:  number | null;
  fee2026:        number | null;
  royalties2026:  number | null;
}

export interface RawFinanceDashboardData {
  entities:     RawAuthorEntity[];
  // transactions keyed by the Author Entity ID they belong to
  txByEntityId: Map<string, FinanceDashboardTransaction[]>;
  // engagements (Author x Event) keyed by Author Entity ID
  engagementsByEntityId: Map<string, AuthorEngagement[]>;
}

// ---------------------------------------------------------------------------
// Main fetcher
// ---------------------------------------------------------------------------

export async function fetchFinanceDashboardData(): Promise<RawFinanceDashboardData> {
  const [entityRecords, txRecords, engagementRecords] = await Promise.all([
    fetchAll(BASE_IDS.FINANCE, FINANCE.AUTHOR_ENTITIES.TABLE_ID, {
      fields: [
        FINANCE.AUTHOR_ENTITIES.NAME,
        FINANCE.AUTHOR_ENTITIES.AUTHOR_ENTITY_NAME,
        FINANCE.AUTHOR_ENTITIES.AUTHOR,
        FINANCE.AUTHOR_ENTITIES.CONTRACT_TYPE,
        FINANCE.AUTHOR_ENTITIES.CONTRACT_SUMMARY,
        FINANCE.AUTHOR_ENTITIES.FEE_2025,
        FINANCE.AUTHOR_ENTITIES.ROYALTIES_2025,
        FINANCE.AUTHOR_ENTITIES.FEE_2026,
        FINANCE.AUTHOR_ENTITIES.ROYALTIES_2026,
      ],
      cellFormat: "string",
    }),
    // Fetch ALL transactions — no GL/product filter — using cellFormat=string
    // so linked records resolve to display names without extra round-trips.
    fetchAll(BASE_IDS.FINANCE, FINANCE.ACTUAL_TRANSACTIONS.TABLE_ID, {
      fields: [
        FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_ENTITY_NAME,
        FINANCE.ACTUAL_TRANSACTIONS.INVOICE_NUMBER,
        FINANCE.ACTUAL_TRANSACTIONS.INVOICE_DATE,
        FINANCE.ACTUAL_TRANSACTIONS.CURRENCY,
        FINANCE.ACTUAL_TRANSACTIONS.INVOICE_AMOUNT,
        FINANCE.ACTUAL_TRANSACTIONS.NET_AMOUNT,
        FINANCE.ACTUAL_TRANSACTIONS.BILL_STATUS,
        FINANCE.ACTUAL_TRANSACTIONS.BILL_APPROVED_ON,
        FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_STATUS,
        FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_INITIATED_DATE,
        FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_COMPLETION_DATE,
        FINANCE.ACTUAL_TRANSACTIONS.GL_EXPENSE_CODE,
        FINANCE.ACTUAL_TRANSACTIONS.ACCOUNT_CODE,
        FINANCE.ACTUAL_TRANSACTIONS.DEPARTMENT,
        FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_CODE,
        FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_NAME,
        FINANCE.ACTUAL_TRANSACTIONS.LINE_TAG_PROJECT,
        FINANCE.ACTUAL_TRANSACTIONS.INVOICE_YEAR,
        FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_ENTITY,
        FINANCE.ACTUAL_TRANSACTIONS.BILL_MEMO,
        FINANCE.ACTUAL_TRANSACTIONS.ATTACHMENT_SUMMARY,
        FINANCE.ACTUAL_TRANSACTIONS.ATTACHMENTS,
      ],
      cellFormat: "string",
    }),
    fetchAll(BASE_IDS.FINANCE, FINANCE.AUTHOR_X_EVENT.TABLE_ID, {
      fields: [
        FINANCE.AUTHOR_X_EVENT.NAME,
        FINANCE.AUTHOR_X_EVENT.STATUS,
        FINANCE.AUTHOR_X_EVENT.AUTHOR,
        FINANCE.AUTHOR_X_EVENT.CALENDAR_EVENT,
        FINANCE.AUTHOR_X_EVENT.FEE,
        FINANCE.AUTHOR_X_EVENT.PROJECTED_FEE,
        FINANCE.AUTHOR_X_EVENT.ENGAGEMENT_TYPE,
        FINANCE.AUTHOR_X_EVENT.OTHER_EXPENSES,
        FINANCE.AUTHOR_X_EVENT.TOTAL_COST,
        FINANCE.AUTHOR_X_EVENT.NOTES,
        FINANCE.AUTHOR_X_EVENT.CONTRACT,
        FINANCE.AUTHOR_X_EVENT.SESSIONS,
      ],
      cellFormat: "string",
    }),
  ]);

  // Map Author Entity record IDs → their display name (for linking transactions
  // that have the AUTHOR_ENTITY multipleRecordLinks field).
  // Transactions also carry AUTHOR_ENTITY_NAME as a plain text field which we
  // use as a fallback join key when the record ID link is absent.
  const entityIdToName = new Map<string, string>();
  const entities: RawAuthorEntity[] = entityRecords.map((r) => {
    const name = asStr(r.fields[FINANCE.AUTHOR_ENTITIES.NAME]) ?? `Entity ${r.id}`;
    entityIdToName.set(r.id, name);
    // AUTHOR field with cellFormat=string returns the linked author display name(s)
    const authorNames = asStrArray(r.fields[FINANCE.AUTHOR_ENTITIES.AUTHOR]);
    return {
      id:              r.id,
      name,
      authorName:      authorNames[0] ?? null,
      entityName:      asStr(r.fields[FINANCE.AUTHOR_ENTITIES.AUTHOR_ENTITY_NAME]),
      contractType:    asStr(r.fields[FINANCE.AUTHOR_ENTITIES.CONTRACT_TYPE]),
      contractSummary: asStr(r.fields[FINANCE.AUTHOR_ENTITIES.CONTRACT_SUMMARY]),
      fee2025:         asNum(r.fields[FINANCE.AUTHOR_ENTITIES.FEE_2025]),
      royalties2025:   asNum(r.fields[FINANCE.AUTHOR_ENTITIES.ROYALTIES_2025]),
      fee2026:         asNum(r.fields[FINANCE.AUTHOR_ENTITIES.FEE_2026]),
      royalties2026:   asNum(r.fields[FINANCE.AUTHOR_ENTITIES.ROYALTIES_2026]),
    };
  });

  // Build a name → entity ID map for text-based fallback lookup
  const entityNameToId = new Map<string, string>();
  for (const e of entities) {
    if (e.entityName) entityNameToId.set(e.entityName.toLowerCase(), e.id);
    entityNameToId.set(e.name.toLowerCase(), e.id);
  }

  // Group transactions by Author Entity ID
  const txByEntityId = new Map<string, FinanceDashboardTransaction[]>();

  for (const r of txRecords) {
    const f = r.fields;

    // Resolve entity ID: prefer the linked record field, fall back to name match
    const linkedEntityNames = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_ENTITY]);
    const directEntityName  = asStr(f[FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_ENTITY_NAME]);

    let entityId: string | null = null;

    // The AUTHOR_ENTITY field in cellFormat=string returns the record's display
    // name — we need to reverse-map it to the entity's record ID.
    if (linkedEntityNames.length > 0) {
      const nameKey = linkedEntityNames[0].toLowerCase();
      entityId = entityNameToId.get(nameKey) ?? null;
    }
    if (!entityId && directEntityName) {
      entityId = entityNameToId.get(directEntityName.toLowerCase()) ?? null;
    }
    if (!entityId) continue; // can't attribute without an entity

    const glCodes    = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.GL_EXPENSE_CODE]);
    const productRaw = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_CODE]);
    const products   = productRaw.map(sanitize);
    // Prefer Product Name lookup (cleaner) over the linked PRODUCT_CODE record name
    const productNameLookup = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_NAME]).map(sanitize);
    const departments       = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.DEPARTMENT]);
    const accountCodes      = asStrArray(f[FINANCE.ACTUAL_TRANSACTIONS.ACCOUNT_CODE]);

    const tx: FinanceDashboardTransaction = {
      id:                    r.id,
      invoiceNumber:         asStr(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_NUMBER]),
      invoiceDate:           asStr(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_DATE]),
      invoiceYear:           asStr(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_YEAR]),
      currency:              asStr(f[FINANCE.ACTUAL_TRANSACTIONS.CURRENCY]),
      invoiceAmount:         asNum(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_AMOUNT]),
      netAmount:             asNum(f[FINANCE.ACTUAL_TRANSACTIONS.NET_AMOUNT]),

      billStatus:            asStr(f[FINANCE.ACTUAL_TRANSACTIONS.BILL_STATUS]),
      billApprovedOn:        asStr(f[FINANCE.ACTUAL_TRANSACTIONS.BILL_APPROVED_ON]),
      paymentStatus:         asStr(f[FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_STATUS]),
      paymentInitiatedDate:  asStr(f[FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_INITIATED_DATE]),
      paymentCompletionDate: asStr(f[FINANCE.ACTUAL_TRANSACTIONS.PAYMENT_COMPLETION_DATE]),

      glCode:         glCodes[0] ?? null,
      accountCode:    accountCodes[0] ?? null,
      department:     departments[0] ?? null,
      productName:    productNameLookup[0] ?? products[0] ?? null,
      lineTagProject: asStr(f[FINANCE.ACTUAL_TRANSACTIONS.LINE_TAG_PROJECT]),

      billMemo:           asStr(f[FINANCE.ACTUAL_TRANSACTIONS.BILL_MEMO]),
      attachmentSummary:  asStr(f[FINANCE.ACTUAL_TRANSACTIONS.ATTACHMENT_SUMMARY]),
      attachments:        parseAttachments(f[FINANCE.ACTUAL_TRANSACTIONS.ATTACHMENTS]),
    };

    if (!txByEntityId.has(entityId)) txByEntityId.set(entityId, []);
    txByEntityId.get(entityId)!.push(tx);
  }

  // Sort each entity's transactions newest-first
  for (const txList of txByEntityId.values()) {
    txList.sort((a, b) => (b.invoiceDate ?? "").localeCompare(a.invoiceDate ?? ""));
  }

  // -------------------------------------------------------------------------
  // Group Author x Event records by Author Entity ID (matched by author name)
  // -------------------------------------------------------------------------
  // Build author-name → entity ID lookup (lowercased for case-insensitive match)
  const authorNameToEntityId = new Map<string, string>();
  for (const e of entities) {
    if (e.authorName) authorNameToEntityId.set(e.authorName.toLowerCase().trim(), e.id);
  }

  const engagementsByEntityId = new Map<string, AuthorEngagement[]>();

  for (const r of engagementRecords) {
    const f = r.fields;
    const authorNames = asStrArray(f[FINANCE.AUTHOR_X_EVENT.AUTHOR]);
    if (authorNames.length === 0) continue;

    const authorName = authorNames[0];
    const entityId = authorNameToEntityId.get(authorName.toLowerCase().trim());
    if (!entityId) continue;  // engagement for an author with no Author Entity — skip

    const fee          = asNum(f[FINANCE.AUTHOR_X_EVENT.FEE]);
    const projectedFee = asNum(f[FINANCE.AUTHOR_X_EVENT.PROJECTED_FEE]);
    const variance     = (fee !== null && projectedFee !== null) ? fee - projectedFee : null;
    const contractAtt  = parseAttachments(f[FINANCE.AUTHOR_X_EVENT.CONTRACT]);

    const engagement: AuthorEngagement = {
      id:             r.id,
      name:           asStr(f[FINANCE.AUTHOR_X_EVENT.NAME]),
      status:         asStr(f[FINANCE.AUTHOR_X_EVENT.STATUS]),
      authorName,
      engagementType: asStr(f[FINANCE.AUTHOR_X_EVENT.ENGAGEMENT_TYPE]),
      calendarEvent:  asStrArray(f[FINANCE.AUTHOR_X_EVENT.CALENDAR_EVENT])[0] ?? null,
      fee,
      projectedFee,
      variance,
      otherExpenses:  asNum(f[FINANCE.AUTHOR_X_EVENT.OTHER_EXPENSES]),
      totalCost:      asNum(f[FINANCE.AUTHOR_X_EVENT.TOTAL_COST]),
      notes:          asStr(f[FINANCE.AUTHOR_X_EVENT.NOTES]),
      hasContract:    contractAtt.length > 0,
      sessions:       asStr(f[FINANCE.AUTHOR_X_EVENT.SESSIONS]),
    };

    if (!engagementsByEntityId.has(entityId)) engagementsByEntityId.set(entityId, []);
    engagementsByEntityId.get(entityId)!.push(engagement);
  }

  // Sort each entity's engagements by name (often holds dates/cohort)
  for (const list of engagementsByEntityId.values()) {
    list.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
  }

  return { entities, txByEntityId, engagementsByEntityId };
}
