/**
 * 단일 행사 상수. 어울림콘서트 2026.5.26 (단발성 행사 1회).
 * 디자인·문구 출처: docs/assets/어울림콘서트_260512_map.html (2026-05-12).
 */
export const EVENT = {
  // 헤더
  preTitle: "협력단체와 함께하는 앙상블의 향연",
  titleKo: "어울림 콘서트",
  ornament: "2026 정기연주회",

  // 메타 (3분할 strip)
  dateLabel: "날짜",
  dateValue: "2026. 5. 26",
  dateDay: "화",
  timeLabel: "시간",
  timeValue: "오후 7:30",
  venueLabel: "장소",
  venueShort: "송파문화예술회관",

  // 영상
  videoYoutubeId: "0aT4IdHXZW8",
  videoCaption: "미리보기",
  videoFootText: "공연의 첫 인사를 만나보세요",

  // 챕터 — 자리 찾기 검색 기능은 비활성화. 메뉴는 좌석배치도 보기로 단순화.
  chapterSearchTitle: "좌석배치도",
  chapterSearchDesc:
    "공연장에 오시는 순서대로 3층부터 4층까지 좌석을 배정해드립니다.",
  chapterBrochureTitle: "공연 안내서",
  chapterBrochureSub: "(브로셔)",
  chapterBrochureDesc: "프로그램과 출연진을 만나보세요",

  // 공연장 — assets 테이블에서 admin 이 덮어쓸 수 있는 값들의 기본치.
  // 구조화된 필드를 받아 VenueIllustration 컴포넌트가 SVG 약도를 그려준다.
  venueName: "송파문화예술회관",
  venueLine: "9호선",
  venuePrevStation: "삼전역",
  venueDestStation: "석촌고분역",
  venueExit: "4번 출구",
  venueWalkDistance: "도보 300m",
  venueAddress: "지하철 9호선 석촌고분역\n4번 출구에서 300m",
  venueMapUrl: "https://map.naver.com/v5/search/송파문화예술회관",

  // 푸터
  organizer: "(사)한국예술가곡총연합회",

  // 앱 제작 지원
  sponsors: [
    {
      name: "(주)아트컴퍼니본",
      url: "http://www.bon-art.kr",
      logo: "/sponsor-bjon.png",
      tone: "burgundy" as const, // 와인색 배경 박스
    },
    {
      name: "(주)카이로스팀",
      url: "https://www.kairosse.com",
      logo: "/sponsor-kairosse.jpg",
      tone: "paper" as const, // 흰 배경 박스
    },
  ],

  // 문의
  inquiryTitle: "이런 앱이 필요하신가요?",
  inquiryDesc: "행사 · 공연 · 전시를 위한 맞춤 AI 웹앱 제작 문의를 받습니다.",
  inquiryPhone: "010-8488-3178",
  inquiryEmail: "master@kairosse.com",

  // 카피라이트
  copyright: "© 2026 어울림콘서트",
} as const;

export type EventInfo = typeof EVENT;
