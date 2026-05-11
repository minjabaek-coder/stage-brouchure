"use client";

import { type FC, useState } from "react";

interface InvitationVideoProps {
  /** YouTube video ID (defaults to EVENT.videoYoutubeId via the parent). */
  videoId: string;
}

/**
 * Reference HTML lines 150-266, 943-963 — clickable thumbnail that swaps to a
 * live YouTube iframe on first interaction. Iframe is intentionally NOT in the
 * initial DOM so it does not regress LCP (PRD NFR-03 / FR-G02 spec).
 *
 * Maxres thumbnail is preferred; falls back to hqdefault if YouTube has not
 * generated maxres for the video.
 */
const InvitationVideo: FC<InvitationVideoProps> = ({ videoId }) => {
  const [playing, setPlaying] = useState(false);

  const thumbMax = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbHq = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

  return (
    <section
      className="animate-fade-up mt-8"
      style={{ animationDelay: "0.15s" }}
      data-testid="invitation-video"
    >
      <div className="border-gold relative aspect-video overflow-hidden rounded-[2px] border bg-black shadow-[0_20px_50px_-15px_rgba(197,165,114,0.25),0_0_0_1px_rgba(197,165,114,0.1)]">
        {/* Top-left + bottom-right gold corner accents (HTML lines 165-172) */}
        <span
          aria-hidden
          className="border-gold pointer-events-none absolute top-[-1px] left-[-1px] z-[3] h-[18px] w-[18px] border-t border-l"
        />
        <span
          aria-hidden
          className="border-gold pointer-events-none absolute right-[-1px] bottom-[-1px] z-[3] h-[18px] w-[18px] border-r border-b"
        />

        {playing ? (
          <iframe
            src={embedSrc}
            title="어울림콘서트 초대 영상"
            className="block h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="클릭하여 초대 영상 재생"
            data-testid="video-thumb"
            className="group relative block h-full w-full cursor-pointer overflow-hidden p-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbMax}
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith("hqdefault.jpg")) img.src = thumbHq;
              }}
              alt="어울림콘서트 초대 영상 썸네일"
              className="block h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.04] group-hover:brightness-[0.85]"
              data-testid="video-thumb-img"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,12,0.2)_0%,rgba(10,10,12,0.55)_100%),linear-gradient(180deg,transparent_60%,rgba(10,10,12,0.7)_100%)]"
            />
            <span
              aria-hidden
              className="animate-pulse-gold absolute top-1/2 left-1/2 flex h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(197,165,114,0.95)] text-[#1a1612] shadow-[0_0_0_2px_rgba(197,165,114,0.3),0_0_0_12px_rgba(197,165,114,0.15),0_10px_40px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-[1.08]"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-[5px]"
              >
                <polygon points="7 4 21 12 7 20 7 4" />
              </svg>
            </span>
            <span className="font-serif-en absolute bottom-[18px] left-1/2 -translate-x-1/2 text-[13px] tracking-[0.2em] text-[rgba(244,237,224,0.85)] [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] italic">
              ▸ 클릭하여 재생
            </span>
          </button>
        )}
      </div>

      <p className="font-serif-en mt-3.5 text-center text-[12px] tracking-[0.25em] text-[rgba(244,237,224,0.55)] uppercase italic">
        <span className="text-gold mx-2">✦</span>
        Invitation to the Evening
        <span className="text-gold mx-2">✦</span>
      </p>
    </section>
  );
};

export default InvitationVideo;
