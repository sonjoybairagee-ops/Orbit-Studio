"use client";

import { useState, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import { ToolItem } from "@/lib/tools-data";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";

interface CategoryItem {
  id: string;
  label: string;
  count: number;
}

interface ToolsExplorerProps {
  tools: ToolItem[];
  categories: CategoryItem[];
}

export default function ToolsExplorer({ tools, categories }: ToolsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      return (
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        (tool.badge && tool.badge.toLowerCase().includes(q))
      );
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Search & Filter Toolbar */}
      <div className="mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#3cff5f]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 80+ tools by name, format, or keyword (e.g. PNG, PDF, SRT, Diff)..."
            className="w-full rounded-xl border border-[#26332d] bg-[#0c1510] py-3 pl-11 pr-10 text-sm text-[#e7eee9] placeholder-[#6f8276] transition-all focus:border-[#3cff5f] focus:bg-[#0f1b14] focus:outline-none focus:ring-1 focus:ring-[#3cff5f]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8da195] hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8da195] self-end md:self-center">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#3cff5f]" />
          <span>
            Showing{" "}
            <strong className="text-[#3cff5f] font-semibold">
              {filteredTools.length}
            </strong>{" "}
            of {tools.length} Tools
          </span>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-[0_0_18px_rgba(60,255,95,0.18)]"
                  : "border border-[#26332d] bg-[#0c1510]/80 text-[#9baaa1] hover:border-[#395a43] hover:bg-[#121f17] hover:text-[#e7eee9]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`ml-1.5 text-[11px] font-mono opacity-80 ${
                  isActive ? "text-[#3cff5f]" : "text-[#62776a]"
                }`}
              >
                ({cat.id === "all" ? tools.length : cat.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="my-12 rounded-2xl border border-[#26332d] bg-[#0c1510] p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#102a16] text-[#3cff5f] mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">No tools found</h3>
          <p className="mt-2 text-xs text-[#9baaa1]">
            No utilities found matching &ldquo;{searchQuery}&rdquo; in this category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-5 rounded-lg border border-[#3cff5f] bg-[#102a16] px-4 py-2 text-xs font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
