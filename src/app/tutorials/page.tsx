import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutorials | CompX Orbit",
  description: "Learn how to master every feature in After Effects with Orbit Studio.",
};

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-[#070b08] pt-32 pb-24 text-white">
      <div className="shell max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Master Your Workflow
          </h1>
          <p className="text-[#8da096] text-lg md:text-xl max-w-2xl mx-auto">
            Everything you need to know to get the most out of CompX Orbit Studio.
          </p>
        </div>

        <div className="bg-[#0b110d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video relative w-full">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/xalYhDRnOh8"
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
    </main>
  );
}
