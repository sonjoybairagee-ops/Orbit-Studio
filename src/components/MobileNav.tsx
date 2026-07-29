"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/#product-tour", "Product tour"],
  ["/#features", "Features"],
  ["/tutorials", "Tutorials"],
  ["/pricing", "Pricing"],
  ["/#install", "How it works"],
];

export function MobileNav({
  signedIn,
  isAdmin,
}: {
  signedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Lock background scrolling while the sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white"
      >
        <span className="relative block h-[14px] w-[18px]">
          <span
            className={`absolute left-0 h-[2px] w-full bg-current transition-all ${
              open ? "top-[6px] rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-[6px] h-[2px] w-full bg-current transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 h-[2px] w-full bg-current transition-all ${
              open ? "top-[6px] -rotate-45" : "top-[12px]"
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <nav
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-[320px] flex-col gap-1 border-l border-white/10 bg-[#0b110d] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="eyebrow mb-4">Menu</p>

            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-3 text-base font-bold text-[#cfd8d2] hover:bg-white/[.05] hover:text-white"
              >
                {label}
              </Link>
            ))}

            <div className="my-4 h-px bg-white/10" />

            {signedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="btn-secondary w-full">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="btn-primary mt-2 w-full">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary w-full">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary mt-2 w-full">
                  Get Orbit
                </Link>
              </>
            )}

            <div className="mt-auto flex flex-wrap gap-4 pt-6 text-xs text-[#8da096]">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refund">Refunds</Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

export default MobileNav;
