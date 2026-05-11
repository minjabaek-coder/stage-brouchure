# 구현 진행 현황 (Progress Tracker)

> 본 문서는 [`07-implementation-plan.md`](./07-implementation-plan.md) 의 **S00–S14 단계 진행 상황**을 한눈에 보여주는 체크리스트다. 단계 게이트(구현 → typecheck/lint → e2e → commit → 사용자 검토 OK)를 모두 통과하면 ✅ 로 표시한다.
>
> 갱신 책임: Claude Code 가 각 단계 완료/시작 시점에 본 문서의 해당 칸을 업데이트한다. 사용자 검토는 사람이 체크.

## 전체 요약

| 단계 | 제목 | 상태 | Commit | 검토 |
|------|------|------|--------|------|
| S00 | 프로젝트 부트스트랩 | ✅ | `0df9b92`, `fdf9452` | ✅ |
| S01 | 디자인 토큰 + 글로벌 레이아웃 | 🔍 검토 대기 | `741527e` | — |
| S02 | 홈 헤더 + 푸터 | 🔍 검토 대기 | `0a25fd5` | — |
| S03 | 초대 영상 인라인 재생 | 🔍 검토 대기 | `8eb931b` | — |
| S04 | 홈 메뉴 카드 + 라우트 스텁 | 🔍 검토 대기 | `fab68da` | — |
| S05 | DB 스키마 + 시드 | 🔍 검토 대기 | `1fa32f4` | — |
| S06 | 검색 API + Rate Limit | 🔍 검토 대기 | `65157ed` | — |
| S07 | 자리 찾기 UI | 🔍 검토 대기 | `e36f86e` | — |
| S08 | 정적 좌석배치도 | 🔍 검토 대기 | `8aad65c` | — |
| S09 | 브로셔 페이지 (8장) | 🔍 검토 대기 | `a1d1c28` | — |
| S10 | 관리자 페이지 셸 | 🔍 검토 대기 | `dec736d` | — |
| S11 | 관리자 CSV 업로드 | 🔍 검토 대기 | `5dfdf43` | — |
| S12 | 관리자 좌석배치도 업로드 | 🔍 검토 대기 | `3f3df0f` | — |
| S13 | 관리자 브로셔 8장 업로드 | ✅ | `63a539d` | ✅ |
| S14 | 최종 QA (게이트) | 🔍 자동화 전부 통과 (카톡 수동 잔여) | `97d0d26` + 후속 | — |

상태 기호: ⏳ 대기 / 🚧 진행 중 / 🔍 검토 대기 / ✅ 완료 / ⚠️ 차단

---

## 단계별 게이트 체크리스트

각 단계는 5개 게이트를 모두 통과해야 ✅ 처리한다.

### S00 · 프로젝트 부트스트랩
- [x] 구현 (Next.js 16 + TS strict + Tailwind 4 + Playwright 매트릭스)
- [x] `pnpm typecheck` `pnpm lint`
- [x] `pnpm test:e2e -- s00`
- [x] `git commit feat(s00): bootstrap nextjs project with playwright`
- [x] 사용자 검토 OK

### S01 · 디자인 토큰 + 글로벌 레이아웃
- [x] 구현 (Tailwind v4 `@theme` 토큰, next/font 두 패밀리, BackgroundLayer + Stage, viewport)
- [x] typecheck/lint
- [x] `pnpm test:e2e -- s01` (10/10 + 회귀 0)
- [x] `git commit 741527e feat(s01): apply design tokens and global layout`
- [ ] 사용자 검토 OK

### S02 · 홈 헤더 + 푸터
- [x] 구현 (`HomeHeader`, `HomeFooter`, `EventMeta`, `Ornament`, `Flourish`, `MetaDivider`, `src/lib/event.ts`)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (28/28, 회귀 0)
- [x] `git commit 0a25fd5 feat(s02): add home header and footer (FR-G01)`
- [ ] 사용자 검토 OK

### S03 · 초대 영상 인라인 재생
- [x] 구현 (`InvitationVideo` 썸네일↔iframe, maxres→hq 폴백, `EVENT.videoYoutubeId` 추가)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (36/36, 회귀 0)
- [x] `git commit 8eb931b feat(s03): inline youtube video player (FR-G02)`
- [ ] 사용자 검토 OK

### S04 · 홈 메뉴 카드 + 라우트 스텁
- [x] 구현 (`MenuCard` + `MenuCardList`, `CornerMarker`, `BackButton`, `PageHeader`, `(public)` 라우트 그룹 + `/search` `/brochure` 스텁)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (46/46, 회귀 0)
- [x] `git commit fab68da feat(s04): add home menu cards and route stubs (FR-G07)`
- [ ] 사용자 검토 OK

### S05 · DB 스키마 + 시드
- [x] 로컬 PostgreSQL 16 (이미 brew 로 설치·기동 중) + `eoullim_dev`/`eoullim_test` 생성 (owner = `kai`)
- [x] 구현 (Prisma 6 schema, `prisma/seed.ts` 22명 + `assets.video_youtube_id`, `src/lib/db.ts`, `/api/dev/seed-check`)
- [x] Playwright `tests/global-setup.ts` 가 매 실행 전 test DB reset+seed (사용자 명시 동의)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (48/48, 회귀 0)
- [x] `git commit 1fa32f4 feat(s05): prisma schema and seed for attendees/assets` + push
- [ ] 사용자 검토 OK

### S06 · 검색 API + Rate Limit
- [x] 구현 (`/api/search` POST + zod, `lib/ratelimit.ts` Upstash + in-memory fallback)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (60/60, 회귀 0)
- [x] `git commit 65157ed feat(s06): search api with rate limit (FR-G03, FR-G05)` + push
- [ ] 사용자 검토 OK

### S07 · 자리 찾기 UI
- [x] 구현 (`SearchForm` native useState, `SeatResultCard` 전화 마스킹, `NoResultCard` 고정 메시지)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (72/72, 회귀 0)
- [x] `git commit e36f86e feat(s07): search ui with masked phone result (FR-G03)` + push
- [ ] 사용자 검토 OK

### S08 · 정적 좌석배치도
- [x] 구현 (`SeatMapImage` 서버, `SeatMapLightbox` 클라이언트, `public/seatmap-placeholder.svg`, seed `assets.seat_map`)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (80/80, 회귀 0)
- [x] `git commit 8aad65c feat(s08): static seat map with lightbox (FR-G04)` + push
- [ ] 사용자 검토 OK

### S09 · 브로셔 페이지
- [x] 구현 (`BrochureScroller` 서버 + `BrochureGallery` 클라이언트, 8장 시안 SVG + seed)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (90/90, 회귀 0)
- [x] `git commit a1d1c28 feat(s09): brochure page with 8 images and lightbox (FR-G06)` + push
- [ ] 사용자 검토 OK

### S10 · 관리자 페이지 셸
- [x] 구현 (`/admin` Stage + AdminStatusBar + 3 AdminSection placeholder, `middleware.ts` ADMIN_PATH_SUFFIX rewrite/404)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (100/100 — 마일스톤! 회귀 0)
- [x] `git commit dec736d feat(s10): admin shell with stats (FR-A01)` + push
- [ ] 사용자 검토 OK

### S11 · 관리자 CSV 업로드
- [x] 구현 (Dropzone, ConfirmDialog, CsvPreviewTable, AdminCsvSection, `lib/csv.ts` UTF-8/EUC-KR + zod, `lib/storage.ts` 로컬 fs 어댑터, `/api/admin/upload-csv` 라우트, csv_backups 3개 보존, sonner 토스트)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (106/106, S11 mobile 6 skip — admin 데스크톱 전용 + DB race 회피)
- [x] `git commit 5dfdf43 feat(s11): admin csv upload with auto backup (FR-A02)` + push
- [ ] 사용자 검토 OK

### S12 · 관리자 좌석배치도 업로드
- [x] 구현 (`lib/image.ts` sharp 1600px+JPEG80, `lib/storage.ts` saveImageAsset (public/uploads/), AdminSeatMapSection, `/api/admin/upload-seatmap`, next.config localPatterns, lib/limits.ts 분리)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (110/110, admin mobile 10 skip, workers=1 직렬화)
- [x] `git commit 3f3df0f feat(s12): admin seat map upload with sharp optimization (FR-A03)` + push
- [ ] 사용자 검토 OK

### S13 · 관리자 브로셔 업로드
- [x] 구현 (`AdminBrochureSection` + `BrochureSlotGrid` 4×2 그리드, 일괄 업로드 input multiple, 슬롯별 교체 input, `/api/admin/upload-brochure` POST + sharp 최적화 + per-slot upsert, S10 spec 회귀 fix)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (114/114, S13 mobile 4 skip — admin 데스크톱 전용)
- [x] `git commit 63a539d feat(s13): admin brochure bulk and per-slot upload (FR-A04)`
- [x] 사용자 검토 OK

### S14 · 최종 QA (게이트) — 자동화 전부 통과
- [x] OG 이미지 + sitemap.ts (`app/opengraph-image.tsx` edge runtime, `app/sitemap.ts`, robots.txt 에 Sitemap 라인 추가, layout.tsx 의 metadataBase + openGraph)
- [x] 전체 사용자 여정 + viewport 매트릭스 e2e (`tests/e2e/s14-qa.spec.ts`: 홈→영상→검색(성공/실패)→좌석맵 라이트박스→브로셔 8장→복귀, 320/375(iPhone 13)/768(iPad) 가로 스크롤 0)
- [x] PRD §9 체크리스트 자동화 가능 항목 (영상·검색·좌석맵·브로셔·rate limit·CSV·이미지 사이즈 제한)
- [x] typecheck/lint
- [x] `pnpm test:e2e` (130/130, 14 skip)
- [x] **Lighthouse CI** (`@lhci/cli`, `lighthouserc.json`, `pnpm lhci`) — 전 페이지 a11y 100 / perf 96–97 / best-practices 100 / **LCP 1.1–1.3s** (임계 2.5s). a11y fix 3건: ① EventMeta `<dl>` 의 `display:contents` 제거 (axe canonical `dl > div > dt+dd`), ② layout viewport `user-scalable=no` 제거 + maximumScale 5 (WCAG 1.4.4), ③ InvitationVideo button aria-label 가 visible text 포함하도록 수정 (S01 spec 도 viewport 검증 갱신)
- [x] **부하 테스트 100 동접** (`scripts/load-search.ts`, `pnpm load:search`) — 100 동시 POST `/api/search`, distinct X-Forwarded-For 로 rate limit 우회. 결과: 894 req/s, ok 100%, p50 69ms / **p95 93ms** / max 94ms
- [ ] 카카오톡 인앱 브라우저 점검 _(수동 — 실기기 필요. 체크리스트는 아래 참조)_
- [ ] `git commit chore(s14): final QA, OG, lighthouse pass`
- [ ] 사용자 최종 승인 → 행사 운영 모드 진입

#### 카카오톡 인앱 브라우저 수동 체크리스트 (실기기 필요)
1. 카카오톡 → "나에게 보내기" 로 배포 URL 전송
2. 미리보기에 OG 이미지(어울림 콘서트 / 일시·장소) 가 노출되는지
3. 링크 탭 → 인앱 브라우저에서 페이지가 정상 렌더되는지
4. 홈에서 영상 썸네일 탭 → 인앱 브라우저 안에서 인라인 재생되는지 (외부 YouTube 앱으로 빠지지 않는지)
5. 자리 찾기 → 좌석맵 이미지 탭 시 라이트박스가 풀스크린으로 동작
6. 브로셔 8장 스크롤 시 이미지가 끊김 없이 lazy load 되는지
7. iOS / Android 양쪽에서 ②~⑥ 동일 확인

---

## 변경 이력

| 날짜 | 단계 | 메모 |
|------|------|------|
| 2026-05-11 | S00 | 부트스트랩 완료, dev/test 포트 3000 으로 통일 (`fdf9452`) |
| 2026-05-11 | S01 | 진입 — Tailwind v4 `@theme` 채택 (07/06 문서의 v3 `tailwind.config.ts` 와 다름) |
| 2026-05-11 | S01 | 게이트 통과 (`741527e`) — `tests/screenshots/` 는 .gitignore 에 추가, visual.spec 은 커밋 |
| 2026-05-11 | S02 | 게이트 통과 (`0a25fd5`) — Ornament/Flourish/MetaDivider/EventMeta/HomeHeader/HomeFooter + EVENT 상수 |
| 2026-05-11 | S03 | 게이트 통과 (`8eb931b`) — InvitationVideo (썸네일 ↔ iframe), EVENT.videoYoutubeId 추가 |
| 2026-05-11 | S04 | 게이트 통과 (`fab68da`) — MenuCard/List + CornerMarker + BackButton + PageHeader, (public) 라우트 그룹, /search /brochure 스텁 |
| 2026-05-11 | S05 | DB 진입 — Prisma 6 (Prisma 7 의 prisma.config.ts 패턴은 행사 스코프 대비 과함), 로컬 superuser 그대로 사용, 시드 22명 (HTML 진실 기준 — docs 의 23 표기 정정), API 경로 `dev/seed-check` (Next.js `_` private 폴더 회피) |
| 2026-05-11 | S06 | 게이트 통과 (`65157ed`) — `/api/search` + zod, ratelimit (Upstash 연결 시 자동 사용 + in-memory fallback). 테스트는 project name 으로 IP 격리 |
| 2026-05-11 | S07 | 게이트 통과 (`e36f86e`) — SearchForm/SeatResultCard/NoResultCard. RHF 미채택 (2-필드라 native), maxLength 대신 onChange 에서 digit-strip+slice |
| 2026-05-11 | S08 | 게이트 통과 (`8aad65c`) — SeatMapImage(server) + SeatMapLightbox(client) + 시안 SVG. yet-another-react-lightbox 채택 |
| 2026-05-11 | S09 | 게이트 통과 (`a1d1c28`) — BrochureScroller/Gallery + 시안 8장 SVG. 첫장 priority+eager / 2~8장 lazy, 라이트박스 prev/next 활성 |
| 2026-05-11 | S09 | dev DB hotfix — 사용자 보고로 dev DB 에 brochure/seatmap asset 누락 확인 → `pnpm db:seed` 재실행. 향후 seed 변경 시 dev DB 도 같이 재시드 필요 (`pnpm db:seed`); test DB 는 global-setup 에서 자동 |
| 2026-05-11 | S10 | 게이트 통과 (`dec736d`) — /admin 셸 + AdminSection·AdminStatusBar + middleware ADMIN_PATH_SUFFIX. 100/100 마일스톤 |
| 2026-05-11 | S11 | 게이트 통과 (`5dfdf43`) — AdminCsvSection (Dropzone + CsvPreviewTable + ConfirmDialog), `/api/admin/upload-csv`, 로컬 fs backup adapter (Supabase 전환은 추후). admin 테스트는 desktop-only + serial |
| 2026-05-11 | S12 | 게이트 통과 (`3f3df0f`) — AdminSeatMapSection + sharp 최적화 + public/uploads/. lib/limits.ts 분리(클라 번들에서 sharp 분리), playwright workers=1 (admin DB race 방지) |
| 2026-05-11 | S13 | 게이트 통과 — AdminBrochureSection + BrochureSlotGrid 4×2, 일괄(파일명 정렬→슬롯 1..N) + 슬롯별 교체, `/api/admin/upload-brochure` per-slot upsert. S10 spec 의 "준비 중 (S13)" placeholder 검증 → 실제 마운트(슬롯 그리드/일괄 트리거) 검증으로 회귀 fix |
| 2026-05-11 | S14 | 자동화 1차 — OG image (edge ImageResponse) + sitemap.ts + robots Sitemap 라인 + s14-qa.spec.ts (풀저니/실패 메시지 동일성/iPhone SE·13·iPad viewport). S11 이 attendees 를 갈아엎으므로 s14 검색 시나리오는 beforeAll 에서 신귀복/0001/A-1 직접 upsert (PrismaClient 직접 사용; schema 에 (name, phoneLast4) unique 없어 findFirst+update/create) |
| 2026-05-11 | S14 | Lighthouse CI 통과 — a11y 86→100 위해 EventMeta dl 구조 정리 (display:contents 제거 + Fragment), layout viewport user-scalable 완화 (maximumScale 5), InvitationVideo aria-label 보강. perf 96/97, LCP 1.1–1.3s, best-practices 100. S01 spec 의 viewport 검증도 동기화 갱신 |
| 2026-05-11 | S14 | 부하 시뮬 통과 — `scripts/load-search.ts` (100 동시 POST `/api/search`, distinct X-Forwarded-For 로 rate-limit 우회). prod build 기준 894 req/s, p95 93ms, ok 100%. PRD 임계 미정시라 합리 기준(ok≥95%, p95<2s) 채택 |
