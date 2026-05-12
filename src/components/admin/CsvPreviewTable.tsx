import { type FC } from "react";
import type { CsvRow, InvalidRow } from "@/lib/csv";

interface CsvPreviewTableProps {
  valid: CsvRow[];
  invalid: InvalidRow[];
  total: number;
  previewLimit?: number;
}

/** Read-only preview shown before confirming a destructive CSV replace. */
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
        className="text-muted text-[13px]"
        data-testid="csv-preview-summary"
      >
        총 {total}행 — 유효 {valid.length}건 · 오류 {invalid.length}건
        {valid.length > previewLimit && (
          <span className="text-muted-light">
            {" "}
            (상위 {previewLimit}건 미리보기)
          </span>
        )}
      </p>

      <div
        className="border-line overflow-hidden rounded-lg border"
        style={{ borderWidth: "0.5px" }}
      >
        <table className="w-full table-fixed text-left text-[12px]">
          <thead className="bg-cream-100">
            <tr>
              <th className="text-gold w-10 px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">
                #
              </th>
              <th className="text-gold px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">
                Name
              </th>
              <th className="text-gold w-20 px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">
                Phone
              </th>
              <th className="text-gold w-16 px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">
                Seat
              </th>
              <th className="text-gold px-3 py-2 text-[10px] font-medium tracking-[0.2em] uppercase">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="text-ink">
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted-light px-3 py-4 text-center">
                  미리볼 유효 행이 없습니다.
                </td>
              </tr>
            )}
            {shown.map((row, idx) => (
              <tr
                key={idx}
                className="border-line border-t"
                style={{ borderTopWidth: "0.5px" }}
                data-testid="csv-preview-row"
              >
                <td className="text-muted-light px-3 py-2 text-[11px]">{idx + 1}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2 tracking-[0.1em]">
                  ****-****-{row.phone_last4}
                </td>
                <td className="px-3 py-2">{row.seat}</td>
                <td className="text-muted px-3 py-2 text-[11px]">
                  {row.note ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invalid.length > 0 && (
        <div
          className="rounded-lg border border-[#e8c5c5] bg-[#fcefef] px-4 py-3"
          data-testid="csv-preview-invalid"
        >
          <p className="mb-1.5 text-[11px] font-medium tracking-[0.2em] text-[#b95e5e] uppercase">
            Invalid rows
          </p>
          <ul className="text-ink space-y-1 text-[12px]">
            {invalid.map((r) => (
              <li key={r.row} data-testid="csv-invalid-row">
                <span className="text-muted-light mr-2">L{r.row}</span>
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
