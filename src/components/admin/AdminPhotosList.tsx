"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { PublicPhoto } from "@/lib/photos";

interface AdminPhotosListProps {
  items: PublicPhoto[];
}

function formatKstDateTime(iso: string): string {
  const d = new Date(iso);
  const kstMs = d.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mm = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

const AdminPhotosList: FC<AdminPhotosListProps> = ({ items }) => {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/photos/${pendingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("삭제에 실패했습니다.");
        setDeleting(false);
        return;
      }
      toast.success("사진을 삭제했습니다.");
      setPendingId(null);
      setDeleting(false);
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
      setDeleting(false);
    }
  };

  if (items.length === 0) {
    return (
      <p
        className="text-muted py-12 text-center text-[14px] leading-[1.6]"
        data-testid="admin-photos-empty"
      >
        공유된 사진이 없습니다.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3" data-testid="admin-photos-list">
        {items.map((p) => (
          <li
            key={p.id}
            className="border-line bg-paper flex gap-3 rounded-xl p-3"
            style={{ borderWidth: "0.5px" }}
            data-testid="admin-photo-item"
          >
            <div
              className="border-line relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg border"
              style={{ borderWidth: "0.5px" }}
            >
              <Image
                src={p.url}
                alt={p.caption ? p.caption : `${p.nickname} 님의 사진`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="mb-1 flex items-baseline justify-between gap-2">
                <span
                  className="font-serif-ko text-ink text-[14px] font-medium tracking-[-0.01em]"
                  data-testid="admin-photo-nickname"
                >
                  {p.nickname}
                </span>
                <span className="text-muted-light text-[11px]">
                  {formatKstDateTime(p.createdAt)}
                </span>
              </header>
              {p.caption ? (
                <p className="text-ink mb-2 text-[13px] leading-[1.5] break-words">
                  {p.caption}
                </p>
              ) : (
                <p className="text-muted-light mb-2 text-[12px] italic">
                  (캡션 없음)
                </p>
              )}
              <div className="mt-auto flex justify-end">
                <button
                  type="button"
                  onClick={() => setPendingId(p.id)}
                  className="border-line text-burgundy hover:bg-cream-100 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors"
                  style={{ borderWidth: "0.5px" }}
                  data-testid="admin-photo-delete"
                >
                  <i className="ti ti-trash text-[13px]" aria-hidden />
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingId !== null}
        title="사진을 삭제할까요?"
        description="DB와 저장소에서 함께 제거됩니다. 되돌릴 수 없습니다."
        confirmLabel={deleting ? "삭제 중…" : "삭제"}
        cancelLabel="취소"
        destructive
        onConfirm={handleDelete}
        onCancel={() => (deleting ? null : setPendingId(null))}
        testId="admin-photo-confirm"
      />
    </>
  );
};

export default AdminPhotosList;
