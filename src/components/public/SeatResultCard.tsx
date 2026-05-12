import { type FC } from "react";

interface SeatResultCardProps {
  name: string;
  phoneLast4: string;
  seat: string;
  note?: string | null;
}

/** PRD §2.2.5 — phone is masked to ****-****-XXXX. */
function maskPhone(last4: string): string {
  return `****-****-${last4}`;
}

/** Light-theme seat result card. */
const SeatResultCard: FC<SeatResultCardProps> = ({
  name,
  phoneLast4,
  seat,
  note,
}) => (
  <article
    className="border-gold/30 rounded-2xl border bg-[linear-gradient(180deg,#FBF6EB_0%,#F5EFE2_100%)] px-6 py-7 text-center shadow-[0_2px_16px_rgba(92,26,27,0.06)]"
    style={{ borderWidth: "0.5px" }}
    data-testid="seat-result-card"
  >
    <p className="text-gold mb-2 text-[12px] font-medium tracking-[0.3em] uppercase">
      Your Seat
    </p>
    <p
      className="font-serif-ko text-ink mb-4 text-[22px] font-medium tracking-[-0.01em]"
      data-testid="result-name"
    >
      {name} 님
    </p>
    <div aria-hidden className="bg-gold mx-auto mb-4 h-px w-10" />
    <p className="text-muted mb-1.5 text-[12px] tracking-[0.2em] uppercase">
      Seat
    </p>
    <p
      className="font-serif-ko text-burgundy text-[56px] leading-none font-semibold tracking-[-0.02em]"
      data-testid="result-seat"
    >
      {seat}
    </p>
    {note && (
      <p className="text-muted font-serif-ko mt-3 text-[13px] tracking-[0.05em]">
        {note}
      </p>
    )}
    <p
      className="text-muted-light mt-4 text-[12px] tracking-[0.18em]"
      data-testid="result-phone-mask"
    >
      {maskPhone(phoneLast4)}
    </p>
  </article>
);

export default SeatResultCard;
