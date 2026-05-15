import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * 방명록 (ENT-04) — 한마디 모음.
 * 닉네임 2–10자, 본문 1–200자. IP·이메일 미저장.
 * 즉시 공개. 삭제는 /admin/messages 에서만.
 */

export const MessageInput = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(10, { message: "닉네임은 10자 이하여야 합니다." }),
  body: z
    .string()
    .trim()
    .min(1, { message: "메시지를 입력해 주세요." })
    .max(200, { message: "메시지는 200자 이하여야 합니다." }),
});
export type MessageInput = z.infer<typeof MessageInput>;

export interface PublicMessage {
  id: string;
  nickname: string;
  body: string;
  createdAt: string; // ISO string for client serialization
}

function serialize(m: {
  id: string;
  nickname: string;
  body: string;
  createdAt: Date;
}): PublicMessage {
  return {
    id: m.id,
    nickname: m.nickname,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getRecentMessages(
  take = DEFAULT_LIMIT,
): Promise<PublicMessage[]> {
  const clamped = Math.max(1, Math.min(take, MAX_LIMIT));
  const rows = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: clamped,
  });
  return rows.map(serialize);
}

export async function getAllMessages(): Promise<PublicMessage[]> {
  const rows = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_LIMIT,
  });
  return rows.map(serialize);
}

export async function countMessages(): Promise<number> {
  return prisma.message.count();
}

export async function createMessage(
  input: MessageInput,
): Promise<PublicMessage> {
  const created = await prisma.message.create({ data: input });
  return serialize(created);
}

export async function deleteMessage(id: string): Promise<void> {
  await prisma.message.delete({ where: { id } });
}
