import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — CompX Orbit Support & Inquiries",
  description:
    "Get in touch with the CompX Orbit team for technical support, license inquiries, feature requests, or creator partnerships.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact CompX Orbit Team",
    description:
      "24/7 creator support, plugin inquiries, and licensing assistance.",
    url: "https://compxorbit.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
