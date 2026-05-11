import { type FC } from "react";

interface SeatResultCardProps {
  name: string;
  phoneLast4: string;
  seat: string;
  note?: string | null;
}

/** PRD §2.2.5 — 전화는 마스킹된 ****-****-XXXX 형식으로만 표시. */
function maskPhone(last4: string): string {
  return `****-****-${last4}`;
}

/**
 * Reference HTML lines 521-578, 1488-1497 — "Your Seat" result card with
 * Cormorant italic eyebrow, name, gold divider, gradient seat code, and an
 * optional note. v1.1 adds the masked phone display.
 */
const SeatResultCard: FC<SeatResultCardProps> = ({
  name,
  phoneLast4,
  seat,
  note,
}) => (
  <article
    className="border-gold/20 animate-fade-up relative rounded-[2px] border bg-[rgba(26,22,18,0.55)] px-6 py-8 text-center shadow-[0_10px_40px_-10px_rgba(197,165,114,0.2)]"
    data-testid="seat-result-card"
  >
    <p className="font-serif-en text-gold mb-2 text-[13px] tracking-[0.3em] uppercase italic">
      — Your Seat —
    </p>
    <p
      className="font-serif-ko text-paper mb-4 text-[24px] font-normal tracking-[0.1em]"
      data-testid="result-name"
    >
      {name} 님
    </p>
    <div aria-hidden className="bg-gold mx-auto mb-4 h-px w-10" />
    <p className="font-serif-en text-paper/60 mb-1.5 text-[14px] tracking-[0.2em] uppercase">
      Seat
    </p>
    <p
      className="font-serif-en from-gold-hi to-gold mb-1.5 bg-gradient-to-b bg-clip-text text-[64px] leading-none font-light text-transparent italic"
      data-testid="result-seat"
    >
      {seat}
    </p>
    {note && (
      <p className="font-serif-ko text-paper/70 mt-2 text-[13px] tracking-[0.15em]">
        {note}
      </p>
    )}
    <p
      className="font-serif-en text-paper/40 mt-4 text-[12px] tracking-[0.18em]"
      data-testid="result-phone-mask"
    >
      {maskPhone(phoneLast4)}
    </p>
  </article>
);

export default SeatResultCard;
