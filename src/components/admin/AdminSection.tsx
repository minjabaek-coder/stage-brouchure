import { type FC, type ReactNode } from "react";

interface AdminSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
  testId?: string;
}

/** Light-theme admin section wrapper (white card + hairline border). */
const AdminSection: FC<AdminSectionProps> = ({
  title,
  description,
  eyebrow,
  children,
  testId,
}) => (
  <section
    className="border-line bg-paper mt-6 rounded-xl border px-5 py-6"
    style={{ borderWidth: "0.5px" }}
    data-testid={testId}
  >
    {eyebrow && (
      <p className="text-gold mb-1 text-[11px] font-medium tracking-[0.3em] uppercase">
        {eyebrow}
      </p>
    )}
    <h2 className="font-serif-ko text-ink text-[18px] font-medium tracking-[-0.01em]">
      {title}
    </h2>
    {description && (
      <p className="text-muted mt-2 text-[13px] leading-[1.6]">
        {description}
      </p>
    )}
    {children && <div className="mt-4">{children}</div>}
  </section>
);

export default AdminSection;
