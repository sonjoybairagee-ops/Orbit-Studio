import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthHashRedirect } from "@/components/AuthHashRedirect";
import "./globals.css";
import "./studio-landing.css";
import "./dashboard.css";
import "./orbit-tools.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://compxorbit.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CompX Orbit — Creative Control Center & 100+ Free Online Creator Tools",
    template: "%s · CompX Orbit",
  },
  description:
    "Free online creator tools suite & professional Adobe After Effects/Premiere Pro panel. Download 4K videos, generate viral AI animated captions, upscale images to 4K with Real-ESRGAN, edit PDFs, and convert multimedia.",
  keywords: [
    "CompX Orbit",
    "free online creator tools",
    "video editing tools",
    "ai auto captions generator",
    "submagic alternative free",
    "animated subtitles for reels",
    "4k video downloader",
    "youtube video downloader",
    "facebook video downloader",
    "instagram reel downloader",
    "tiktok downloader without watermark",
    "real-esrgan online free",
    "ai image upscaler 4k",
    "waifu2x online upscaler",
    "pdf tools free",
    "audio converter online",
    "After Effects extension",
    "Premiere Pro extension",
    "motion design tools",
    "CEP panel",
  ],
  applicationName: "CompX Orbit Studio",
  authors: [{ name: "CompX Orbit" }],
  creator: "CompX Orbit Team",
  publisher: "CompX Orbit",
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CompX Orbit",
    title: "CompX Orbit — Creative Control Center & Free Creator Tools",
    description:
      "100+ free online creator tools (4K video downloaders, AI captions, Real-ESRGAN upscaler) and creative control center for After Effects & Premiere Pro.",
    images: [
      {
        url: "/screens/studio.png",
        width: 1200,
        height: 630,
        alt: "CompX Orbit Studio & Online Creator Tools Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CompX Orbit — Creative Control Center & Free Creator Tools",
    description:
      "100+ free online creator tools and After Effects/Premiere Pro extension panel.",
    images: ["/screens/studio.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "1024x1024", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#050806",
  width: "device-width",
  initialScale: 1,
};

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CompX Orbit",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      "All-in-one creator suite offering professional Adobe After Effects & Premiere Pro extension panels and 100+ free browser-based multimedia tools.",
    sameAs: [
      "https://facebook.com/compxorbit",
      "https://youtube.com/@compxorbit",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CompX Orbit",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
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
  },
];

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3118671109259877";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3118671109259877" />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1433903445352253');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1433903445352253&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <AuthHashRedirect />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        {schemas.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </body>
    </html>
  );
}
