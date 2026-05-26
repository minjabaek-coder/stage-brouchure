import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * 관람 후기 (ENT-05) — 공연을 본 관객이 남기는 감상글.
 * 닉네임 2–10자, 본문 1–500자. IP·이메일 미저장 (NFR-09).
 * 즉시 공개. 삭제는 /admin/messages 의 후기 탭에서만.
 */

export const ReviewInput = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(10, { message: "닉네임은 10자 이하여야 합니다." }),
  body: z
    .string()
    .trim()
    .min(1, { message: "후기를 입력해 주세요." })
    .max(500, { message: "후기는 500자 이하여야 합니다." }),
});
export type ReviewInput = z.infer<typeof ReviewInput>;

export interface PublicReview {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
}

function serialize(r: {
  id: string;
  nickname: string;
  body: string;
  createdAt: Date;
}): PublicReview {
  return {
    id: r.id,
    nickname: r.nickname,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getRecentReviews(
  take = DEFAULT_LIMIT,
): Promise<PublicReview[]> {
  const clamped = Math.max(1, Math.min(take, MAX_LIMIT));
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: clamped,
  });
  return rows.map(serialize);
}

export async function getAllReviews(): Promise<PublicReview[]> {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_LIMIT,
  });
  return rows.map(serialize);
}

export async function countReviews(): Promise<number> {
  return prisma.review.count();
}

export async function createReview(input: ReviewInput): Promise<PublicReview> {
  const created = await prisma.review.create({ data: input });
  return serialize(created);
}

export async function deleteReview(id: string): Promise<void> {
  await prisma.review.delete({ where: { id } });
}
