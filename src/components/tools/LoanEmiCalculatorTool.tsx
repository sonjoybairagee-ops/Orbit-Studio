"use client";

import { useState, useMemo } from "react";
import {
  Landmark,
  DollarSign,
  Calendar,
  Percent,
  Download,
  Copy,
  Check,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LoanEmiCalculatorTool() {
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [tenureType, setTenureType] = useState<"years" | "months">("years");
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [viewSchedule, setViewSchedule] = useState<"yearly" | "monthly">("yearly");
  const [copied, setCopied] = useState<boolean>(false);

  // Total tenure in months
  const totalMonths = tenureType === "years" ? tenureYears * 12 : tenureYears;

  // Monthly interest rate
  const monthlyRate = interestRate / 12 / 100;

  // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const baseEmi = useMemo(() => {
    if (loanAmount <= 0 || totalMonths <= 0) return 0;
    if (monthlyRate === 0) return loanAmount / totalMonths;
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    return (loanAmount * monthlyRate * factor) / (factor - 1);
  }, [loanAmount, monthlyRate, totalMonths]);

  // Standard loan summary without prepayment
  const standardSummary = useMemo(() => {
    const totalPayment = baseEmi * totalMonths;
    const totalInterest = Math.max(0, totalPayment - loanAmount);
    const principalPercent = totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 100;
    const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

    return {
      monthlyEmi: baseEmi,
      totalInterest,
      totalPayment,
      principalPercent,
      interestPercent,
    };
  }, [baseEmi, totalMonths, loanAmount]);

  // Prepayment simulation (with extra monthly payment)
  const prepaymentSummary = useMemo(() => {
    if (extraMonthlyPayment <= 0) return null;

    let balance = loanAmount;
    let actualMonths = 0;
    let totalInterestPaid = 0;
    const actualMonthlyPayment = baseEmi + extraMonthlyPayment;

    while (balance > 0.01 && actualMonths < 1000) {
      actualMonths++;
      const interestForMonth = balance * monthlyRate;
      totalInterestPaid += interestForMonth;
      const principalPaid = Math.min(balance, actualMonthlyPayment - interestForMonth);
      balance -= principalPaid;
    }

    const monthsSaved = Math.max(0, totalMonths - actualMonths);
    const interestSaved = Math.max(0, standardSummary.totalInterest - totalInterestPaid);

    return {
      actualMonths,
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
      totalInterestPaid,
      interestSaved,
    };
  }, [extraMonthlyPayment, loanAmount, monthlyRate, baseEmi, totalMonths, standardSummary]);

  // Full Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    const monthlyRows: Array<{
      month: number;
      openingBalance: number;
      interest: number;
      principal: number;
      totalPayment: number;
      closingBalance: number;
    }> = [];

    let balance = loanAmount;
    for (let m = 1; m <= totalMonths && balance > 0.001; m++) {
      const interest = balance * monthlyRate;
      let principal = baseEmi - interest;
      if (principal > balance) {
        principal = balance;
      }
      const payment = principal + interest;
      const closing = Math.max(0, balance - principal);

      monthlyRows.push({
        month: m,
        openingBalance: balance,
        interest,
        principal,
        totalPayment: payment,
        closingBalance: closing,
      });

      balance = closing;
    }

    // Aggregate by Year
    const yearlyRows: Array<{
      year: number;
      openingBalance: number;
      interest: number;
      principal: number;
      totalPayment: number;
      closingBalance: number;
    }> = [];

    for (let i = 0; i < monthlyRows.length; i += 12) {
      const chunk = monthlyRows.slice(i, i + 12);
      const yearNum = Math.floor(i / 12) + 1;
      const opening = chunk[0].openingBalance;
      const closing = chunk[chunk.length - 1].closingBalance;
      const interestYear = chunk.reduce((acc, r) => acc + r.interest, 0);
      const principalYear = chunk.reduce((acc, r) => acc + r.principal, 0);
      const paymentYear = chunk.reduce((acc, r) => acc + r.totalPayment, 0);

      yearlyRows.push({
        year: yearNum,
        openingBalance: opening,
        interest: interestYear,
        principal: principalYear,
        totalPayment: paymentYear,
        closingBalance: closing,
      });
    }

    return { monthlyRows, yearlyRows };
  }, [loanAmount, monthlyRate, totalMonths, baseEmi]);

  // Export Amortization Table to CSV
  const handleExportCsv = () => {
    let header = "Period,Opening Balance,Principal Paid,Interest Paid,Total Payment,Closing Balance\n";
    let rows = "";

    if (viewSchedule === "yearly") {
      rows = amortizationSchedule.yearlyRows
        .map(
          (r) =>
            `Year ${r.year},${r.openingBalance.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(
              2
            )},${r.totalPayment.toFixed(2)},${r.closingBalance.toFixed(2)}`
        )
        .join("\n");
    } else {
      rows = amortizationSchedule.monthlyRows
        .map(
          (r) =>
            `Month ${r.month},${r.openingBalance.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(
              2
            )},${r.totalPayment.toFixed(2)},${r.closingBalance.toFixed(2)}`
        )
        .join("\n");
    }

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loan_amortization_schedule_${viewSchedule}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = [
      `📊 Loan EMI Summary:`,
      `• Loan Amount: $${loanAmount.toLocaleString()}`,
      `• Interest Rate: ${interestRate}% per annum`,
      `• Tenure: ${tenureYears} ${tenureType}`,
      `• Monthly EMI: $${standardSummary.monthlyEmi.toFixed(2)}`,
      `• Total Interest: $${standardSummary.totalInterest.toFixed(2)}`,
      `• Total Repayment: $${standardSummary.totalPayment.toFixed(2)}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Inputs & Visual Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Controls (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Loan Parameters</h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Interactive Sliders
            </span>
          </div>

          {/* Slider 1: Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Loan Amount
              </label>
              <div className="relative w-36 sm:w-44">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min={1000}
                  max={2000000}
                  step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-3 text-sm font-bold text-slate-900 text-right focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={5000}
              max={1500000}
              step={5000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>$5,000</span>
              <span>$500,000</span>
              <span>$1,000,000</span>
              <span>$1,500,000</span>
            </div>
          </div>

          {/* Slider 2: Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interest Rate (Annual)
              </label>
              <div className="relative w-28">
                <input
                  type="number"
                  min={0.1}
                  max={25}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-7 text-sm font-bold text-slate-900 text-right focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1%</span>
              <span>5%</span>
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Slider 3: Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Loan Tenure
                </label>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === "months") {
                        setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                      }
                      setTenureType("years");
                    }}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      tenureType === "years" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Yr
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tenureType === "years") {
                        setTenureYears(tenureYears * 12);
                      }
                      setTenureType("months");
                    }}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      tenureType === "months" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Mo
                  </button>
                </div>
              </div>
              <div className="relative w-28">
                <input
                  type="number"
                  min={1}
                  max={tenureType === "years" ? 40 : 480}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-sm font-bold text-slate-900 text-right focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={tenureType === "years" ? 30 : 360}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{tenureType === "years" ? "1 Yr" : "12 Mo"}</span>
              <span>{tenureType === "years" ? "10 Yrs" : "120 Mo"}</span>
              <span>{tenureType === "years" ? "20 Yrs" : "240 Mo"}</span>
              <span>{tenureType === "years" ? "30 Yrs" : "360 Mo"}</span>
            </div>
          </div>

          {/* Prepayment / Extra Payment Option */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Extra Monthly Prepayment (Optional)
                </span>
                <p className="text-[11px] text-slate-400">
                  Simulate paying extra each month to save interest and pay off faster.
                </p>
              </div>
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-6 pr-2.5 text-xs font-bold text-slate-900 text-right focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {prepaymentSummary && prepaymentSummary.interestSaved > 0 && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 mt-3 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <div className="font-bold text-emerald-800">
                    Prepayment Savings: Save ${prepaymentSummary.interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })} in Interest!
                  </div>
                  <div>
                    Your loan will be paid off in{" "}
                    <strong>{(prepaymentSummary.actualMonths / 12).toFixed(1)} years</strong> instead of {tenureYears} years ({prepaymentSummary.monthsSaved} months sooner).
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Payment (EMI)
            </span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Large EMI Display */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-6 text-center">
            <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight">
              ${standardSummary.monthlyEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-bold text-emerald-800/80 mt-1 uppercase tracking-wider">
              Monthly Payment for {totalMonths} Months
            </div>
          </div>

          {/* Visual Progress Bar / Donut alternative */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-blue-600 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block"></span>
                Principal ({standardSummary.principalPercent.toFixed(1)}%)
              </span>
              <span className="text-amber-600 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span>
                Interest ({standardSummary.interestPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${standardSummary.principalPercent}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${standardSummary.interestPercent}%` }}
              />
            </div>
          </div>

          {/* Cost Breakdown Details */}
          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-slate-500">Principal Amount:</span>
              <span className="font-mono font-bold text-slate-900">
                ${loanAmount.toLocaleString()}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-500">Total Interest Payable:</span>
              <span className="font-mono font-bold text-amber-600">
                ${standardSummary.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-900 font-bold">Total Payment (P + I):</span>
              <span className="font-mono font-extrabold text-slate-900">
                ${standardSummary.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Amortization Schedule</h3>
            <p className="text-xs text-slate-500">
              Detailed loan repayment trajectory with principal reduction and interest amortized over time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewSchedule("yearly")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  viewSchedule === "yearly" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                Yearly
              </button>
              <button
                type="button"
                onClick={() => setViewSchedule("monthly")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  viewSchedule === "monthly" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                Monthly
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-2xs z-10 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Period</th>
                <th className="py-3 px-4 text-right">Opening Balance</th>
                <th className="py-3 px-4 text-right">Principal Repaid</th>
                <th className="py-3 px-4 text-right">Interest Paid</th>
                <th className="py-3 px-4 text-right">Total Payment</th>
                <th className="py-3 px-4 sm:px-6 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {viewSchedule === "yearly"
                ? amortizationSchedule.yearlyRows.map((r) => (
                    <tr key={r.year} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 sm:px-6 font-sans font-bold text-slate-800">
                        Year {r.year}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600">
                        ${r.openingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-blue-600">
                        ${r.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-600">
                        ${r.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-900">
                        ${r.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                        ${r.closingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))
                : amortizationSchedule.monthlyRows.map((r) => (
                    <tr key={r.month} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-4 sm:px-6 font-sans font-semibold text-slate-700">
                        Month {r.month}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        ${r.openingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-blue-600">
                        ${r.principal.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-amber-600">
                        ${r.interest.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-900">
                        ${r.totalPayment.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 sm:px-6 text-right font-semibold text-slate-900">
                        ${r.closingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
