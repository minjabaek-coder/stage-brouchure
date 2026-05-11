import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  MAX_CSV_BYTES,
  decodeCsv,
  parseAttendeesCsv,
} from "@/lib/csv";
import { deleteBackupCsv, saveBackupCsv } from "@/lib/storage";

const KEEP_BACKUPS = 3; // PRD §3.3.4 — keep latest 3 backups

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FILE" }, { status: 400 });
  }

  if (file.size > MAX_CSV_BYTES) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        message: `5MB 를 초과합니다 (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      },
      { status: 413 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const text = decodeCsv(buf);
  const parsed = parseAttendeesCsv(text);

  if (parsed.valid.length === 0) {
    return NextResponse.json(
      { error: "NO_VALID_ROWS", invalid: parsed.invalid },
      { status: 400 },
    );
  }

  // 1) Backup the previous attendees to CSV + record csv_backups + prune.
  const existing = await prisma.attendee.findMany({
    orderBy: { id: "asc" },
    select: { name: true, phoneLast4: true, seat: true, note: true },
  });
  if (existing.length > 0) {
    const backupCsv = serializeBackup(existing);
    const filename = `attendees-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    const storagePath = await saveBackupCsv(filename, backupCsv);
    await prisma.csvBackup.create({
      data: { storagePath, rowCount: existing.length },
    });

    const overflow = await prisma.csvBackup.findMany({
      orderBy: { uploadedAt: "desc" },
      skip: KEEP_BACKUPS,
    });
    if (overflow.length > 0) {
      await Promise.all(
        overflow.map((b) =>
          deleteBackupCsv(b.storagePath).catch((e) =>
            console.warn("[csv backup prune] failed:", b.storagePath, e),
          ),
        ),
      );
      await prisma.csvBackup.deleteMany({
        where: { id: { in: overflow.map((b) => b.id) } },
      });
    }
  }

  // 2) Replace attendees in a transaction.
  await prisma.$transaction([
    prisma.attendee.deleteMany(),
    prisma.attendee.createMany({
      data: parsed.valid.map((r) => ({
        name: r.name,
        phoneLast4: r.phone_last4,
        seat: r.seat,
        note: r.note ?? null,
      })),
    }),
  ]);

  // 3) Revalidate public surfaces that depend on attendees.
  revalidatePath("/search");
  revalidatePath("/admin");

  return NextResponse.json({
    inserted: parsed.valid.length,
    invalid: parsed.invalid,
  });
}

interface BackupRow {
  name: string;
  phoneLast4: string;
  seat: string;
  note: string | null;
}

function serializeBackup(rows: BackupRow[]): string {
  const escape = (v: string) =>
    /["\n,]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const header = "name,phone_last4,seat,note";
  const body = rows
    .map((r) =>
      [r.name, r.phoneLast4, r.seat, r.note ?? ""].map(escape).join(","),
    )
    .join("\n");
  return `${header}\n${body}\n`;
}
