import { type FC } from "react";

/**
 * 검색 실패 카드. PRD §2.2.5 — 메시지는 이름·전화 어느 쪽이 틀려도 동일.
 */
const NoResultCard: FC = () => (
  <div
    className="text-muted rounded-2xl border border-dashed border-[#d4d0c4] bg-white px-5 py-7 text-center text-sm leading-[1.7]"
    data-testid="no-result-card"
  >
    <p className="text-gold mb-1.5 block text-[12px] font-medium tracking-[0.2em] uppercase">
      Not Found
    </p>
    일치하는 정보를 찾을 수 없습니다.
    <br />
    안내데스크에 문의해 주십시오.
  </div>
);

export default NoResultCard;
