"use client";

import { useState } from "react";
import { LayoutGrid, Copy, Check, RotateCcw, Plus, Trash2, Sparkles, Layers, Sliders } from "lucide-react";

interface GridItem {
  id: string;
  name: string;
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
  color: string;
}

const PRESET_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-fuchsia-600",
  "from-lime-500 to-emerald-600",
  "from-red-500 to-pink-600",
];

const PRESET_LAYOUTS = [
  {
    name: "Holy Grail",
    cols: 4,
    rows: 4,
    gap: 16,
    items: [
      { id: "1", name: "Header", colStart: 1, colEnd: 5, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[0] },
      { id: "2", name: "Nav Sidebar", colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[2] },
      { id: "3", name: "Main Content", colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[1] },
      { id: "4", name: "Aside", colStart: 4, colEnd: 5, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[3] },
      { id: "5", name: "Footer", colStart: 1, colEnd: 5, rowStart: 4, rowEnd: 5, color: PRESET_COLORS[4] },
    ],
  },
  {
    name: "Dashboard 3-Col",
    cols: 3,
    rows: 3,
    gap: 16,
    items: [
      { id: "1", name: "Top Metrics", colStart: 1, colEnd: 4, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[0] },
      { id: "2", name: "Analytics Chart", colStart: 1, colEnd: 3, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[4] },
      { id: "3", name: "Recent Feeds", colStart: 3, colEnd: 4, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[2] },
      { id: "4", name: "Quick Actions", colStart: 3, colEnd: 4, rowStart: 3, rowEnd: 4, color: PRESET_COLORS[3] },
    ],
  },
  {
    name: "Bento Grid (4 Tiles)",
    cols: 3,
    rows: 2,
    gap: 16,
    items: [
      { id: "1", name: "Hero Feature", colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[1] },
      { id: "2", name: "Stat Card", colStart: 3, colEnd: 4, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[2] },
      { id: "3", name: "Mini Feature", colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[3] },
      { id: "4", name: "Showcase Card", colStart: 2, colEnd: 4, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[0] },
    ],
  },
  {
    name: "Card Gallery",
    cols: 3,
    rows: 2,
    gap: 16,
    items: [
      { id: "1", name: "Card 1", colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[0] },
      { id: "2", name: "Card 2", colStart: 2, colEnd: 3, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[1] },
      { id: "3", name: "Card 3", colStart: 3, colEnd: 4, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[2] },
      { id: "4", name: "Card 4", colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[3] },
      { id: "5", name: "Card 5", colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[4] },
      { id: "6", name: "Card 6", colStart: 3, colEnd: 4, rowStart: 2, rowEnd: 3, color: PRESET_COLORS[5] },
    ],
  },
];

export function GridGeneratorTool() {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [colGap, setColGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);
  const [selectedItemId, setSelectedItemId] = useState<string>("1");
  const [copiedType, setCopiedType] = useState<"css" | "html" | null>(null);

  const [items, setItems] = useState<GridItem[]>([
    { id: "1", name: "Header", colStart: 1, colEnd: 5, rowStart: 1, rowEnd: 2, color: PRESET_COLORS[0] },
    { id: "2", name: "Sidebar", colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[2] },
    { id: "3", name: "Main Content", colStart: 2, colEnd: 5, rowStart: 2, rowEnd: 4, color: PRESET_COLORS[1] },
  ]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const updateSelectedItem = (updates: Partial<GridItem>) => {
    if (!selectedItemId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedItemId ? { ...item, ...updates } : item))
    );
  };

  const addItem = () => {
    const nextId = String(Date.now());
    const nextColor = PRESET_COLORS[items.length % PRESET_COLORS.length];
    const newItem: GridItem = {
      id: nextId,
      name: `Item ${items.length + 1}`,
      colStart: 1,
      colEnd: 2,
      rowStart: 1,
      rowEnd: 2,
      color: nextColor,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(nextId);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItemId === id) {
      const remaining = items.filter((i) => i.id !== id);
      setSelectedItemId(remaining[0].id);
    }
  };

  const applyPreset = (preset: (typeof PRESET_LAYOUTS)[0]) => {
    setCols(preset.cols);
    setRows(preset.rows);
    setColGap(preset.gap);
    setRowGap(preset.gap);
    setItems(preset.items);
    setSelectedItemId(preset.items[0].id);
  };

  const resetAll = () => {
    applyPreset(PRESET_LAYOUTS[0]);
  };

  // Generate CSS code
  const cssCode = `.parent-grid {
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  grid-template-rows: repeat(${rows}, 1fr);
  grid-column-gap: ${colGap}px;
  grid-row-gap: ${rowGap}px;
}
${items
  .map(
    (item, idx) => `
.div${idx + 1} {
  grid-area: ${item.rowStart} / ${item.colStart} / ${item.rowEnd} / ${item.colEnd};
}`
  )
  .join("")}`;

  const htmlCode = `<div class="parent-grid">
${items.map((item, idx) => `  <div class="div${idx + 1}">${item.name}</div>`).join("\n")}
</div>`;

  const copyToClipboard = (text: string, type: "css" | "html") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Presets Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Quick Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_LAYOUTS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={resetAll}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Reset Grid"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grid Container Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Container Matrix</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  <span>Columns</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{cols}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  <span>Rows</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{rows}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  <span>Col Gap</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{colGap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={colGap}
                  onChange={(e) => setColGap(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                  <span>Row Gap</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono">{rowGap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={rowGap}
                  onChange={(e) => setRowGap(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Grid Items List & Placement */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Grid Items ({items.length})</h3>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* Item selector chips */}
            <div className="flex flex-wrap gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedItemId === item.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                  }`}
                >
                  {item.name || `Item ${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Selected Item Editor */}
            {selectedItem && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => updateSelectedItem({ name: e.target.value })}
                    className="font-bold text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Item Name"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(selectedItem.id)}
                      className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Col Start (1 - {cols})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={cols}
                      value={selectedItem.colStart}
                      onChange={(e) =>
                        updateSelectedItem({ colStart: Math.min(Number(e.target.value), selectedItem.colEnd - 1) })
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Col End (2 - {cols + 1})
                    </label>
                    <input
                      type="number"
                      min={selectedItem.colStart + 1}
                      max={cols + 1}
                      value={selectedItem.colEnd}
                      onChange={(e) =>
                        updateSelectedItem({ colEnd: Math.max(Number(e.target.value), selectedItem.colStart + 1) })
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Row Start (1 - {rows})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={rows}
                      value={selectedItem.rowStart}
                      onChange={(e) =>
                        updateSelectedItem({ rowStart: Math.min(Number(e.target.value), selectedItem.rowEnd - 1) })
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Row End (2 - {rows + 1})
                    </label>
                    <input
                      type="number"
                      min={selectedItem.rowStart + 1}
                      max={rows + 1}
                      value={selectedItem.rowEnd}
                      onChange={(e) =>
                        updateSelectedItem({ rowEnd: Math.max(Number(e.target.value), selectedItem.rowStart + 1) })
                      }
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="text-xs font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                  grid-area: {selectedItem.rowStart} / {selectedItem.colStart} / {selectedItem.rowEnd} / {selectedItem.colEnd};
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Visual Canvas Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Interactive Canvas</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {cols}×{rows} grid ({colGap}px, {rowGap}px)
              </span>
            </div>

            {/* Grid Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 min-h-[380px] flex items-stretch">
              <div
                className="w-full grid rounded-xl transition-all"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(60px, 1fr))`,
                  columnGap: `${colGap}px`,
                  rowGap: `${rowGap}px`,
                }}
              >
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`relative cursor-pointer rounded-xl p-3 flex flex-col justify-between transition-all duration-200 text-white shadow-md bg-gradient-to-br ${
                        item.color
                      } ${
                        isSelected
                          ? "ring-4 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-950 scale-[1.01] z-10"
                          : "hover:opacity-95 opacity-90"
                      }`}
                      style={{
                        gridColumnStart: item.colStart,
                        gridColumnEnd: item.colEnd,
                        gridRowStart: item.rowStart,
                        gridRowEnd: item.rowEnd,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm drop-shadow">{item.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-white/30 backdrop-blur-md rounded font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-white/80">
                        {item.colStart}:{item.colEnd} / {item.rowStart}:{item.rowEnd}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generated Code Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Generated CSS Code</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(cssCode, "css")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  {copiedType === "css" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === "css" ? "Copied CSS!" : "Copy CSS"}
                </button>
                <button
                  onClick={() => copyToClipboard(htmlCode, "html")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  {copiedType === "html" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === "html" ? "Copied HTML!" : "Copy HTML"}
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <code>{cssCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
