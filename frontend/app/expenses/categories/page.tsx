"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTransactions, Transaction } from "../lib/api";
import { colorForCategory } from "../lib/categories";
import { useCurrency } from "../lib/currency-context";

export default function CategoriesPage() {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const stats = new Map<string, { count: number; total: number }>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const category = t.category?.trim() || "Others";
      const entry = stats.get(category) || { count: 0, total: 0 };
      entry.count += 1;
      entry.total += t.amount;
      stats.set(category, entry);
    }
    return Array.from(stats.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [transactions]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">
            Manage your spending categories
          </p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
          + Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400">No categorized expenses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(([category, stat]) => (
            <div
              key={category}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: colorForCategory(category) }}
                >
                  🏷️
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{category}</p>
                  <p className="text-xs text-gray-500">{stat.count} transactions</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {format(stat.total)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
