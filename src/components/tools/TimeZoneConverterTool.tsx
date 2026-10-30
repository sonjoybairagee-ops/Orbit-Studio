"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Globe2,
  Clock,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Users,
  Sun,
  Moon,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface CityZone {
  id: string;
  name: string;
  country: string;
  flag: string;
  iana: string; // e.g. "America/New_York"
  offsetHours: number; // approximate standard UTC offset for display/fallback
}

const ALL_CITIES: CityZone[] = [
  { id: "utc", name: "UTC", country: "Universal", flag: "🌐", iana: "UTC", offsetHours: 0 },
  { id: "london", name: "London", country: "United Kingdom", flag: "🇬🇧", iana: "Europe/London", offsetHours: 0 },
  { id: "paris", name: "Paris", country: "France", flag: "🇫🇷", iana: "Europe/Paris", offsetHours: 1 },
  { id: "berlin", name: "Berlin", country: "Germany", flag: "🇩🇪", iana: "Europe/Berlin", offsetHours: 1 },
  { id: "cairo", name: "Cairo", country: "Egypt", flag: "🇪🇬", iana: "Africa/Cairo", offsetHours: 2 },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", flag: "🇦🇪", iana: "Asia/Dubai", offsetHours: 4 },
  { id: "karachi", name: "Karachi", country: "Pakistan", flag: "🇵🇰", iana: "Asia/Karachi", offsetHours: 5 },
  { id: "mumbai", name: "Mumbai / Delhi", country: "India", flag: "🇮🇳", iana: "Asia/Kolkata", offsetHours: 5.5 },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", flag: "🇧🇩", iana: "Asia/Dhaka", offsetHours: 6 },
  { id: "bangkok", name: "Bangkok", country: "Thailand", flag: "🇹🇭", iana: "Asia/Bangkok", offsetHours: 7 },
  { id: "singapore", name: "Singapore", country: "Singapore", flag: "🇸🇬", iana: "Asia/Singapore", offsetHours: 8 },
  { id: "hongkong", name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰", iana: "Asia/Hong_Kong", offsetHours: 8 },
  { id: "tokyo", name: "Tokyo", country: "Japan", flag: "🇯🇵", iana: "Asia/Tokyo", offsetHours: 9 },
  { id: "seoul", name: "Seoul", country: "South Korea", flag: "🇰🇷", iana: "Asia/Seoul", offsetHours: 9 },
  { id: "sydney", name: "Sydney", country: "Australia", flag: "🇦🇺", iana: "Australia/Sydney", offsetHours: 11 },
  { id: "auckland", name: "Auckland", country: "New Zealand", flag: "🇳🇿", iana: "Pacific/Auckland", offsetHours: 13 },
  { id: "honolulu", name: "Honolulu", country: "United States (Hawaii)", flag: "🌺", iana: "Pacific/Honolulu", offsetHours: -10 },
  { id: "sanfrancisco", name: "San Francisco / LA", country: "United States (PST)", flag: "🇺🇸", iana: "America/Los_Angeles", offsetHours: -8 },
  { id: "denver", name: "Denver", country: "United States (MST)", flag: "🇺🇸", iana: "America/Denver", offsetHours: -7 },
  { id: "chicago", name: "Chicago", country: "United States (CST)", flag: "🇺🇸", iana: "America/Chicago", offsetHours: -6 },
  { id: "newyork", name: "New York", country: "United States (EST)", flag: "🇺🇸", iana: "America/New_York", offsetHours: -5 },
  { id: "toronto", name: "Toronto", country: "Canada", flag: "🇨🇦", iana: "America/Toronto", offsetHours: -5 },
  { id: "saopaulo", name: "São Paulo", country: "Brazil", flag: "🇧🇷", iana: "America/Sao_Paulo", offsetHours: -3 },
];

const DEFAULT_ACTIVE_IDS = ["newyork", "london", "dubai", "singapore", "tokyo"];

export default function TimeZoneConverterTool() {
  const [activeCityIds, setActiveCityIds] = useState<string[]>(DEFAULT_ACTIVE_IDS);
  const [selectedCityId, setSelectedCityId] = useState<string>("add_placeholder");
  const [baseDate, setBaseDate] = useState<string>("2026-10-30");
  // Selected minute offset from start of day (0 to 1439 mins)
  const [sliderMinutes, setSliderMinutes] = useState<number>(720);
  const [primaryCityId, setPrimaryCityId] = useState<string>("newyork");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const d = new Date();
      setBaseDate(d.toISOString().split("T")[0]);
      setSliderMinutes(d.getHours() * 60 + Math.floor(d.getMinutes() / 15) * 15);
    } catch {}
  }, []);

  // Re-synchronize to live time
  const handleSetToCurrentTime = () => {
    const d = new Date();
    setBaseDate(d.toISOString().split("T")[0]);
    setSliderMinutes(d.getHours() * 60 + Math.floor(d.getMinutes() / 15) * 15);
  };

  const primaryCity = useMemo(
    () => ALL_CITIES.find((c) => c.id === primaryCityId) || ALL_CITIES[0],
    [primaryCityId]
  );

  // Compute Base UTC Date object from the primary city's chosen date and time
  const baseUtcTimestamp = useMemo(() => {
    const hours = Math.floor(sliderMinutes / 60);
    const minutes = sliderMinutes % 60;
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

    // Parse the date and time as if it occurred in the primary city
    try {
      // Create a date in ISO string format and apply primary timezone
      const naiveDate = new Date(`${baseDate}T${timeStr}`);
      // Find offset of primary city at this date
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone: primaryCity.iana,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      });
      // Rough timezone offset resolution via Intl
      const primaryLocalStr = dtf.format(naiveDate);
      const diffMs = naiveDate.getTime() - new Date(primaryLocalStr).getTime();
      return naiveDate.getTime() + diffMs;
    } catch {
      return new Date(`${baseDate}T${timeStr}Z`).getTime();
    }
  }, [baseDate, sliderMinutes, primaryCity]);

  // City time calculation
  const citiesData = useMemo(() => {
    return activeCityIds
      .map((id) => ALL_CITIES.find((c) => c.id === id))
      .filter((c): c is CityZone => Boolean(c))
      .map((city) => {
        try {
          const dateObj = new Date(baseUtcTimestamp);

          const timeFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: city.iana,
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const time24Formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: city.iana,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const dateFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: city.iana,
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          const offsetFormatter = new Intl.DateTimeFormat("en-US", {
            timeZone: city.iana,
            timeZoneName: "shortOffset",
          });

          const parts = offsetFormatter.formatToParts(dateObj);
          const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "UTC";

          const formattedTime12 = timeFormatter.format(dateObj);
          const formattedTime24 = time24Formatter.format(dateObj);
          const formattedDate = dateFormatter.format(dateObj);

          const [h24, m24] = formattedTime24.split(":").map(Number);
          const hourOfDay = h24 + (m24 || 0) / 60;

          // Status: Work (9 - 17), Leisure (7 - 9 or 17 - 22), Sleep (22 - 7)
          let status: "work" | "leisure" | "sleep" = "sleep";
          if (hourOfDay >= 9 && hourOfDay < 17) {
            status = "work";
          } else if ((hourOfDay >= 7 && hourOfDay < 9) || (hourOfDay >= 17 && hourOfDay < 22)) {
            status = "leisure";
          }

          // Relative day compared to primary city
          const primaryDateStr = new Intl.DateTimeFormat("en-US", {
            timeZone: primaryCity.iana,
            day: "numeric",
          }).format(dateObj);

          const thisDateStr = new Intl.DateTimeFormat("en-US", {
            timeZone: city.iana,
            day: "numeric",
          }).format(dateObj);

          let dayDiffLabel = "Same day";
          const diffDay = parseInt(thisDateStr) - parseInt(primaryDateStr);
          if (diffDay > 0 || (diffDay < -20)) {
            dayDiffLabel = "+1 Day";
          } else if (diffDay < 0 || (diffDay > 20)) {
            dayDiffLabel = "-1 Day";
          }

          return {
            city,
            formattedTime12,
            formattedTime24,
            formattedDate,
            tzName,
            status,
            hourOfDay,
            dayDiffLabel,
          };
        } catch {
          return {
            city,
            formattedTime12: "12:00 PM",
            formattedTime24: "12:00",
            formattedDate: "Today",
            tzName: "UTC",
            status: "work" as const,
            hourOfDay: 12,
            dayDiffLabel: "Same day",
          };
        }
      });
  }, [activeCityIds, baseUtcTimestamp, primaryCity]);

  // Check if current slot is a golden meeting hour (all cities awake: 8am to 10pm, and at least some working)
  const isGoodMeetingTime = useMemo(() => {
    return citiesData.every((c) => c.status !== "sleep");
  }, [citiesData]);

  const allWorkingHours = useMemo(() => {
    return citiesData.every((c) => c.status === "work");
  }, [citiesData]);

  const handleAddCity = (id: string) => {
    if (id === "add_placeholder") return;
    if (!activeCityIds.includes(id)) {
      setActiveCityIds([...activeCityIds, id]);
    }
    setSelectedCityId("add_placeholder");
  };

  const handleRemoveCity = (id: string) => {
    if (activeCityIds.length <= 1) return;
    const remaining = activeCityIds.filter((cid) => cid !== id);
    setActiveCityIds(remaining);
    if (primaryCityId === id) {
      setPrimaryCityId(remaining[0]);
    }
  };

  const handleCopyMeetingSummary = () => {
    const hours = Math.floor(sliderMinutes / 60);
    const mins = sliderMinutes % 60;
    const timeFormatted = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    const lines = [
      `📅 Proposed Meeting Schedule (${baseDate}):`,
      ...citiesData.map(
        (c) =>
          `• ${c.city.flag} ${c.city.name} (${c.tzName}): ${c.formattedTime12} (${c.formattedDate})`
      ),
      `\nGenerated via iformat.io Time Zone Converter`,
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sliderHours = Math.floor(sliderMinutes / 60);
  const sliderMins = sliderMinutes % 60;
  const sliderDisplayTime = `${String(sliderHours % 12 || 12).padStart(2, "0")}:${String(
    sliderMins
  ).padStart(2, "0")} ${sliderHours >= 12 ? "PM" : "AM"}`;

  return (
    <div className="space-y-8">
      {/* Top Controller Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Globe2 className="h-3.5 w-3.5" />
                Live World Time Planner
              </span>
              {allWorkingHours ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                  <Briefcase className="h-3 w-3" />
                  All In Working Hours!
                </span>
              ) : isGoodMeetingTime ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60">
                  <Sun className="h-3 w-3" />
                  Good Meeting Time (All Awake)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200/60">
                  <Moon className="h-3 w-3" />
                  Late Night for Some Cities
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Compare & Plan Global Times
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Scrub the time slider below to instantly convert hours across all selected time zones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSetToCurrentTime}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Now
            </button>
            <button
              type="button"
              onClick={handleCopyMeetingSummary}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied Schedule!" : "Copy Schedule"}
            </button>
          </div>
        </div>

        {/* Primary Anchor Selector & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Anchor City / Base Timezone
            </label>
            <select
              value={primaryCityId}
              onChange={(e) => setPrimaryCityId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              {ALL_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Meeting Date
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Add Another City
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => handleAddCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="add_placeholder">+ Select a city to add...</option>
              {ALL_CITIES.filter((c) => !activeCityIds.includes(c.id)).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Master Time Slider */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Drag Hour Slider:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200/60">
                {sliderDisplayTime}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                in {primaryCity.name}
              </span>
            </div>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min={0}
              max={1425}
              step={15}
              value={sliderMinutes}
              onChange={(e) => setSliderMinutes(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
            />
            {/* Visual 24h markers */}
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
              <span>12 AM</span>
              <span>4 AM</span>
              <span>8 AM</span>
              <span>12 PM</span>
              <span>4 PM</span>
              <span>8 PM</span>
              <span>11:45 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* City Time Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Active Cities ({citiesData.length})
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Work (9am-5pm)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span> Awake (7-9am, 5-10pm)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-400"></span> Sleep (10pm-7am)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {citiesData.map((item) => {
            const isPrimary = item.city.id === primaryCityId;
            return (
              <div
                key={item.city.id}
                className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all ${
                  isPrimary
                    ? "border-blue-400 bg-white ring-2 ring-blue-500/20 shadow-md"
                    : "border-slate-200/80 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* City Info */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{item.city.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          {item.city.name}
                        </h4>
                        {isPrimary && (
                          <span className="rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 uppercase">
                            Anchor
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 text-slate-600 text-xs font-mono px-1.5 py-0.5">
                          {item.tzName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{item.city.country}</span>
                        <span>•</span>
                        <span>{item.formattedDate}</span>
                        {item.dayDiffLabel !== "Same day" && (
                          <span className="rounded-full bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 text-[10px]">
                            {item.dayDiffLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time & Status Badge */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {item.formattedTime12}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        {item.status === "work" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <Briefcase className="h-3 w-3" /> Working Hours
                          </span>
                        ) : item.status === "leisure" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <Sun className="h-3 w-3" /> Awake
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
                            <Moon className="h-3 w-3" /> Sleeping
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryCityId(item.city.id)}
                          className="rounded-lg p-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Set as Anchor City"
                        >
                          Make Base
                        </button>
                      )}
                      {citiesData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(item.city.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove city"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 24-hour visual progress indicator */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="relative w-full h-2 rounded-full overflow-hidden bg-slate-100 flex">
                    {/* 0 to 7: sleep (purple) */}
                    <div className="h-full bg-purple-200" style={{ width: "29.16%" }}></div>
                    {/* 7 to 9: awake (amber) */}
                    <div className="h-full bg-amber-200" style={{ width: "8.33%" }}></div>
                    {/* 9 to 17: work (emerald) */}
                    <div className="h-full bg-emerald-400" style={{ width: "33.33%" }}></div>
                    {/* 17 to 22: awake (amber) */}
                    <div className="h-full bg-amber-200" style={{ width: "20.83%" }}></div>
                    {/* 22 to 24: sleep (purple) */}
                    <div className="h-full bg-purple-200" style={{ width: "8.33%" }}></div>

                    {/* Active cursor needle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-slate-900 shadow-sm"
                      style={{
                        left: `${Math.min(99, Math.max(0, (item.hourOfDay / 24) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    {item.formattedTime24}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
