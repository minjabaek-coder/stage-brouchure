import Image from "next/image";
import { type FC } from "react";
import { EVENT } from "@/lib/event";

/**
 * Home footer = presented (주최) + biz-card (앱 제작 지원) + inquiry (문의) +
 * copyright. Source: docs/assets/어울림콘서트_260512.html footer.
 */
const HomeFooter: FC = () => (
  <footer
    className="border-line border-t"
    style={{ borderTopWidth: "0.5px" }}
    data-testid="home-footer"
  >
    {/* 주최 */}
    <div className="px-[26px] pt-9 pb-7 text-center">
      <div className="bg-ink mx-auto mb-[18px] h-px w-7" />
      <p className="text-muted mb-2 text-[14px] font-medium">주최</p>
      <p className="text-ink text-[18px] font-medium tracking-[-0.01em]">
        {EVENT.organizer}
      </p>
    </div>

    {/* 앱 제작 지원 */}
    <div
      className="border-line-strong bg-paper mx-[26px] mb-7 rounded-xl px-[18px] py-4"
      style={{ borderWidth: "0.5px" }}
      data-testid="biz-card"
    >
      <p className="text-muted-light mb-3.5 text-[12px] font-medium tracking-[0.02em]">
        앱 제작 지원
      </p>
      <div className="grid grid-cols-2 gap-3.5">
        {EVENT.sponsors.map((s, idx) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener"
            className={[
              "flex min-w-0 items-center gap-2.5 transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-70",
              idx > 0 ? "border-line pl-3.5 [border-left-width:0.5px]" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-testid={`biz-${s.tone}`}
          >
            <span
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md",
                s.tone === "burgundy"
                  ? "bg-burgundy"
                  : "bg-paper border-line border p-1",
              ].join(" ")}
              style={s.tone === "paper" ? { borderWidth: "0.5px" } : undefined}
            >
              <Image
                src={s.logo}
                alt={s.name}
                width={72}
                height={72}
                className={
                  s.tone === "burgundy"
                    ? "h-full w-full object-cover"
                    : "max-h-full max-w-full object-contain"
                }
              />
            </span>
            <span className="text-ink min-w-0 overflow-hidden text-[14px] font-medium tracking-[-0.02em] text-ellipsis whitespace-nowrap">
              {s.name}
            </span>
          </a>
        ))}
      </div>
    </div>

    {/* 문의 */}
    <div
      className="bg-surface mx-[26px] mb-7 rounded-[14px] px-6 py-[22px]"
      data-testid="inquiry-card"
    >
      <p className="font-serif-ko text-ink mb-2 text-[18px] font-medium tracking-[-0.01em]">
        {EVENT.inquiryTitle}
      </p>
      <p className="mb-3.5 text-[14px] leading-[1.6] text-[#555]">
        {EVENT.inquiryDesc}
      </p>
      <p
        className="border-line text-ink pt-3.5 text-[14px] leading-[1.6]"
        style={{ borderTopWidth: "0.5px" }}
      >
        연락처:{" "}
        <a
          href={`tel:${EVENT.inquiryPhone.replace(/-/g, "")}`}
          className="text-ink font-medium tracking-[-0.01em] hover:underline"
        >
          {EVENT.inquiryPhone}
        </a>
        <span className="text-muted-light mx-1.5">/</span>
        <a
          href={`mailto:${EVENT.inquiryEmail}`}
          className="text-ink font-medium tracking-[-0.01em] hover:underline"
        >
          {EVENT.inquiryEmail}
        </a>
      </p>
    </div>

    {/* 카피라이트 */}
    <div
      className="border-line text-muted-light px-[26px] pt-5 pb-9 text-center text-[13px]"
      style={{ borderTopWidth: "0.5px" }}
      data-testid="home-copyright"
    >
      {EVENT.copyright}
    </div>
  </footer>
);

export default HomeFooter;
