import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * 관객 업로드 사진 (ENT-06). 닉네임 + (선택) 캡션 + Vercel Blob URL +
 * 메타데이터. EXIF/GPS 는 서버 sharp 단계에서 strip (NFR-09).
 *
 * 한 번에 1–3장 업로드 (FR-G12). 즉시 공개. 삭제는 운영자만.
 */

export const PhotoMetaInput = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(10, { message: "닉네임은 10자 이하여야 합니다." }),
  caption: z
    .string()
    .trim()
    .max(100, { message: "캡션은 100자 이하여야 합니다." })
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type PhotoMetaInput = z.infer<typeof PhotoMetaInput>;

export interface PublicPhoto {
  id: string;
  nickname: string;
  caption: string | null;
  url: string;
  width: number;
  height: number;
  createdAt: string;
}

function serialize(p: {
  id: string;
  nickname: string;
  caption: string | null;
  url: string;
  width: number;
  height: number;
  createdAt: Date;
}): PublicPhoto {
  return {
    id: p.id,
    nickname: p.nickname,
    caption: p.caption,
    url: p.url,
    width: p.width,
    height: p.height,
    createdAt: p.createdAt.toISOString(),
  };
}

const MAX_LIMIT = 200;

export async function getAllPhotos(): Promise<PublicPhoto[]> {
  const rows = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_LIMIT,
  });
  return rows.map(serialize);
}

export async function countPhotos(): Promise<number> {
  return prisma.photo.count();
}

export interface CreatePhotoInput extends PhotoMetaInput {
  url: string;
  width: number;
  height: number;
  byteSize: number;
}

export async function createPhoto(input: CreatePhotoInput): Promise<PublicPhoto> {
  const created = await prisma.photo.create({
    data: {
      nickname: input.nickname,
      caption: input.caption ?? null,
      url: input.url,
      width: input.width,
      height: input.height,
      byteSize: input.byteSize,
    },
  });
  return serialize(created);
}

/**
 * Returns the deleted photo's url so the API route can also remove the
 * Vercel Blob object after the DB row is gone.
 */
export async function deletePhoto(id: string): Promise<{ url: string }> {
  const row = await prisma.photo.delete({
    where: { id },
    select: { url: true },
  });
  return { url: row.url };
}
