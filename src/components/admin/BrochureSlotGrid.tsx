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
            className="border-line group relative flex flex-col rounded-lg border bg-white p-1.5"
            style={{ borderWidth: "0.5px" }}
            data-testid={`brochure-slot-${padded}`}
          >
            <div className="bg-cream-200 aspect-[4/5.5] w-full overflow-hidden rounded">
              {slot.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slot.url}
                  alt={`브로셔 ${padded} 미리보기`}
                  className="block h-full w-full object-cover"
                  data-testid={`brochure-slot-img-${padded}`}
                />
              ) : (
                <p className="text-muted-light flex h-full items-center justify-center text-[11px] font-medium tracking-[0.2em] uppercase">
                  empty
                </p>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="text-gold text-[10px] font-medium tracking-[0.3em]">
                {padded}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputs.current[i]?.click()}
                className="text-muted hover:text-ink text-[11px] font-medium tracking-[-0.01em] disabled:opacity-40"
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
