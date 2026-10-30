import { Metadata } from "next";
import RandomPasswordGeneratorTool from "@/components/tools/RandomPasswordGeneratorTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Random Password Generator — Secure Cryptographic Passwords | ToolHub",
  description:
    "Generate strong, random, and cryptographically secure passwords online. Custom length, symbols, numbers, entropy evaluation, and bulk generation. 100% private.",
  keywords: ["random password generator", "strong password generator", "secure password maker", "generate password online", "bulk password generator"],
};

export default function RandomPasswordGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Random Password Generator",
    applicationCategory: "SecurityApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Cryptographically secure random password generator using Web Crypto API.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/60 mb-2">
            100% Free · Web Crypto API
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Random Password Generator
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Generate strong, uncrackable passwords using cryptographically secure random number generation. Zero server logging.
          </p>
        </div>

        <div className="mb-14">
          <RandomPasswordGeneratorTool />
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-600" />
            Password Security Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: 1, title: "16+ Characters", body: "Length is the most significant factor in brute-force resistance. Passwords with 16+ chars take centuries to crack." },
              { step: 2, title: "Diverse Characters", body: "Combine uppercase letters, lowercase letters, numbers, and special symbols to maximize entropy bit strength." },
              { step: 3, title: "Unique Per Service", body: "Never reuse the same password across multiple accounts. Store generated passwords in a reputable password manager." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white mb-3">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-violet-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "Are the generated passwords sent to your server?",
                a: "No! All random characters are created locally on your computer or phone using `window.crypto.getRandomValues()`. They are never sent across the internet.",
              },
              {
                q: "What is entropy in password strength?",
                a: "Entropy measures the randomness and unpredictability of a password in bits. A password with >80 bits of entropy cannot be cracked by modern supercomputers.",
              },
            ].map((faq, i) => (
              <div key={i} className="py-4">
                <h3 className="text-sm font-bold text-slate-800">{faq.q}</h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
