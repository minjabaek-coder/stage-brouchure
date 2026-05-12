import Image from "next/image";
import { type FC } from "react";
import { EVENT } from "@/lib/event";

/**
 * Light-theme hero — gradient cream wash + faded ghost wordmark + logo PNG.
 * Source: docs/assets/어울림콘서트_260512.html .hero / .hero-content.
 */
const HomeHeader: FC = () => (
  <section
    className="relative overflow-hidden pt-14 pb-6"
    style={{
      background:
        "linear-gradient(180deg, #F8F3E9 0%, #F5EFE2 60%, #FFFFFF 100%)",
    }}
    data-testid="home-header"
  >
    <span
      aria-hidden
      className="bg-gold absolute top-6 left-[26px] h-px w-9"
    />
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 -right-7 -translate-y-1/2 font-serif-ko font-semibold whitespace-nowrap select-none"
      style={{
        fontSize: "180px",
        lineHeight: 1,
        letterSpacing: "-0.05em",
        color: "rgba(92, 26, 27, 0.04)",
      }}
    >
      어울림
    </span>

    <div className="relative z-10 px-[26px]">
      <p className="font-serif-ko mt-4 mb-5 text-[15px] font-normal tracking-[0.02em] text-[#6B5A3F]">
        {EVENT.preTitle}
      </p>

      <h1 className="mt-1 mb-6 leading-none">
        <Image
          src="/hero-title.png"
          alt={EVENT.titleKo}
          width={755}
          height={315}
          priority
          className="block h-auto w-full max-w-[360px]"
          data-testid="hero-title"
        />
      </h1>

      <div
        className="font-serif-ko mt-3.5 flex items-center gap-2.5 text-[14px] italic"
        style={{ color: "#B89968" }}
      >
        <span aria-hidden className="bg-gold h-px w-6 shrink-0" />
        {EVENT.ornament}
        <span aria-hidden className="bg-gold h-px flex-1" />
      </div>
    </div>
  </section>
);

export default HomeHeader;
