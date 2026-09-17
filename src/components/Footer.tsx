"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  // Hide footer on admin and dashboard pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="mt-10 border-t border-white/[.06]">
      <div className="shell grid gap-8 py-10 sm:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <b>
            CompX <span className="text-[#45c66d]">Orbit</span>
          </b>
          <p className="muted mt-2 max-w-sm text-sm">
            Extension panels for After Effects and Premiere Pro, with secure
            device licensing and lifetime access to your version.
          </p>
        </div>
        <div className="text-sm">
          <b className="block text-xs uppercase tracking-wider text-[#8da096]">
            Product
          </b>
          <div className="muted mt-3 grid gap-2">
            <Link href="/pricing">Pricing</Link>
            <Link href="/#features">Features</Link>
            <Link href="/contact">Contact Support</Link>
            <a
              href="https://wa.me/8801922577297?text=Hi%2C%20I%20need%20support%20for%20CompX%20Orbit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline flex items-center gap-1 font-medium"
            >
              <span>💬 WhatsApp Support</span>
            </a>
          </div>
        </div>
        <div className="text-sm">
          <b className="block text-xs uppercase tracking-wider text-[#8da096]">
            Account
          </b>
          <div className="muted mt-3 grid gap-2">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </div>
        <div className="text-sm">
          <b className="block text-xs uppercase tracking-wider text-[#8da096]">
            Legal
          </b>
          <div className="muted mt-3 grid gap-2">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refunds</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[.05] py-5 text-center text-xs text-[#8da096]">
        © {new Date().getFullYear()} CompX Orbit. Built for motion designers.
      </div>
    </footer>
  );
}
