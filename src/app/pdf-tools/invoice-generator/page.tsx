import { Metadata } from "next";
import InvoiceGeneratorTool from "@/components/tools/InvoiceGeneratorTool";
import { FileText, CheckCircle2, HelpCircle, Sparkles, Printer, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create & Export Invoices to PDF Online | CompX Orbit",
  description:
    "Free online Invoice Generator. Create professional invoices with custom logo, billing address, line items, pricing, tax, and discount calculations. Export to print-ready PDF instantly with 100% privacy.",
  keywords: [
    "invoice generator",
    "free invoice maker",
    "invoice to pdf",
    "pdf invoice generator online",
    "create invoice online free",
    "invoice with logo and tax",
    "billing invoice generator",
    "receipt maker pdf",
  ],
  alternates: {
    canonical: "/pdf-tools/invoice-generator",
  },
  openGraph: {
    title: "Free Invoice Generator — Create & Export Invoices to PDF Online",
    description: "Instant in-browser invoice maker with logo, auto-calculated tax, and PDF download.",
    url: "https://compxorbit.com/pdf-tools/invoice-generator",
    type: "website",
  },
};

export default function InvoiceGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Invoice Generator & PDF Exporter",
    url: "https://compxorbit.com/pdf-tools/invoice-generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Client-side Invoice Generator: create professional invoices with logo, customer details, products, auto-calculated tax, and export directly to PDF.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>100% Free · Client-Side PDF Generation</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Invoice Generator & PDF Exporter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#8da194] max-w-2xl mx-auto">
            Design professional commercial invoices with your logo, business details, line item pricing, automatic taxes, and export directly to <b>Print-Ready PDF</b>.
          </p>
        </div>

        {/* Main Interactive Tool Container */}
        <div className="mb-14">
          <InvoiceGeneratorTool />
        </div>

        {/* Feature Highlights Grid */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-8 mb-10 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3cff5f]" />
            <span>Included Features & Professional Standards</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <h3 className="text-sm font-black text-[#3cff5f]">Logo & Branding</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Upload your company or personal logo with automatic aspect-ratio fitting, custom brand color themes, and personalized signatory authorization.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧮</span>
                <h3 className="text-sm font-black text-[#38bdf8]">Automatic Financials</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Real-time math calculations for multi-currency products (USD, BDT, EUR, GBP, INR), flat/percentage discounts, VAT/GST taxes, and shipping fees.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1d2a21] bg-[#080e0b] p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <h3 className="text-sm font-black text-amber-400">1-Click PDF & Print</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed">
                Instant vector-sharp A4 PDF download via in-browser PDF engine or direct printing with zero server data storage.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="divide-y divide-[#1d2a21] text-xs">
            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                Is this invoice generator free to use?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                Yes! There are no limits, no watermarks, and no sign-up requirements. You can create and export as many invoices as you need.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                Is my business and financial data secure?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                <strong>100% Private.</strong> All calculations, logo processing, and PDF rendering happen directly inside your web browser memory. Your client names, rates, and bank information are never uploaded or stored on any server.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-bold text-[#e7eee9] text-sm">
                Can I use different currencies like BDT (৳), EUR (€), or USD ($)?
              </h3>
              <p className="mt-1 text-[#8da194] leading-relaxed">
                Yes! Use the Currency selector to choose between USD ($), BDT (৳), EUR (€), GBP (£), INR (₹), CAD, AUD, or JPY. All amounts and line items format automatically with your selected currency symbol.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
