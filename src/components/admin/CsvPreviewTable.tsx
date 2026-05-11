import { type FC } from "react";
import type { CsvRow, InvalidRow } from "@/lib/csv";

interface CsvPreviewTableProps {
  valid: CsvRow[];
  invalid: InvalidRow[];
  total: number;
  /** Cap shown rows. Default 10 (PRD §3.3.3). */
  previewLimit?: number;
}

/**
 * Read-only preview shown before the operator confirms a destructive
 * "replace all attendees" upload (FR-A02). Top N valid rows + a separate
 * invalid block so the operator can fix and re-upload without leaving the
 * page.
 */
const CsvPreviewTable: FC<CsvPreviewTableProps> = ({
  valid,
  invalid,
  total,
  previewLimit = 10,
}) => {
  const shown = valid.slice(0, previewLimit);

  return (
    <div className="space-y-4" data-testid="csv-preview">
      <p
        className="font-serif-ko text-paper/65 text-[13px] tracking-[0.05em]"
        data-testid="csv-preview-summary"
      >
        총 {total}행 — 유효 {valid.length}건 · 오류 {invalid.length}건
        {valid.length > previewLimit && (
          <span className="text-paper/40">
            {" "}
            (상위 {previewLimit}건 미리보기)
          </span>
        )}
      </p>

      <div className="border-gold/15 overflow-hidden rounded-[2px] border">
        <table className="w-full table-fixed text-left text-[12px]">
          <thead className="bg-[rgba(197,165,114,0.08)]">
            <tr>
              <th className="font-serif-en text-gold w-10 px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
                #
              </th>
              <th className="font-serif-en text-gold px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
                Name
              </th>
              <th className="font-serif-en text-gold w-20 px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
                Phone
              </th>
              <th className="font-serif-en text-gold w-16 px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
                Seat
              </th>
              <th className="font-serif-en text-gold px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="font-serif-ko text-paper/85">
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="text-paper/40 px-3 py-4 text-center">
                  미리볼 유효 행이 없습니다.
                </td>
              </tr>
            )}
            {shown.map((row, idx) => (
              <tr
                key={idx}
                className="border-gold/10 border-t"
                data-testid="csv-preview-row"
              >
                <td className="text-paper/45 px-3 py-2 text-[11px]">{idx + 1}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="font-serif-en px-3 py-2 tracking-[0.1em]">
                  ****-****-{row.phone_last4}
                </td>
                <td className="font-serif-en px-3 py-2">{row.seat}</td>
                <td className="text-paper/55 px-3 py-2 text-[11px]">
                  {row.note ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invalid.length > 0 && (
        <div
          className="rounded-[2px] border border-[rgba(232,180,180,0.4)] bg-[rgba(92,26,27,0.18)] px-4 py-3"
          data-testid="csv-preview-invalid"
        >
          <p className="font-serif-en text-[#e8b4b4] mb-1.5 text-[11px] tracking-[0.2em] uppercase italic">
            — Invalid rows —
          </p>
          <ul className="font-serif-ko text-paper/75 space-y-1 text-[12px]">
            {invalid.map((r) => (
              <li key={r.row} data-testid="csv-invalid-row">
                <span className="font-serif-en text-paper/55 mr-2">
                  L{r.row}
                </span>
                {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CsvPreviewTable;
