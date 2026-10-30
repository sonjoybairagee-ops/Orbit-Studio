import { Metadata } from "next";
import EditingProjectPlannerTool from "@/components/tools/EditingProjectPlannerTool";
import { Film, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Editing Project Planner — Shot List, Scene Breakdown & Revision Tracker",
  description:
    "Free online Post-Production & Video Editing Project Planner. Shot list generator, scene breakdown, post-production checklist, timecode client revision tracker, and deadline manager.",
  keywords: [
    "video editing project planner",
    "shot list generator",
    "video editing checklist",
    "client revision tracker",
    "scene breakdown template",
    "post production workflow planner",
    "video editor project management",
    "premiere pro project planner",
  ],
};

export default function EditingProjectPlannerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Video Editing Project Planner",
    url: "https://compxorbit.com/video-tools/project-planner",
    applicationCategory: "MultimediaApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "All-in-one post-production planning tool for video creators: Shot lists, scene breakdown, 18-step editing checklist, client revision log, and deadline tracker.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
            <Film className="h-3.5 w-3.5" />
            <span>Editing Workflow Tools</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Editing Project Planner
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            All-in-one post-production command center for video editors,
            directors, and agencies. Generate shot lists, break down scenes,
            audit editing checklists, and track client timecode revisions.
          </p>
        </div>

        {/* Interactive Tool Container */}
        <div className="mb-14">
          <EditingProjectPlannerTool />
        </div>

        {/* Step-by-step Guide */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Organize a Pro Post-Production Pipeline</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Pre-Shoot &amp; Shot List</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Log camera angles, movements, and scene references before filming to guarantee you never miss critical B-roll cutaways.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">5-Stage Editing Checklist</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Progress systematically from ingest and proxies to fine cuts, -14 LUFS sound design, and color grading.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Timecode Revision Log</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Track client notes by exact timecode, prioritize critical changes, and export clean summaries for Notion or client emails.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#e7eee9] flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-[#8da195]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
            <h3 className="text-sm font-bold text-[#e7eee9]">
              Is my project planning data saved if I close or refresh the browser?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9baaa1]">
              Yes! All shot lists, scene breakdowns, checklist states, client revision notes, and deadlines are automatically persisted into your browser&apos;s local storage. You can also click &ldquo;Save Plan&rdquo; or &ldquo;Copy Markdown&rdquo; at any time to back up your plan to Notion or Google Docs.
            </p>
          </div>

          <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
            <h3 className="text-sm font-bold text-[#e7eee9]">
              How does the client revision tracker simplify video feedback?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9baaa1]">
              Instead of messy email chains, every note is anchored to an exact SMPTE timecode (HH:MM:SS:FF) and tagged by department (Video Cut, Audio, Color, Graphics). You can mark items as In Progress or Resolved, eliminating client misunderstandings during final billing.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
