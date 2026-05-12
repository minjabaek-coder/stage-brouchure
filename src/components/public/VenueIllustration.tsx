import { type FC } from "react";

interface VenueIllustrationProps {
  /** 지하철 호선 라벨 (예: "9호선" / "2호선") */
  line: string;
  /** 좌측 비교 정거장 — 비우면 도착 정거장만 단독으로 표시 */
  prevStation?: string;
  /** 우측 도착(강조) 정거장 — burgundy 배경 */
  destStation: string;
  /** 출구 (예: "4번 출구") — 숫자만 추출해서 핀에 표기 */
  exit: string;
  /** 도보 거리 — 우측 곡선 옆 칩 */
  walkDistance: string;
  /** 공연장명 — 하단 다크 라벨 */
  venueName: string;
}

/**
 * 송파문화예술회관 같은 단일 행사장의 약도 SVG. 노선 라인 + 정거장 두 개 +
 * 출구 핀 + 도보 거리 칩 + 음악 아이콘 핀으로 구성. docs/assets/
 * 어울림콘서트_260512_map.html 의 venue-card SVG (viewBox 600×620) 를 React
 * 컴포넌트로 분리하고 동적 텍스트만 prop 으로 받도록 재작성한 것.
 */
const VenueIllustration: FC<VenueIllustrationProps> = ({
  line,
  prevStation,
  destStation,
  exit,
  walkDistance,
  venueName,
}) => {
  // "4번 출구" → "4" 추출. 비숫자 라벨이면 그대로 첫 글자 사용.
  const exitDigit = exit.match(/\d+/)?.[0] ?? exit.slice(0, 1);
  // "9호선" → "9". 한국 노선은 숫자/공항 식이므로 첫 토큰만.
  const lineDigit = line.match(/\d+|공항|신분당|중앙|경의|수인|분당|경춘|에버라인/)?.[0] ?? line;
  const lineLabel = `지하철 ${line}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 620"
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      role="img"
      aria-label={`${venueName} 약도 — ${lineLabel} ${destStation} ${exit}, ${walkDistance}`}
      data-testid="venue-illustration"
    >
      <defs>
        <linearGradient id="vbg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBF6EB" />
          <stop offset="100%" stopColor="#F5EFE2" />
        </linearGradient>
        <filter id="vshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="ob" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="600" height="620" fill="url(#vbg)" />

      {/* 배경 그리드 */}
      <g stroke="#E8DFC8" strokeWidth="1" opacity="0.4">
        <line x1="0" y1="120" x2="600" y2="120" />
        <line x1="0" y1="290" x2="600" y2="290" />
        <line x1="0" y1="460" x2="600" y2="460" />
        <line x1="150" y1="0" x2="150" y2="620" />
        <line x1="450" y1="0" x2="450" y2="620" />
      </g>

      {/* 노선 라인 + 라벨 */}
      <line
        x1="0"
        y1="60"
        x2="600"
        y2="60"
        stroke="#D9A847"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <text
        x="300"
        y="40"
        fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
        fontSize="20"
        fill="#A87E1E"
        fontWeight="700"
        textAnchor="middle"
      >
        {lineLabel}
      </text>

      {/* 좌측 (이전) 정거장 — prevStation 이 있을 때만 */}
      {prevStation && (
        <g data-testid="venue-prev-station">
          <circle cx="140" cy="60" r="30" fill="#FFFFFF" stroke="#D9A847" strokeWidth="4" />
          <text
            x="140"
            y="70"
            fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
            fontSize="24"
            fontWeight="700"
            fill="#1A1410"
            textAnchor="middle"
          >
            {lineDigit}
          </text>
          <rect
            x="65"
            y="105"
            width="150"
            height="42"
            rx="21"
            fill="#FFFFFF"
            stroke="#D4C8A8"
            strokeWidth="1.5"
            filter="url(#vshadow)"
          />
          <text
            x="140"
            y="134"
            fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
            fontSize="22"
            fontWeight="700"
            fill="#1A1410"
            textAnchor="middle"
          >
            {prevStation}
          </text>
        </g>
      )}

      {/* 우측 (도착) 정거장 — burgundy 강조 */}
      <g data-testid="venue-dest-station">
        <circle cx="460" cy="60" r="30" fill="#FFFFFF" stroke="#D9A847" strokeWidth="4" />
        <text
          x="460"
          y="70"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="24"
          fontWeight="700"
          fill="#1A1410"
          textAnchor="middle"
        >
          {lineDigit}
        </text>
        <rect
          x="350"
          y="105"
          width="220"
          height="42"
          rx="21"
          fill="#5C1A1B"
          filter="url(#vshadow)"
        />
        <text
          x="460"
          y="134"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="22"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          {destStation}
        </text>

        {/* 출구 표시 */}
        <circle cx="460" cy="198" r="26" fill="#5C1A1B" />
        <text
          x="460"
          y="208"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="22"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          {exitDigit}
        </text>
        <text
          x="460"
          y="252"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="18"
          fill="#5C1A1B"
          fontWeight="700"
          textAnchor="middle"
        >
          {exit}
        </text>
      </g>

      {/* 도착 정거장 → 공연장 점선 경로 */}
      <path
        d="M 460 270 Q 420 320, 380 360 T 320 420"
        fill="none"
        stroke="#5C1A1B"
        strokeWidth="5"
        strokeDasharray="10 8"
        strokeLinecap="round"
      />
      {/* 도보 거리 칩 */}
      <g transform="translate(420, 330)">
        <rect
          x="-62"
          y="-22"
          width="124"
          height="44"
          rx="22"
          fill="#FFFFFF"
          stroke="#5C1A1B"
          strokeWidth="2"
          filter="url(#vshadow)"
        />
        <text
          x="0"
          y="8"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="#5C1A1B"
          textAnchor="middle"
          data-testid="venue-walk-distance"
        >
          {walkDistance}
        </text>
      </g>

      {/* 이전 정거장 → 공연장 흐릿한 보조 곡선 (prevStation 있을 때만) */}
      {prevStation && (
        <path
          d="M 140 148 Q 180 260, 240 350 T 310 420"
          fill="none"
          stroke="#B0A080"
          strokeWidth="3"
          strokeDasharray="7 7"
          strokeLinecap="round"
          opacity="0.5"
        />
      )}

      {/* 공연장 핀 (음표 아이콘 포함) */}
      <g transform="translate(300, 450)">
        <ellipse cx="0" cy="115" rx="60" ry="9" fill="#000" opacity="0.12" />
        <path
          d="M 0 -70 C -45 -70, -75 -40, -75 0 C -75 50, 0 110, 0 110 C 0 110, 75 50, 75 0 C 75 -40, 45 -70, 0 -70 Z"
          fill="#5C1A1B"
          filter="url(#vshadow)"
        />
        <circle cx="0" cy="-5" r="36" fill="#FFFFFF" />
        <g transform="translate(-2, -5)" fill="#5C1A1B">
          <circle cx="-10" cy="10" r="5.5" />
          <circle cx="10" cy="7" r="5.5" />
          <rect x="-6.5" y="-13" width="3.2" height="23" />
          <rect x="13" y="-16" width="3.2" height="23" />
          <path d="M -6.5 -13 L 16 -16 L 16 -10 L -6.5 -7 Z" />
        </g>
      </g>

      {/* 공연장명 라벨 */}
      <g transform="translate(300, 590)">
        <rect x="-180" y="-20" width="360" height="40" rx="20" fill="#0A0A0A" />
        <text
          x="0"
          y="7"
          fontFamily="'Noto Sans KR', 'NanumGothic', sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="#FFFFFF"
          textAnchor="middle"
          data-testid="venue-name-label"
        >
          {venueName}
        </text>
      </g>
    </svg>
  );
};

export default VenueIllustration;
