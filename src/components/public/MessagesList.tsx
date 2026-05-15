import { type FC } from "react";
import MessageItem from "@/components/public/MessageItem";
import type { PublicMessage } from "@/lib/messages";

interface MessagesListProps {
  items: PublicMessage[];
}

const MessagesList: FC<MessagesListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <p
        className="text-muted py-12 text-center text-[14px] leading-[1.6]"
        data-testid="messages-list-empty"
      >
        아직 남겨진 메시지가 없어요.
        <br />첫 메시지의 주인공이 되어 주세요.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3" data-testid="messages-list">
      {items.map((m) => (
        <li key={m.id}>
          <MessageItem message={m} />
        </li>
      ))}
    </ul>
  );
};

export default MessagesList;
