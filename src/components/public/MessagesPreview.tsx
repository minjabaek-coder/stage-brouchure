import Link from "next/link";
import { type FC } from "react";
import MessageItem from "@/components/public/MessageItem";
import MessageFormButton from "@/components/public/MessageFormButton";
import { getRecentMessages } from "@/lib/messages";

/**
 * Home preview block — latest 3 messages + write button + see-all link.
 * Renders as a server component; the write button is the only client child.
 * Toast notifications surface through the single Toaster mounted in
 * ShareFab (via (public)/layout.tsx) so we don't double-mount here.
 */
const MessagesPreview: FC = async () => {
  const items = await getRecentMessages(3);

  return (
    <section
      className="pt-1.5 pb-6"
      aria-label="방명록 미리보기"
      data-testid="messages-preview"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span aria-hidden className="bg-gold/40 h-px flex-1" />
        <p className="text-gold-warm font-serif-ko text-[13px] italic tracking-[0.02em]">
          ✦ 출연자에게 한마디 ✦
        </p>
        <span aria-hidden className="bg-gold/40 h-px flex-1" />
      </div>

      {items.length === 0 ? (
        <p
          className="text-muted py-6 text-center text-[13px] leading-[1.6]"
          data-testid="messages-empty"
        >
          첫 메시지를 남겨 주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5" data-testid="messages-preview-list">
          {items.map((m) => (
            <li key={m.id}>
              <MessageItem message={m} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <MessageFormButton />
        <Link
          href="/messages"
          className="text-ink hover:text-burgundy inline-flex items-center gap-1 text-[13px] font-medium tracking-[-0.01em]"
          data-testid="messages-see-all"
        >
          전체 보기
          <i className="ti ti-arrow-right text-[14px]" aria-hidden />
        </Link>
      </div>
    </section>
  );
};

export default MessagesPreview;
