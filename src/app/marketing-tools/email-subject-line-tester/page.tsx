import { Metadata } from "next";
import EmailSubjectLineTesterTool from "@/components/tools/EmailSubjectLineTesterTool";
import { CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Email Subject Line Counter & Tester — Boost Open Rates | ToolHub",
  description:
    "Test and grade email subject lines in real time: character counter, word counter, spam trigger word detection, power word score, and mobile/desktop inbox previews.",
  keywords: [
    "email subject line tester",
    "subject line character counter",
    "email subject line grader",
    "spam word checker email",
    "test subject line open rate",
    "email marketing tools",
  ],
};

export default function EmailSubjectLineTesterPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ToolHub Email Subject Line Tester",
    applicationCategory: "MarketingApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free in-browser email subject line grader, character counter, and spam trigger word scanner with inbox simulation.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 mb-2">
            100% Free · 50+ Spam Words Checked · Mobile Viewport Preview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Email Subject Line Tester &amp; Counter
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Optimize your email subject lines for higher open rates. Track character limits, scan for spam filter triggers, and simulate mobile inbox cutoffs.
          </p>
        </div>

        <div className="mb-14">
          <EmailSubjectLineTesterTool />
        </div>

        {/* Feature Highlights */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Subject Line Optimization Benchmarks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Mobile Character Limit (~41 Chars)",
                formula: "Over 55% of all emails are opened on mobile",
                desc: "Mobile email clients (iOS Mail, Gmail App) truncate subject lines after 40 to 45 characters. Put your most impactful words first.",
              },
              {
                title: "Avoid Spam Filter Triggers",
                formula: "Zero '100% free', 'urgent', or $$$ claims",
                desc: "Spam filters penalize exaggerated urgency, all-caps yelling, excessive exclamation points, and overt get-rich-quick terminology.",
              },
              {
                title: "Strategic Emoji Usage",
                formula: "1 or 2 relevant emojis boost open rates",
                desc: "A well-placed emoji stands out in a crowded inbox and can increase engagement by up to 15% when aligned with your brand voice.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 font-mono text-xs text-blue-700 font-bold">{f.formula}</p>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: "What is an ideal subject line character length?",
                a: "Between 35 and 50 characters (or 6 to 9 words). This ensures your entire message is visible on mobile smartphones without awkward truncation.",
              },
              {
                q: "What are Power Words?",
                a: "Power words are psychologically proven trigger terms (such as 'exclusive', 'secret', 'proven', 'breakthrough', 'announcing') that spark curiosity or urgency, driving higher clicks.",
              },
              {
                q: "Why are ALL CAPS penalized?",
                a: "Using more than 50% capital letters is heavily penalized by internet service providers (ISPs) and spam algorithms like SpamAssassin, landing your email in the junk folder.",
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
