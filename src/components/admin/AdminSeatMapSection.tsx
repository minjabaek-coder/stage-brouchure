"use client";

import { type FC, useState } from "react";
import { toast } from "sonner";
import Dropzone from "@/components/ui/Dropzone";
import { MAX_IMAGE_BYTES } from "@/lib/limits";

interface AdminSeatMapSectionProps {
  /** Current seat_map asset URL (from server). null when none uploaded yet. */
  initialUrl: string | null;
}

const AdminSeatMapSection: FC<AdminSeatMapSectionProps> = ({ initialUrl }) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: File[]) {
    const f = files[0]!;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch("/api/admin/upload-seatmap", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message ?? `Upload failed (${res.status})`);
      }
      const body = (await res.json()) as { url: string };
      setCurrentUrl(body.url);
      toast.success("좌석배치도가 업데이트되었습니다.");
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
      <div
        className="border-gold/15 rounded-[2px] border bg-[rgba(244,237,224,0.04)] p-2"
        data-testid="seatmap-current-preview"
      >
        {currentUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentUrl}
            alt="현재 좌석배치도"
            className="block h-auto w-full"
            data-testid="seatmap-current-img"
          />
        ) : (
          <p className="font-serif-ko text-paper/40 px-3 py-6 text-center text-[13px]">
            업로드된 좌석배치도가 없습니다.
          </p>
        )}
      </div>

      <Dropzone
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        maxBytes={MAX_IMAGE_BYTES}
        onFiles={handleFiles}
        onError={(m) => toast.error(m)}
        label={
          uploading
            ? "업로드 중…"
            : "좌석배치도 이미지(JPG/PNG)를 끌어다 놓거나 클릭해 선택해 주세요."
        }
        hint="최대 4MB · 1600px 로 자동 리사이즈 + JPEG 80% 압축"
        testId="seatmap-dropzone"
      />
    </div>
  );
};

export default AdminSeatMapSection;
