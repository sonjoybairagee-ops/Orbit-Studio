import { TOOLS_DATA } from "@/lib/tools-data";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { Calculator, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Calculators & Productivity Tools — Free Online Math, Finance & Utility Tools | ToolHub",
  description:
    "Free calculators: Unit Converter, Time Zone Converter, Work Hours & Timesheet, Loan EMI, Discount Calculator, Tip Calculator, Percentage, Date Difference, Time Duration, QR Generator, and more.",
};

export default function CalculatorToolsPage() {
  const tools = TOOLS_DATA.filter((t) => t.category === "calc");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <Calculator className="w-4 h-4" />
            Calculators & Generators
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Free Online Calculators & Generators
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Solve math, dates, and times, generate QR codes, secure passwords, color schemes, and dummy content instantly.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-medium">Calculators & Generators</span>
        </nav>
      </div>

      {/* Tools Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}
