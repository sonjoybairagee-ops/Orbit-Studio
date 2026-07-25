import Link from "next/link";

export const LEGAL_UPDATED = "25 July 2026";

const TABS = [
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
  ["/refund", "Refunds"],
];

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell py-14">
      <div className="mx-auto max-w-[780px]">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
        <p className="muted mt-3 text-sm">Last updated {updated}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-[#aab0bd] hover:border-[#45c66d]/40 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="legal-body mt-10">{children}</div>

        <div className="card mt-12 p-6">
          <p className="label">Still unsure?</p>
          <p className="muted mt-2 text-sm leading-7">
            Write to us at{" "}
            <a
              href="mailto:support@compxorbit.com"
              className="font-bold text-[#45c66d]"
            >
              support@compxorbit.com
            </a>{" "}
            and a human will answer.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LegalPage;
