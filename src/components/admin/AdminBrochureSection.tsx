"use client";

import { type FC, useRef, useState } from "react";
import { toast } from "sonner";
import BrochureSlotGrid, {
  type BrochureSlot,
} from "@/components/admin/BrochureSlotGrid";
import { MAX_IMAGE_BYTES } from "@/lib/limits";

interface AdminBrochureSectionProps {
  initialSlots: BrochureSlot[]; // length 8, ordered 1..8
}

interface UploadResponse {
  updated: { slot: number; url: string }[];
}

const AdminBrochureSection: FC<AdminBrochureSectionProps> = ({
  initialSlots,
}) => {
  const [slots, setSlots] = useState(initialSlots);
  const [uploading, setUploading] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  function applyResponse(updates: UploadResponse["updated"]) {
    setSlots((prev) =>
      prev.map((s) => {
        const found = updates.find((u) => u.slot === s.index);
        return found ? { ...s, url: found.url } : s;
      }),
    );
  }

  async function uploadFiles(items: { slot: number; file: File }[]) {
    setUploading(true);
    try {
      const formData = new FormData();
      for (const { slot, file } of items) {
        formData.append("files", file);
        formData.append("slots", String(slot));
      }
      const res = await fetch("/api/admin/upload-brochure", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? `Upload failed (${res.status})`);
      }
      const body = (await res.json()) as UploadResponse;
      applyResponse(body.updated);
      toast.success(
        items.length === 1
          ? `슬롯 ${String(items[0]!.slot).padStart(2, "0")} 업데이트 완료`
          : `${body.updated.length}장 업데이트 완료`,
      );
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleBulk(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    if (arr.length > 8) {
      toast.error("브로셔는 최대 8장까지 업로드할 수 있습니다.");
      return;
    }
    const oversized = arr.find((f) => f.size > MAX_IMAGE_BYTES);
    if (oversized) {
      toast.error(
        `파일 용량이 5MB 를 초과합니다 (${oversized.name}: ${(oversized.size / 1024 / 1024).toFixed(1)}MB)`,
      );
      return;
    }
    // 파일명 오름차순 정렬 → 슬롯 1..N 순서대로 매핑
    const sorted = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    void uploadFiles(
      sorted.map((file, i) => ({ slot: i + 1, file })),
    );
  }

  function handleReplace(index: number, file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("파일 용량이 5MB 를 초과합니다.");
      return;
    }
    void uploadFiles([{ slot: index, file }]);
  }

  return (
    <div className="space-y-4" data-testid="admin-brochure-controls">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif-ko text-paper/55 text-[12px] leading-[1.6] tracking-[0.05em]">
          파일명 오름차순으로 슬롯 1~8 에 자동 매핑됩니다 (`brochure-01.jpg`,
          `brochure-02.jpg` …).
        </p>
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          className="sr-only"
          data-testid="brochure-bulk-input"
          onChange={(e) => {
            handleBulk(e.target.files);
            e.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => bulkInputRef.current?.click()}
          className="font-serif-ko bg-gold text-ink hover:bg-gold-hi rounded-[2px] px-4 py-2 text-[12px] tracking-[0.15em] transition-colors disabled:cursor-wait disabled:opacity-60"
          data-testid="brochure-bulk-trigger"
        >
          {uploading ? "업로드 중…" : "8장 일괄 업로드"}
        </button>
      </div>

      <BrochureSlotGrid
        slots={slots}
        onReplace={handleReplace}
        disabled={uploading}
      />
    </div>
  );
};

export default AdminBrochureSection;
