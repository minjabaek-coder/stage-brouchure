# 04 · 데이터 모델 (Data Model)

> 기준 문서: [`00-prd.md`](./00-prd.md) v1.2 · §4.2

PostgreSQL (Supabase) + Prisma ORM 기준. PRD §4.2 에 따라 **3 테이블** (`attendees`, `assets`, `messages`) + 선택 백업 1개 (`csv_backups`) 를 운영한다.

## 1. ERD (텍스트)

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  attendees   │        │    assets    │        │   messages   │
│              │        │              │        │              │
│  id (PK)     │        │  key (PK)    │        │  id (PK)     │
│  name        │        │  url         │        │  nickname    │
│  phone_last4 │        │  updated_at  │        │  body        │
│  seat        │        │              │        │  created_at  │
│  note        │        │              │        │              │
│  created_at  │        │              │        │              │
│  updated_at  │        │              │        │              │
└──────────────┘        └──────────────┘        └──────────────┘
        ↑                                              ↑
        │ (논리적, FK 없음)                            │ (독립)
        │
┌──────────────────┐
│  csv_backups     │   (선택, 자동 백업용)
│  id (PK)         │
│  uploaded_at     │
│  storage_path    │
│  row_count       │
└──────────────────┘
```

행사 정보(타이틀·일시·장소·주최)는 **단일 행사** 전제로 코드 상수 또는 환경변수로 관리. 별도 `Event` 테이블 없음.

## 2. 엔터티 명세

### ENT-01 · attendees
참석자 명단. CSV 업로드 시 전체가 truncate + insert 된다.

| 필드 | 타입 | 제약 | 비고 |
|------|------|------|------|
| id | int | PK, auto increment | |
| name | text | not null | "홍길동" — trim 후 저장 |
| phone_last4 | char(4) | not null | "1234" — 숫자 4자리만 |
| seat | text | not null | "A-2" |
| note | text | nullable | "이사장석" 등 |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | | |

**인덱스**:
- `(name, phone_last4)` 복합 인덱스 — 검색 쿼리에 최적화
- (선택) `(name)` 단독 인덱스 — 동명이인 통계용

**삭제·재삽입 정책**: CSV 업로드는 `BEGIN; TRUNCATE attendees; INSERT ...; COMMIT;` 트랜잭션. 직전 데이터는 `csv_backups` 또는 Supabase Storage 에 백업한다.

### ENT-02 · assets
이미지 자원 (좌석배치도 1장 + 브로셔 8장 + 영상 ID).

| 필드 | 타입 | 제약 | 비고 |
|------|------|------|------|
| key | text | PK | 아래 enum 참조 |
| url | text | not null | Supabase Storage public URL |
| updated_at | timestamptz | default now() | |

**`key` 허용 값**:
- `seat_map` — 좌석배치도 이미지 1장
- `brochure_01` ~ `brochure_08` — 브로셔 8장
- `video_youtube_id` — (선택) 초청 영상 ID. 기본 `0aT4IdHXZW8`. URL 이 아니라 ID 만 저장하므로 `url` 컬럼명이지만 ID 값을 보관해도 무방. 또는 환경변수로 분리

업로드 시 동일 key 의 기존 row 를 UPSERT.

### ENT-03 · csv_backups (선택)
CSV 업로드 직전 데이터를 자동 백업. 최근 3개 버전만 유지 (PRD §3.3.4).

| 필드 | 타입 | 제약 | 비고 |
|------|------|------|------|
| id | int | PK, auto increment | |
| uploaded_at | timestamptz | default now() | 업로드 시각 |
| storage_path | text | not null | Supabase Storage 의 백업 CSV 경로 |
| row_count | int | | 백업 당시 행 수 |

업로드 후 4번째 백업이 생기면 가장 오래된 백업을 자동 삭제 (cron 또는 트리거).

> 단순화: Supabase Storage 의 디렉터리 listing 만으로 관리할 수도 있어 본 테이블은 **선택 사항**.

### ENT-04 · messages
응원 메시지 (PRD §2.4, FR-G09/G10, FR-A05). 닉네임 + 본문만 저장. 작성자 식별 정보(IP/이메일/전화 등) 미저장 (NFR-09).

| 필드 | 타입 | 제약 | 비고 |
|------|------|------|------|
| id | text (cuid) | PK | `@default(cuid())` |
| nickname | varchar(10) | not null | 2–10자, trim 후 저장 |
| body | varchar(200) | not null | 1–200자, 줄바꿈 허용 |
| created_at | timestamptz | default now() | 인덱스 (DESC) — 최신순 조회 최적화 |

**인덱스**:
- `(created_at DESC)` — `/messages` 와 홈 미리보기의 최신순 조회 패턴에 일치

**운영 정책**:
- 즉시 공개 (별도 모더레이션 큐 없음)
- 작성 Rate Limit: 1분 / IP (FR-G10). IP 는 `@upstash/ratelimit` 의 키로만 사용, DB·로그 미저장
- 삭제는 운영자만 (`DELETE /api/admin/messages/[id]`, FR-A05), hard delete
- 작성자 본인 삭제·수정 기능 없음 (단순화)

## 3. Prisma 스키마

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Attendee {
  id          Int      @id @default(autoincrement())
  name        String
  phoneLast4  String   @map("phone_last4") @db.Char(4)
  seat        String
  note        String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt      @map("updated_at")

  @@index([name, phoneLast4])
  @@index([name])
  @@map("attendees")
}

model Asset {
  key       String   @id
  url       String
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")

  @@map("assets")
}

model CsvBackup {
  id           Int      @id @default(autoincrement())
  uploadedAt   DateTime @default(now()) @map("uploaded_at")
  storagePath  String   @map("storage_path")
  rowCount     Int?     @map("row_count")

  @@map("csv_backups")
}

model Message {
  id        String   @id @default(cuid())
  nickname  String   @db.VarChar(10)
  body      String   @db.VarChar(200)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt(sort: Desc)])
  @@map("messages")
}
```

## 4. 검색 쿼리

```ts
// app/api/search/route.ts
const result = await prisma.attendee.findFirst({
  where: {
    name: name.trim(),
    phoneLast4: phoneLast4,
  },
  select: { name: true, seat: true, note: true, phoneLast4: true },
});
// 매칭 실패 케이스를 모두 동일 메시지로 응답 (PRD §2.2.5)
```

대소문자 무관 처리는 한국어에는 큰 영향이 없으나, 코드 단계에서 `name.trim()` 만 적용. 향후 영문 이름이 추가되면 `mode: 'insensitive'` 검토.

## 5. CSV 업로드 트랜잭션 의사코드

```ts
async function uploadCsv(file: File) {
  // 1. 백업
  const oldRows = await prisma.attendee.findMany();
  await uploadToStorage(`backups/${Date.now()}.csv`, csvSerialize(oldRows));
  await prisma.csvBackup.create({ data: { storagePath, rowCount: oldRows.length } });
  await pruneOldBackups(3);  // 최근 3개만 유지

  // 2. 파싱·검증
  const { valid, invalid } = parseCsvWithValidation(file);

  // 3. 트랜잭션
  await prisma.$transaction(async (tx) => {
    await tx.attendee.deleteMany();
    await tx.attendee.createMany({ data: valid });
  });

  return { inserted: valid.length, invalid };
}
```

## 6. 시드 데이터 (`prisma/seed.ts`)

원본 HTML lines 1324-1347 의 **22명** 게스트를 시드 (이전 표기 "23명" 은 HTML 행 카운트 착오). PRD 에 없는 `phone_last4` 는 더미 값 (`0001` ~ `0022`) 으로 순서대로 채운다 — 실제 명단은 운영자가 CSV 업로드 (S11) 시 덮어쓴다.

```ts
const seed = [
  { name: "신귀복", phone_last4: "0001", seat: "A-1", note: "이사장석" },
  { name: "정희준", phone_last4: "0002", seat: "A-2", note: "명예이사장석" },
  // … 23건
];
await prisma.attendee.createMany({ data: seed });

await prisma.asset.upsert({
  where: { key: "video_youtube_id" },
  create: { key: "video_youtube_id", url: "0aT4IdHXZW8" },
  update: {},
});
```

좌석배치도·브로셔 이미지는 시드 단계에서는 미설정 → 관리자가 업로드.

## 7. 검증 매핑 (PRD → 엔터티)

| PRD 위치 | 엔터티/필드 |
|----------|-------------|
| §4.2 attendees 표 | `Attendee.*` |
| §4.2 assets 표 | `Asset.*` |
| §4.2 messages 표 | `Message.*` |
| §3.3.4 자동 백업 | `CsvBackup.*` + Storage |
| §2.2.3 검색 로직 | `Attendee.findFirst({ where: { name, phoneLast4 } })` |
| §3.3.3 검증 규칙 | CSV 파서 단계 zod 스키마 |
| §2.4.3 작성 입력 검증 | `MessageInput` zod 스키마 (`src/lib/messages.ts`) |
| §2.4.4 도배 방지 | `@upstash/ratelimit` messages 트랙 (1/min/IP) |
| §3.6.2 삭제 흐름 | `prisma.message.delete({ where: { id } })` + `revalidatePath` |

## 8. 데이터 보관 정책

- 행사 종료 6개월 후 `attendees` 자동 삭제 (cron) — 개인정보 최소화 (NFR-09)
- `csv_backups` Storage 도 동일하게 6개월 후 정리
- 이미지 자산은 보관 (다음 회차 재사용 가능)
- `messages` 는 식별 정보가 없으므로 보관해도 무방. 다음 회차 사이트로 마이그레이션할지 폐기할지는 운영자가 행사 후 판단
