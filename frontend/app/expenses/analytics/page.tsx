"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchTransactions, Transaction } from "../lib/api";
import { useCurrency } from "../lib/currency-context";
import { bucketKey, bucketKeysInRange, modeForRange, recentBucketKeys } from "../lib/trend";
import TrendChart from "../components/TrendChart";
import AreaTrendChart from "../components/AreaTrendChart";
import CategoryDonut from "../components/CategoryDonut";

type Period = "weekly" | "monthly" | "yearly" | "custom";
type ChartStyle = "bars" | "area";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("monthly");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("bars");
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [rangeEnd, setRangeEnd] = useState(todayISO);

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = income ? Math.round(((income - expense) / income) * 100) : 0;
    return { income, expense, net: income - expense, savingsRate };
  }, [transactions]);

  const { mode, source } = useMemo(() => {
    if (period === "custom") {
      const start = new Date(rangeStart).getTime();
      const end = new Date(rangeEnd).getTime();
      return {
        mode: modeForRange(rangeStart, rangeEnd),
        source: transactions.filter((t) => {
          const time = new Date(t.date).getTime();
          return time >= start && time <= end;
        }),
      };
    }
    if (period === "weekly") return { mode: "week" as const, source: transactions };
    if (period === "yearly") return { mode: "year" as const, source: transactions };
    return { mode: "month" as const, source: transactions };
  }, [transactions, period, rangeStart, rangeEnd]);

  const chartData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of source) {
      const key = bucketKey(t.date, mode);
      const entry = map.get(key) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(key, entry);
    }

    let expectedKeys: string[];
    if (period === "weekly") expectedKeys = recentBucketKeys("week", 8);
    else if (period === "monthly") expectedKeys = recentBucketKeys("month", 12);
    else if (period === "yearly") expectedKeys = recentBucketKeys("year", 5);
    else expectedKeys = bucketKeysInRange(mode, rangeStart, rangeEnd);

    // Union with any real data outside the default window (e.g. older years) so it isn't dropped.
    const allKeys = Array.from(new Set([...expectedKeys, ...map.keys()])).sort((a, b) =>
      a.localeCompare(b),
    );

    return allKeys.map(
      (key): [string, { income: number; expense: number }] => [
        key,
        map.get(key) || { income: 0, expense: 0 },
      ],
    );
  }, [source, mode, period, rangeStart, rangeEnd]);

  const topCategories = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const category = t.category?.trim() || "Others";
      totals.set(category, (totals.get(category) || 0) + t.amount);
    }
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mb-6 text-sm text-gray-500">
        Track your financial performance
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Income" value={format(totals.income)} icon="⬆️" accent="#dcfce7" />
        <StatCard label="Total Expenses" value={format(totals.expense)} icon="🗑️" accent="#fee2e2" />
        <StatCard label="Net Savings" value={format(totals.net)} icon="💰" accent="#e0e7ff" />
        <StatCard label="Savings Rate" value={`${totals.savingsRate}%`} icon="📈" accent="#fef9c3" />
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">
              Income vs Expenses Trend
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {(["bars", "area"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setChartStyle(option)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                      chartStyle === option
                        ? "bg-navy text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {(["weekly", "monthly", "yearly", "custom"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setPeriod(option)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                      period === option
                        ? "bg-accent text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {period === "custom" && (
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                From
                <input
                  type="date"
                  value={rangeStart}
                  max={rangeEnd}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex items-center gap-2 text-gray-600">
                To
                <input
                  type="date"
                  value={rangeEnd}
                  min={rangeStart}
                  max={todayISO()}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : chartStyle === "bars" ? (
            <TrendChart data={chartData} mode={mode} format={format} />
          ) : (
            <AreaTrendChart data={chartData} mode={mode} format={format} />
          )}
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#e85d4e]" /> Expenses
            </span>
            {chartStyle === "bars" && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-navy" /> Net savings
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-semibold text-gray-900">
            Top Spending Categories
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : topCategories.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses yet.</p>
          ) : (
            <CategoryDonut data={topCategories} format={format} />
          )}
        </div>
      </div>
    </div>
  );
}
