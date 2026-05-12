"use client";

import { type FC, useState } from "react";

interface InvitationVideoProps {
  videoId: string;
  caption?: string;
  footText?: string;
}

/**
 * Light-theme video card. Thumbnail with caption + circular play button +
 * footer text. Swaps to YouTube iframe on click. Iframe is intentionally NOT
 * in the initial DOM (LCP).
 */
const InvitationVideo: FC<InvitationVideoProps> = ({
  videoId,
  caption = "미리보기",
  footText = "공연의 첫 인사를 만나보세요",
}) => {
  const [playing, setPlaying] = useState(false);

  const thumbMax = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const thumbHq = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embedSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;

  return (
    <section className="pt-8 pb-7" data-testid="invitation-video">
      <div className="bg-ink relative aspect-video overflow-hidden rounded-[12px]">
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
            aria-label={`클릭하여 초대 영상 재생 — ${footText}`}
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
              className="block h-full w-full object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.02] group-hover:brightness-90"
              data-testid="video-thumb-img"
            />
            {/* gentle bottom shade */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(10,10,12,0.55)_100%)]"
            />

            {/* top caption */}
            <span className="absolute top-4 left-[18px] text-[13px] text-white/75">
              {caption}
            </span>

            {/* central play button */}
            <span
              aria-hidden
              className="bg-paper text-ink animate-pulse-gold absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              <i className="ti ti-player-play ml-[3px] text-[26px]" />
            </span>

            {/* bottom footer */}
            <span className="absolute right-[18px] bottom-4 left-[18px] flex items-end justify-between">
              <span className="font-serif-ko text-[14px] text-white/90">
                {footText}
              </span>
              <i
                aria-hidden
                className="ti ti-arrow-right text-[16px] text-white/75"
              />
            </span>
          </button>
        )}
      </div>
    </section>
  );
};

export default InvitationVideo;
