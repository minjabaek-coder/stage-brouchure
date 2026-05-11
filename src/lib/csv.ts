import iconv from "iconv-lite";
import Papa from "papaparse";
import { z } from "zod";

export const MAX_CSV_BYTES = 5 * 1024 * 1024; // PRD NFR-10 / FR-A02 — 5MB

const ROW_SCHEMA = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "name is empty")),
  phone_last4: z
    .string()
    .regex(/^\d{4}$/, "phone_last4 must be 4 digits"),
  seat: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "seat is empty")),
  note: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() !== "" ? s.trim() : undefined)),
});

export type CsvRow = z.infer<typeof ROW_SCHEMA>;

export interface InvalidRow {
  /** 1-based source line number including header (row 2 = first data row). */
  row: number;
  reason: string;
}

export interface ParsedCsv {
  valid: CsvRow[];
  invalid: InvalidRow[];
  total: number;
}

/**
 * Decode raw CSV bytes — try UTF-8 first; if it produces replacement chars
 * (U+FFFD), retry with EUC-KR. Most Korean exports from Excel are EUC-KR by
 * default, but UTF-8 is increasingly common. PRD §3.3.3 requires both.
 */
export function decodeCsv(buf: Buffer): string {
  // Strip UTF-8 BOM if present
  const start = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf ? 3 : 0;
  const utf8 = buf.subarray(start).toString("utf8");
  if (!utf8.includes("�")) return utf8;
  return iconv.decode(buf, "euc-kr");
}

/**
 * Parse + validate. Returns the canonical {valid, invalid, total} regardless
 * of partial failures so the operator can fix individual rows in the source
 * file (admins see invalid rows in the preview before confirming).
 */
export function parseAttendeesCsv(text: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const valid: CsvRow[] = [];
  const invalid: InvalidRow[] = [];

  result.data.forEach((raw, idx) => {
    // CSV lines: header is line 1 → first data row is line 2
    const lineNumber = idx + 2;
    const parsed = ROW_SCHEMA.safeParse(raw);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      const reason = parsed.error.issues
        .map((i) => `${i.path.join(".") || "(row)"}: ${i.message}`)
        .join("; ");
      invalid.push({ row: lineNumber, reason });
    }
  });

  return { valid, invalid, total: result.data.length };
}
