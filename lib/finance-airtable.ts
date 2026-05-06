import { BASE_IDS, FINANCE } from "@/lib/airtable-schema";

// ---------------------------------------------------------------------------
// Core paginated fetcher (local copy that supports cellFormat=string)
// We need the string representation of linked records (GL_EXPENSE_CODE and
// PRODUCT_CODE) so that we can filter without extra lookup requests.
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
const financeCache = new Map<string, { records: RawRecord[]; expiresAt: number }>();

async function fetchAll(
  baseId: string,
  tableId: string,
  options: FetchOptions = {}
): Promise<RawRecord[]> {
  const cacheKey = `${baseId}:${tableId}:${JSON.stringify(options)}`;
  const cached = financeCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.records;
  const pat = process.env.AIRTABLE_PAT;
  if (!pat) throw new Error("AIRTABLE_PAT environment variable is not set");

  const results: RawRecord[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams();

    const cellFormat = options.cellFormat ?? "json";
    params.set("cellFormat", cellFormat);
    // When using string cellFormat, field IDs are still field IDs — but we
    // need returnFieldsByFieldId so the keys are stable IDs, not mutable names.
    params.set("returnFieldsByFieldId", "true");
    if (cellFormat === "string") {
      // Required by Airtable when using string cellFormat
      params.set("timeZone", "UTC");
      params.set("userLocale", "en-us");
    }

    if (options.fields) {
      options.fields.forEach((f) => params.append("fields[]", f));
    }
    if (options.filterByFormula) {
      params.set("filterByFormula", options.filterByFormula);
    }
    if (options.maxRecords) {
      params.set("maxRecords", String(options.maxRecords));
    }
    if (offset) {
      params.set("offset", offset);
    }

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable API error ${res.status} for ${tableId}: ${body}`);
    }

    const data = (await res.json()) as { records: RawRecord[]; offset?: string };
    results.push(...data.records);
    offset = data.offset;
  } while (offset);

  financeCache.set(cacheKey, { records: results, expiresAt: Date.now() + CACHE_TTL_MS });
  return results;
}

// ---------------------------------------------------------------------------
// Field value extractors
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
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string")
    return (val[0] as string).trim() || null;
  return null;
}

// When cellFormat=string, linked record arrays come back as a PLAIN STRING
// (not an array) — e.g. GL_EXPENSE_CODE → "Speaker fees"
// We normalise to an array so callers are always dealing with string[].
function asStringArray(val: unknown): string[] {
  if (typeof val === "string") return [val.trim()];
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === "string");
}

// Strip Airtable multilineText quirks from product names:
// The API wraps them in escaped quotes and appends a newline, e.g. '"Mastery\n"'
// → strip leading/trailing quotes, trim whitespace.
function sanitizeProductName(raw: string): string {
  return raw.replace(/^"+/, "").replace(/"+$/, "").trim();
}

// Parse a currency string like "$10,000.00" or "$833.00" to a number.
function parseCurrencyString(raw: unknown): number | null {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[$,]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Exported types used by signals.ts
// ---------------------------------------------------------------------------

// Author totals derived from Actual Transactions (Speaker Fee only, Mastery products only)
export interface RawAuthorTransactionTotals {
  /** Normalised display name extracted from AUTHOR_LOOKUP — used as join key */
  authorName: string;
  /** Sum of Speaker Fee invoice amounts for Mastery products in 2025 */
  speakerFeeTotal2025: number | null;
  /** Sum of Speaker Fee invoice amounts for Mastery products in 2026 */
  speakerFeeTotal2026: number | null;
  /** Individual matching transaction records — shown in the detail panel */
  transactions: RawTransactionDetail[];
}

export interface RawTransactionDetail {
  id: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceAmount: number | null;
  invoiceYear: string | null;
  billMemo: string | null;
  productName: string | null;
}

// ---------------------------------------------------------------------------
// Main fetcher
// ---------------------------------------------------------------------------

/**
 * Fetches Actual Transactions from the Finance base and returns per-author
 * Speaker Fee totals aggregated by year.
 *
 * Filter rules:
 *  1. PRODUCT_CODE linked record name contains "mastery" (case-insensitive)
 *  2. GL_EXPENSE_CODE linked record name equals "Speaker Fee" (case-insensitive)
 */
export async function fetchFinanceData(): Promise<{
  authorTotals: RawAuthorTransactionTotals[];
}> {
  const txFields = [
    FINANCE.ACTUAL_TRANSACTIONS.INVOICE_NUMBER,
    FINANCE.ACTUAL_TRANSACTIONS.INVOICE_DATE,
    FINANCE.ACTUAL_TRANSACTIONS.INVOICE_AMOUNT,
    FINANCE.ACTUAL_TRANSACTIONS.GL_EXPENSE_CODE,
    FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_CODE,
    FINANCE.ACTUAL_TRANSACTIONS.INVOICE_YEAR,
    FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_LOOKUP,
    FINANCE.ACTUAL_TRANSACTIONS.BILL_MEMO,
  ];

  // Fetch with cellFormat=string so linked records come back as display names,
  // not raw record IDs — lets us filter by "Speaker Fee" and "mastery" without
  // extra round-trips to the GL Expense Code and Product Code tables.
  const rawTx = await fetchAll(
    BASE_IDS.FINANCE,
    FINANCE.ACTUAL_TRANSACTIONS.TABLE_ID,
    { fields: txFields, cellFormat: "string" }
  );

  // Group by author name, filtering as we go
  const byAuthor = new Map<string, {
    fee2025: number;
    fee2026: number;
    transactions: RawTransactionDetail[];
  }>();

  for (const r of rawTx) {
    const f = r.fields;

    // 1. Check GL Expense Code — must contain "speaker" (the actual value is "Speaker fees")
    const glCodes = asStringArray(f[FINANCE.ACTUAL_TRANSACTIONS.GL_EXPENSE_CODE]);
    const isSpeakerFee = glCodes.some((g) => g.toLowerCase() === "speaker fees");
    if (!isSpeakerFee) continue;

    // 2. Check Product Code — must contain "mastery" (after sanitizing quotes/newlines)
    const productNamesRaw = asStringArray(f[FINANCE.ACTUAL_TRANSACTIONS.PRODUCT_CODE]);
    const productNames = productNamesRaw.map(sanitizeProductName);
    const isMastery = productNames.some((p) => p.toLowerCase().includes("mastery"));
    if (!isMastery) continue;

    // 3. Resolve author name from the AUTHOR_LOOKUP lookup field
    const authorNameRaw = asString(f[FINANCE.ACTUAL_TRANSACTIONS.AUTHOR_LOOKUP]);
    if (!authorNameRaw) continue;  // can't attribute a transaction with no author

    const invoiceYear = asString(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_YEAR]);
    // Amount comes back as a currency string "$10,000.00" — strip $ and commas
    const amount = parseCurrencyString(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_AMOUNT]);

    if (!byAuthor.has(authorNameRaw)) {
      byAuthor.set(authorNameRaw, { fee2025: 0, fee2026: 0, transactions: [] });
    }
    const entry = byAuthor.get(authorNameRaw)!;

    // Accumulate by year
    if (amount !== null) {
      if (invoiceYear === "2025") entry.fee2025 += amount;
      else if (invoiceYear === "2026") entry.fee2026 += amount;
    }

    // Store individual transaction for the detail panel
    entry.transactions.push({
      id:            r.id,
      invoiceNumber: asString(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_NUMBER]),
      invoiceDate:   asString(f[FINANCE.ACTUAL_TRANSACTIONS.INVOICE_DATE]),
      invoiceAmount: amount,
      invoiceYear,
      billMemo:      asString(f[FINANCE.ACTUAL_TRANSACTIONS.BILL_MEMO]),
      productName:   productNames[0] ?? null,
    });
  }

  // Distinguish "no transactions in this year" (null) from "$0 net" (0).
  // A year is null only if the author had no Speaker Fee transactions for it.
  const authorTotals: RawAuthorTransactionTotals[] = Array.from(byAuthor.entries()).map(
    ([authorName, data]) => {
      const has2025 = data.transactions.some(t => t.invoiceYear === "2025");
      const has2026 = data.transactions.some(t => t.invoiceYear === "2026");
      return {
        authorName,
        speakerFeeTotal2025: has2025 ? data.fee2025 : null,
        speakerFeeTotal2026: has2026 ? data.fee2026 : null,
        transactions:        data.transactions,
      };
    }
  );

  return { authorTotals };
}
