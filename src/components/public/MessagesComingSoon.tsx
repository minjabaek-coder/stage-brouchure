import { type FC } from "react";

interface MessagesComingSoonProps {
  icon: string;
  title: string;
  description: string;
  testid: string;
}

/**
 * Placeholder panel shown inside MessagesTabs for the review/photos tabs
 * until the post-concert content lands. Visual tone matches MessageItem
 * cards (paper bg + soft line) so the tab transition stays cohesive.
 */
const MessagesComingSoon: FC<MessagesComingSoonProps> = ({
  icon,
  title,
  description,
  testid,
}) => (
  <div
    className="border-line bg-paper rounded-xl px-6 py-14 text-center"
    style={{ borderWidth: "0.5px" }}
    data-testid={testid}
  >
    <div className="text-gold/70 mb-3 flex justify-center">
      <i className={`ti ${icon} text-[36px]`} aria-hidden />
    </div>
    <h3 className="font-serif-ko text-ink text-[15px] font-medium tracking-[-0.01em]">
      {title}
    </h3>
    <p className="text-muted mt-2 text-[13px] leading-[1.7]">{description}</p>
  </div>
);

export default MessagesComingSoon;
