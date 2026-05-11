# 08 · 디자인 시스템 (Design System)

> 기준 문서: [`00-prd.md`](./00-prd.md) v1.1, [`06-tech-stack.md`](./06-tech-stack.md), [`assets/reference-original.html`](./assets/reference-original.html)

본 문서는 어울림콘서트 웹앱의 **단일 디자인 시스템 카탈로그**다. 모든 UI 컴포넌트는 본 카탈로그를 먼저 참조하고, 없을 때만 신규 작성한다 (CLAUDE.md 의 워크플로우 규칙).

---

## §1 철학 (Philosophy)

1. **단일 토큰 → 전파**: 색상·타이포·간격·모션은 `tailwind.config.ts` 의 토큰에서 정의되어 모든 컴포넌트가 동일 출처를 공유. 매직 넘버·임의 hex 금지
2. **shadcn/ui 베이스 + 어울림 톤**: Radix 의 a11y 보장 위에 디자인 토큰을 적용하여 럭셔리·클래식 톤으로 커스터마이즈
3. **재사용 우선**: 신규 UI 작성 전 본 카탈로그(§3) 와 `src/components/` 디렉터리를 grep
4. **합성으로 확장**: 비슷한 컴포넌트는 fork 가 아닌 `variant` prop / composition 으로 차이를 표현
5. **기록 의무**: 신규 컴포넌트 추가 시 §3 카탈로그 표에 한 줄을 함께 추가 (PR 단위)

---

## §2 디자인 토큰

원본 HTML `lines 11-22` (`:root { ... }`) 의 CSS 변수가 출처다.

### 2.1 색상 (CSS 변수 → Tailwind 매핑)

| CSS var | hex | Tailwind 토큰 | 용도 |
|---|---|---|---|
| `--ink` | `#0a0a0c` | `ink` | 페이지 배경 (베이스) |
| `--ink-soft` | `#1a1a1f` | `inkSoft` | 카드/섹션 배경 한 단계 위 |
| `--paper` | `#f4ede0` | `paper` | 본문 텍스트 (다크 배경 위) |
| `--paper-warm` | `#ebe1cf` | `paperWarm` | 종이 톤 카드 배경 (브로셔) |
| `--gold` | `#c5a572` | `gold` | 액센트, 보더, 라벨 |
| `--gold-deep` | `#a08247` | `goldDeep` | 호버/강조 |
| `--gold-light` | `#e8d4a8` | `goldHi` | 활성 상태 하이라이트 |
| `--burgundy` | `#5c1a1b` | `burgundy` | 무대, 브로셔 헤딩 |
| `--burgundy-deep` | `#3d0e0f` | `burgundyDeep` | 그라디언트 deep stop |

> 어떤 컴포넌트도 위 토큰 외 임의 hex 를 사용하지 말 것. 새 색조가 필요하면 본 표에 먼저 추가하고 사용한다.

### 2.2 타이포그래피

| 패밀리 | 변수 | 용도 | 권장 사이즈 |
|---|---|---|---|
| **Noto Serif KR** (200–700) | `--font-noto-serif-kr` | 한글 본문·타이틀·라벨 | body 14–16, title 30–48 |
| **Cormorant Garamond** (300–600 + italic) | `--font-cormorant` | 영문 라벨·서브타이틀·숫자 | label 12–14, subtitle 16–18 |

자간 토큰:
- `tracking-wider2: 0.18em` — 영문 라벨 ("DATE", "VENUE", "STAGE")
- `tracking-wider3: 0.3em` — 챕터 작은 라벨 ("Chapter I")

쓰기 규칙:
- 거대 한글 타이틀 (어울림 콘서트): Noto Serif KR weight 600, italic 금지
- 영문 보조 (Harmony Concert): Cormorant Garamond italic 또는 regular
- 메타값 (2026 · 5 · 26): Cormorant Garamond, `tracking-wider2`

### 2.3 간격·여백

| 토큰 | 값 | 용도 |
|---|---|---|
| Stage 컨테이너 | `max-w-[560px]` + `px-6 py-8 pb-20` | 모든 페이지의 1열 컨테이너 |
| 섹션 간격 | `space-y-10` ~ `space-y-12` | 헤더/영상/메뉴 카드 간 |
| 카드 패딩 | `p-6` ~ `p-8` (모바일 < 420px 시 `p-5`) | MenuCard, BrochurePageCard |

모바일 < 420px 축소: 원본 HTML lines 899-910 그대로 이식 (제목·아이콘·result 숫자)

### 2.4 모서리·그림자

| 토큰 | Tailwind | 용도 |
|---|---|---|
| 카드 라운드 | `rounded-lg` (8px) ~ `rounded-xl` (12px) | MenuCard, ResultCard |
| 버튼 라운드 | `rounded-full` | IconButton, BackButton |
| 럭스 그림자 | `shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]` (커스텀 `shadow-luxe`) | 카드 떠있는 느낌 |
| 인셋 보더 | `ring-1 ring-gold/40` | 카드 보더 (불투명 골드) |

### 2.5 모션

| 키프레임 | 정의 | 용도 |
|---|---|---|
| `fadeUp` | `from { opacity:0; translateY(20px) } to { opacity:1; translateY(0) }` | 페이지/섹션 진입 |
| `shimmer` | `0%,100%: opacity .7; 50%: 1` (3s ease-in-out infinite) | Ornament 글자 (lines 894-896) |
| `pulseGold` | gold glow 살짝 호흡 | 활성 버튼/검색 결과 강조 (선택) |

페이지 전환:
- 라우트 간 fade (200–300ms) — `PageTransition` 컴포넌트
- v1.0 의 모달 슬라이드업은 v1.1 에서 라우트로 대체 (deprecated)

### 2.6 배경 레이어

전 페이지 공통 배경은 `BackgroundLayer` 컴포넌트로 캡슐화:
- 메인 그라디언트: 상단 burgundy (35% alpha) + 하단 gold (12% alpha) + 베이스 ink 그라디언트 (lines 33-40)
- 노이즈 오버레이: SVG fractal noise (lines 41-49), `mix-blend-mode: overlay`, `opacity: 0.4`, `position: fixed`

---

## §3 컴포넌트 카탈로그

각 컴포넌트는 다음 칼럼:
**이름 / 참조 라인 / 상태 / 매핑 단계 / 위치 (예정)**

상태 표기:
- 🔧 **포팅 예정** — 현재 reference HTML 에 존재, 단계에서 React 로 옮김
- 🆕 **v1.1 신규** — HTML 에 없으나 PRD v1.1 에서 추가
- ⚠️ **v1.0 폐기** — HTML 에 있으나 PRD v1.1 에서 제거
- ✅ **구현 완료** — 이미 React 로 작성됨 (S## 완료 후 갱신)

### 3.1 레이아웃

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `Stage` | 52-58 | ✅ | S01 | `components/layout/Stage.tsx` |
| `BackgroundLayer` | 33-49 | ✅ | S01 | `components/layout/BackgroundLayer.tsx` |
| `PageTransition` | (신규) | 🆕 | S04 | `components/layout/PageTransition.tsx` |

### 3.2 데코·타이포 부속

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `Ornament` (`❦ ✦ ❦`) | 919, 1010 | ✅ | S02 | `components/ui/Ornament.tsx` |
| `Flourish` (단일 `❦`) | 1009 | ✅ | S02 | `components/ui/Flourish.tsx` |
| `CornerMarker` (4 코너) | 969-970 | 🔧 | S04 | `components/ui/CornerMarker.tsx` |
| `MetaDivider` | 929 | ✅ | S02 | `components/ui/MetaDivider.tsx` |
| `ChapterLabel` (`Chapter I`) | 1020 | 🔧 | S04 | `components/ui/ChapterLabel.tsx` |

### 3.3 헤더·타이틀

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `HomeHeader` (composition) | 918-940 | ✅ | S02 | `components/public/HomeHeader.tsx` |
| ↳ `PreTitle` | 920 | ✅ | S02 | (HomeHeader 내 인라인) |
| ↳ `TitleEn` | 921 | ✅ | S02 | (HomeHeader 내 인라인) |
| ↳ `TitleKo` | 922 | ✅ | S02 | (HomeHeader 내 인라인, gold-gradient highlight 포함) |
| ↳ `Subtitle` | 923 | ✅ | S02 | (HomeHeader 내 인라인) |
| ↳ `EventMeta` (DATE / VENUE / TIME) | 924-939 | ✅ | S02 | `components/public/EventMeta.tsx` |
| `PageHeader` (← + chapter + title) | 1018-1022, 1087-1091 | 🔧 | S04 | `components/ui/PageHeader.tsx` |

### 3.4 메뉴·네비게이션

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `MenuCardList` | 966-1006 | 🔧 | S04 | `components/public/MenuCardList.tsx` |
| `MenuCard` (icon + num + title + desc + →) | 968-1004 | 🔧 | S04 | `components/public/MenuCard.tsx` |
| `BackButton` (←) | 1019, 1088 | 🔧 | S04 | `components/ui/BackButton.tsx` |

### 3.5 영상

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `InvitationVideo` (썸네일 ↔ iframe) | 943-963 + 1350-1364 | 🔧 | S03 | `components/public/InvitationVideo.tsx` |

### 3.6 폼·검색

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `SearchInputField` (input + icon submit) | 1028-1036 | 🔧 | S07 | `components/ui/SearchInputField.tsx` |
| `IconButton` (search-btn 패턴) | 1030-1035 | 🔧 | S07 | `components/ui/IconButton.tsx` |
| `SearchForm` (name + phone_last4) | (신규) | 🆕 | S07 | `components/public/SearchForm.tsx` |

### 3.7 결과·카드

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `SeatResultCard` | 1488-1497 (JS) | 🔧 + 🆕 (전화 마스킹) | S07 | `components/public/SeatResultCard.tsx` |
| `NoResultCard` | 1505-1509 (JS) | 🔧 | S07 | `components/public/NoResultCard.tsx` |
| `BrochurePageCard` (paper texture) | 1100-1115 외 | 🔧 (단순화) | — | (v1.1 에서는 8장 이미지로 대체. 표지 카드 패턴만 보존) |

### 3.8 좌석맵

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `SeatMapSvg` (인터랙티브) | 1044-1074, 1383-1459 | ⚠️ v1.0 폐기 | — | (포팅하지 않음) |
| `SeatMapLegend` | 1076-1079 | ⚠️ v1.0 폐기 | — | (정적 이미지에 포함) |
| `SeatMapImage` (정적 + 라이트박스) | (신규) | 🆕 | S08 | `components/public/SeatMapImage.tsx` |

### 3.9 푸터

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `HomeFooter` (ornament + welcome + org) | 1008-1012 | ✅ | S02 | `components/public/HomeFooter.tsx` |

### 3.10 모달·트랜지션

| 이름 | 참조 라인 | 상태 | 단계 | 위치 |
|---|---|---|---|---|
| `ModalPage` slide-up | 392-396 | ⚠️ v1.0 폐기 | — | (라우트로 대체) |
| `Lightbox` 래퍼 | (신규, yet-another-react-lightbox) | 🆕 | S08, S09 | `components/ui/Lightbox.tsx` |

### 3.11 v1.1 신규 (브로셔·관리자)

| 이름 | 상태 | 단계 | 위치 |
|---|---|---|---|
| `BrochureScroller` (8장 + 페이지번호 + lazy) | 🆕 | S09 | `components/public/BrochureScroller.tsx` |
| `Dropzone` (CSV/이미지 공통) | 🆕 | S11–13 | `components/ui/Dropzone.tsx` |
| `ConfirmDialog` (덮어쓰기 확인) | 🆕 | S11 | `components/ui/ConfirmDialog.tsx` |
| `CsvPreviewTable` | 🆕 | S11 | `components/admin/CsvPreviewTable.tsx` |
| `BrochureSlotGrid` (8 슬롯) | 🆕 | S13 | `components/admin/BrochureSlotGrid.tsx` |
| `AdminCsvSection` | 🆕 | S11 | `components/admin/AdminCsvSection.tsx` |
| `AdminSeatMapSection` | 🆕 | S12 | `components/admin/AdminSeatMapSection.tsx` |
| `AdminBrochureSection` | 🆕 | S13 | `components/admin/AdminBrochureSection.tsx` |
| `AdminStatusBar` (등록 N명, 마지막 업로드 시간) | 🆕 | S10 | `components/admin/AdminStatusBar.tsx` |

---

## §4 shadcn/ui 베이스 매핑

어떤 shadcn 프리미티브를 활용해 자체 컴포넌트를 합성할지.

| shadcn 프리미티브 | 어울림 컴포넌트 |
|---|---|
| `Button` | `IconButton`, `BackButton`, "자리 확인" CTA |
| `Input` | `SearchInputField` 의 input 부 |
| `Card` | `BrochurePageCard` 베이스 (paper 톤 커스터마이즈) |
| `Dialog` | `ConfirmDialog`, `Lightbox` 폴백 |
| `Toast` (sonner) | 업로드 성공·실패 알림 |
| `Tooltip` | 보조 라벨 (필요 시) |

shadcn 설치는 S01 또는 첫 사용 시점 (S04/S07 등) 에 `pnpm dlx shadcn@latest add <name>` 으로 1개씩 추가.

---

## §5 명명·위치 규칙

```
src/components/
├── ui/        재사용 프리미티브 (shadcn 기반 + 어울림 커스텀)
├── layout/    Stage, BackgroundLayer, PageTransition
├── public/    관객용 도메인 합성 (HomeHeader, MenuCard, SeatResultCard, BrochureScroller …)
└── admin/     관리자 도메인 합성 (AdminCsvSection …)
```

- 파일명 = 컴포넌트명, PascalCase, 단일 default export
- Props 는 명시적 TypeScript interface (`type` 보다 `interface` 선호 — 확장 가능)
- 합리적 기본값 (`required` 최소화)
- 한 파일 한 컴포넌트 (sub-component 는 같은 파일 내 named export 가능)

예시 시그니처:
```ts
// components/ui/Ornament.tsx
import { type FC } from "react";
import { cn } from "@/lib/utils";

interface OrnamentProps {
  className?: string;
  variant?: "default" | "small";
}

const Ornament: FC<OrnamentProps> = ({ className, variant = "default" }) => (
  <div className={cn("flex justify-center gap-3 text-gold", className)} aria-hidden>
    <span>❦</span>
    <span>✦</span>
    <span>❦</span>
  </div>
);

export default Ornament;
```

---

## §6 추가·갱신 워크플로우

신규 컴포넌트가 필요하다고 판단되면:

1. **grep 으로 기존 확인** (CLAUDE.md 의 "디자인 시스템" 섹션)
2. **본 문서 §3 카탈로그 확인** — 이미 명세된 컴포넌트가 있는가?
3. 없으면 신규 작성:
   - 위치 결정 (ui / layout / public / admin)
   - 디자인 토큰만 사용
   - 합리적 prop 인터페이스
4. **본 문서 §3 의 적절한 sub-section 표에 한 줄 추가** (의무)
5. git commit 메시지 컨벤션:
   - `feat(ds): add <ComponentName> primitive` (디자인 시스템 신규)
   - `feat(s##): use <ComponentName> in <Page>` (단계 작업 중 사용)

---

## §7 향후

- **S14 완료 시점** 에 카탈로그 전수 점검:
  - 사용처 ≤ 1 인 컴포넌트는 인라인화 검토
  - 명세는 됐지만 실제 미사용 컴포넌트 제거
- **디자인 토큰 변경 시** reference-original.html 과의 격차를 본 문서 §2 에 기록
- **Storybook** 도입은 컴포넌트 수가 30개 이상으로 늘어나면 검토 (현재 ≈ 25개로 적은 편)
