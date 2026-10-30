"use client";

import { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
  Ruler,
  Weight,
  Thermometer,
  Grid3X3,
  Box,
  Gauge,
  Clock,
  HardDrive,
  Compass,
  Zap,
  Flame,
  Search,
} from "lucide-react";

type UnitCategory =
  | "length"
  | "weight"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "time"
  | "digital"
  | "pressure"
  | "energy";

interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  // Conversion factor to the base unit of this category
  // For standard units: valInBase = val * toBase
  toBase: number | ((val: number) => number);
  fromBase: number | ((baseVal: number) => number);
}

interface CategoryConfig {
  id: UnitCategory;
  name: string;
  icon: typeof Ruler;
  baseUnit: string;
  units: UnitDefinition[];
  presets: number[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "length",
    name: "Length",
    icon: Ruler,
    baseUnit: "m",
    presets: [1, 5, 10, 50, 100, 1000],
    units: [
      { id: "mm", name: "Millimeter", symbol: "mm", toBase: 0.001, fromBase: 1000 },
      { id: "cm", name: "Centimeter", symbol: "cm", toBase: 0.01, fromBase: 100 },
      { id: "m", name: "Meter", symbol: "m", toBase: 1, fromBase: 1 },
      { id: "km", name: "Kilometer", symbol: "km", toBase: 1000, fromBase: 0.001 },
      { id: "in", name: "Inch", symbol: "in", toBase: 0.0254, fromBase: 1 / 0.0254 },
      { id: "ft", name: "Foot", symbol: "ft", toBase: 0.3048, fromBase: 1 / 0.3048 },
      { id: "yd", name: "Yard", symbol: "yd", toBase: 0.9144, fromBase: 1 / 0.9144 },
      { id: "mi", name: "Mile", symbol: "mi", toBase: 1609.344, fromBase: 1 / 1609.344 },
      { id: "nmi", name: "Nautical Mile", symbol: "nmi", toBase: 1852, fromBase: 1 / 1852 },
    ],
  },
  {
    id: "weight",
    name: "Weight & Mass",
    icon: Weight,
    baseUnit: "kg",
    presets: [1, 5, 10, 50, 100, 500],
    units: [
      { id: "mg", name: "Milligram", symbol: "mg", toBase: 0.000001, fromBase: 1000000 },
      { id: "g", name: "Gram", symbol: "g", toBase: 0.001, fromBase: 1000 },
      { id: "kg", name: "Kilogram", symbol: "kg", toBase: 1, fromBase: 1 },
      { id: "t", name: "Metric Ton", symbol: "t", toBase: 1000, fromBase: 0.001 },
      { id: "oz", name: "Ounce", symbol: "oz", toBase: 0.028349523, fromBase: 1 / 0.028349523 },
      { id: "lb", name: "Pound", symbol: "lb", toBase: 0.45359237, fromBase: 1 / 0.45359237 },
      { id: "st", name: "Stone", symbol: "st", toBase: 6.35029, fromBase: 1 / 6.35029 },
      { id: "uston", name: "US Short Ton", symbol: "US ton", toBase: 907.18474, fromBase: 1 / 907.18474 },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    icon: Thermometer,
    baseUnit: "c",
    presets: [0, 20, 37, 100, -40, 212],
    units: [
      {
        id: "c",
        name: "Celsius",
        symbol: "°C",
        toBase: (v: number) => v,
        fromBase: (v: number) => v,
      },
      {
        id: "f",
        name: "Fahrenheit",
        symbol: "°F",
        toBase: (v: number) => ((v - 32) * 5) / 9,
        fromBase: (v: number) => (v * 9) / 5 + 32,
      },
      {
        id: "k",
        name: "Kelvin",
        symbol: "K",
        toBase: (v: number) => v - 273.15,
        fromBase: (v: number) => v + 273.15,
      },
      {
        id: "r",
        name: "Rankine",
        symbol: "°R",
        toBase: (v: number) => ((v - 491.67) * 5) / 9,
        fromBase: (v: number) => ((v + 273.15) * 9) / 5,
      },
    ],
  },
  {
    id: "area",
    name: "Area",
    icon: Grid3X3,
    baseUnit: "sqm",
    presets: [1, 10, 50, 100, 1000, 5000],
    units: [
      { id: "sqcm", name: "Square Centimeter", symbol: "cm²", toBase: 0.0001, fromBase: 10000 },
      { id: "sqm", name: "Square Meter", symbol: "m²", toBase: 1, fromBase: 1 },
      { id: "sqkm", name: "Square Kilometer", symbol: "km²", toBase: 1000000, fromBase: 0.000001 },
      { id: "sqin", name: "Square Inch", symbol: "in²", toBase: 0.00064516, fromBase: 1 / 0.00064516 },
      { id: "sqft", name: "Square Foot", symbol: "ft²", toBase: 0.092903, fromBase: 1 / 0.092903 },
      { id: "sqyd", name: "Square Yard", symbol: "yd²", toBase: 0.836127, fromBase: 1 / 0.836127 },
      { id: "ac", name: "Acre", symbol: "ac", toBase: 4046.856, fromBase: 1 / 4046.856 },
      { id: "ha", name: "Hectare", symbol: "ha", toBase: 10000, fromBase: 0.0001 },
      { id: "sqmi", name: "Square Mile", symbol: "mi²", toBase: 2589988.11, fromBase: 1 / 2589988.11 },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    icon: Box,
    baseUnit: "l",
    presets: [1, 2, 5, 10, 50, 100],
    units: [
      { id: "ml", name: "Milliliter", symbol: "mL", toBase: 0.001, fromBase: 1000 },
      { id: "l", name: "Liter", symbol: "L", toBase: 1, fromBase: 1 },
      { id: "cbm", name: "Cubic Meter", symbol: "m³", toBase: 1000, fromBase: 0.001 },
      { id: "tsp", name: "Teaspoon (US)", symbol: "tsp", toBase: 0.00492892, fromBase: 1 / 0.00492892 },
      { id: "tbsp", name: "Tablespoon (US)", symbol: "tbsp", toBase: 0.0147868, fromBase: 1 / 0.0147868 },
      { id: "floz", name: "Fluid Ounce (US)", symbol: "fl oz", toBase: 0.0295735, fromBase: 1 / 0.0295735 },
      { id: "cup", name: "Cup (US)", symbol: "cup", toBase: 0.236588, fromBase: 1 / 0.236588 },
      { id: "pt", name: "Pint (US)", symbol: "pt", toBase: 0.473176, fromBase: 1 / 0.473176 },
      { id: "qt", name: "Quart (US)", symbol: "qt", toBase: 0.946353, fromBase: 1 / 0.946353 },
      { id: "gal", name: "Gallon (US)", symbol: "gal", toBase: 3.78541, fromBase: 1 / 3.78541 },
      { id: "impgal", name: "Gallon (UK)", symbol: "imp gal", toBase: 4.54609, fromBase: 1 / 4.54609 },
    ],
  },
  {
    id: "speed",
    name: "Speed",
    icon: Gauge,
    baseUnit: "mps",
    presets: [10, 30, 60, 100, 120, 500],
    units: [
      { id: "mps", name: "Meters per second", symbol: "m/s", toBase: 1, fromBase: 1 },
      { id: "kmh", name: "Kilometers per hour", symbol: "km/h", toBase: 1 / 3.6, fromBase: 3.6 },
      { id: "mph", name: "Miles per hour", symbol: "mph", toBase: 0.44704, fromBase: 1 / 0.44704 },
      { id: "fps", name: "Feet per second", symbol: "ft/s", toBase: 0.3048, fromBase: 1 / 0.3048 },
      { id: "knot", name: "Knot", symbol: "kn", toBase: 0.514444, fromBase: 1 / 0.514444 },
      { id: "mach", name: "Mach (sea level)", symbol: "Mach", toBase: 340.29, fromBase: 1 / 340.29 },
    ],
  },
  {
    id: "time",
    name: "Time",
    icon: Clock,
    baseUnit: "s",
    presets: [60, 3600, 86400, 604800, 2592000],
    units: [
      { id: "ms", name: "Millisecond", symbol: "ms", toBase: 0.001, fromBase: 1000 },
      { id: "s", name: "Second", symbol: "s", toBase: 1, fromBase: 1 },
      { id: "min", name: "Minute", symbol: "min", toBase: 60, fromBase: 1 / 60 },
      { id: "hr", name: "Hour", symbol: "h", toBase: 3600, fromBase: 1 / 3600 },
      { id: "day", name: "Day", symbol: "d", toBase: 86400, fromBase: 1 / 86400 },
      { id: "wk", name: "Week", symbol: "wk", toBase: 604800, fromBase: 1 / 604800 },
      { id: "mo", name: "Month (avg 30.4d)", symbol: "mo", toBase: 2629746, fromBase: 1 / 2629746 },
      { id: "yr", name: "Year (365d)", symbol: "yr", toBase: 31536000, fromBase: 1 / 31536000 },
    ],
  },
  {
    id: "digital",
    name: "Digital Data",
    icon: HardDrive,
    baseUnit: "b",
    presets: [1024, 1048576, 1073741824, 1000000],
    units: [
      { id: "bit", name: "Bit", symbol: "b", toBase: 1, fromBase: 1 },
      { id: "B", name: "Byte", symbol: "B", toBase: 8, fromBase: 1 / 8 },
      { id: "KB", name: "Kilobyte (KB)", symbol: "KB", toBase: 8000, fromBase: 1 / 8000 },
      { id: "MB", name: "Megabyte (MB)", symbol: "MB", toBase: 8e6, fromBase: 1 / 8e6 },
      { id: "GB", name: "Gigabyte (GB)", symbol: "GB", toBase: 8e9, fromBase: 1 / 8e9 },
      { id: "TB", name: "Terabyte (TB)", symbol: "TB", toBase: 8e12, fromBase: 1 / 8e12 },
      { id: "KiB", name: "Kibibyte (KiB)", symbol: "KiB", toBase: 8 * 1024, fromBase: 1 / (8 * 1024) },
      { id: "MiB", name: "Mebibyte (MiB)", symbol: "MiB", toBase: 8 * 1048576, fromBase: 1 / (8 * 1048576) },
      { id: "GiB", name: "Gibibyte (GiB)", symbol: "GiB", toBase: 8 * 1073741824, fromBase: 1 / (8 * 1073741824) },
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    icon: Compass,
    baseUnit: "pa",
    presets: [100, 1000, 101325, 100000],
    units: [
      { id: "pa", name: "Pascal", symbol: "Pa", toBase: 1, fromBase: 1 },
      { id: "kpa", name: "Kilopascal", symbol: "kPa", toBase: 1000, fromBase: 0.001 },
      { id: "bar", name: "Bar", symbol: "bar", toBase: 100000, fromBase: 0.00001 },
      { id: "psi", name: "Pound/sq inch", symbol: "psi", toBase: 6894.757, fromBase: 1 / 6894.757 },
      { id: "atm", name: "Standard Atmosphere", symbol: "atm", toBase: 101325, fromBase: 1 / 101325 },
      { id: "torr", name: "Torr / mmHg", symbol: "mmHg", toBase: 133.322, fromBase: 1 / 133.322 },
    ],
  },
  {
    id: "energy",
    name: "Energy & Work",
    icon: Flame,
    baseUnit: "j",
    presets: [1000, 4184, 3600000, 1055],
    units: [
      { id: "j", name: "Joule", symbol: "J", toBase: 1, fromBase: 1 },
      { id: "kj", name: "Kilojoule", symbol: "kJ", toBase: 1000, fromBase: 0.001 },
      { id: "cal", name: "Gram Calorie", symbol: "cal", toBase: 4.184, fromBase: 1 / 4.184 },
      { id: "kcal", name: "Food Calorie (kcal)", symbol: "kcal", toBase: 4184, fromBase: 1 / 4184 },
      { id: "wh", name: "Watt-hour", symbol: "Wh", toBase: 3600, fromBase: 1 / 3600 },
      { id: "kwh", name: "Kilowatt-hour", symbol: "kWh", toBase: 3600000, fromBase: 1 / 3600000 },
      { id: "btu", name: "British Thermal Unit", symbol: "BTU", toBase: 1055.06, fromBase: 1 / 1055.06 },
    ],
  },
];

function formatNumber(num: number): string {
  if (isNaN(num)) return "0";
  if (num === 0) return "0";
  const abs = Math.abs(num);
  if (abs >= 1e9 || (abs < 1e-5 && abs > 0)) {
    return num.toExponential(6);
  }
  // Trim trailing zeros after decimal
  const str = num.toFixed(6);
  const trimmed = parseFloat(str).toString();
  return trimmed;
}

export default function UnitConverterTool() {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>("length");
  const [inputValue, setInputValue] = useState<string>("10");
  const [fromUnitId, setFromUnitId] = useState<string>("m");
  const [toUnitId, setToUnitId] = useState<string>("ft");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const currentCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0],
    [selectedCategory]
  );

  // Switch category handler
  const handleCategoryChange = (catId: UnitCategory) => {
    setSelectedCategory(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length >= 2) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1].id);
    }
  };

  const fromUnit = useMemo(
    () => currentCategory.units.find((u) => u.id === fromUnitId) || currentCategory.units[0],
    [currentCategory, fromUnitId]
  );

  const toUnit = useMemo(
    () => currentCategory.units.find((u) => u.id === toUnitId) || currentCategory.units[1] || currentCategory.units[0],
    [currentCategory, toUnitId]
  );

  // Conversion math
  const numericInput = parseFloat(inputValue) || 0;

  const toBaseValue = (val: number, unit: UnitDefinition): number => {
    if (typeof unit.toBase === "function") {
      return unit.toBase(val);
    }
    return val * unit.toBase;
  };

  const fromBaseValue = (baseVal: number, unit: UnitDefinition): number => {
    if (typeof unit.fromBase === "function") {
      return unit.fromBase(baseVal);
    }
    return baseVal * unit.fromBase;
  };

  const convertedValue = useMemo(() => {
    if (isNaN(numericInput)) return 0;
    const base = toBaseValue(numericInput, fromUnit);
    return fromBaseValue(base, toUnit);
  }, [numericInput, fromUnit, toUnit]);

  // Swap units
  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1800);
  };

  // Quick all-units comparison table
  const allConversions = useMemo(() => {
    const base = toBaseValue(numericInput, fromUnit);
    return currentCategory.units.map((unit) => {
      const val = fromBaseValue(base, unit);
      return {
        unit,
        formatted: formatNumber(val),
        raw: val,
      };
    });
  }, [numericInput, fromUnit, currentCategory]);

  const filteredAllConversions = useMemo(() => {
    if (!searchFilter.trim()) return allConversions;
    const q = searchFilter.toLowerCase();
    return allConversions.filter(
      (c) =>
        c.unit.name.toLowerCase().includes(q) ||
        c.unit.symbol.toLowerCase().includes(q)
    );
  }, [allConversions, searchFilter]);

  return (
    <div className="space-y-8">
      {/* Category Pills Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Converter Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-6">
          {/* From Side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>From</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {fromUnit.symbol}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-lg font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono"
              />
            </div>
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {currentCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-6">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap units"
              className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
            >
              <ArrowRightLeft className="h-5 w-5 transition-transform group-hover:rotate-180 duration-300" />
            </button>
          </div>

          {/* To Side */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>To (Result)</span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {toUnit.symbol}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={formatNumber(convertedValue)}
                className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 text-lg font-bold text-emerald-950 font-mono pr-12 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(formatNumber(convertedValue), "main")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Copy result"
              >
                {copiedKey === "main" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {currentCategory.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula breakdown and Quick Presets */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Formula:</span>
            <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              1 {fromUnit.symbol} ={" "}
              {formatNumber(
                fromBaseValue(toBaseValue(1, fromUnit), toUnit)
              )}{" "}
              {toUnit.symbol}
            </span>
          </div>

          {/* Quick preset values */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
            {currentCategory.presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setInputValue(val.toString())}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  inputValue === val.toString()
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Unit Comparison Grid */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              All {currentCategory.name} Conversions
            </h3>
            <p className="text-xs text-slate-500">
              Equivalent values for {inputValue || "0"} {fromUnit.symbol} across all units in this category.
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredAllConversions.map(({ unit, formatted }) => {
            const isSelected = unit.id === toUnit.id;
            return (
              <div
                key={unit.id}
                onClick={() => setToUnitId(unit.id)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                    : "border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {unit.name}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      ({unit.symbol})
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 truncate mt-0.5">
                    {formatted}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(formatted, unit.id);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white transition-colors"
                  title="Copy value"
                >
                  {copiedKey === unit.id ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
