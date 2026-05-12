import { type ReactNode } from "react";

interface StageProps {
  children: ReactNode;
  className?: string;
  /** Disables horizontal padding so children (hero, video, etc.) can bleed
   *  to the stage edge and manage their own gutters — matches the new HTML
   *  where individual sections control their own 26px gutters. */
  edgeToEdge?: boolean;
}

/**
 * Stage = single-column container all public pages share. Light theme uses
 * a 480px max-width white card centered on the canvas (`bg-canvas` on body).
 * The card has a subtle hairline border to read as a "page" on wider screens.
 */
export default function Stage({ children, className, edgeToEdge }: StageProps) {
  return (
    <main
      className={[
        "bg-paper relative z-10 mx-auto w-full max-w-[480px] min-h-screen",
        edgeToEdge ? "" : "px-[26px] pt-8 pb-12",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
}
