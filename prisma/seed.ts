/**
 * 시드 — 원본 HTML lines 1324-1347 의 더미 게스트 22명 + 영상 ID asset.
 * 실제 명단은 운영자가 CSV 업로드(S11) 로 덮어쓴다. phone_last4 는 더미
 * 0001..0022 순서대로 배정.
 */
import { PrismaClient } from "@prisma/client";
import { EVENT } from "../src/lib/event";

const prisma = new PrismaClient();

const GUESTS: ReadonlyArray<{ name: string; seat: string; note?: string }> = [
  { name: "신귀복", seat: "A-1", note: "이사장석" },
  { name: "정희준", seat: "A-2", note: "명예이사장석" },
  { name: "정영택", seat: "A-3", note: "부이사장석" },
  { name: "임청화", seat: "B-1", note: "출연자석" },
  { name: "민은홍", seat: "B-2", note: "출연자석" },
  { name: "김보영", seat: "B-3", note: "출연자석" },
  { name: "정세욱", seat: "B-4", note: "출연자석" },
  { name: "이광석", seat: "B-5", note: "출연자석" },
  { name: "이철웅", seat: "C-1", note: "지휘자석" },
  { name: "강예지", seat: "C-2", note: "반주석" },
  { name: "김성수", seat: "C-3", note: "임원석" },
  { name: "홍익표", seat: "C-4", note: "임원석" },
  { name: "서영순", seat: "D-1" },
  { name: "이해선", seat: "D-2" },
  { name: "이희옥", seat: "D-3" },
  { name: "임승환", seat: "D-4", note: "사무총장" },
  { name: "강순예", seat: "E-1", note: "사무국장" },
  { name: "윤희철", seat: "E-2", note: "경기포천지부장" },
  { name: "김은애", seat: "E-3", note: "경북대구지부장" },
  { name: "홍길동", seat: "F-1" },
  { name: "김철수", seat: "F-2" },
  { name: "이영희", seat: "G-1" },
];

async function main() {
  await prisma.attendee.deleteMany();
  await prisma.attendee.createMany({
    data: GUESTS.map((g, idx) => ({
      name: g.name,
      phoneLast4: String(idx + 1).padStart(4, "0"),
      seat: g.seat,
      note: g.note,
    })),
  });

  await prisma.asset.upsert({
    where: { key: "video_youtube_id" },
    create: { key: "video_youtube_id", url: EVENT.videoYoutubeId },
    update: { url: EVENT.videoYoutubeId },
  });

  // S08 — placeholder seat map shipped from /public until the operator uploads
  // the real one via /admin (S12). Storing a relative path is fine; next/image
  // accepts both relative and remote URLs.
  await prisma.asset.upsert({
    where: { key: "seat_map" },
    create: { key: "seat_map", url: "/seatmap-placeholder.svg" },
    update: { url: "/seatmap-placeholder.svg" },
  });

  // S09 — 8 brochure placeholder pages shipped from /public.
  for (let i = 1; i <= 8; i++) {
    const padded = String(i).padStart(2, "0");
    const key = `brochure_${padded}`;
    const url = `/brochure-${padded}.svg`;
    await prisma.asset.upsert({
      where: { key },
      create: { key, url },
      update: { url },
    });
  }

  const count = await prisma.attendee.count();
  console.log(`✓ Seeded ${count} attendees + video_youtube_id asset`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
