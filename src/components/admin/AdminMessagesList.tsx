"use client";

import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { PublicMessage } from "@/lib/messages";

interface AdminMessagesListProps {
  items: PublicMessage[];
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

const AdminMessagesList: FC<AdminMessagesListProps> = ({ items }) => {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/messages/${pendingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("삭제에 실패했습니다.");
        setDeleting(false);
        return;
      }
      toast.success("메시지를 삭제했습니다.");
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
        data-testid="admin-messages-empty"
      >
        남겨진 메시지가 없습니다.
      </p>
    );
  }

  return (
    <>
      <ul
        className="flex flex-col gap-3"
        data-testid="admin-messages-list"
      >
        {items.map((m) => (
          <li
            key={m.id}
            className="border-line bg-paper rounded-xl px-[18px] py-4"
            style={{ borderWidth: "0.5px" }}
            data-testid="admin-message-item"
          >
            <header className="mb-1.5 flex items-baseline justify-between gap-2">
              <span
                className="font-serif-ko text-ink text-[14px] font-medium tracking-[-0.01em]"
                data-testid="admin-message-nickname"
              >
                {m.nickname}
              </span>
              <span className="text-muted-light text-[11px]">
                {formatKstDateTime(m.createdAt)}
              </span>
            </header>
            <p className="font-serif-ko text-ink text-[14px] leading-[1.6] whitespace-pre-wrap">
              {m.body}
            </p>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPendingId(m.id)}
                className="border-line text-burgundy hover:bg-cream-100 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors"
                style={{ borderWidth: "0.5px" }}
                data-testid="admin-message-delete"
              >
                <i className="ti ti-trash text-[13px]" aria-hidden />
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingId !== null}
        title="메시지를 삭제할까요?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel={deleting ? "삭제 중…" : "삭제"}
        cancelLabel="취소"
        destructive
        onConfirm={handleDelete}
        onCancel={() => (deleting ? null : setPendingId(null))}
        testId="admin-message-confirm"
      />
    </>
  );
};

export default AdminMessagesList;
