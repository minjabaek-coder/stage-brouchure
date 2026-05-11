"use client";

import { type FC, useState } from "react";
import { toast } from "sonner";
import Dropzone from "@/components/ui/Dropzone";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CsvPreviewTable from "@/components/admin/CsvPreviewTable";
import { MAX_CSV_BYTES } from "@/lib/limits";
import { decodeCsv, parseAttendeesCsv, type ParsedCsv } from "@/lib/csv";

interface UploadResponse {
  inserted: number;
  invalid: { row: number; reason: string }[];
}

const AdminCsvSection: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: File[]) {
    const f = files[0]!;
    const buf = Buffer.from(await f.arrayBuffer());
    const text = decodeCsv(buf);
    const result = parseAttendeesCsv(text);

    if (result.valid.length === 0) {
      toast.error("유효한 행이 없습니다. 헤더와 데이터를 확인해 주세요.");
      setFile(null);
      setParsed(null);
      return;
    }
    setFile(f);
    setParsed(result);
  }

  function handleError(message: string) {
    toast.error(message);
  }

  async function handleConfirm() {
    if (!file) return;
    setConfirmOpen(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-csv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Upload failed (${res.status})`);
      }
      const body = (await res.json()) as UploadResponse;
      toast.success(
        `총 ${body.inserted}건 등록 완료${body.invalid.length ? ` · 오류 ${body.invalid.length}건은 건너뜀` : ""}`,
      );
      setFile(null);
      setParsed(null);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Dropzone
        accept=".csv,text/csv"
        maxBytes={MAX_CSV_BYTES}
        onFiles={handleFiles}
        onError={handleError}
        label="CSV 파일을 끌어다 놓거나 클릭해 선택해 주세요."
        hint="컬럼: name, phone_last4, seat, note · UTF-8 또는 EUC-KR · 최대 5MB"
        testId="csv-dropzone"
      />

      {parsed && (
        <>
          <CsvPreviewTable
            valid={parsed.valid}
            invalid={parsed.invalid}
            total={parsed.total}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={uploading || parsed.valid.length === 0}
              className="font-serif-ko bg-gold text-ink hover:bg-gold-hi rounded-[2px] px-5 py-2.5 text-[13px] tracking-[0.15em] transition-colors disabled:cursor-wait disabled:opacity-60"
              data-testid="csv-upload-confirm-trigger"
            >
              {uploading ? "업로드 중…" : "기존 명단 덮어쓰고 업로드"}
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="기존 명단을 모두 삭제합니다"
        description={
          <>
            현재 등록된 모든 참석자가 사라지고 새 명단으로 교체됩니다.
            <br />
            직전 데이터는 자동으로 백업되며 이후 복구가 가능합니다.
          </>
        }
        confirmLabel="덮어쓰기"
        cancelLabel="취소"
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        testId="csv-confirm-dialog"
      />
    </div>
  );
};

export default AdminCsvSection;
