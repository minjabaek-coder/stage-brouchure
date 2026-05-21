import { Toaster } from "sonner";
import Stage from "@/components/layout/Stage";
import AdminNav from "@/components/admin/AdminNav";
import AdminMessagesList from "@/components/admin/AdminMessagesList";
import { getAllMessages, countMessages } from "@/lib/messages";

export const metadata = {
  title: "관리자 · 응원 메시지 · 어울림 콘서트",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const [items, total] = await Promise.all([getAllMessages(), countMessages()]);

  return (
    <Stage>
      <Toaster richColors position="top-center" theme="light" />
      <header
        className="pt-2 pb-4 text-center"
        data-testid="admin-messages-header"
      >
        <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
          Stage Manager
        </p>
        <h1 className="font-serif-ko text-ink mt-2 text-[24px] font-semibold tracking-[-0.01em]">
          응원 메시지 관리
        </h1>
        <p className="text-muted mt-2 text-[13px] leading-[1.6]">
          관객이 보낸 응원 메시지를 확인하고 부적절한 글은 삭제합니다.
        </p>
      </header>

      <AdminNav active="messages" />

      <div className="mb-5 text-center">
        <span className="text-muted text-[13px]">
          총{" "}
          <span
            className="text-ink font-medium"
            data-testid="admin-messages-total"
          >
            {total}
          </span>
          개의 메시지
        </span>
      </div>

      <AdminMessagesList items={items} />
    </Stage>
  );
}
