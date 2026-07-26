import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthHashRedirect } from "@/components/AuthHashRedirect";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://compxorbit.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CompX Orbit Studio — Creative Control Center",
    template: "%s · CompX Orbit Studio",
  },
  description:
    "Production tools, captions, shape utilities and your asset library in one fast panel for After Effects and Premiere Pro, with secure device licensing.",
  keywords: [
    "After Effects extension",
    "Premiere Pro extension",
    "motion design tools",
    "CompX Orbit",
    "CEP panel",
  ],
  applicationName: "CompX Orbit Studio",
  authors: [{ name: "CompX" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CompX Orbit Studio",
    title: "CompX Orbit Studio — Creative Control Center",
    description:
      "One panel for production tools, captions, shapes and assets in After Effects and Premiere Pro.",
    images: [
      {
        url: "/screens/studio.png",
        width: 1200,
        height: 630,
        alt: "The CompX Orbit Studio panel running in After Effects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompX Orbit Studio — Creative Control Center",
    description:
      "One panel for production tools, captions, shapes and assets in After Effects and Premiere Pro.",
    images: ["/screens/studio.png"],
  },
  icons: {
    icon: "/compx-mark.png",
    apple: "/compx-mark.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050806",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CompX Orbit Studio",
  applicationCategory: "DesignApplication",
  operatingSystem: "Windows, macOS",
  description:
    "An extension panel for Adobe After Effects and Premiere Pro that brings production tools, captions, shape utilities and asset libraries into one place.",
  url: SITE_URL,
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthHashRedirect />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
