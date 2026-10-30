"use client";

import { useState } from "react";
import { Columns3, Copy, Check, Plus, Trash2, Sliders } from "lucide-react";

interface FlexItem {
  id: number;
  grow: number;
  shrink: number;
  basis: string;
  alignSelf: string;
}

export default function FlexboxPlaygroundTool() {
  const [direction, setDirection] = useState<string>("row");
  const [justify, setJustify] = useState<string>("flex-start");
  const [align, setAlign] = useState<string>("stretch");
  const [wrap, setWrap] = useState<string>("nowrap");
  const [gap, setGap] = useState<number>(16);

  const [items, setItems] = useState<FlexItem[]>([
    { id: 1, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto" },
    { id: 2, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto" },
    { id: 3, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto" },
  ]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedItem = items.find((it) => it.id === selectedItemId);

  const addItem = () => {
    if (items.length >= 8) return;
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems([
      ...items,
      { id: nextId, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto" },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
    if (selectedItemId === id) setSelectedItemId(items[0]?.id || null);
  };

  const updateSelectedItem = (field: keyof FlexItem, val: any) => {
    if (!selectedItemId) return;
    setItems(items.map((it) => (it.id === selectedItemId ? { ...it, [field]: val } : it)));
  };

  const containerCss = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;

  const copyCss = () => {
    navigator.clipboard.writeText(containerCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const itemColors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-600",
    "from-fuchsia-500 to-pink-600",
    "from-lime-500 to-emerald-600",
  ];

  return (
    <div className="space-y-6">
      {/* Visual Flex Playground Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 min-h-[360px] overflow-auto">
        <div
          style={{
            display: "flex",
            flexDirection: direction as any,
            justifyContent: justify as any,
            alignItems: align as any,
            flexWrap: wrap as any,
            gap: `${gap}px`,
            minHeight: "280px",
          }}
          className="bg-slate-950/80 border border-dashed border-slate-700/80 rounded-2xl p-4 transition-all duration-200"
        >
          {items.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              style={{
                flexGrow: item.grow,
                flexShrink: item.shrink,
                flexBasis: item.basis,
                alignSelf: item.alignSelf as any,
              }}
              className={`min-w-[70px] min-h-[70px] bg-gradient-to-br ${
                itemColors[idx % itemColors.length]
              } text-white rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer shadow-lg transition-all duration-200 ${
                selectedItemId === item.id ? "ring-4 ring-white shadow-2xl scale-105" : "opacity-90 hover:opacity-100"
              }`}
            >
              <span className="font-black text-xl">{item.id}</span>
              <span className="text-[10px] font-mono opacity-80 mt-1">grow:{item.grow}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Container Settings & Item Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Container Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Flex Container Properties
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={addItem}
                disabled={items.length >= 8}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item ({items.length}/8)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            {/* Direction */}
            <div>
              <label className="block mb-1">flex-direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-blue-500"
              >
                <option value="row">row</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column">column</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>

            {/* Justify Content */}
            <div>
              <label className="block mb-1">justify-content</label>
              <select
                value={justify}
                onChange={(e) => setJustify(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-blue-500"
              >
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>

            {/* Align Items */}
            <div>
              <label className="block mb-1">align-items</label>
              <select
                value={align}
                onChange={(e) => setAlign(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-blue-500"
              >
                <option value="stretch">stretch</option>
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="baseline">baseline</option>
              </select>
            </div>

            {/* Flex Wrap */}
            <div>
              <label className="block mb-1">flex-wrap</label>
              <select
                value={wrap}
                onChange={(e) => setWrap(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-blue-500"
              >
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>

            {/* Gap Slider */}
            <div className="sm:col-span-2">
              <div className="flex justify-between mb-1">
                <span>gap</span>
                <span className="font-mono">{gap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                step="4"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Selected Item Properties */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Item {selectedItem ? `#${selectedItem.id}` : "(None)"} Properties
            </h4>
            {selectedItem && items.length > 1 && (
              <button
                onClick={() => removeItem(selectedItem.id)}
                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>

          {selectedItem ? (
            <div className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <div className="flex justify-between mb-1">
                  <span>flex-grow</span>
                  <span className="font-mono">{selectedItem.grow}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={selectedItem.grow}
                  onChange={(e) => updateSelectedItem("grow", Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>flex-shrink</span>
                  <span className="font-mono">{selectedItem.shrink}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={selectedItem.shrink}
                  onChange={(e) => updateSelectedItem("shrink", Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <span className="block mb-1">align-self</span>
                <select
                  value={selectedItem.alignSelf}
                  onChange={(e) => updateSelectedItem("alignSelf", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold focus:outline-blue-500"
                >
                  <option value="auto">auto</option>
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click on any card in the preview to inspect item properties.</p>
          )}

          {/* Copy CSS Button */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={copyCss}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied Container CSS!" : "Copy Container CSS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
