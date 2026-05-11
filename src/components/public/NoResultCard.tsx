import { type FC } from "react";

/**
 * Reference HTML lines 580-599, 1505-1509 — dashed-border card shown when the
 * search misses. Per PRD §2.2.5 the message is always identical regardless of
 * which field mismatched, so the user can't probe whether a name exists.
 */
const NoResultCard: FC = () => (
  <div
    className="font-serif-ko text-paper/55 animate-fade-up rounded-[2px] border border-dashed border-[rgba(197,165,114,0.3)] px-5 py-8 text-center text-sm leading-[1.7]"
    data-testid="no-result-card"
  >
    <p className="font-serif-en text-gold mb-1.5 block text-[13px] tracking-[0.2em] italic">
      — Not Found —
    </p>
    일치하는 정보를 찾을 수 없습니다.
    <br />
    안내데스크에 문의해 주십시오.
  </div>
);

export default NoResultCard;
