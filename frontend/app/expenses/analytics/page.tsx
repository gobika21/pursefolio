"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchTransactions, Transaction } from "../lib/api";
import { colorForCategory } from "../lib/categories";
import { useCurrency } from "../lib/currency-context";

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

export default function AnalyticsPage() {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const byMonth = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of transactions) {
      const key = monthKey(t.date);
      const entry = map.get(key) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [transactions]);

  const maxMonthTotal = Math.max(
    1,
    ...byMonth.map(([, v]) => Math.max(v.income, v.expense)),
  );

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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-semibold text-gray-900">
            Income vs Expenses Trend
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : byMonth.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="flex h-56 items-end gap-4">
              {byMonth.map(([key, v]) => (
                <div key={key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-44 w-full items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t bg-green-400"
                      style={{ height: `${(v.income / maxMonthTotal) * 100}%` }}
                      title={`Income: ${format(v.income)}`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-red-400"
                      style={{ height: `${(v.expense / maxMonthTotal) * 100}%` }}
                      title={`Expense: ${format(v.expense)}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{monthLabel(key)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Expenses
            </span>
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
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => {
                const max = topCategories[0][1] || 1;
                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between text-sm text-gray-700">
                      <span>{category}</span>
                      <span className="text-gray-500">{format(amount)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(amount / max) * 100}%`,
                          backgroundColor: colorForCategory(category),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
