/**
 * 단일 행사 상수. 어울림콘서트 2026.5.26 (단발성 행사 1회).
 * 디자인·문구 출처: docs/assets/어울림콘서트_260512.html (2026-05-12).
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

  // 챕터
  chapterSearchTitle: "자리 찾기",
  chapterSearchDesc: "예매하신 좌석을 확인하세요",
  chapterBrochureTitle: "공연 안내서",
  chapterBrochureSub: "(브로셔)",
  chapterBrochureDesc: "프로그램과 출연진을 만나보세요",

  // 공연장 (기본값 — 관리자가 admin 페이지에서 덮어쓸 수 있음, assets 테이블의
  // venue_name / venue_address / venue_map_url 키)
  venueName: "송파문화예술회관",
  venueAddress: "지하철 9호선 석촌고분역\n4번 출구에서 300m",
  venueMapUrl: "https://map.naver.com/v5/search/송파문화예술회관",

  // 푸터
  organizer: "(사)한국예술가곡총연합회",

  // 앱 제작 지원
  sponsors: [
    {
      name: "(주)아트컴퍼니본",
      url: "https://www.bon-art.kr",
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
