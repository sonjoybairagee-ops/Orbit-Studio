import React from "react";

export default function ToolCategoryLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="orbit-tool-page min-h-screen bg-[#050a08] text-[#e7eee9] relative overflow-hidden">
      {/* Ambient background glow beam */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#3cff5f]/12 via-[#102a16]/10 to-transparent blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
