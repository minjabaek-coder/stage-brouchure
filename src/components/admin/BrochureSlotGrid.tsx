"use client";

import { type FC, useRef } from "react";

export interface BrochureSlot {
  index: number; // 1..8
  url: string | null; // current asset URL
}

interface BrochureSlotGridProps {
  slots: BrochureSlot[];
  /** Called when the user picks a file for the single-slot replacement. */
  onReplace: (index: number, file: File) => void;
  /** Disable interactions while a parent upload is in flight. */
  disabled?: boolean;
}

/**
 * 8 brochure pages laid out as a 4×2 grid (mobile collapses to 2 cols).
 * Each slot shows the current image + page number + a "교체" picker that
 * triggers `onReplace(index, file)` for single-slot updates (FR-A04).
 */
const BrochureSlotGrid: FC<BrochureSlotGridProps> = ({
  slots,
  onReplace,
  disabled,
}) => {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      data-testid="brochure-slot-grid"
    >
      {slots.map((slot, i) => {
        const padded = String(slot.index).padStart(2, "0");
        return (
          <div
            key={slot.index}
            className="border-gold/15 group relative flex flex-col rounded-[2px] border bg-[rgba(244,237,224,0.04)] p-1.5"
            data-testid={`brochure-slot-${padded}`}
          >
            <div className="aspect-[4/5.5] w-full overflow-hidden bg-[rgba(26,22,18,0.55)]">
              {slot.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slot.url}
                  alt={`브로셔 ${padded} 미리보기`}
                  className="block h-full w-full object-cover"
                  data-testid={`brochure-slot-img-${padded}`}
                />
              ) : (
                <p className="font-serif-en text-paper/35 flex h-full items-center justify-center text-[11px] tracking-[0.2em] italic">
                  empty
                </p>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="font-serif-en text-gold text-[10px] tracking-[0.3em] italic">
                {padded}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputs.current[i]?.click()}
                className="font-serif-ko text-paper/70 hover:text-gold text-[10px] tracking-[0.2em] uppercase disabled:opacity-40"
                data-testid={`brochure-slot-replace-${padded}`}
              >
                교체
              </button>
            </div>
            <input
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              className="sr-only"
              data-testid={`brochure-slot-input-${padded}`}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onReplace(slot.index, f);
                // Reset so the same file can be re-picked
                e.currentTarget.value = "";
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default BrochureSlotGrid;
