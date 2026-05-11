# 어울림콘서트 웹앱

(사)한국예술가곡총연합회의 **어울림 콘서트(2026.5.26 송파문화예술회관)** 를 위한 행사 안내·자리찾기·브로셔 웹앱.

## 빠른 시작

```bash
# 0. 사전 준비 — 로컬 PostgreSQL (자세한 설치는 docs/06-tech-stack.md §7.3)
brew install postgresql@16 && brew services start postgresql@16
psql -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
createdb -O postgres eoullim_dev && createdb -O postgres eoullim_test

# 1. 환경변수 + 의존성
cp .env.example .env.local      # 그리고 Supabase/Upstash 키 채우기
pnpm install

# 2. 개발 서버
pnpm dev                        # http://localhost:3100

# 3. 검사 및 테스트
pnpm typecheck
pnpm lint
pnpm test:e2e
```

## 문서

모든 사양·설계·구현 계획은 [`docs/`](./docs/README.md) 에 있다. 신규 작업 전에 다음 두 문서를 먼저 읽는다:

- [`docs/00-prd.md`](./docs/00-prd.md) — **SSOT** (PRD v1.1)
- [`docs/07-implementation-plan.md`](./docs/07-implementation-plan.md) — 단계별 구현 게이트

AI 어시스턴트 가이드: [`CLAUDE.md`](./CLAUDE.md)
