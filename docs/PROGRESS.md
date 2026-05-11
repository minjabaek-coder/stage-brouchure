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
| S03 | 초대 영상 인라인 재생 | ⏳ 대기 | — | — |
| S04 | 홈 메뉴 카드 + 라우트 스텁 | ⏳ 대기 | — | — |
| S05 | DB 스키마 + 시드 | ⏳ 대기 | — | — |
| S06 | 검색 API + Rate Limit | ⏳ 대기 | — | — |
| S07 | 자리 찾기 UI | ⏳ 대기 | — | — |
| S08 | 정적 좌석배치도 | ⏳ 대기 | — | — |
| S09 | 브로셔 페이지 (8장) | ⏳ 대기 | — | — |
| S10 | 관리자 페이지 셸 | ⏳ 대기 | — | — |
| S11 | 관리자 CSV 업로드 | ⏳ 대기 | — | — |
| S12 | 관리자 좌석배치도 업로드 | ⏳ 대기 | — | — |
| S13 | 관리자 브로셔 8장 업로드 | ⏳ 대기 | — | — |
| S14 | 최종 QA (게이트) | ⏳ 대기 | — | — |

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
- [ ] 구현 (`InvitationVideo` 썸네일↔iframe)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s03`
- [ ] `git commit feat(s03): inline youtube video player (FR-G02)`
- [ ] 사용자 검토 OK

### S04 · 홈 메뉴 카드 + 라우트 스텁
- [ ] 구현 (`MenuCardList`, `MenuCard`, `/search`·`/brochure` 스텁, `PageHeader`)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s04`
- [ ] `git commit feat(s04): add home menu cards and route stubs (FR-G07)`
- [ ] 사용자 검토 OK

### S05 · DB 스키마 + 시드
- [ ] 로컬 PostgreSQL 설치 + `eoullim_dev`/`eoullim_test` 생성
- [ ] 구현 (Prisma schema, `prisma/seed.ts` 23명 + `assets.video_youtube_id`, `src/lib/db.ts`)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s05`
- [ ] `git commit feat(s05): prisma schema and seed for attendees/assets`
- [ ] 사용자 검토 OK

### S06 · 검색 API + Rate Limit
- [ ] 구현 (`/api/search` zod + Upstash ratelimit)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s06`
- [ ] `git commit feat(s06): search api with rate limit (FR-G03, FR-G05)`
- [ ] 사용자 검토 OK

### S07 · 자리 찾기 UI
- [ ] 구현 (`SearchForm`, `SeatResultCard`, `NoResult`)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s07`
- [ ] `git commit feat(s07): search ui with masked phone result (FR-G03)`
- [ ] 사용자 검토 OK

### S08 · 정적 좌석배치도
- [ ] 구현 (`SeatMapImage` + 라이트박스, 더미 시드)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s08`
- [ ] `git commit feat(s08): static seat map with lightbox (FR-G04)`
- [ ] 사용자 검토 OK

### S09 · 브로셔 페이지
- [ ] 구현 (`BrochureScroller` 8장 + 페이지번호 + 라이트박스)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s09`
- [ ] `git commit feat(s09): brochure page with 8 images and lightbox (FR-G06)`
- [ ] 사용자 검토 OK

### S10 · 관리자 페이지 셸
- [ ] 구현 (`/admin` + `AdminStatusBar`, `ADMIN_PATH_SUFFIX` 미들웨어)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s10`
- [ ] `git commit feat(s10): admin shell with stats (FR-A01)`
- [ ] 사용자 검토 OK

### S11 · 관리자 CSV 업로드
- [ ] 구현 (Dropzone, Papaparse, zod 검증, 자동 백업, `csv_backups` 4개 보존)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s11`
- [ ] `git commit feat(s11): admin csv upload with auto backup (FR-A02)`
- [ ] 사용자 검토 OK

### S12 · 관리자 좌석배치도 업로드
- [ ] 구현 (sharp 1600px 리사이즈 + Storage upsert)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s12`
- [ ] `git commit feat(s12): admin seat map upload with sharp optimization (FR-A03)`
- [ ] 사용자 검토 OK

### S13 · 관리자 브로셔 업로드
- [ ] 구현 (8 슬롯 그리드, 일괄/개별 업로드, 위/아래 정렬)
- [ ] typecheck/lint
- [ ] `pnpm test:e2e -- s13`
- [ ] `git commit feat(s13): admin brochure bulk and per-slot upload (FR-A04)`
- [ ] 사용자 검토 OK

### S14 · 최종 QA (게이트)
- [ ] PRD §9 체크리스트 전 항목
- [ ] Lighthouse: LCP ≤ 2.5s, a11y ≥ 90, best-practices ≥ 90
- [ ] OG 이미지 + sitemap.ts
- [ ] 카카오톡 인앱 브라우저 점검
- [ ] 부하 테스트 100 동접
- [ ] `git commit chore(s14): final QA, OG, lighthouse pass`
- [ ] 사용자 최종 승인

---

## 변경 이력

| 날짜 | 단계 | 메모 |
|------|------|------|
| 2026-05-11 | S00 | 부트스트랩 완료, dev/test 포트 3000 으로 통일 (`fdf9452`) |
| 2026-05-11 | S01 | 진입 — Tailwind v4 `@theme` 채택 (07/06 문서의 v3 `tailwind.config.ts` 와 다름) |
| 2026-05-11 | S01 | 게이트 통과 (`741527e`) — `tests/screenshots/` 는 .gitignore 에 추가, visual.spec 은 커밋 |
| 2026-05-11 | S02 | 게이트 통과 (`0a25fd5`) — Ornament/Flourish/MetaDivider/EventMeta/HomeHeader/HomeFooter + EVENT 상수 |
