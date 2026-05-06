import fs from "fs";
import path from "path";

// Airtable attachment shape returned in `fields[FIELD_ID]` for attachment fields.
interface AirtableAttachment {
  id: string;
  url: string;
  filename?: string;
  size?: number;
  type?: string;
}

const TRANSCRIPT_CACHE_DIR = path.join(process.cwd(), ".cache", "transcripts");

function cacheFilePath(attachmentId: string): string {
  return path.join(TRANSCRIPT_CACHE_DIR, `${attachmentId}.txt`);
}

function ensureCacheDir(): void {
  if (!fs.existsSync(TRANSCRIPT_CACHE_DIR)) {
    fs.mkdirSync(TRANSCRIPT_CACHE_DIR, { recursive: true });
  }
}

/**
 * Resolves an Airtable attachment field's first attachment to its text content.
 * Downloads on first miss; subsequent calls hit the on-disk cache (keyed by
 * stable attachment ID — the signed URL expires, but the ID does not).
 *
 * Returns null if the field is empty, the first attachment isn't text-like,
 * or the download fails.
 */
export async function resolveTranscriptText(rawField: unknown): Promise<string | null> {
  if (!Array.isArray(rawField) || rawField.length === 0) return null;
  const attachment = rawField[0] as AirtableAttachment;
  if (!attachment?.id || !attachment.url) return null;

  // Restrict to text-like attachments — transcripts are .txt in this dataset.
  const t = attachment.type ?? "";
  const filename = attachment.filename ?? "";
  const looksTextual = t.startsWith("text/") || /\.(txt|md|srt|vtt)$/i.test(filename);
  if (!looksTextual) return null;

  ensureCacheDir();
  const cachePath = cacheFilePath(attachment.id);
  if (fs.existsSync(cachePath)) {
    try {
      return fs.readFileSync(cachePath, "utf-8");
    } catch {
      // Fall through to re-download if cache read fails.
    }
  }

  try {
    const res = await fetch(attachment.url);
    if (!res.ok) {
      console.error(`[transcripts] download failed ${res.status} for ${attachment.id}`);
      return null;
    }
    const text = await res.text();
    fs.writeFileSync(cachePath, text, "utf-8");
    return text;
  } catch (err) {
    console.error(`[transcripts] download error for ${attachment.id}:`, err);
    return null;
  }
}
