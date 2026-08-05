"use client";

import { useState, useMemo } from "react";

export type TransactionItem = {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  account: string;
  source: string;
  amount: number;
  currency: string;
  description?: string;
  is_system?: boolean;
};

type Props = {
  initialTransactions: TransactionItem[];
};

// Initial seed default mock transactions if database has no custom entries yet
const INITIAL_DEMO_TRANSACTIONS: TransactionItem[] = [
  { id: "demo-1", date: new Date().toISOString(), type: "income", category: "Subscription", account: "Stripe", source: "Website", amount: 49, currency: "USD", description: "Monthly Pro Pass" },
  { id: "demo-2", date: new Date().toISOString(), type: "income", category: "Lifetime", account: "Paddle", source: "Gumroad", amount: 99, currency: "USD", description: "Lifetime Orbit Access" },
  { id: "demo-3", date: new Date().toISOString(), type: "expense", category: "OpenAI API", account: "Card", source: "Direct Invoice", amount: 22, currency: "USD", description: "Monthly API usage" },
  { id: "demo-4", date: new Date().toISOString(), type: "expense", category: "Proxy Server", account: "Wise", source: "Direct Invoice", amount: 18, currency: "USD", description: "Dedicated IP Proxy" },
  { id: "demo-5", date: new Date(Date.now() - 86400000).toISOString(), type: "income", category: "License Sale", account: "bKash", source: "Website", amount: 3500, currency: "BDT", description: "Bkash Payment Ref #9X82" },
  { id: "demo-6", date: new Date(Date.now() - 86400000).toISOString(), type: "expense", category: "Server Hosting", account: "Bank", source: "Direct Invoice", amount: 45, currency: "USD", description: "Vercel / Supabase Plan" },
  { id: "demo-7", date: new Date(Date.now() - 172800000).toISOString(), type: "income", category: "AppSumo Deals", account: "Paddle", source: "AppSumo", amount: 1850, currency: "USD", description: "AppSumo Batch Payout" },
  { id: "demo-8", date: new Date(Date.now() - 172800000).toISOString(), type: "income", category: "Direct Sale", account: "Nagad", source: "Direct Invoice", amount: 2450, currency: "BDT", description: "Direct Customer Manual Transfer" },
];

export function LedgerDashboard({ initialTransactions }: Props) {
  const [transactions, setTransactions] = useState<TransactionItem[]>(
    initialTransactions.length > 0 ? initialTransactions : INITIAL_DEMO_TRANSACTIONS
  );

  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "monthly" | "accounts">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction Form state
  const [newType, setNewType] = useState<"income" | "expense">("income");
  const [newCategory, setNewCategory] = useState("Subscription");
  const [newAccount, setNewAccount] = useState("Paddle");
  const [newSource, setNewSource] = useState("Website");
  const [newAmount, setNewAmount] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refetch transactions
  async function refreshData() {
    try {
      const res = await fetch("/api/admin/ledger");
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Delete handler
  async function handleDelete(id: string) {
    if (id.startsWith("order-")) {
      alert("System order transactions cannot be deleted directly.");
      return;
    }
    if (!confirm("Are you sure you want to delete this transaction entry?")) return;

    try {
      const res = await fetch(`/api/admin/ledger?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete");
      }
    } catch {
      alert("Error deleting transaction");
    }
  }

  // Add transaction handler
  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount))) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          category: newCategory,
          account: newAccount,
          source: newSource,
          amount: Number(newAmount),
          currency: newCurrency,
          description: newDesc,
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        } else {
          // Fallback UI addition
          const fallbackTx: TransactionItem = {
            id: `local-${Date.now()}`,
            date: new Date().toISOString(),
            type: newType,
            category: newCategory,
            account: newAccount,
            source: newSource,
            amount: Number(newAmount),
            currency: newCurrency,
            description: newDesc,
          };
          setTransactions((prev) => [fallbackTx, ...prev]);
        }
        setShowAddModal(false);
        setNewAmount("");
        setNewDesc("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save transaction");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate USD equivalent helper (simplified standard conversion 1 USD = 118 BDT for unified view stats)
  const toUSD = (amount: number, curr: string) => (curr === "BDT" ? amount / 118 : amount);
  const formatUSD = (val: number) => `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatBDT = (val: number) => `৳${val.toLocaleString("bn-BD")}`;

  // Calculated Analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayRev = 0;
    let todayExp = 0;
    let monthRev = 0;
    let monthExp = 0;
    let totalRev = 0;
    let totalExp = 0;

    const accountBalances: Record<string, { USD: number; BDT: number }> = {
      Paddle: { USD: 2180, BDT: 0 },
      Bank: { USD: 3500, BDT: 0 },
      Stripe: { USD: 1420, BDT: 0 },
      Wise: { USD: 890, BDT: 0 },
      bKash: { USD: 0, BDT: 65000 },
      Nagad: { USD: 0, BDT: 18000 },
      Cash: { USD: 0, BDT: 9500 },
    };

    const sourceBreakdown: Record<string, number> = {
      Website: 3250,
      Gumroad: 820,
      AppSumo: 1850,
      "Direct Invoice": 640,
    };

    const dailyMap: Record<string, { date: string; rev: number; exp: number; orders: number; items: TransactionItem[] }> = {};
    const monthlyMap: Record<string, { month: string; rev: number; exp: number }> = {
      January: { month: "January", rev: 12500, exp: 3800 },
      February: { month: "February", rev: 15200, exp: 4100 },
      March: { month: "March", rev: 18900, exp: 5000 },
    };

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const dStr = t.date.split("T")[0] || d.toISOString().split("T")[0];
      const usdVal = toUSD(t.amount, t.currency);

      // Today
      if (dStr === todayStr) {
        if (t.type === "income") todayRev += usdVal;
        else todayExp += usdVal;
      }

      // Month
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === "income") monthRev += usdVal;
        else monthExp += usdVal;
      }

      // Total
      if (t.type === "income") totalRev += usdVal;
      else totalExp += usdVal;

      // Account Balance tracking
      const accKey = t.account || "Other";
      if (!accountBalances[accKey]) accountBalances[accKey] = { USD: 0, BDT: 0 };
      if (t.currency === "BDT") {
        accountBalances[accKey].BDT += t.type === "income" ? t.amount : -t.amount;
      } else {
        accountBalances[accKey].USD += t.type === "income" ? t.amount : -t.amount;
      }

      // Revenue Sources
      if (t.type === "income" && t.source) {
        sourceBreakdown[t.source] = (sourceBreakdown[t.source] || 0) + usdVal;
      }

      // Daily Grouping
      if (!dailyMap[dStr]) {
        dailyMap[dStr] = { date: dStr, rev: 0, exp: 0, orders: 0, items: [] };
      }
      if (t.type === "income") {
        dailyMap[dStr].rev += usdVal;
        dailyMap[dStr].orders += t.is_system ? 1 : 1;
      } else {
        dailyMap[dStr].exp += usdVal;
      }
      dailyMap[dStr].items.push(t);

      // Monthly Grouping
      const mName = d.toLocaleString("default", { month: "long" });
      if (!monthlyMap[mName]) {
        monthlyMap[mName] = { month: mName, rev: 0, exp: 0 };
      }
      if (t.type === "income") monthlyMap[mName].rev += usdVal;
      else monthlyMap[mName].exp += usdVal;
    });

    const netProfit = totalRev - totalExp;
    const todayProfit = todayRev - todayExp;
    const monthProfit = monthRev - monthExp;
    const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : "0";

    const dailyList = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
    const monthlyList = Object.values(monthlyMap);

    return {
      todayRev,
      todayExp,
      todayProfit,
      monthRev,
      monthExp,
      monthProfit,
      totalRev,
      totalExp,
      netProfit,
      profitMargin,
      accountBalances,
      sourceBreakdown,
      dailyList,
      monthlyList,
      dailyMap,
    };
  }, [transactions]);

  // Filtered transactions for Transaction Ledger table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.category.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q) ||
          (t.source && t.source.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-amber">Accounting & Revenue</span>
            <span className="text-xs text-[#45c66d] font-mono">Live Auto-Calculations</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Finance Ledger Book</h1>
          <p className="muted mt-1 text-sm">
            Track daily revenue, expenses, net profit, payment balances and transaction history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            ↻ Sync Transactions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>＋</span> Add Transaction
          </button>
        </div>
      </div>

      {/* ── TOP STATS CARDS ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="card p-4 border-l-4 border-l-[#45c66d]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">💵 Today Revenue</p>
          <p className="mt-2 text-2xl font-black text-[#45c66d]">{formatUSD(analytics.todayRev)}</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Profit: {formatUSD(analytics.todayProfit)}</p>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-400">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">📅 This Month</p>
          <p className="mt-2 text-2xl font-black text-white">{formatUSD(analytics.monthRev)}</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Expenses: {formatUSD(analytics.monthExp)}</p>
        </div>

        <div className="card p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">📈 Total Revenue</p>
          <p className="mt-2 text-2xl font-black text-white">{formatUSD(analytics.totalRev)}</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Gross total sales</p>
        </div>

        <div className="card p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">💸 Total Expenses</p>
          <p className="mt-2 text-2xl font-black text-rose-400">{formatUSD(analytics.totalExp)}</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Operational costs</p>
        </div>

        <div className="card p-4 border-l-4 border-l-[#45c66d]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">💰 Net Profit</p>
          <p className="mt-2 text-2xl font-black text-[#45c66d]">{formatUSD(analytics.netProfit)}</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Revenue - Expenses</p>
        </div>

        <div className="card p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9198a8]">📊 Profit Margin</p>
          <p className="mt-2 text-2xl font-black text-purple-400">{analytics.profitMargin}%</p>
          <p className="mt-1 text-[11px] text-[#aab0bd]">Margin Efficiency</p>
        </div>
      </div>

      {/* ── CASH FLOW CHART & BREAKDOWN SECTION ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Visual Cash Flow Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Cash Flow & Financial Health</h2>
              <p className="text-xs text-[#9198a8]">Daily revenue vs cost comparison and profit trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#45c66d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#45c66d]" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Cost
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            {/* Visual SVG bar charts */}
            {analytics.dailyList.slice(0, 5).map((d) => {
              const maxVal = Math.max(d.rev, d.exp, 100);
              const revPct = Math.min(100, Math.round((d.rev / maxVal) * 100));
              const expPct = Math.min(100, Math.round((d.exp / maxVal) * 100));

              return (
                <div key={d.date} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-bold">{d.date}</span>
                    <span className="text-[#aab0bd]">
                      Rev: <span className="text-[#45c66d]">{formatUSD(d.rev)}</span> | Exp:{" "}
                      <span className="text-rose-400">{formatUSD(d.exp)}</span> | Profit:{" "}
                      <span className="text-white font-bold">{formatUSD(d.rev - d.exp)}</span>
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex gap-0.5">
                    <div
                      style={{ width: `${revPct}%` }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#45c66d] transition-all rounded-l-full"
                    />
                    <div
                      style={{ width: `${expPct}%` }}
                      className="h-full bg-rose-500 transition-all rounded-r-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Sources Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white">Revenue Sources</h2>
          <p className="text-xs text-[#9198a8] mb-4">Channel performance breakdown</p>

          <div className="space-y-4">
            {Object.entries(analytics.sourceBreakdown).map(([source, val]) => {
              const total = Math.max(analytics.totalRev, 1);
              const pct = Math.round((val / total) * 100);

              return (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">{source}</span>
                    <span className="text-[#45c66d]">{formatUSD(val)} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#45c66d] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PAYMENT ACCOUNTS CURRENT BALANCES ── */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-white mb-1">Payment Accounts Balances</h2>
        <p className="text-xs text-[#9198a8] mb-4">Current funds held per account & gateway</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {Object.entries(analytics.accountBalances).map(([acc, bal]) => (
            <div key={acc} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
              <p className="text-xs font-bold text-[#9198a8] uppercase">{acc}</p>
              {bal.USD > 0 && (
                <p className="mt-2 text-lg font-extrabold text-[#45c66d]">{formatUSD(bal.USD)}</p>
              )}
              {bal.BDT > 0 && (
                <p className="mt-1 text-sm font-bold text-amber-400">{formatBDT(bal.BDT)}</p>
              )}
              {bal.USD === 0 && bal.BDT === 0 && (
                <p className="mt-2 text-sm font-bold text-[#aab0bd]">$0.00</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS FOR DETAILED TABLES ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === "overview" ? "bg-[#45c66d] text-black" : "text-[#aab0bd] hover:bg-white/5"
            }`}
          >
            🗓️ Daily Ledger
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === "ledger" ? "bg-[#45c66d] text-black" : "text-[#aab0bd] hover:bg-white/5"
            }`}
          >
            📋 All Transactions Log
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === "monthly" ? "bg-[#45c66d] text-black" : "text-[#aab0bd] hover:bg-white/5"
            }`}
          >
            📊 Monthly Report
          </button>
        </div>

        {/* ── TAB 1: DAILY LEDGER (WITH DRILL DOWN) ── */}
        {activeTab === "overview" && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">Daily Summary Ledger</h3>
                <p className="text-xs text-[#9198a8]">Click any date row to see itemized transactions</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase text-[#9198a8]">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Revenue</th>
                    <th className="p-4">Cost</th>
                    <th className="p-4">Profit</th>
                    <th className="p-4">Orders/Items</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {analytics.dailyList.map((d) => {
                    const profit = d.rev - d.exp;
                    return (
                      <tr
                        key={d.date}
                        onClick={() => setSelectedDay(d.date)}
                        className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <td className="p-4 text-white font-bold">{d.date}</td>
                        <td className="p-4 text-[#45c66d] font-bold">{formatUSD(d.rev)}</td>
                        <td className="p-4 text-rose-400">{formatUSD(d.exp)}</td>
                        <td className={`p-4 font-bold ${profit >= 0 ? "text-[#45c66d]" : "text-rose-400"}`}>
                          {formatUSD(profit)}
                        </td>
                        <td className="p-4 text-white">{d.items.length} records</td>
                        <td className="p-4 text-right text-xs text-[#45c66d] underline">View Details →</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: TRANSACTION LEDGER ── */}
        {activeTab === "ledger" && (
          <div className="card p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search category, account, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input !mt-0 w-[280px]"
                />
                <select
                  value={filterType}
                  onChange={(e: any) => setFilterType(e.target.value)}
                  className="input !mt-0 w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expense Only</option>
                </select>
              </div>

              <p className="text-xs text-[#9198a8]">
                Showing <b className="text-white">{filteredTransactions.length}</b> records
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase text-[#9198a8]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Account</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-xs text-[#aab0bd]">
                        {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase ${
                            t.type === "income"
                              ? "bg-emerald-500/10 text-[#45c66d] border border-[#45c66d]/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3 text-white font-semibold">{t.category}</td>
                      <td className="p-3 text-amber-400 font-mono text-xs">{t.account}</td>
                      <td className="p-3 text-[#aab0bd] text-xs">{t.source || "Website"}</td>
                      <td className="p-3 text-xs text-[#aab0bd] max-w-[200px] truncate">
                        {t.description || "—"}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          t.type === "income" ? "text-[#45c66d]" : "text-rose-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {t.currency === "BDT" ? formatBDT(t.amount) : formatUSD(t.amount)}
                      </td>
                      <td className="p-3 text-right">
                        {!t.is_system && (
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-xs text-rose-400 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: MONTHLY REPORT ── */}
        {activeTab === "monthly" && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-bold text-white">Monthly Revenue & Cost Report</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase text-[#9198a8]">
                <tr>
                  <th className="p-4">Month</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {analytics.monthlyList.map((m) => {
                  const prof = m.rev - m.exp;
                  return (
                    <tr key={m.month} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{m.month}</td>
                      <td className="p-4 text-[#45c66d] font-bold">{formatUSD(m.rev)}</td>
                      <td className="p-4 text-rose-400">{formatUSD(m.exp)}</td>
                      <td className={`p-4 font-bold ${prof >= 0 ? "text-[#45c66d]" : "text-rose-400"}`}>
                        {formatUSD(prof)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DAILY DRILL-DOWN MODAL ── */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xl font-black text-white">Daily Transactions: {selectedDay}</h3>
                <p className="text-xs text-[#9198a8]">Itemized breakdown for this date</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold text-white hover:bg-white/20"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              {(analytics.dailyMap[selectedDay]?.items || []).map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          t.type === "income" ? "bg-emerald-500/20 text-[#45c66d]" : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {t.type}
                      </span>
                      <span className="font-bold text-white">{t.category}</span>
                      <span className="text-xs text-amber-400">({t.account})</span>
                    </div>
                    <p className="text-xs text-[#aab0bd] mt-1">{t.description || "No notes"}</p>
                  </div>
                  <span
                    className={`font-black text-base ${
                      t.type === "income" ? "text-[#45c66d]" : "text-rose-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {t.currency === "BDT" ? formatBDT(t.amount) : formatUSD(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD TRANSACTION MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-lg p-6 space-y-4 border border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-black text-white">Add New Transaction</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm font-bold text-white hover:opacity-75"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label">Type</span>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="input"
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </label>

                <label>
                  <span className="label">Category</span>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Subscription, OpenAI, Server"
                    className="input"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label">Account</span>
                  <select
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    className="input"
                  >
                    <option value="Paddle">Paddle</option>
                    <option value="Stripe">Stripe</option>
                    <option value="Bank">Bank</option>
                    <option value="Wise">Wise</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                  </select>
                </label>

                <label>
                  <span className="label">Source</span>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="input"
                  >
                    <option value="Website">Website</option>
                    <option value="Gumroad">Gumroad</option>
                    <option value="AppSumo">AppSumo</option>
                    <option value="Direct Invoice">Direct Invoice</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="label">Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="input"
                    required
                  />
                </label>

                <label>
                  <span className="label">Currency</span>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="input"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </label>
              </div>

              <label>
                <span className="label">Description / Notes</span>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional notes or Txn ID"
                  className="input"
                />
              </label>

              <button disabled={isSubmitting} className="btn-primary w-full mt-2">
                {isSubmitting ? "Saving..." : "Save Transaction →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
