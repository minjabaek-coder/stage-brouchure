import { type FC } from "react";
import type { PublicMessage } from "@/lib/messages";

interface MessageItemProps {
  message: PublicMessage;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const kstMs = d.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const m = String(kst.getUTCMonth() + 1);
  const day = String(kst.getUTCDate());
  return `${m}/${day}`;
}

/**
 * Single guestbook entry — nickname, body, KST short date. Used in both the
 * home preview and the /messages full page. No interactive controls here;
 * delete is admin-only.
 */
const MessageItem: FC<MessageItemProps> = ({ message }) => (
  <article
    className="border-line bg-paper rounded-xl px-[18px] py-4"
    style={{ borderWidth: "0.5px" }}
    data-testid="message-item"
  >
    <header className="mb-1.5 flex items-baseline justify-between gap-2">
      <span
        className="font-serif-ko text-ink text-[14px] font-medium tracking-[-0.01em]"
        data-testid="message-nickname"
      >
        {message.nickname}
      </span>
      <span className="text-muted-light text-[11px] tracking-[-0.01em]">
        {formatDate(message.createdAt)}
      </span>
    </header>
    <p
      className="font-serif-ko text-ink text-[14px] leading-[1.6] whitespace-pre-wrap"
      data-testid="message-body"
    >
      {message.body}
    </p>
  </article>
);

export default MessageItem;
