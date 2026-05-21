import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import MessagesList from "@/components/public/MessagesList";
import MessageFormButton from "@/components/public/MessageFormButton";
import MessagesTabs from "@/components/public/MessagesTabs";
import MessagesComingSoon from "@/components/public/MessagesComingSoon";
import { getAllMessages, countMessages } from "@/lib/messages";

export const metadata = {
  title: "응원 메시지 · 어울림 콘서트",
};

// DB-backed list — always SSR with fresh data; admin deletions/new posts
// propagate via revalidatePath in their respective routes.
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [items, total] = await Promise.all([getAllMessages(), countMessages()]);

  const cheerPanel = (
    <>
      <p className="text-muted mb-4 text-center text-[13px] leading-[1.6]">
        지금까지 <span data-testid="messages-total">{total}</span>개의 메시지가
        있습니다.
      </p>
      <div className="mb-5">
        <MessageFormButton variant="hero" />
      </div>
      <MessagesList items={items} />
    </>
  );

  const reviewPanel = (
    <MessagesComingSoon
      icon="ti-message-circle"
      title="관람 후기는 공연 후 공개됩니다"
      description={`2026년 5월 26일 공연이 끝난 뒤\n관람객의 후기를 이곳에서 만나보실 수 있어요.`}
      testid="messages-review-coming-soon"
    />
  );

  const photosPanel = (
    <MessagesComingSoon
      icon="ti-camera"
      title="공연 사진은 공연 후 공개됩니다"
      description={`공연 당일 현장 사진을\n행사 종료 후 이곳에서 공유해 드릴 예정이에요.`}
      testid="messages-photos-coming-soon"
    />
  );

  return (
    <Stage>
      <PageHeader title="응원 메시지" chapter="Chapter III" />
      <MessagesTabs
        cheerPanel={cheerPanel}
        reviewPanel={reviewPanel}
        photosPanel={photosPanel}
      />
    </Stage>
  );
}
