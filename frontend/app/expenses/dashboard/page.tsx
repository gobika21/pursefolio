"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { fetchTransactions, Transaction } from "../lib/api";
import { formatDate } from "../lib/format";
import { colorForCategory } from "../lib/categories";
import { useCurrency } from "../lib/currency-context";

export default function DashboardPage() {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const spendingByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const category = t.category?.trim() || "Others";
      totals.set(category, (totals.get(category) || 0) + t.amount);
    }
    const entries = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
    return { entries, total };
  }, [transactions]);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [transactions],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good day, Gobika 👋
          </h1>
          <p className="text-sm text-gray-500">
            Here&apos;s your financial overview
          </p>
        </div>
        <Link
          href="/expenses/transactions/add"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Transaction
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Balance"
          value={format(stats.balance)}
          icon="💰"
          accent="#f5ddc4"
        />
        <StatCard
          label="Income"
          value={format(stats.income)}
          icon="⬆️"
          accent="#e2ece0"
        />
        <StatCard
          label="Expenses"
          value={format(stats.expense)}
          icon="🗑️"
          accent="#f8ddd9"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-semibold text-gray-900">
            Spending by Category
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : spendingByCategory.entries.length === 0 ? (
            <p className="text-sm text-gray-400">No expenses yet.</p>
          ) : (
            <div className="space-y-3">
              {spendingByCategory.entries.map(([category, amount]) => {
                const pct = spendingByCategory.total
                  ? Math.round((amount / spendingByCategory.total) * 100)
                  : 0;
                return (
                  <div key={category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colorForCategory(category) }}
                        />
                        {category}
                      </span>
                      <span className="text-gray-500">
                        {format(amount)} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${pct}%`,
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

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <Link
              href="/expenses/transactions"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-gray-400">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((t) => (
                <li key={t._id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm"
                      style={{
                        backgroundColor: colorForCategory(
                          t.category || "Others",
                        ),
                      }}
                    >
                      {t.type === "income" ? "⬆️" : "🛒"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.category || "Others"} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {format(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
