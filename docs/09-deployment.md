# 09 · 배포 가이드 (Vercel + Supabase)

> 본 문서는 어울림콘서트 웹앱을 Vercel + Supabase 조합으로 프로덕션에 배포하기 위한 단계별 체크리스트다. 코드 변경은 모두 완료된 상태이며, 사용자는 외부 서비스의 계정/리소스만 준비하면 된다.

## 0. 사전 준비

- GitHub 저장소에 main 이 push 되어 있을 것 (Vercel 이 이걸 트래킹)
- Supabase 계정 (https://supabase.com) — Free tier 가능
- Vercel 계정 (https://vercel.com) — Hobby 가능
- Upstash 계정 (https://upstash.com) — Free tier 가능 (검색 Rate Limit)

## 1. Supabase 프로젝트 + DB 생성

1. Supabase 대시보드 → **New Project**
   - Name: `eoullim-concert` (자유)
   - Region: `Northeast Asia (Seoul)` 권장
   - Database Password: 강력한 문자열 (저장해둘 것)
2. 프로젝트가 준비되면 **Settings → Database → Connection string**
   - **Transaction pooler** (`...pooler.supabase.com:6543`) — 런타임용 (`DATABASE_URL`)
   - **Session pooler** (`...pooler.supabase.com:5432`) — 마이그레이션용 (`DIRECT_URL`)
   - **Direct connection** (`db.<ref>.supabase.co:5432`) 은 사용하지 말 것:
     Supabase Free tier 는 IPv6 전용이라 Vercel build runner 가 접속 못 함
     (`prisma migrate deploy` 가 timeout/connection-refused 로 실패)
   - 두 URI 모두 비밀번호 자리 `[YOUR-PASSWORD]` 를 프로젝트 생성 시 정한 값으로 치환

## 2. Supabase Storage 버킷 + 정책

Supabase 대시보드 → **Storage → New bucket** 으로 두 개 생성:

### 2.1 `images` 버킷 (public)
- **Public bucket** 체크 — 좌석맵/브로셔는 관객이 직접 접근
- 정책은 기본값으로 충분 (public read, service-role write)

### 2.2 `backups` 버킷 (private)
- **Public bucket** 체크 해제 — CSV 백업은 운영자만 접근
- service-role key 로만 업로드/삭제 — 추가 정책 불필요

## 3. Upstash Redis (검색 Rate Limit)

1. Upstash → **Create Database**
   - Type: `Regional` (Seoul 권장)
   - Eviction: 기본값
2. 생성 후 화면에서 메모:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

> 미설정 시 `lib/ratelimit.ts` 가 in-memory fallback 으로 동작하지만, Vercel 서버리스 인스턴스 간 메모리 공유가 안 되어 실제 제한이 작동하지 않는다. **프로덕션은 반드시 Upstash 설정 필수**.

## 4. Vercel 프로젝트 생성

1. Vercel 대시보드 → **Add New → Project** → GitHub 저장소 import
2. **Framework Preset**: Next.js (자동 감지)
3. **Build Command**: `pnpm prisma migrate deploy && pnpm build`
   - 첫 배포 시 마이그레이션이 적용된 다음 빌드된다
4. **Environment Variables** — 아래 §5 의 모든 키 등록 (Production + Preview)

## 5. 환경 변수 (Vercel)

| 키 | 값 | 비고 |
|---|---|---|
| `DATABASE_URL` | Supabase **transaction pooler** URI (포트 6543, `?pgbouncer=true&connection_limit=1` 권장) | 서버리스 런타임용 |
| `DIRECT_URL` | Supabase **session pooler** URI (포트 5432, 같은 pooler 호스트) | `prisma migrate deploy` 가 사용. direct connection (`db.*`) 은 IPv6 전용이라 Vercel build runner 에서 실패 |
| `SUPABASE_URL` | Supabase 프로젝트 URL (예: `https://abc.supabase.co`) | Storage 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | **Settings → API → Project API keys → service_role** | **Secret** — 서버에서만 사용 |
| `SUPABASE_IMAGES_BUCKET` | `images` | §2.1 의 버킷명 |
| `SUPABASE_BACKUPS_BUCKET` | `backups` | §2.2 의 버킷명 |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | §3 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST Token | Secret |
| `ADMIN_PATH_SUFFIX` | 추측하기 어려운 6~12자 (예: `h7k9x2`) | `/admin-h7k9x2` 로만 접근 가능. middleware 가 `/admin` 을 404 처리 |
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (예: `https://eoullim.vercel.app`) | sitemap, OG image, metadataBase 에 사용 |

## 6. 첫 배포 + 시드

Vercel 이 GitHub push 를 감지해 자동 배포. 첫 빌드가 끝나면:

1. **마이그레이션 확인**
   - Supabase 대시보드 → **Table Editor** 에서 `attendees`, `assets`, `csv_backups` 테이블이 보이는지
2. **초기 시드 (선택)**
   - 운영자가 즉시 CSV/이미지를 업로드할 거라면 시드 불필요
   - placeholder 가 필요하면 로컬에서 prod DB 를 향한 시드 실행:
     ```bash
     DATABASE_URL="<prod DIRECT URL>" DIRECT_URL="<prod DIRECT URL>" pnpm db:seed
     ```
     ⚠️ 이 명령은 `attendees` 를 전부 삭제하고 더미 22명을 재삽입한다. 운영자 명단이 이미 업로드된 후라면 절대 실행 금지.

## 7. 스모크 테스트 (배포 직후)

| URL | 확인 사항 |
|---|---|
| `/` | 헤더 + 영상 썸네일 + 메뉴 2개 |
| `/search` | 폼 → 시드된 이름+전화로 검색 시 좌석 노출 |
| `/brochure` | 8장 (placeholder SVG) 표시 + 라이트박스 |
| `/admin-<SUFFIX>` | 통계 + 3 섹션 (CSV / 좌석맵 / 브로셔) |
| `/admin` | 404 (suffix 가 비어있지 않은 경우) |
| `/sitemap.xml` | / /search /brochure 3 URL, `/admin` 제외 |
| `/opengraph-image` | 1200×630 PNG (행사명 + 일시) |
| `/robots.txt` | `Disallow: /admin` + `Sitemap: /sitemap.xml` |

## 8. 운영자 첫 사용 흐름 (행사 전)

1. `/admin-<SUFFIX>` 접속
2. **Section I (CSV)**: 실제 명단 CSV 업로드 → 미리보기 → 확인 → 시드 22명이 운영자 명단으로 교체됨. 직전 데이터는 `backups` 버킷에 자동 백업.
3. **Section II (좌석맵)**: 실제 좌석배치도 JPG/PNG 업로드 → `/search` 즉시 반영
4. **Section III (브로셔)**: 브로셔 8장 일괄 업로드 (파일명 `01.jpg`, `02.jpg` ... 오름차순) → `/brochure` 즉시 반영
5. 카카오톡으로 본인에게 배포 URL 전송 → 인앱 브라우저에서 ②~④ 결과 확인

## 9. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| `pnpm prisma migrate deploy` 가 `exited with 1` / connection refused | `DIRECT_URL` 이 `db.<ref>.supabase.co` (IPv6 전용 direct connection) 를 가리킴 | `DIRECT_URL` 을 **session pooler** (`...pooler.supabase.com:5432`) 로 교체 후 재배포 |
| `/search` 의 좌석맵이 깨짐 (`next/image` 가 호스트 거부) | Supabase 도메인이 remotePatterns 에 없음 | `SUPABASE_URL` 이 env 에 정확히 설정됐는지 확인 후 재배포 |
| CSV 업로드 시 `Supabase backup upload failed` | `SUPABASE_SERVICE_ROLE_KEY` 누락 또는 `backups` 버킷 미생성 | §2.2 + §5 재확인 |
| 검색 429 가 너무 자주 발생 | Upstash 미설정 → in-memory fallback 이 서버리스 cold start 때 초기화 | §3 의 Upstash 키 등록 |
| `/admin` 이 404 인데 운영자가 진입 못 함 | `ADMIN_PATH_SUFFIX` 가 운영자에게 전달 안 됨 | `/admin-<SUFFIX>` 로 안내 (Vercel env 의 값과 동일) |

## 10. 행사 D-day 체크리스트 (운영자)

- [ ] 행사 1일 전: 최종 명단 CSV 재업로드, 미리보기에서 좌석 무작위 5명 검증
- [ ] 행사 1일 전: 좌석맵·브로셔 최종 버전 업로드
- [ ] 행사 당일 오전: 카카오톡 안내문에 배포 URL + QR (선택) 포함
- [ ] 행사 당일: Vercel 대시보드 → Analytics 에서 동시 접속 모니터링 (100명 동시 통과 검증됨)
- [ ] 행사 종료 후: Supabase `backups` 버킷에서 CSV 보존 확인 → 필요 시 다운로드

---

**관련 문서**
- 기능 요구사항: [`02-functional-requirements.md`](./02-functional-requirements.md)
- 기술 스택 / 의존성: [`06-tech-stack.md`](./06-tech-stack.md)
- 단계별 구현: [`07-implementation-plan.md`](./07-implementation-plan.md)
