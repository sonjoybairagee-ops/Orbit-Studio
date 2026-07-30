import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tutorials | CompX Orbit",
  description: "Learn how to master every feature in After Effects with Orbit Studio.",
};

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-[#070b08] pt-32 pb-24 text-white relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#45c66d]/10 blur-[120px] rounded-[100%] pointer-events-none"></div>

      <div className="shell max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Master Your Workflow
          </h1>
          <p className="text-[#8da096] text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need to know to get the most out of CompX Orbit Studio.
          </p>
        </div>

        {/* Video Player Section with Glow */}
        <div className="relative">
          {/* Subtle outer glow effect for the video container */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-[#45c66d]/30 to-transparent blur-xl opacity-50 rounded-2xl"></div>
          
          <div className="relative bg-[#0b110d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video relative w-full">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/xalYhDRnOh8?si=BGENMoA0ULD-wv0n"
                title="Orbit Studio Complete Tutorial | Master Every Feature in After Effects"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-2">
                Orbit Studio Complete Tutorial | Master Every Feature in After Effects
              </h2>
              <p className="text-[#8da096]">
                In this comprehensive guide, we walk through every feature of Orbit Studio so you can speed up your creative workflow in After Effects.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center border border-white/10 bg-white/[0.02] rounded-2xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#45c66d] blur-[100px] opacity-[0.08] pointer-events-none rounded-full"></div>
          <h3 className="text-3xl font-bold mb-4 relative z-10">Ready to speed up your workflow?</h3>
          <p className="text-[#8da096] mb-8 text-lg relative z-10">Get Orbit Studio today and master your creative process.</p>
          <Link href="/pricing" className="btn-primary inline-flex items-center text-base px-8 py-3 relative z-10">
            Get Orbit
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <p className="text-[#8da096]">
            Still have questions?{" "}
            <Link href="/contact" className="text-[#45c66d] hover:text-white transition-colors font-semibold">
              Contact Support
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
