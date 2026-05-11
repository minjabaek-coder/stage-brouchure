import { type FC, type ReactNode } from "react";

interface AdminSectionProps {
  /** Korean section heading (예: "1 · 명단 (CSV)") */
  title: string;
  /** Optional one-line description shown under the title. */
  description?: string;
  /** Roman-numeral / English eyebrow above the title. */
  eyebrow?: string;
  children?: ReactNode;
  /** data-testid for e2e targeting (e.g., "admin-csv-section"). */
  testId?: string;
}

/**
 * Generic titled section wrapper used by /admin. S11–S13 fill the children
 * (CSV upload, seat map upload, brochure upload). For S10 the body is a
 * "준비 중" placeholder so the page already shows its final shape.
 */
const AdminSection: FC<AdminSectionProps> = ({
  title,
  description,
  eyebrow,
  children,
  testId,
}) => (
  <section
    className="border-gold/15 mt-8 rounded-[2px] border bg-[rgba(26,22,18,0.45)] px-5 py-6"
    data-testid={testId}
  >
    {eyebrow && (
      <p className="font-serif-en text-gold mb-1 text-[11px] tracking-[0.4em] uppercase italic">
        {eyebrow}
      </p>
    )}
    <h2 className="font-serif-ko text-paper text-[18px] font-light tracking-[0.15em]">
      {title}
    </h2>
    {description && (
      <p className="font-serif-ko text-paper/55 mt-2 text-[13px] leading-[1.7] tracking-[0.05em]">
        {description}
      </p>
    )}
    {children && <div className="mt-4">{children}</div>}
  </section>
);

export default AdminSection;
