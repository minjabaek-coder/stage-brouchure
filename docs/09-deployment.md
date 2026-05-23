# 09 · 배포 가이드 (Vercel + Neon + Vercel Blob)

> 본 문서는 어울림콘서트 웹앱을 **Vercel + Neon Postgres + Vercel Blob** 조합으로 프로덕션에 배포하기 위한 단계별 체크리스트다. 코드 변경은 모두 완료된 상태이며, 사용자는 외부 서비스의 계정/리소스만 준비하면 된다.
>
> **2026-02-27 마이그레이션 이력**: 기존 Supabase (DB + Storage) → Neon + Vercel Blob로 교체. 사유는 `00-prd.md` §4.1 옵션 B 이력 참조 (Supabase Free 7일 자동 pause + 2-프로젝트 제한이 단발성 행사 다수 운영에 부적합). 코드 변경은 `src/lib/storage.ts` + `.env.example` 일부에 국한.

## 0. 사전 준비

- GitHub 저장소에 `main` 이 push 되어 있을 것 (Vercel 이 트래킹)
- Vercel 계정 (https://vercel.com) — Hobby 가능
- Upstash 계정 (https://upstash.com) — Free tier 가능 (검색 Rate Limit)

> Neon과 Vercel Blob은 Vercel Marketplace 통합으로 1-클릭 프로비저닝되므로 별도 계정 가입이 필요하지 않다.

## 1. Vercel 프로젝트 생성 (없을 경우)

1. Vercel 대시보드 → **Add New → Project** → GitHub 저장소 import
2. **Framework Preset**: Next.js (자동 감지)
3. **Build Command**: `pnpm prisma migrate deploy && pnpm build`
   - 첫 배포 시 마이그레이션이 적용된 다음 빌드된다
4. 일단 환경변수 없이 import 만 해두고, 다음 절차로 Neon/Blob을 연결한다

## 2. Neon Postgres 프로비저닝 (Vercel Marketplace)

1. Vercel 프로젝트 → **Storage** 탭 → **Create Database** → **Neon**
2. **Region**: `Asia Pacific (Singapore)` 또는 가장 가까운 region 선택
3. **Project name**: `eoullim-concert` (자유)
4. **Connect to project**: 본 Vercel 프로젝트 선택, **Production / Preview / Development** 모두 체크
5. 생성되면 다음 환경변수가 **Vercel에 자동 주입**됨:
   - `DATABASE_URL` — pooled connection (PgBouncer 호환). hostname에 `-pooler` 접미사 포함 → 런타임용
   - `DIRECT_URL` — direct connection. `prisma migrate deploy` 용
   - `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGUSER` 등 부가 변수 (Prisma 코드에서는 사용하지 않음)

> Neon은 Supabase와 달리 **IPv4/IPv6 모두 지원**되어 IPv6 전용 이슈가 없다. `?sslmode=require` 가 기본 포함됨.

## 3. Vercel Blob 프로비저닝

1. Vercel 프로젝트 → **Storage** 탭 → **Create Database** → **Blob**
2. **Store name**: `eoullim-assets` (자유)
3. **Connect to project**: 본 Vercel 프로젝트 선택, 모든 환경 체크
4. 생성되면 다음 환경변수가 자동 주입됨:
   - `BLOB_READ_WRITE_TOKEN` — `@vercel/blob`의 `put`/`del`에 사용

> 단일 store를 사용하며 폴더 구조로 분리한다: `images/seatmap.jpg`, `images/brochure-NN.jpg`, `backups/<filename>.csv`. 공개 URL은 Vercel CDN을 통해 자동 서빙되므로 별도 public 정책 설정 불필요.

## 4. Upstash Redis (검색 Rate Limit)

1. Upstash → **Create Database**
   - Type: `Regional` (가장 가까운 region)
   - Eviction: 기본값
2. 생성 후 메모:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Vercel 환경변수로 등록 (Production + Preview)

> 미설정 시 `lib/ratelimit.ts` 가 in-memory fallback 으로 동작하지만, Vercel 서버리스 인스턴스 간 메모리 공유가 안 되어 실제 제한이 작동하지 않는다. **프로덕션은 반드시 Upstash 설정 필수**.

## 5. 환경 변수 (Vercel)

자동 주입되는 변수 외에 다음을 **수동 등록**:

| 키 | 값 | 비고 |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | §4 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST Token | Secret |
| `ADMIN_PATH_SUFFIX` | 추측하기 어려운 6~12자 (예: `h7k9x2`) | `/admin-h7k9x2` 로만 접근 가능. middleware 가 `/admin` 을 404 처리 |
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (예: `https://stage-brochure.vercel.app`) | sitemap, OG image, metadataBase 에 사용 |
| `SENTRY_DSN` (선택) | Sentry Project DSN | 미설정 시 Sentry 비활성 |

**자동 주입 (Neon + Blob 통합):**
- `DATABASE_URL`, `DIRECT_URL`, `BLOB_READ_WRITE_TOKEN`

> Vercel 환경변수를 로컬로 받으려면: `vercel env pull .env.local`

## 6. 첫 배포 + 시드

`§5`까지 끝나면 Vercel 이 GitHub push 를 감지해 자동 배포한다. 첫 빌드가 끝나면:

1. **마이그레이션 확인**
   - Neon 대시보드 → **Tables** 에서 `attendees`, `assets`, `csv_backups`, `messages` 테이블이 보이는지
   - 또는 `/api/dev/seed-check` 호출하여 attendees count 확인
2. **초기 시드 (선택)**
   - 운영자가 즉시 CSV/이미지를 업로드할 거라면 시드 불필요
   - placeholder 가 필요하면 로컬에서 prod DB 를 향한 시드 실행:
     ```bash
     vercel env pull .env.production.local
     # .env.production.local 의 DATABASE_URL/DIRECT_URL 로 실행
     dotenv -e .env.production.local -- pnpm db:seed
     ```
     ⚠️ 이 명령은 `attendees` 를 전부 삭제하고 더미 22명을 재삽입한다. 운영자 명단이 이미 업로드된 후라면 절대 실행 금지.

## 7. 스모크 테스트 (배포 직후)

| URL | 확인 사항 |
|---|---|
| `/api/dev/deploy-diag` | `DATABASE_URL_set: true`, `BLOB_TOKEN_set: true`, `probe.ok: true` |
| `/` | 헤더 + 영상 썸네일 + 메뉴 2개 |
| `/search` | 폼 → 시드된 이름+전화로 검색 시 좌석 노출 |
| `/brochure` | 8장 (placeholder SVG) 표시 + 라이트박스 |
| `/messages` | 한마디 남기기 3-탭 UI |
| `/admin-<SUFFIX>` | 통계 + 3 섹션 (CSV / 좌석맵 / 브로셔) |
| `/admin` | 404 (suffix 가 비어있지 않은 경우) |
| `/sitemap.xml` | / /search /brochure 3 URL, `/admin` 제외 |
| `/opengraph-image` | 1200×630 PNG (행사명 + 일시) |
| `/robots.txt` | `Disallow: /admin` + `Sitemap: /sitemap.xml` |

## 8. 운영자 첫 사용 흐름 (행사 전)

1. `/admin-<SUFFIX>` 접속
2. **Section I (CSV)**: 실제 명단 CSV 업로드 → 미리보기 → 확인 → 시드 22명이 운영자 명단으로 교체됨. 직전 데이터는 Vercel Blob의 `backups/` 폴더에 자동 백업.
3. **Section II (좌석맵)**: 실제 좌석배치도 JPG/PNG 업로드 → `/search` 즉시 반영
4. **Section III (브로셔)**: 브로셔 8장 일괄 업로드 (파일명 `01.jpg`, `02.jpg` ... 오름차순) → `/brochure` 즉시 반영
5. 카카오톡으로 본인에게 배포 URL 전송 → 인앱 브라우저에서 ②~④ 결과 확인

## 9. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| `pnpm prisma migrate deploy` 가 `exited with 1` / connection refused | `DIRECT_URL` 가 누락되었거나 잘못된 hostname | Vercel 대시보드 → Storage → Neon → **Connection Details** 에서 `DIRECT_URL` 재복사 |
| `prisma.attendee.count()` 호출 시 `Error querying the database: ENOTFOUND` | Neon 프로젝트가 삭제되었거나 통합이 해제됨 | Vercel → Storage 탭에서 Neon 연결 상태 확인. 자동 wake는 정상 동작 (1~2초 cold start) |
| `/search`의 좌석맵이 깨짐 (`next/image` 가 호스트 거부) | Vercel Blob 도메인 (`*.public.blob.vercel-storage.com`) 이 `next.config.ts` 의 `remotePatterns` 에 없음 | `next.config.ts` 의 `images.remotePatterns` 확인 |
| CSV 업로드 시 `Blob upload failed` | `BLOB_READ_WRITE_TOKEN` 누락 또는 Blob 스토어 미연결 | §3 + §5 재확인 |
| 검색 429 가 너무 자주 발생 | Upstash 미설정 → in-memory fallback 이 서버리스 cold start 때 초기화 | §4 의 Upstash 키 등록 |
| `/admin` 이 404 인데 운영자가 진입 못 함 | `ADMIN_PATH_SUFFIX` 가 운영자에게 전달 안 됨 | `/admin-<SUFFIX>` 로 안내 (Vercel env 의 값과 동일) |

## 10. 행사 D-day 체크리스트 (운영자)

- [ ] 행사 1일 전: 최종 명단 CSV 재업로드, 미리보기에서 좌석 무작위 5명 검증
- [ ] 행사 1일 전: 좌석맵·브로셔 최종 버전 업로드
- [ ] 행사 당일 오전: 카카오톡 안내문에 배포 URL + QR (선택) 포함
- [ ] 행사 당일: Vercel 대시보드 → Analytics 에서 동시 접속 모니터링 (100명 동시 통과 검증됨)
- [ ] 행사 종료 후: Vercel Blob 대시보드의 `backups/` 폴더에서 CSV 보존 확인 → 필요 시 다운로드. Neon DB는 행사 종료 후 dump 받아 보관 가능 (`pg_dump`)

---

**관련 문서**
- 기능 요구사항: [`02-functional-requirements.md`](./02-functional-requirements.md)
- 기술 스택 / 의존성: [`06-tech-stack.md`](./06-tech-stack.md)
- 단계별 구현: [`07-implementation-plan.md`](./07-implementation-plan.md)
