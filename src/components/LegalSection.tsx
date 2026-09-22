import type { ReactNode } from "react";

export default function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
