import { type ReactNode } from "react";

interface StageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Reference HTML lines 52-58 (.stage) — single-column container that all public
 * pages share. z-index 10 keeps content above the BackgroundLayer noise overlay.
 */
export default function Stage({ children, className }: StageProps) {
  return (
    <main
      className={[
        "relative z-10 mx-auto w-full max-w-[560px] px-6 pt-8 pb-20",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </main>
  );
}
