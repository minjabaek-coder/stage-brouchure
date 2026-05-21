# 03 · 정보 구조 (Information Architecture)

> 기준 문서: [`00-prd.md`](./00-prd.md) v1.2

## 1. 사이트맵 (PRD §6)

```
어울림콘서트 웹앱
│
├─ Public
│   ├─ /                          홈 (헤더 + 영상 + 메뉴 2개 + 응원 메시지 미리보기)
│   ├─ /search                    자리 찾기 (이름 + 전화4자리 검색 + 좌석배치도)
│   ├─ /brochure                  브로셔 (이미지 8장 세로 스크롤)
│   └─ /messages                  응원 메시지 (목록 + 작성 다이얼로그)
│
└─ Admin (인증 없음, URL 비공개)
    ├─ /admin                     콘텐츠 관리 (CSV / 좌석맵 / 브로셔)
    └─ /admin/messages            응원 메시지 관리 (목록 + 삭제)
       ※ 운영상 `/admin-h7k9x2` 같은 추측 어려운 경로 권장
       ※ `AdminNav` 가 두 탭(`콘텐츠 관리` / `응원 메시지 관리`)을 노출
```

총 6개 라우트.

## 2. 라우팅 (Next.js App Router)

```
src/app/
├─ (public)/                      Route Group · 관객용 레이아웃
│   ├─ layout.tsx                 폰트, 배경, 페이지 트랜지션
│   ├─ page.tsx                   /  홈
│   ├─ search/page.tsx            /search
│   ├─ brochure/page.tsx          /brochure
│   └─ messages/page.tsx          /messages (force-dynamic)
│
├─ admin/
│   ├─ page.tsx                   /admin (콘텐츠 관리)
│   └─ messages/page.tsx          /admin/messages (응원 메시지 관리, force-dynamic)
│
└─ api/
    ├─ search/route.ts            POST /api/search   { name, phone_last4 } → { seat, note } | 404
    ├─ messages/route.ts          GET /api/messages?limit=20   |   POST /api/messages  (1/min/IP)
    └─ admin/
        ├─ upload-csv/route.ts        POST   multipart (CSV)
        ├─ upload-seatmap/route.ts    POST   multipart (image)
        ├─ upload-brochure/route.ts   POST   multipart (image[])
        └─ messages/[id]/route.ts     DELETE /api/admin/messages/[id] → revalidatePath('/'), revalidatePath('/messages')
```

`middleware.ts` 에서 `/api/search` 에 Rate Limit 적용 (PRD §4.4 — 1분당 30회). `POST /api/messages` 는 라우트 핸들러에서 `@upstash/ratelimit` 의 messages 트랙으로 1분/IP 1회 적용 (FR-G10). `/admin*` 라우트는 `robots.txt` 에서 disallow 처리. 운영 환경에서는 `ADMIN_PATH_SUFFIX` 가 설정돼 `middleware.ts` 가 `/admin-<suffix>*` 를 내부적으로 `/admin*` 로 rewrite 한다.

## 3. 화면 (SCR) 카탈로그

| ID | 화면 | 경로 | 핵심 컴포넌트 |
|----|------|------|---------------|
| SCR-G01 | 홈 | `/` | `HomeHeader`, `InvitationVideo`, `MenuCardList`, `MessagesPreview`, `HomeFooter` |
| SCR-G02 | 자리 찾기 | `/search` | `PageHeader`, `SearchForm`, `SeatResultCard`, `SeatMapImage` |
| SCR-G03 | 브로셔 | `/brochure` | `PageHeader`, `BrochureScroller` (8 이미지) |
| SCR-G04 | 응원 메시지 | `/messages` | `PageHeader`, `MessagesTabs` (3탭: cheer/review/photos), `MessageFormButton` (hero), `MessagesList`, `MessageItem`, `MessagesComingSoon` (review/photos placeholder) |
| SCR-A01 | 관리자 (콘텐츠) | `/admin` | `AdminNav`, `AdminCsvSection`, `AdminSeatMapSection`, `AdminBrochureSection` |
| SCR-A02 | 관리자 (응원 메시지) | `/admin/messages` | `AdminNav`, `AdminMessagesList` |

## 4. 와이어프레임 묘사

### SCR-G01 · 홈
```
┌──────────────────────────────────────┐
│ ❦  ✦  ❦                              │
│ 협력단체와 함께하는 앙상블의 향연      │
│ Harmony Concert                       │
│ 어울림 콘서트                          │
│ A Symphony of Souls in Concord        │
│ ─────────────────────                 │
│ DATE 2026·5·26 │ VENUE 송파… │ TIME PM 7:30 │
├──────────────────────────────────────┤
│ ┌─ 16:9 영상 썸네일 (▸ 클릭하여 재생) ─┐ │
│ └────────────────────────────────────┘ │
│        ✦ Invitation to the Evening ✦  │
├──────────────────────────────────────┤
│ ┌── — I — 자리 찾기 ────────────  → ┐ │
│ │   🔍   Find Your Seat              │ │
│ └────────────────────────────────────┘ │
│ ┌── — II — 브로셔 ─────────────  → ┐ │
│ │   📖   Programme & Notes           │ │
│ └────────────────────────────────────┘ │
├──────────────────────────────────────┤
│            ❦                          │
│      WELCOME TO THE EVENING           │
│      (사)한국예술가곡총연합회          │
└──────────────────────────────────────┘
```

### SCR-G02 · 자리 찾기 (PRD §2.2.2)
```
┌──────────────────────────────────────┐
│ ←   자리 찾기                          │
│                                       │
│ 이름과 전화번호 뒷자리 4자리를         │
│ 입력하시면 좌석을 안내해 드립니다       │
│                                       │
│ ┌─ 이름 ─────────────────────────────┐│
│ └────────────────────────────────────┘ │
│ ┌─ 전화번호 뒷자리 (4자리) ──────────┐│
│ └────────────────────────────────────┘ │
│        [    자리 확인    ]             │
│                                       │
│ ── (검색 후 노출) ──                  │
│ ┌────────────────────────────────────┐ │
│ │       ✦ 좌석 안내 ✦                │ │
│ │  이름:     홍길동                   │ │
│ │  연락처:   ****-****-1234           │ │
│ │  좌석번호: A-2                      │ │
│ └────────────────────────────────────┘ │
│                                       │
│  ── 또는 (실패 시) ──                 │
│  일치하는 정보를 찾을 수 없습니다.     │
│  입력 정보를 확인해 주세요.            │
│                                       │
│ ────────────────────────              │
│  좌석 배치도                           │
│ ┌───── 정적 이미지 (핀치줌 가능) ──┐  │
│ │  [ seat_map.jpg 표시 ]            │  │
│ └────────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### SCR-G03 · 브로셔 (PRD §2.3)
```
┌──────────────────────────────────────┐
│ ←   브로셔                             │
│                                       │
│ ┌────────────────────────────────────┐ │
│ │      [ brochure_01.jpg ]           │ │
│ └────────────────────────────────────┘ │
│            ✦  1 / 8  ✦                │
│ ──────────────────────                │
│ ┌────────────────────────────────────┐ │
│ │      [ brochure_02.jpg ]           │ │
│ └────────────────────────────────────┘ │
│            ✦  2 / 8  ✦                │
│ ──────────────────────                │
│         …  3, 4, 5, 6, 7, 8 …         │
│                                       │
│ * 이미지 탭 → 풀스크린 라이트박스      │
│ * 첫 이미지 즉시 로드, 나머지 lazy     │
└──────────────────────────────────────┘
```

### SCR-A01 · 관리자 (PRD §3.2)
```
┌─────────────────────────────────────────┐
│  관리자 페이지                           │
│  현재 등록: 547명                        │
│  마지막 업데이트: 2026-05-25 18:30       │
├─────────────────────────────────────────┤
│  [1] 좌석 명단 (CSV)                     │
│      [CSV 파일 선택]  [업로드]            │
│      ── 미리보기 (상위 10행) ──           │
│      | name | phone_last4 | seat | note | │
│      | 신귀복 |  1234  | A-1 | 이사장석 │ │
│      …                                   │
├─────────────────────────────────────────┤
│  [2] 좌석 배치도 (이미지 1장)            │
│      [현재 이미지 미리보기]              │
│      [이미지 선택]  [업로드]              │
├─────────────────────────────────────────┤
│  [3] 브로셔 이미지 (8장)                 │
│      ┌──┬──┬──┬──┐                      │
│      │1 │2 │3 │4 │                      │
│      ├──┼──┼──┼──┤                      │
│      │5 │6 │7 │8 │                      │
│      └──┴──┴──┴──┘                      │
│      [8장 일괄 선택]  [업로드]            │
│      [개별 슬롯 클릭 → 1장 교체]          │
└─────────────────────────────────────────┘
```

## 5. 컴포넌트 트리 (Public)

```
<RootLayout>
  <PublicLayout>
    <BackgroundLayer />          // noise SVG + radial gradient
    <Stage>                      // max-width 560px container
      <Outlet />
    </Stage>
  </PublicLayout>
</RootLayout>

<HomePage>
  <HomeHeader>
    <Ornament />
    <PreTitle />
    <TitleEn />
    <TitleKo />
    <Subtitle />
    <EventMeta />               // 하드코딩 (PRD §1)
  </HomeHeader>
  <InvitationVideo youtubeId="0aT4IdHXZW8" />
  <MenuCardList>
    <MenuCard href="/search"   no="I"  title="자리 찾기" desc="Find Your Seat"     icon={<SearchIcon/>} />
    <MenuCard href="/brochure" no="II" title="브로셔"   desc="Programme & Notes" icon={<BookIcon/>} />
  </MenuCardList>
  <MessagesPreview>             // 칩 링크 3개 + 최근 3건 + 작성 버튼 + 전체 보기
    <nav>                       // 칩 링크 (Next Link)
      <Link href="/messages"             aria-current="page">응원 메시지</Link>  // active 톤
      <Link href="/messages?tab=review">관람 후기</Link>                          // muted 톤
      <Link href="/messages?tab=photos">사진</Link>                                // muted 톤
    </nav>
    <MessageItem />                              // 최신 3건
    <MessageFormButton variant="primary" />      // gold-soft pill (작성 다이얼로그)
    <Link href="/messages">전체 보기 →</Link>
  </MessagesPreview>
  <HomeFooter />
</HomePage>

<SearchPage>                    // /search
  <PageHeader title="자리 찾기" />
  <SearchIntro />
  <SearchForm                   // 클라이언트 컴포넌트
    onSubmit={(name, phoneLast4) => fetch('/api/search', ...)}
  />
  <SeatResultCard result={...} />     // 또는 <NoResult />
  <SeatMapImage src={assets.seat_map.url} />   // lightbox 지원
</SearchPage>

<BrochurePage>                  // /brochure
  <PageHeader title="브로셔" />
  <BrochureScroller pages={assets.brochure_01..08}>
    {pages.map((p, i) => (
      <BrochurePage key={i} src={p.url} pageNo={i+1} total={pages.length} />
    ))}
  </BrochureScroller>
</BrochurePage>

<MessagesPage>                  // /messages (force-dynamic)
  <PageHeader title="응원 메시지" chapter="Chapter III" />
  <MessagesTabs                          // client component, useState
    cheerPanel={                         // 활성 콘텐츠 (응원 메시지)
      <>
        <Count total={N} />
        <MessageFormButton variant="hero" />
        <MessagesList items={messages} />
      </>
    }
    reviewPanel={<MessagesComingSoon icon="ti-message-circle" .../>}
    photosPanel={<MessagesComingSoon icon="ti-camera" .../>}
  />
</MessagesPage>
```

## 6. 컴포넌트 트리 (Admin)

```
<AdminPage>                     // /admin
  <AdminNav active="content" />              // 콘텐츠 관리 / 응원 메시지 관리 두 탭
  <AdminHeader stats={...} />   // 등록 N명, 마지막 업데이트 시간
  <AdminCsvSection>
    <CsvDropzone />
    <CsvPreviewTable />
    <ConfirmOverwriteDialog />
  </AdminCsvSection>
  <AdminSeatMapSection>
    <ImagePreview src={current.seat_map} />
    <ImageDropzone single />
  </AdminSeatMapSection>
  <AdminBrochureSection>
    <BrochureSlotGrid                  // 8 슬롯
      slots={brochureSlots}
      onBulkUpload={...}
      onSlotReplace={(idx, file) => ...}
      onReorder={(from, to) => ...}    // dnd 또는 위/아래 화살표
    />
    <UploadButton />
  </AdminBrochureSection>
</AdminPage>

<AdminMessagesPage>             // /admin/messages
  <AdminNav active="messages" />
  <AdminMessagesHeader total={N} />
  <AdminMessagesList items={messages}>
    {items.map(m => (
      <AdminMessageItem message={m} onDelete={confirmAndDelete} />
    ))}
    <ConfirmDialog ... />        // 삭제 전 한 번 확인
  </AdminMessagesList>
</AdminMessagesPage>
```

별도의 사이드바·인증 레이어 없음. 운영 환경의 admin URL 난독화는 `ADMIN_PATH_SUFFIX` 환경변수 + `middleware.ts` rewrite 로 처리.

## 7. 상태 관리 전략

- **관객 페이지**:
  - 홈/브로셔: 서버 컴포넌트로 `assets` 조회 후 SSR (revalidate 60s)
  - 자리 찾기: 검색 폼만 클라이언트 컴포넌트, `useTransition` 또는 단순 fetch
  - 응원 메시지(`/messages`): 서버 컴포넌트로 SSR (`force-dynamic`), 작성 다이얼로그(`MessageFormButton`) 만 클라이언트
- **관리자 페이지**: 모든 섹션이 클라이언트 컴포넌트, 폼 제출은 Server Action 또는 Route Handler. `/admin/messages` 도 SSR + 삭제 액션만 클라이언트
- **전역 상태 불필요**: Context/Redux 등 도입하지 않음

## 8. 캐시·재검증

- 자리 찾기 결과는 캐시하지 않음 (`cache: 'no-store'`)
- 좌석배치도/브로셔 이미지는 Supabase Storage CDN + `next/image` 캐시
- CSV/이미지 업로드 후 `revalidatePath('/search')`, `revalidatePath('/brochure')`
- 응원 메시지 작성·삭제 후 `revalidatePath('/')`, `revalidatePath('/messages')` — 홈 미리보기와 전체 목록 동시 갱신
- `/messages` 와 `/admin/messages` 는 `force-dynamic` (DB 의존, 캐시 부적합)
