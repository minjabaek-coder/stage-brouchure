import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import MessagesList from "@/components/public/MessagesList";
import MessageFormButton from "@/components/public/MessageFormButton";
import { getAllMessages, countMessages } from "@/lib/messages";

export const metadata = {
  title: "방명록 · 어울림 콘서트",
};

// DB-backed list — always SSR with fresh data; admin deletions/new posts
// propagate via revalidatePath in their respective routes.
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [items, total] = await Promise.all([getAllMessages(), countMessages()]);

  return (
    <Stage>
      <PageHeader title="방명록" chapter="Chapter III" />
      <p className="text-muted mb-5 text-center text-[14px] leading-[1.7]">
        출연자에게 응원의 한마디를 남겨 주세요.
        <br />
        지금까지 <span data-testid="messages-total">{total}</span>개의 메시지가
        있습니다.
      </p>

      <div className="mb-6 flex justify-center">
        <MessageFormButton />
      </div>

      <MessagesList items={items} />
    </Stage>
  );
}
