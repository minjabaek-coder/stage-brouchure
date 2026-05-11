/**
 * 단일 행사 상수. PRD §1 + 07-implementation-plan.md S02 의 값 그대로.
 * 본 프로젝트는 단발성 행사 1회 전제이므로 멀티테넌트 Event 엔터티를 만들지 않고
 * 이 모듈에서 하드코딩한다 (CLAUDE.md "도메인 핵심").
 */
export const EVENT = {
  titleKo: "어울림 콘서트",
  titleKoHighlight: "콘서트", // title-ko 의 강조(gold gradient) 부분
  titleEn: "Harmony Concert",
  preTitle: "협력단체와 함께하는 앙상블의 향연",
  subtitleEn: "A Symphony of Souls in Concord",
  date: "2026 · 5 · 26",
  venue: "송파문화예술회관",
  time: "PM 7:30",
  organizer: "(사)한국예술가곡총연합회",
  welcomeEn: "WELCOME TO THE EVENING",
} as const;

export type EventInfo = typeof EVENT;
