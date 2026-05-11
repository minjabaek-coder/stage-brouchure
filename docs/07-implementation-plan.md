# 07 · 구현 계획 (Implementation Plan)

> 기준 문서: [`00-prd.md`](./00-prd.md) v1.1, [`02-functional-requirements.md`](./02-functional-requirements.md), [`06-tech-stack.md`](./06-tech-stack.md)

PRD v1.1 의 모든 기능을 **단계별로 한 기능씩** 구현한다. 각 단계는 다음 게이트를 통과해야 다음 단계로 넘어갈 수 있다.

> **단계 게이트**:
> 1. 구현 완료
> 2. `pnpm typecheck` `pnpm lint` 통과
> 3. `pnpm test:e2e -- <step>` 통과 (Playwright)
> 4. `git commit` (메시지 컨벤션: `feat(s##): <짧은 설명>`)
> 5. **사용자 수동 검토 OK**

---

## 단계 개요

| Step | 제목 | 매핑 FR | 의존 | 예상 시간 |
|------|------|---------|------|-----------|
| [S00](#s00--프로젝트-부트스트랩) | 프로젝트 부트스트랩 | — | — | 0.5일 |
| [S01](#s01--디자인-토큰--글로벌-레이아웃) | 디자인 토큰 + 글로벌 레이아웃 | NFR-01,02 | S00 | 0.5일 |
| [S02](#s02--홈-헤더--푸터) | 홈 헤더 + 푸터 | FR-G01 | S01 | 0.5일 |
| [S03](#s03--초대-영상-인라인-재생) | 초대 영상 인라인 재생 | FR-G02 | S02 | 0.5일 |
| [S04](#s04--홈-메뉴-카드--라우트-스텁) | 홈 메뉴 카드 + 라우트 스텁 | FR-G07 | S02 | 0.5일 |
| [S05](#s05--db-스키마--시드) | DB 스키마 + 시드 | ENT-01,02,03 | S00 | 1일 |
| [S06](#s06--검색-api--rate-limit) | 검색 API + Rate Limit | FR-G03(API), FR-G05 | S05 | 0.5일 |
| [S07](#s07--자리-찾기-ui) | 자리 찾기 UI | FR-G03(UI) | S04, S06 | 1일 |
| [S08](#s08--정적-좌석배치도) | 정적 좌석배치도 표시 | FR-G04 | S07 | 0.5일 |
| [S09](#s09--브로셔-페이지) | 브로셔 페이지 (8장) | FR-G06 | S04, S05 | 1일 |
| [S10](#s10--관리자-페이지-셸) | 관리자 페이지 셸 | FR-A01 | S05 | 0.5일 |
| [S11](#s11--관리자-csv-업로드) | 관리자 CSV 업로드 + 백업 | FR-A02 | S10 | 1.5일 |
| [S12](#s12--관리자-좌석배치도-업로드) | 관리자 좌석배치도 업로드 | FR-A03 | S10, S08 | 0.5일 |
| [S13](#s13--관리자-브로셔-업로드) | 관리자 브로셔 8장 업로드 | FR-A04 | S10, S09 | 1일 |
| [S14](#s14--최종-qa-게이트) | **최종 QA (게이트)** | NFR 전체 | 전체 | 1일 |

총 약 **10일** (PRD §8 의 10–14일 범위 내).

---

## S00 · 프로젝트 부트스트랩

> 매핑 FR: 없음 (인프라)

### 목표
Next.js 15 + TypeScript + Tailwind 프로젝트와 Playwright 환경을 셋업한다.

### 구현 범위
- `pnpm create next-app stage_brochure --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`
- `package.json` 스크립트: `dev`, `build`, `start`, `lint`, `typecheck`, `test:e2e`
- `playwright.config.ts` (mobile chromium iPhone 13, desktop chromium)
- `tests/e2e/smoke.spec.ts` 디렉터리 구조
- `public/robots.txt`:
  ```
  User-agent: *
  Disallow: /admin
  ```
- `.env.example`, `.gitignore` (Next 기본 + Playwright 산출물)
- 첫 git commit

### Out of Scope
- 디자인 토큰, 폰트 (S01)
- 모든 페이지 콘텐츠 (S02 이후)

### Playwright E2E
- `tests/e2e/s00-smoke.spec.ts`
  1. `/` 응답이 200
  2. `<title>` 에 "어울림" 포함 (또는 placeholder 라도 페이지가 로드됨)
  3. `/admin` 접속 시 200 (인증 없음 — placeholder 라도)
- 데이터 준비: 없음

### 단계 완료 (DoD)
- [ ] 프로젝트 생성 + 빌드 성공
- [ ] `pnpm typecheck` `pnpm lint` 통과
- [ ] `pnpm test:e2e -- s00` 통과
- [ ] git commit `feat(s00): bootstrap nextjs project with playwright`
- [ ] 사용자 검토 OK

### 검토 가이드
- `pnpm dev` 실행 → http://localhost:3000 접속, 기본 페이지 로드 확인
- `pnpm test:e2e` 실행, 모든 테스트 green 확인
- 디렉터리 구조가 `06-tech-stack.md` §2 와 일치하는지 확인

---

## S01 · 디자인 토큰 + 글로벌 레이아웃

> 매핑 FR: NFR-01 (모바일 우선), NFR-02 (한국어 UI)

### 목표
원본 HTML 의 디자인 토큰(잉크/페이퍼/골드/와인)과 폰트(Noto Serif KR + Cormorant)를 Next.js 에 이식한다.

### 구현 범위
- `tailwind.config.ts` colors 확장 (ink, paper, gold, goldHi, burgundy, burgundyDeep, inkSoft)
- `src/app/layout.tsx` 에 `next/font/google` 로 두 폰트 변수 (`--font-noto-serif-kr`, `--font-cormorant`)
- `src/styles/globals.css`:
  - body 배경: ink + radial gradient + noise SVG (data URI, 원본 HTML lines 34-49 참고)
  - 한글 본문 기본 font-family
- `src/components/ui/BackgroundLayer.tsx`
- `src/components/ui/Stage.tsx` (max-w-[560px] 컨테이너)
- 키프레임: `fadeUp`, `pulseGold` (globals.css)
- viewport meta (max-scale 1, user-scalable=no) — `app/layout.tsx`

### Out of Scope
- 헤더/메뉴 등 페이지 콘텐츠 (S02)

### Playwright E2E
- `tests/e2e/s01-design-tokens.spec.ts`
  1. body 의 computed `background-color` 가 `rgb(10, 10, 12)` (`#0a0a0c`)
  2. 본문 영역에 Noto Serif KR 폰트 family 적용
  3. `<html>` viewport meta 가 PRD 명세대로 적용

### 단계 완료 (DoD)
- [ ] 토큰·폰트·배경 적용
- [ ] typecheck/lint 통과
- [ ] `pnpm test:e2e -- s01` 통과
- [ ] git commit `feat(s01): apply design tokens and global layout`
- [ ] 사용자 검토 OK

### 검토 가이드
- 빈 페이지여도 배경이 어두운 잉크 톤 + 미세한 노이즈가 보여야 함
- 모바일 폭 320px 에서 가로 스크롤이 발생하지 않는지 (DevTools)

---

## S02 · 홈 헤더 + 푸터

> 매핑 FR: FR-G01

### 목표
메인 페이지의 헤더(타이틀·일시·장소·시간)와 푸터(주최)를 표시한다.

### 구현 범위
- `src/lib/event.ts` — 행사 정보 상수 (PRD §1)
  ```ts
  export const EVENT = {
    titleKo: "어울림 콘서트",
    titleEn: "Harmony Concert",
    preTitle: "협력단체와 함께하는 앙상블의 향연",
    subtitleEn: "A Symphony of Souls in Concord",
    date: "2026 · 5 · 26",
    venue: "송파문화예술회관",
    time: "PM 7:30",
    organizer: "(사)한국예술가곡총연합회",
  };
  ```
- `src/components/public/HomeHeader.tsx` (Ornament, PreTitle, TitleEn, TitleKo, Subtitle, EventMeta)
- `src/components/public/HomeFooter.tsx`
- `src/app/(public)/page.tsx` 에서 두 컴포넌트 사용
- fadeUp 진입 애니메이션

### Out of Scope
- 영상, 메뉴 카드 (S03, S04)

### Playwright E2E
- `tests/e2e/s02-home-header.spec.ts`
  1. `/` 진입 시 "어울림", "Harmony Concert", "협력단체와 함께하는 앙상블의 향연" 모두 노출
  2. 메타 영역에 `2026 · 5 · 26`, `송파문화예술회관`, `PM 7:30` 노출
  3. 푸터에 `(사)한국예술가곡총연합회` 노출
  4. iPhone 13 viewport 에서 가로 스크롤 없음

### 단계 완료 (DoD)
- [ ] 헤더·푸터 정상 표시
- [ ] AC-1~3 E2E 통과
- [ ] git commit `feat(s02): add home header and footer (FR-G01)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 모바일/데스크톱 모두에서 시각적 정렬·여백·폰트가 원본 HTML 과 유사한지 비교 (`docs/assets/reference-original.html`)

---

## S03 · 초대 영상 인라인 재생

> 매핑 FR: FR-G02

### 목표
헤더 아래 YouTube 초대 영상을 클릭으로 인라인 재생한다.

### 구현 범위
- `src/components/public/InvitationVideo.tsx` (클라이언트 컴포넌트)
  - 썸네일 `https://i.ytimg.com/vi/0aT4IdHXZW8/maxresdefault.jpg`
  - onerror 시 `hqdefault.jpg` 폴백
  - 클릭 시 iframe 으로 교체:
    `https://www.youtube.com/embed/0aT4IdHXZW8?autoplay=1&playsinline=1&rel=0&modestbranding=1`
  - allow 속성: `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture`
- 영상 캡션 "✦ Invitation to the Evening ✦"
- 홈 페이지에 통합

### Out of Scope
- 메뉴 카드 (S04)

### Playwright E2E
- `tests/e2e/s03-video.spec.ts`
  1. `/` 진입 시 썸네일 `<img>` 가 `0aT4IdHXZW8` 포함 src 로 렌더
  2. iframe 은 첫 진입 시 미존재 (LCP 영향 차단)
  3. 썸네일 클릭 → `iframe[src*="youtube.com/embed/0aT4IdHXZW8"]` 가 등장
  4. iframe 의 `src` 에 `playsinline=1` 포함

### 단계 완료 (DoD)
- [ ] 썸네일·재생 정상
- [ ] AC-1~3 E2E 통과
- [ ] git commit `feat(s03): inline youtube video player (FR-G02)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 모바일 Safari 에서 영상이 새 창으로 빠지지 않고 인라인 재생되는지 (실기기 또는 emulator)

---

## S04 · 홈 메뉴 카드 + 라우트 스텁

> 매핑 FR: FR-G07

### 목표
"자리 찾기"·"브로셔" 메뉴 카드를 만들고 두 라우트의 스텁 페이지를 둔다.

### 구현 범위
- `src/components/public/MenuCardList.tsx`
- `src/components/public/MenuCard.tsx` (corner ornaments, num "I/II", title, desc, arrow)
- `src/app/(public)/search/page.tsx` — 임시 페이지 ("자리 찾기 — 준비 중")
- `src/app/(public)/brochure/page.tsx` — 임시 페이지 ("브로셔 — 준비 중")
- `PageHeader` 공용 컴포넌트 (뒤로가기 ← 버튼 + 타이틀)
- 페이지 전환 fade

### Out of Scope
- 검색·브로셔 실제 콘텐츠 (S07, S09)

### Playwright E2E
- `tests/e2e/s04-menu.spec.ts`
  1. `/` 에서 "자리 찾기" 카드 클릭 → URL `/search`, 헤더 "자리 찾기" 노출
  2. 뒤로가기 버튼 클릭 → URL `/`
  3. "브로셔" 카드 → URL `/brochure`, 헤더 "브로셔" 노출
  4. 브라우저 뒤로가기로도 홈 복귀

### 단계 완료 (DoD)
- [ ] 카드·라우팅·스텁 페이지 정상
- [ ] E2E 통과
- [ ] git commit `feat(s04): add home menu cards and route stubs (FR-G07)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 카드 hover/active 효과
- 라우트 전환 시 깜박임/레이아웃 시프트 없음

---

## S05 · DB 스키마 + 시드

> 매핑 ENT: ENT-01 (attendees), ENT-02 (assets), ENT-03 (csv_backups)

### 목표
Supabase Postgres + Prisma 로 스키마를 만들고 23명 더미 데이터를 시드한다.

### 구현 범위
- Supabase 프로젝트 생성, `DATABASE_URL` `.env`
- `prisma/schema.prisma` (`docs/04-data-model.md` §3 그대로)
- `prisma migrate dev --name init`
- `prisma/seed.ts`:
  - 원본 HTML lines 1324-1347 의 23명 → `attendees` (`phone_last4` 더미 `0001`~`0023`)
  - `assets.video_youtube_id = "0aT4IdHXZW8"` upsert
- `package.json` `prisma.seed` 등록
- `src/lib/db.ts` Prisma 싱글톤
- (테스트 전용) `src/app/api/__test__/seed-check/route.ts` — `process.env.NODE_ENV !== 'production'` 가드, attendee count 와 video ID 반환

### Out of Scope
- 검색 API (S06), 업로드 API (S11–13)

### Playwright E2E
- `tests/e2e/s05-db-seed.spec.ts`
  1. `GET /api/__test__/seed-check` → `{ attendees: 23, videoId: "0aT4IdHXZW8" }`
- 데이터 준비: `pnpm prisma migrate reset --force --skip-seed && pnpm prisma db seed`

### 단계 완료 (DoD)
- [ ] Supabase 마이그레이션 적용
- [ ] 시드 정상 동작
- [ ] E2E 통과
- [ ] git commit `feat(s05): prisma schema and seed for attendees/assets`
- [ ] 사용자 검토 OK

### 검토 가이드
- Supabase Studio 에서 테이블·row 가 보이는지 확인
- `phone_last4` 가 4자리 숫자로 저장되었는지

---

## S06 · 검색 API + Rate Limit

> 매핑 FR: FR-G03 (백엔드), FR-G05

### 목표
이름+전화 4자리로 좌석을 조회하는 API 와 1분 30회 Rate Limit 을 구현한다.

### 구현 범위
- `src/lib/ratelimit.ts` — `@upstash/ratelimit` + Upstash Redis
- `src/app/api/search/route.ts`:
  - zod: `{ name: string.trim().min(1), phone_last4: /^\d{4}$/ }`
  - Rate Limit (key = IP)
  - `prisma.attendee.findFirst({ where: { name, phoneLast4 } })`
  - 응답:
    - 200 `{ data: { name, seat, note, phoneLast4 } }`
    - 400 `{ error: { code: "INVALID_INPUT" } }`
    - 404 `{ error: { code: "NOT_FOUND" } }` (보안: 이름·전화 어느 쪽이 틀려도 동일)
    - 429 `{ error: { code: "RATE_LIMITED" } }`
- `.env`: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Out of Scope
- UI (S07)

### Playwright E2E (API 레벨, `request` 픽스처)
- `tests/e2e/s06-search-api.spec.ts`
  1. POST 시드 이름+전화 → 200, body.data.seat 존재
  2. POST `{ name: "신귀복" }` (전화 누락) → 400
  3. POST 시드 이름 + 잘못된 전화 → 404
  4. POST 31번 연속 → 마지막은 429
- 데이터 준비: 시드된 DB 사용

### 단계 완료 (DoD)
- [ ] 4가지 응답 분기 모두 동작
- [ ] E2E 4 시나리오 통과
- [ ] git commit `feat(s06): search api with rate limit (FR-G03, FR-G05)`
- [ ] 사용자 검토 OK

### 검토 가이드
- `curl -X POST http://localhost:3000/api/search -d '{"name":"신귀복","phone_last4":"0001"}'` 로 직접 호출
- 31회 연속 시 429 응답 확인

---

## S07 · 자리 찾기 UI

> 매핑 FR: FR-G03 (UI), AC-1~5

### 목표
자리 찾기 페이지에서 이름+전화를 입력해 본인 좌석을 카드로 표시한다.

### 구현 범위
- `src/app/(public)/search/page.tsx` 본격 구현 (스텁 교체)
- `src/components/public/SearchForm.tsx` (클라이언트, react-hook-form + zod)
  - 이름 input, 전화 4자리 input (`inputMode="numeric"`, `maxLength=4`, `pattern="\d{4}"`)
  - "자리 확인" 버튼
  - 빈 필드 시 "이름과 전화번호 뒷자리 4자리를 모두 입력해 주세요." 안내 (제출 차단)
- `src/components/public/SeatResultCard.tsx` (이름, 마스킹된 전화 `****-****-XXXX`, 좌석)
- `src/components/public/NoResult.tsx`
- `fetch('/api/search', ...)` — 결과에 따라 카드/오류 메시지 교체
- 검색 성공 시 `setTimeout` 으로 좌석맵 영역 `scrollIntoView` (S08 에서 본격)

### Out of Scope
- 좌석맵 이미지 (S08)

### Playwright E2E
- `tests/e2e/s07-search-ui.spec.ts`
  1. `/search` 진입 → 폼 노출
  2. 이름만 입력하고 제출 → 클라이언트 검증 메시지
  3. "신귀복" + "0001" 입력 → 결과 카드: "신귀복", "****-****-0001", "A-1"
  4. "신귀복" + "9999" 입력 → "일치하는 정보를 찾을 수 없습니다."
  5. 결과 카드 표시 후 입력 비우면 카드 사라짐

### 단계 완료 (DoD)
- [ ] 5가지 시나리오 E2E 통과
- [ ] 모바일 viewport 에서도 폼 정상 동작
- [ ] git commit `feat(s07): search ui with masked phone result (FR-G03)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 모바일에서 숫자 키패드가 자동으로 뜨는지 (`inputMode="numeric"`)
- 잘못된 입력 시 메시지 톤 적절한지

---

## S08 · 정적 좌석배치도

> 매핑 FR: FR-G04

### 목표
자리 찾기 페이지 하단에 운영자가 업로드한 좌석배치도 이미지를 표시한다 (라이트박스 포함).

### 구현 범위
- `src/components/public/SeatMapImage.tsx` (서버 컴포넌트로 `assets.seat_map` 조회)
- `next/image` 사용
- `yet-another-react-lightbox` 통합 (탭 시 풀스크린)
- 미업로드 상태일 때 "좌석배치도 준비 중" 플레이스홀더 + 가벼운 illustration
- alt: "어울림콘서트 좌석 배치도"
- `prisma/seed.ts` 에 더미 좌석맵 1장 시드 (테스트 자산: `tests/fixtures/seatmap.jpg` 를 Storage 에 업로드 + `assets.seat_map` upsert)

### Out of Scope
- 업로드 (S12)

### Playwright E2E
- `tests/e2e/s08-seatmap.spec.ts`
  1. `/search` 하단에 `<img alt="어울림콘서트 좌석 배치도">` 노출
  2. 이미지 탭 → 라이트박스 (overlay) 등장
  3. 라이트박스 닫기 → 원위치
  4. (옵션) `assets.seat_map` row 가 없을 때 플레이스홀더 텍스트 노출 — 별도 테스트 또는 fixture 토글

### 단계 완료 (DoD)
- [ ] 이미지·라이트박스 정상
- [ ] E2E 통과
- [ ] git commit `feat(s08): static seat map with lightbox (FR-G04)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 검색 성공 후 좌석맵 영역으로 자동 스크롤되는지
- 모바일 핀치줌이 라이트박스 안에서 작동하는지

---

## S09 · 브로셔 페이지

> 매핑 FR: FR-G06

### 목표
브로셔 8장 이미지를 세로 스크롤 + 페이지 번호 + 라이트박스로 표시한다.

### 구현 범위
- `src/app/(public)/brochure/page.tsx` 본격 구현
- `src/components/public/BrochureScroller.tsx` (서버 컴포넌트)
  - `assets.brochure_01..08` 조회
  - 8개 `next/image` 렌더 (첫 이미지 `priority`, 나머지 `loading="lazy"`)
  - 각 이미지 사이 ornament + "N / 8"
- 라이트박스 (S08 와 동일 라이브러리)
- 미업로드 시 "브로셔 준비 중" 안내
- `prisma/seed.ts` 에 더미 8장 시드

### Out of Scope
- 업로드 (S13)

### Playwright E2E
- `tests/e2e/s09-brochure.spec.ts`
  1. `/brochure` 진입 시 8개 `<img>` 가 순서대로 노출
  2. 첫 이미지는 `loading=eager` 또는 priority 처리
  3. 2번째 이후는 `loading="lazy"` 속성
  4. 페이지 번호 "1 / 8" ~ "8 / 8" 모두 노출
  5. 임의 이미지 탭 → 라이트박스 등장

### 단계 완료 (DoD)
- [ ] 8장 모두 정상 표시
- [ ] E2E 통과
- [ ] git commit `feat(s09): brochure page with 8 images and lightbox (FR-G06)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 스크롤 시 모바일 데이터 사용량이 점진적으로 증가하는지 (DevTools Network)
- 라이트박스 좌우 슬라이드/줌 동작

---

## S10 · 관리자 페이지 셸

> 매핑 FR: FR-A01

### 목표
`/admin` 단일 페이지 진입과 상단 상태 정보를 구현한다 (3 섹션은 placeholder).

### 구현 범위
- `src/app/admin/page.tsx`
  - 상단: 등록 게스트 수 (`prisma.attendee.count()`), 마지막 업로드 시간 (각각 csv/seatmap/brochure)
  - 3 섹션 placeholder (`<section>` + 제목만)
- `ADMIN_PATH_SUFFIX` env 지원: 비어 있으면 `/admin`, 채우면 `/admin-${suffix}` 로 redirect (`middleware.ts`)
- `public/robots.txt` 의 `/admin` disallow 확인 (S00 에서 추가됨)

### Out of Scope
- 인증 (PRD §3.1 — 없음)
- 실제 업로드 (S11–13)

### Playwright E2E
- `tests/e2e/s10-admin-shell.spec.ts`
  1. `/admin` 진입 → 200, "관리자 페이지" 텍스트
  2. 상단에 `현재 등록: \d+명` 노출 (시드 후 23 또는 그 이상)
  3. 3 섹션 placeholder 모두 노출
  4. `ADMIN_PATH_SUFFIX=h7k9x2` 설정 시 `/admin` 이 `/admin-h7k9x2` 로 redirect (선택 — 환경변수 분기 필요 시 별도 e2e 분리)

### 단계 완료 (DoD)
- [ ] 페이지 로드 + 통계 표시
- [ ] E2E 통과
- [ ] git commit `feat(s10): admin shell with stats (FR-A01)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 시드 후 등록 수가 23 인지
- 마지막 업로드 시간이 시드 시각과 비슷한지

---

## S11 · 관리자 CSV 업로드

> 매핑 FR: FR-A02 (전체 덮어쓰기 + 자동 백업)

### 목표
CSV 업로드로 `attendees` 를 전체 교체하고 직전 데이터를 자동 백업한다.

### 구현 범위
- `src/components/admin/AdminCsvSection.tsx`
  - Dropzone (5MB 제한, `.csv`)
  - 인코딩 자동 감지 (`jschardet` 또는 try UTF-8 → fallback EUC-KR)
  - Papaparse 파싱
  - zod row 검증: `{ name: string.min(1), phone_last4: /^\d{4}$/, seat: string.min(1), note: string.optional() }`
  - 미리보기 테이블 (상위 10행) + 검증 실패 행 인라인 표시
  - "기존 데이터가 모두 삭제됩니다" 확인 모달
- API `POST /api/admin/upload-csv` (multipart)
  - 트랜잭션 ①: 직전 `attendees` 전체 → CSV → Supabase Storage `backups/<ts>.csv` + `csv_backups` insert + 4번째 백업 시 가장 오래된 것 삭제
  - 트랜잭션 ②: `truncate attendees; insert valid rows;`
  - 응답 `{ inserted, invalid: [{ row, reason }] }`
- `revalidatePath('/search')`
- `src/lib/csv.ts` 헬퍼

### Out of Scope
- 좌석맵·브로셔 (S12, S13)

### Playwright E2E
- `tests/e2e/s11-csv-upload.spec.ts`
  1. `/admin` 진입 → CSV 섹션 노출
  2. `tests/fixtures/attendees-valid.csv` 업로드 → 미리보기 → 확인 → 토스트 "총 N건 등록 완료"
  3. `/search` 에서 새 CSV 의 첫 행 이름+전화로 검색 → 새 좌석 노출
  4. 두 번째 다른 CSV 업로드 → `csv_backups` 에 row 2개 (Storage 에 백업 파일 2개)
  5. `tests/fixtures/attendees-invalid.csv` (phone_last4 가 5자리) → 해당 행은 invalid 목록에 표시, 나머지는 등록
  6. 6MB 파일 업로드 → 거부 메시지

### 단계 완료 (DoD)
- [ ] 6 시나리오 E2E 통과
- [ ] git commit `feat(s11): admin csv upload with auto backup (FR-A02)`
- [ ] 사용자 검토 OK

### 검토 가이드
- Supabase Storage 의 `backups/` 디렉터리에 CSV 파일이 누적되는지
- 4번째 업로드 후 가장 오래된 백업이 자동 삭제되는지

---

## S12 · 관리자 좌석배치도 업로드

> 매핑 FR: FR-A03

### 목표
좌석배치도 이미지 1장을 업로드하여 즉시 `/search` 에 반영한다.

### 구현 범위
- `src/components/admin/AdminSeatMapSection.tsx`
  - Dropzone (5MB, JPG/PNG)
  - 현재 이미지 미리보기 (assets.seat_map)
- API `POST /api/admin/upload-seatmap` (multipart)
  - `sharp` 로 1600px 리사이즈 + JPG 80%
  - Supabase Storage `images/seatmap.jpg` upload (overwrite)
  - `assets.seat_map` UPSERT
- `revalidatePath('/search')`
- `src/lib/image.ts`, `src/lib/storage.ts`

### Out of Scope
- 브로셔 (S13)

### Playwright E2E
- `tests/e2e/s12-seatmap-upload.spec.ts`
  1. `/admin` → 좌석맵 섹션 dropzone
  2. `tests/fixtures/seatmap-new.jpg` 업로드 → 미리보기 갱신
  3. `/search` 진입 → 좌석맵 이미지의 src 가 새 URL 로 변경 (또는 `updated_at` 쿼리 파라미터 변경 확인)
  4. 6MB 파일 → 거부

### 단계 완료 (DoD)
- [ ] 4 시나리오 통과
- [ ] git commit `feat(s12): admin seat map upload with sharp optimization (FR-A03)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 업로드된 이미지의 가로가 1600px 이하인지 (`file` 명령어 또는 metadata)
- 기존 이미지가 즉시 교체되는지 (브라우저 캐시 우회)

---

## S13 · 관리자 브로셔 업로드

> 매핑 FR: FR-A04

### 목표
브로셔 이미지 8장을 일괄 업로드하거나 슬롯별 개별 교체한다.

### 구현 범위
- `src/components/admin/AdminBrochureSection.tsx`
  - 8 슬롯 그리드 (현재 `assets.brochure_01..08` 미리보기)
  - "8장 일괄 선택" — `<input type="file" multiple>` (최대 8장 검증)
  - 파일명 오름차순 자동 정렬
  - 위/아래 화살표로 순서 변경 (드래그는 P1)
  - 슬롯 클릭 → 단일 파일 교체
  - "업로드" 버튼
- API `POST /api/admin/upload-brochure` (multipart)
  - 입력: `files[]` + `slots[]` (인덱스 매핑)
  - 각 파일 `sharp` 최적화
  - Storage `images/brochure-NN.jpg`
  - `assets.brochure_NN` UPSERT (해당 슬롯만)
- `revalidatePath('/brochure')`

### Out of Scope
- 드래그-드롭 순서 변경 (P1, 향후)

### Playwright E2E
- `tests/e2e/s13-brochure-upload.spec.ts`
  1. `/admin` → 브로셔 섹션 8 슬롯
  2. 8장 일괄 업로드 (`tests/fixtures/brochure-01..08.jpg`) → 8 슬롯에 미리보기 채워짐
  3. `/brochure` 진입 → 8장 모두 새 이미지로 표시
  4. 슬롯 3 만 다른 이미지로 교체 → `/brochure` 의 3번째만 변경, 나머지는 동일
  5. 9장 업로드 시도 → 거부

### 단계 완료 (DoD)
- [ ] 5 시나리오 통과
- [ ] git commit `feat(s13): admin brochure bulk and per-slot upload (FR-A04)`
- [ ] 사용자 검토 OK

### 검토 가이드
- 슬롯별 미리보기가 즉시 갱신되는지
- 일괄 업로드 후 파일명 순서가 페이지 1~8과 일치하는지

---

## S14 · 최종 QA (게이트)

> 매핑 NFR 전체

### 목표
PRD §9 체크리스트를 전수 점검하고 행사 디데이 직전 상태로 확정한다.

### 구현 범위
- 모바일 viewport (320 / 375 / 768) Playwright 매트릭스 테스트
- Lighthouse CI: LCP ≤ 2.5s, a11y ≥ 90, best-practices ≥ 90
- `app/opengraph-image.tsx` 동적 OG 이미지 (행사명 + 일시)
- `app/sitemap.ts` (`/admin` 제외)
- 카카오톡 인앱 브라우저에서 영상·라이트박스 동작 점검 (실기기 또는 가능한 emulator)
- 행사 리허설 시뮬레이션:
  - 운영자 흐름: 실제 명단(혹은 더미 100건) CSV 업로드 → 좌석맵·브로셔 업로드
  - 관객 흐름: 100명 동시 접속 (k6 또는 Playwright 병렬 워커)

### Playwright E2E
- `tests/e2e/s14-qa.spec.ts`
  - 전체 사용자 여정: 홈 → 영상 재생 → 자리 찾기 (성공/실패 모두) → 좌석맵 라이트박스 → 브로셔 8장 → 메인 복귀
  - viewport 매트릭스: iPhone SE / iPhone 13 / iPad
- Lighthouse: `pnpm lhci autorun`

### 단계 완료 (DoD)
- [ ] PRD §9 체크리스트 전 항목 ✓
- [ ] Lighthouse 임계 통과
- [ ] OG 이미지 카카오톡 미리보기 정상
- [ ] 부하 테스트 100 동접 통과
- [ ] git commit `chore(s14): final QA, OG, lighthouse pass`
- [ ] 사용자 최종 승인 → 행사 운영 모드 진입

### 검토 가이드
- 카카오톡으로 본인에게 링크 전송 → 미리보기·인앱 브라우저에서 영상·검색·브로셔 모두 정상 확인
- 행사장 Wi-Fi 또는 LTE 환경에서 첫 로딩 시간 측정

---

## 부록 · Playwright 환경 표준

```ts
// playwright.config.ts (요지)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "mobile-chromium", use: { ...devices["iPhone 13"] } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

```jsonc
// package.json scripts (요지)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset --force"
  }
}
```

## 부록 · 픽스처 디렉터리 (S08~S13 사용)

```
tests/
├─ e2e/
│  ├─ s00-smoke.spec.ts
│  ├─ s01-design-tokens.spec.ts
│  └─ ...
└─ fixtures/
   ├─ attendees-valid.csv      (10행, phone_last4 정상)
   ├─ attendees-invalid.csv    (1행은 phone_last4 5자리)
   ├─ seatmap-new.jpg          (가로 2000px 테스트용)
   └─ brochure-01.jpg ~ brochure-08.jpg
```

## 부록 · 단계 완료 보고 형식

각 단계가 끝나면 다음 형식으로 사용자에게 보고한다:

```
✅ S## · <제목> 완료

구현
- 파일 N 추가/수정
- 핵심 컴포넌트/API: ...

E2E
- ✓ 시나리오 1
- ✓ 시나리오 2
- ...

검토 요청
- URL: http://localhost:3000/...
- 동작 확인 포인트: ...
- 다음 단계 (S##) 로 진행해도 될까요?
```
