import Link from "next/link";
import Image from "next/image";
import { getProfile } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { MobileNav } from "@/components/MobileNav";

const NAV = [
  ["/#product-tour", "Product tour"],
  ["/#features", "Features"],
  ["/pricing", "Pricing"],
  ["/#install", "How it works"],
];

export async function Header() {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";

  return (
    <header className="orbit-site-header">
      <div className="shell orbit-header-inner">
        <Link href="/" className="orbit-logo" aria-label="CompX Orbit home">
          <span>
            <Image src="/compx-mark.png" alt="" width={44} height={28} priority />
          </span>
          <div>
            <b>CompX Orbit</b>
            <small>Creative Control Center</small>
          </div>
        </Link>

        <nav className="desktop-nav orbit-nav" aria-label="Main navigation">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="orbit-header-actions">
          <div className="desktop-actions">
            {profile ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="orbit-header-link">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="btn-primary orbit-header-cta">
                  Dashboard
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="orbit-header-link">
                  Sign in
                </Link>
                <Link href="/pricing" className="btn-primary orbit-header-cta">
                  Get Orbit
                </Link>
              </>
            )}
          </div>
          <MobileNav signedIn={Boolean(profile)} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

export default Header;
