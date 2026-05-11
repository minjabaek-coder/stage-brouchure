# 06 · 기술 스택 (Tech Stack)

> 기준 문서: [`00-prd.md`](./00-prd.md) v1.1 — 기술 사양은 **Option B (Next.js + Supabase)** 채택

## 1. 한눈에 보기

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | **Next.js 15+** (App Router, RSC) | Vercel 배포·Edge·이미지 최적화 |
| 런타임 | Node.js 20 LTS | |
| 언어 | **TypeScript 5.x** (strict) | |
| UI 라이브러리 | **React 19** | Server Components + Server Actions |
| 스타일 | **Tailwind CSS 4** + **shadcn/ui** | 디자인 토큰 이식 |
| 폰트 | **Noto Serif KR**, **Cormorant Garamond** | `next/font/google` |
| DB | **PostgreSQL** (Supabase) | |
| ORM | **Prisma** 6+ | |
| 폼 | **react-hook-form** + **zod** | CSV 검증 포함 |
| 이미지 | **next/image** + **sharp** | 업로드 시 1600px 리사이즈 + JPG 80% |
| 라이트박스 | **yet-another-react-lightbox** (또는 자체) | 브로셔 풀스크린 확대 |
| CSV 파싱 | **Papaparse** | UTF-8/EUC-KR 자동 감지 |
| Rate Limit | **@upstash/ratelimit** + **@upstash/redis** | 검색 1분 30회 |
| 토스트 | **sonner** | |
| 패키지 매니저 | **pnpm** | |
| 린트/포맷 | ESLint, Prettier | |
| 배포 | **Vercel** | Preview Deploy 활용 |
| 스토리지 | **Supabase Storage** | CSV 백업 + 이미지 자산 |
| 모니터링 | **Vercel Analytics** + **Sentry** (선택) | |

> PRD §4.1 의 **Option A (정적 + Google Sheets)** 는 운영비 최소화 대안으로 참고만 한다. 본 프로젝트는 확장성·관리자 UI 품질을 위해 Option B 를 채택했다.

## 2. 폴더 구조

```
stage_brochure/
├─ docs/                          (본 문서들)
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                     원본 HTML 23명 시드 (phone_last4 더미)
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx              /
│  │  │  ├─ search/page.tsx       /search
│  │  │  └─ brochure/page.tsx     /brochure
│  │  ├─ admin/page.tsx           /admin (단일 페이지)
│  │  └─ api/
│  │     ├─ search/route.ts
│  │     └─ admin/
│  │        ├─ upload-csv/route.ts
│  │        ├─ upload-seatmap/route.ts
│  │        └─ upload-brochure/route.ts
│  ├─ components/
│  │  ├─ public/                  HomeHeader, InvitationVideo, MenuCard, SeatMapImage, BrochureScroller
│  │  ├─ admin/                   AdminCsvSection, AdminSeatMapSection, AdminBrochureSection
│  │  └─ ui/                      shadcn 베이스
│  ├─ lib/
│  │  ├─ db.ts                    Prisma 클라이언트
│  │  ├─ ratelimit.ts             upstash
│  │  ├─ csv.ts                   Papaparse + zod 검증
│  │  ├─ image.ts                 sharp 최적화
│  │  ├─ storage.ts               Supabase Storage 헬퍼
│  │  └─ youtube.ts               URL → ID 파싱
│  ├─ styles/
│  │  └─ globals.css              Tailwind + 디자인 토큰
│  └─ middleware.ts               /api/search 에 Rate Limit 적용
├─ public/
│  └─ robots.txt                  /admin disallow
├─ .env.example
├─ next.config.ts
├─ tailwind.config.ts
└─ package.json
```

별도 `(admin)` Route Group, 인증 미들웨어, 사이드바 컴포넌트 없음.

## 3. 디자인 토큰 이식

원본 HTML 의 CSS 변수(lines 11-22)를 Tailwind theme 으로 이식.

```ts
// tailwind.config.ts (발췌)
export default {
  theme: {
    extend: {
      colors: {
        ink:           "#0a0a0c",   // 먹빛 배경
        paper:         "#f4ede0",   // 본문 / 종이
        gold:          "#c5a572",   // 액센트
        goldHi:        "#e8d4a8",   // 하이라이트
        burgundy:      "#5c1a1b",   // 와인색
        burgundyDeep:  "#3d0e0f",
        inkSoft:       "#1a1612",
      },
      fontFamily: {
        serifKo: ["var(--font-noto-serif-kr)", "serif"],
        serifEn: ["var(--font-cormorant)", "serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
    },
  },
};
```

```ts
// app/layout.tsx (발췌)
import { Noto_Serif_KR, Cormorant_Garamond } from "next/font/google";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["200","300","400","500","600","700"],
  variable: "--font-noto-serif-kr",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300","400","500","600"],
  style: ["normal","italic"],
  variable: "--font-cormorant",
});
```

## 4. API 설계 원칙

- 관객용 페이지: RSC 로 `assets` 조회 후 SSR (revalidate 60s)
- 자리 검색만 클라이언트 → `POST /api/search` (Rate Limit 적용)
- 관리자 업로드: `POST /api/admin/upload-*` Route Handler (multipart)
- 응답 형식: `{ data, error: null }` 또는 `{ data: null, error: { code, message } }`
- 모든 입력은 zod 스키마 통과
- 업로드 후 `revalidatePath('/search')`, `revalidatePath('/brochure')`

```ts
// app/api/search/route.ts (의사 코드)
const SearchInput = z.object({
  name: z.string().min(1).transform(s => s.trim()),
  phone_last4: z.string().regex(/^\d{4}$/),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await ratelimit.limit(ip);
  if (!success) return Response.json({ error: { code: "RATE_LIMITED" } }, { status: 429 });

  const body = SearchInput.safeParse(await req.json());
  if (!body.success) return Response.json({ error: { code: "INVALID_INPUT" } }, { status: 400 });

  const found = await prisma.attendee.findFirst({
    where: { name: body.data.name, phoneLast4: body.data.phone_last4 },
    select: { name: true, seat: true, note: true, phoneLast4: true },
  });

  if (!found) return Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  return Response.json({ data: found });
}
```

## 5. Rate Limit (PRD §4.4)

```ts
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "search",
});
```

운영 환경: Upstash Redis 무료 티어로 충분 (행사 1회용).

## 6. 이미지 최적화 (PRD §2.3.4, §3.5.2)

```ts
// lib/image.ts
import sharp from "sharp";

export async function optimize(input: Buffer): Promise<Buffer> {
  return await sharp(input)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}
```

- 좌석배치도 1장, 브로셔 8장 모두 업로드 시 변환 후 Storage 저장
- 클라이언트에서는 `next/image` 로 표시 (자동 srcset)

## 7. 환경 변수 (.env)

```
DATABASE_URL="postgresql://..."

SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE="..."
SUPABASE_ANON_KEY="..."
SUPABASE_STORAGE_BUCKET="eoullim-assets"

UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# 선택
SENTRY_DSN="..."
ADMIN_PATH_SUFFIX=""    # 비워두면 /admin, 채우면 /admin-<suffix> 권장
```

`AUTH_SECRET` 등 인증 관련 변수는 사용하지 않는다.

## 8. 개발 워크플로우

```bash
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev                 # http://localhost:3000

# 코드 품질
pnpm lint
pnpm typecheck
pnpm format

# 배포: Vercel git 연동, main → production, PR → preview
```

## 9. 라이브러리 선정 근거

| 결정 | 채택 사유 | 비고 |
|------|----------|------|
| Next.js (App Router) | 관객/관리자 1 코드베이스, RSC 로 빠른 첫 로딩, Vercel 무료 티어 | |
| Tailwind + shadcn | 디자인 토큰 이식 용이, 관리자 UI 빠르게 조립 | |
| Prisma | 스키마 1 파일로 협업, 마이그레이션 관리 | |
| Papaparse | 한글 CSV·BOM·EUC-KR 안정 처리 | |
| sharp | 서버사이드 이미지 리사이즈/압축 표준 | |
| Upstash Ratelimit | 서버리스 환경에서 안정적 Rate Limit, 무료 티어 충분 | |
| Supabase | DB + Storage 통합, 무료 티어로 행사 1회 충분 | |
| sonner | shadcn 표준 토스트 | |

## 10. 의도적으로 채택하지 않은 것 (v1.0 대비 변경)

PRD v1.1 은 v1.0 대비 스코프가 줄어 다음 라이브러리는 **모두 제거**:

| 미채택 | 이유 |
|--------|------|
| Auth.js (NextAuth) | 관리자 로그인 없음 (PRD §3.1) |
| @dnd-kit | 좌석배치도 편집기·프로그램 DnD 없음. 브로셔 8장 순서 변경은 단순 위/아래 화살표로 충분 |
| TanStack Table | 인라인 편집 테이블 없음. CSV 미리보기는 단순 read-only 테이블 |
| react-pdf | QR PDF 일괄 출력 없음 |
| qrcode / qrcode.react | 게스트별 QR 토큰 없음 |
| react-zoom-pan-pinch | SVG 인터랙션 대신 정적 이미지 + 라이트박스 |
| next-intl | 다국어 지원 미포함 (PRD §7) |

## 11. 비기능 충족 매핑

| NFR | 충족 방식 |
|-----|----------|
| NFR-03 (첫 로딩 2s) | next/image, 폰트 preload, Vercel Edge, Tailwind 트리쉐이킹 |
| NFR-04 (검색 1s) | `(name, phone_last4)` 복합 인덱스, RSC 가 아닌 단발 fetch |
| NFR-05 (lazy) | `<img loading="lazy">` 또는 next/image 기본 동작 |
| NFR-06 (동시 100명) | Vercel Edge + Supabase 커넥션 풀 |
| NFR-07 (HTTPS) | Vercel 기본 |
| NFR-08 (Rate Limit) | Upstash 30/min |
| NFR-09 (개인정보) | `phone_last4` char(4) 만 저장, 전체 번호 컬럼 부재 |
| NFR-10 (파일 크기) | 업로드 핸들러에서 5MB/10MB 검증 |

## 12. 마일스톤 (PRD §8)

| 단계 | 작업 | 기간 |
|------|------|------|
| 1주차 | 프로젝트 초기화, Prisma 스키마, 시드, 디자인 토큰 | 2–3일 |
| 2주차 | 메인 / 브로셔 페이지 구현 (이미지 뷰어 포함) | 2–3일 |
| 3주차 | 자리 찾기 + 관리자 페이지 (CSV·이미지 업로드) | 3–4일 |
| 4주차 | 테스트, 명단·이미지 업로드 리허설, 버그 수정 | 2일 |
| 행사 전 | 최종 명단 업로드, 브로셔·좌석배치도 업로드 | 1일 |

**총 예상 개발 기간: 약 10–14일**

## 13. 위험 요소 & 완화

| 위험 | 영향 | 완화 |
|------|------|------|
| 행사 당일 트래픽 스파이크 | 검색 지연 | Vercel Edge + DB 인덱스 + Rate Limit 적정 |
| `/admin` URL 유출 | 무단 업로드 위험 | 추측 어려운 경로 + robots.txt + 운영자 1인 보관 |
| CSV 인코딩 (EUC-KR) | 한글 깨짐 | Papaparse + 자동 감지, 실패 시 안내 |
| 카카오톡 인앱 브라우저 | 일부 영상·라이트박스 제한 | 사전 점검, 폴백 UI |
| 명단 실수 덮어쓰기 | 데이터 손실 | 자동 백업 3개 보존 + 확인 모달 |
