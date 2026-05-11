# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 상태

이 저장소는 **(사)한국예술가곡총연합회 어울림콘서트(2026.5.26) 웹앱**의 사양·구현 계획 단계이며, **아직 애플리케이션 코드는 존재하지 않는다**. `docs/` 에 기획·기능 명세·구현 계획 9개 마크다운만 있다. 첫 코드 작업은 `docs/07-implementation-plan.md` 의 **S00 (프로젝트 부트스트랩)** 부터 시작한다.

문서 구조 진입점: [`docs/README.md`](./docs/README.md)

## SSOT (Single Source of Truth) — 매우 중요

[`docs/00-prd.md`](./docs/00-prd.md) (PRD v1.1) 가 **모든 결정의 단일 진실 공급원**이다. 다른 docs/ 문서 또는 코드와 충돌이 발생하면 **PRD 가 우선**한다. 사양 변경 요청을 받으면:
1. PRD 를 먼저 갱신
2. `docs/01–07` 의존 문서를 동기화
3. 코드를 갱신

이 순서를 어기면 문서·코드가 어긋난다. 과거에 PRD v1.0 → v1.1 갱신 시 v1.0 의 다수 기능(관리자 로그인, QR 토큰, 프로그램/출연단체/후원 CRUD, SVG 좌석맵 편집기 등)이 **완전 삭제**된 사례가 있으므로, "기존 docs 에 있다" 가 아니라 "현재 PRD 에 있다" 를 기준으로 판단할 것.

## 구현 방식 — 단계 게이트

[`docs/07-implementation-plan.md`](./docs/07-implementation-plan.md) 의 **S00–S14 (총 14 단계 + 최종 QA 게이트)** 를 순서대로 진행한다. 각 단계는 다음 게이트를 모두 통과해야 다음 단계로 넘어갈 수 있다:

1. 구현 완료 (해당 단계의 단일 기능만)
2. `pnpm typecheck` `pnpm lint` 통과
3. `pnpm test:e2e -- s##` (Playwright) 통과
4. `git commit` (메시지 컨벤션: `feat(s##): <짧은 설명>`)
5. **사용자 수동 검토 OK**

여러 단계를 한꺼번에 진행하지 말 것. 한 단계의 게이트가 끝나면 사용자에게 다음 보고 형식으로 검토를 요청한다 (07-implementation-plan.md 부록 참조):

```
✅ S## · <제목> 완료
구현: ...
E2E: ✓ 시나리오 ...
검토 요청: URL, 동작 확인 포인트, 다음 단계 진행 여부
```

## 기술 스택 (PRD §4.1 의 Option B 채택)

- Next.js 15+ (App Router, RSC) · React 19 · TypeScript strict
- Tailwind CSS 4 + shadcn/ui · 폰트는 `next/font` 의 Noto Serif KR + Cormorant Garamond
- PostgreSQL: **로컬 dev/test 는 Homebrew 로 설치한 로컬 인스턴스**, 프로덕션은 Supabase. 두 DB 모두 동일 Prisma 스키마. 인증 없음 (관리자도 로그인 없음, PRD §3.1)
- 검색 Rate Limit: `@upstash/ratelimit` + Upstash Redis (1분 30회)
- 이미지 최적화: `sharp` (1600px 리사이즈 + JPG 80%)
- CSV: Papaparse (UTF-8/EUC-KR 자동 감지)
- E2E: Playwright (mobile chromium iPhone 13 + desktop chromium)
- 패키지 매니저: **pnpm**
- 배포: Vercel + Supabase Storage

상세는 [`docs/06-tech-stack.md`](./docs/06-tech-stack.md). 의도적으로 채택하지 않은 라이브러리(Auth.js, @dnd-kit, qrcode, react-pdf 등)도 명시되어 있으니 신규 의존성 추가 전 확인할 것.

## 도메인 핵심

| 항목 | 값 |
|------|-----|
| 행사일 | 2026-05-26 19:30 |
| 장소 | 송파문화예술회관 |
| 예상 관객 | 500–700명 (단발성 행사 1회) |
| 운영자 | 1인 |
| 초청 영상 | YouTube `0aT4IdHXZW8` |

기능은 단 4개 라우트로 압축된다:
- `/` — 메인 (헤더 + 영상 + 메뉴 2개)
- `/search` — 자리 찾기 (이름 + 전화 뒷4자리 **AND 일치** + 정적 좌석맵 이미지)
- `/brochure` — 브로셔 8장 세로 스크롤
- `/admin` — 단일 페이지 3 섹션 (CSV / 좌석맵 / 브로셔 8장 업로드, **인증 없음**)

데이터는 단 2(+1) 테이블: `attendees`, `assets`, `csv_backups` (선택). 단일 행사 전제이므로 `Event` 같은 멀티테넌트 엔터티는 만들지 않는다. 행사 상수는 `src/lib/event.ts` 에 하드코딩한다.

## 보안·개인정보 원칙

- 전화번호는 **뒷 4자리만** 저장 (`phone_last4 char(4)`). 전체 번호 컬럼·로그를 만들지 말 것 (NFR-09)
- 검색 실패 사유는 **항상 동일 메시지** ("일치하는 정보를 찾을 수 없습니다") — 이름·전화 어느 쪽이 틀렸는지 노출하지 않음 (PRD §2.2.5)
- `/admin` 은 인증 없음. 보호는 ① `robots.txt` disallow ② 추측 어려운 URL (`ADMIN_PATH_SUFFIX` env) ③ 운영자만 URL 보관, 세 가지 layer 만으로 처리
- IP 주소는 저장하지 않는다 (Rate Limit 키로만 사용)

## 자주 사용하게 될 명령어 (S00 이후)

`package.json` 은 S00 단계에서 생성된다. 그 이후 다음 명령이 표준이 된다 (`docs/07-implementation-plan.md` 부록 참조):

```bash
# 사전 준비: 로컬 PostgreSQL (Homebrew)
brew install postgresql@16 && brew services start postgresql@16
psql -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
createdb -O postgres eoullim_dev && createdb -O postgres eoullim_test

# 일상 개발
pnpm install
pnpm dev                       # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test:e2e                  # 전체 Playwright (eoullim_test DB 사용)
pnpm test:e2e -- s07           # 특정 단계만 (파일명 매칭)
pnpm prisma migrate dev
pnpm db:seed
pnpm db:reset                  # migrate reset --force
```

DB 분리: `eoullim_dev` 는 `pnpm dev` 용, `eoullim_test` 는 Playwright 가 사용. `playwright.config.ts` 의 `webServer.env.DATABASE_URL` 에서 후자를 주입한다.

## 디자인 토큰 (Tailwind theme 으로 이식)

원본 HTML (`docs/assets/reference-original.html` lines 11-22) 의 색상 변수를 Tailwind 색상 토큰으로 옮긴다:

- `ink #0a0a0c` — 배경
- `paper #f4ede0` — 본문/종이
- `gold #c5a572`, `goldHi #e8d4a8` — 액센트
- `burgundy #5c1a1b`, `burgundyDeep #3d0e0f` — 와인색
- `inkSoft #1a1612`

폰트: 한글 Noto Serif KR, 영문 Cormorant Garamond. `letterSpacing: { wider2: '0.18em' }` 등 추가 토큰은 `docs/06-tech-stack.md` §3 참조.

## 디자인 시스템 — UI 컴포넌트 재사용 규칙

**모든 UI 는 재사용 가능한 디자인 시스템 위에서 조립한다.** 신규 UI 가 필요할 때는 반드시 다음 순서를 따른다:

1. **기존 컴포넌트 탐색 먼저** — 새 컴포넌트를 만들기 전에 항상 grep 으로 확인:
   ```bash
   # 1순위: 범용 프리미티브 (Button, Card, Input, Dialog, Tabs, Toast 등)
   ls src/components/ui/ 2>/dev/null
   grep -r "export" src/components/ui/ 2>/dev/null

   # 2순위: 도메인 합성 컴포넌트 (HomeHeader, MenuCard, SeatResultCard 등)
   ls src/components/public/ src/components/admin/ 2>/dev/null
   ```

2. **기존 컴포넌트로 해결되면 그것만 사용**. 비슷한 것을 새로 만들거나 복사·수정하지 말 것

3. **기존 컴포넌트가 약간만 다르다면 prop 으로 확장** — 새 prop 추가, variant 추가, 또는 합성(composition) 으로 해결. fork 금지

4. **정말로 없으면 생성** — 단, 다음 위치 규칙을 따른다:
   - 도메인 무관·재사용 가능 → `src/components/ui/` (예: `Button`, `Modal`, `Dropzone`)
   - 도메인·페이지 종속 → `src/components/public/` 또는 `src/components/admin/` (예: `HomeHeader`, `SeatResultCard`, `AdminCsvSection`)

### 디자인 시스템 구성 원칙

- **프리미티브 베이스**: shadcn/ui (Radix + Tailwind) 를 기반으로 하되, 디자인 토큰(`ink/paper/gold/burgundy`) 을 적용하여 어울림콘서트 톤으로 커스터마이즈
- **스타일링**: Tailwind 클래스만 사용. 인라인 `style`, CSS 모듈, styled-components 금지
- **prop 인터페이스**: 명시적 TypeScript 타입. 기본값을 합리적으로 제공하여 호출부가 간결해지도록
- **단일 책임**: 컴포넌트는 한 가지 시각/상호작용 단위만 담당. 두 가지 일을 한다면 분리
- **a11y 우선**: shadcn(radix) 기본 동작 유지, alt/aria-label 누락 금지
- **이름**: PascalCase, 약어보다 명확한 풀네임 (`SeatResultCard` ✓, `SRC` ✗)

### 행동 규칙 (해서는 안 되는 것)

- ❌ 한 페이지에서만 쓴다는 이유로 인라인 JSX 로 박아두기 → 재사용 못 하더라도 컴포넌트화하여 `public/` 또는 `admin/` 에 둘 것 (한 페이지에서만 써도 의도가 분명해짐)
- ❌ 비슷한 컴포넌트를 복사·붙여넣기로 변형 (예: `MenuCard` 와 `MenuCardSmall`) → variant prop 으로 통합
- ❌ Tailwind 클래스를 매 호출부에서 길게 나열 (예: `className="px-4 py-2 rounded-lg ..."` 반복) → 컴포넌트 또는 `cva`(class-variance-authority) 로 캡슐화
- ❌ 프리미티브가 있는데 native HTML 직접 사용 (예: shadcn `<Button>` 두고 `<button>`)

### 신규 컴포넌트 생성 시 체크리스트

- [ ] `src/components/ui/` 와 `src/components/public/` `admin/` 에 비슷한 게 없는지 grep 으로 확인
- [ ] 비슷한 게 있다면 prop 확장으로 가능한지 검토
- [ ] 새로 만든다면 위치 규칙 (ui vs public/admin) 확인
- [ ] PascalCase 단일 파일, default export
- [ ] TypeScript prop 인터페이스 명시
- [ ] Tailwind 토큰만 사용 (임의 hex 색상 금지)
- [ ] 같은 페이지에서 두 번 이상 쓰일 패턴이면 즉시 컴포넌트로 추출

이 규칙은 S02 (홈 헤더) 단계부터 적용된다. 상세 토큰·컴포넌트 카탈로그는 [`docs/08-design-system.md`](./docs/08-design-system.md) 참조. 신규 컴포넌트 추가 시 본 문서의 §3 카탈로그 표에도 한 줄 추가하는 것이 의무.

## 작성 컨벤션

- **언어**: 한국어 본문, 영문은 식별자·기술 용어 (예: `라우팅 (routing)`)
- **식별자**: `FR-G##` (관객용 기능), `FR-A##` (관리자용 기능), `ENT-##` (엔터티), `SCR-##` (화면), `S##` (구현 단계)
- **우선순위**: PRD v1.1 의 모든 기능은 **P0** (MVP 필수). P1/P2 는 PRD 갱신을 통해서만 추가
- **참조 표기**: 코드/문서에서 PRD 조항을 인용할 때 `PRD §2.2.3` 식으로 표기

## 참조 자료

- 디자인·문구의 출처: [`docs/assets/reference-original.html`](./docs/assets/reference-original.html) (1,524줄 vanilla HTML/CSS/JS) — 이미 동작하는 시안. 좌석맵 SVG (lines 1044-1074), 더미 게스트 23명 (lines 1324-1347), 디자인 토큰 (lines 11-22) 등이 참조 출처
- 모든 docs 의 변경 이력은 git commit 메시지로 관리 (별도 changelog 파일 없음)
