"use client";

import { useState } from "react";

interface AnalyticsProps {
  totalUSD: number;
  totalBDT: number;
  dailySales: Array<{ date: string; orders: number }>;
  planSales: Array<{ name: string; orders: number; seats: number }>;
  methodSales: Array<{ method: string; orders: number }>;
  todaySignups: number;
  todayOrders: number;
  activeLicenses: number;
  seatsSold: number;
}

export function AdminAnalyticsChart({
  totalUSD,
  totalBDT,
  dailySales,
  planSales,
  methodSales,
  todaySignups,
  todayOrders,
  activeLicenses,
  seatsSold,
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "revenue" | "plans">("sales");

  // Calculate max daily orders for bar scale
  const maxOrders = Math.max(...dailySales.map((d) => d.orders), 5);
  const totalOrdersCount = methodSales.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="card p-6 border border-[#45c66d]/30 bg-[#07130b]/60 backdrop-blur-md shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="badge badge-green text-xs font-black uppercase tracking-wider">
            📊 Executive Analytics
          </span>
          <h2 className="text-xl font-black text-white mt-1">Revenue & Performance Velocity</h2>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "sales"
                ? "bg-[#45c66d] text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sales Trends (7 Days)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("revenue")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "revenue"
                ? "bg-[#45c66d] text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Payment Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "plans"
                ? "bg-[#45c66d] text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Plan Shares
          </button>
        </div>
      </div>

      {/* Real-time KPI Velocity Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Today&apos;s Signups</p>
          <p className="text-2xl font-black text-white mt-1">{todaySignups}</p>
          <span className="text-[10px] text-[#45c66d] font-bold">New user registrations</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Today&apos;s Purchases</p>
          <p className="text-2xl font-black text-[#45c66d] mt-1">{todayOrders}</p>
          <span className="text-[10px] text-[#45c66d] font-bold">Orders placed today</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Active Licenses</p>
          <p className="text-2xl font-black text-white mt-1">{activeLicenses}</p>
          <span className="text-[10px] text-gray-400 font-bold">{seatsSold} device seats issued</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Gross BDT Volume</p>
          <p className="text-2xl font-black text-[#45c66d] mt-1">৳{totalBDT.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400 font-bold">+ ${totalUSD} USD</span>
        </div>
      </div>

      {/* Visual Chart Sections */}
      {activeTab === "sales" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Daily Order Volume (Recent 7 Days)</span>
            <span>Peak: {maxOrders} orders/day</span>
          </div>

          <div className="h-44 w-full bg-black/30 rounded-xl p-4 border border-white/5 flex items-end justify-between gap-2 sm:gap-4">
            {dailySales.length > 0 ? (
              dailySales.map((d) => {
                const heightPercent = Math.max(12, Math.round((d.orders / maxOrders) * 100));
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono text-[#45c66d] font-bold bg-black/80 px-2 py-0.5 rounded border border-[#45c66d]/30">
                      {d.orders} orders
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-[#205e34] to-[#45c66d] transition-all group-hover:brightness-125 shadow-lg shadow-[#45c66d]/10"
                    />
                    <span className="text-[11px] font-mono text-gray-400 truncate w-full text-center">
                      {d.date.slice(5)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center text-sm text-gray-500 my-auto">
                No orders recorded in the past 7 days yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-400">Distribution by Payment Gateway / Channel:</p>
          <div className="space-y-3">
            {methodSales.map((m) => {
              const pct = totalOrdersCount > 0 ? Math.round((m.orders / totalOrdersCount) * 100) : 0;
              const isBkash = m.method.toLowerCase().includes("bkash");
              const isNagad = m.method.toLowerCase().includes("nagad");
              const color = isBkash ? "bg-[#e2136e]" : isNagad ? "bg-[#f6921e]" : "bg-blue-500";

              return (
                <div key={m.method} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white uppercase flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {m.method}
                    </span>
                    <span className="text-gray-300 font-mono">
                      {m.orders} orders ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "plans" && (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-400">Distribution by Extension Plan Tier:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {planSales.map((p) => (
              <div key={p.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="badge badge-purple text-[10px] font-bold uppercase">
                    {p.name}
                  </span>
                  <p className="text-xl font-black text-white mt-2">{p.orders} Orders</p>
                </div>
                <p className="text-xs font-mono text-[#45c66d] mt-3 pt-2 border-t border-white/5">
                  {p.seats} Device Seats Active
                </p>
              </div>
            ))}
            {planSales.length === 0 && (
              <p className="text-xs text-gray-500 col-span-3">No plan sales recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
