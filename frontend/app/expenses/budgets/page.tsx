"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTransactions, Transaction } from "../lib/api";
import { colorForCategory } from "../lib/categories";
import { useCurrency } from "../lib/currency-context";

const BUDGET_TARGETS: Record<string, number> = {
  "Food & Dining": 40000,
  Transport: 28000,
  Shopping: 25000,
  "Bills & Utilities": 20000,
  Entertainment: 15000,
  Others: 12000,
};

export default function BudgetsPage() {
  const { format } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  const spendByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const category = t.category?.trim() || "Others";
      totals.set(category, (totals.get(category) || 0) + t.amount);
    }
    return totals;
  }, [transactions]);

  const budgets = Object.entries(BUDGET_TARGETS).map(([category, target]) => ({
    category,
    target,
    spent: spendByCategory.get(category) || 0,
  }));

  const overallBudget = budgets.reduce((sum, b) => sum + b.target, 0);
  const overallSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = overallBudget
    ? Math.min(100, Math.round((overallSpent / overallBudget) * 100))
    : 0;

  const overBudget = budgets.filter((b) => b.spent > b.target);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
      <p className="mb-6 text-sm text-gray-500">
        Manage your budgets and track spending
      </p>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Overall Budget</h2>
          <span className="text-sm text-gray-500">
            {format(overallSpent)} / {format(overallBudget)}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-2.5 rounded-full ${
              overallPct >= 90 ? "bg-red-500" : "bg-accent"
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {!loading && overBudget.length > 0 && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          <p className="font-semibold">Budget Alert</p>
          <p>
            You&apos;ve exceeded your budget in {overBudget.map((b) => b.category).join(", ")}.
          </p>
        </div>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 font-semibold text-gray-900">Category Budgets</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = b.target ? Math.min(100, Math.round((b.spent / b.target) * 100)) : 0;
              return (
                <div key={b.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: colorForCategory(b.category) }}
                      />
                      {b.category}
                    </span>
                    <span className="text-gray-500">
                      {format(b.spent)} / {format(b.target)} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${
                        b.spent > b.target ? "bg-red-500" : "bg-accent"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
