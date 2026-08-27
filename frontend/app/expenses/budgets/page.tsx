"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTransactions, Transaction } from "../lib/api";
import { useCurrency } from "../lib/currency-context";
import { getToken } from "../../lib/auth";
import CategoryIcon from "../components/CategoryIcon";

const BUDGET_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Others",
];

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function BudgetsPage() {
  const { format, currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [overallBudget, setOverallBudget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchTransactions(),
      fetch("/api/users/me", { headers: authHeaders() }).then((res) =>
        res.ok ? res.json() : null,
      ),
    ])
      .then(([txns, profile]) => {
        setTransactions(txns);
        if (profile) {
          setOverallBudget(profile.overallBudget || 0);
          setCategoryBudgets(profile.categoryBudgets || {});
        }
      })
      .catch((err) => setError(err.message))
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

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const budgets = BUDGET_CATEGORIES.map((category) => ({
    category,
    target: categoryBudgets[category] || 0,
    spent: spendByCategory.get(category) || 0,
  }));

  const overallPct = overallBudget
    ? Math.min(100, Math.round((totalSpent / overallBudget) * 100))
    : 0;
  const overallRemaining = overallBudget - totalSpent;

  const overBudget = budgets.filter((b) => b.target > 0 && b.spent > b.target);

  async function saveBudgets(next: {
    overallBudget?: number;
    categoryBudgets?: Record<string, number>;
  }) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/me/budgets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(next),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unable to save budget");
      setOverallBudget(result.overallBudget || 0);
      setCategoryBudgets(result.categoryBudgets || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save budget");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(key: string, current: number) {
    setEditing(key);
    setDraftValue(current ? String(current) : "");
  }

  function cancelEdit() {
    setEditing(null);
    setDraftValue("");
  }

  async function confirmEdit(key: string) {
    const value = Number(draftValue);
    if (Number.isNaN(value) || value < 0) {
      setError("Enter a valid non-negative amount");
      return;
    }

    if (key === "overall") {
      await saveBudgets({ overallBudget: value });
    } else {
      await saveBudgets({ categoryBudgets: { ...categoryBudgets, [key]: value } });
    }
    setEditing(null);
    setDraftValue("");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <p className="text-sm text-gray-500">
          Manage your budgets and track spending, in {currency}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Overall Monthly Budget</h2>
          {editing === "overall" ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                autoFocus
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={() => confirmEdit("overall")}
                disabled={saving}
                className="rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit("overall", overallBudget)}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {overallBudget ? "Edit" : "Set budget"}
            </button>
          )}
        </div>

        {overallBudget ? (
          <>
            <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
              <span>
                {format(totalSpent)} of {format(overallBudget)}
              </span>
              <span className={overallRemaining < 0 ? "text-red-600" : "text-gray-500"}>
                {overallRemaining < 0
                  ? `${format(Math.abs(overallRemaining))} over`
                  : `${format(overallRemaining)} left`}
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
          </>
        ) : (
          <p className="text-sm text-gray-400">
            No overall budget set yet — click &quot;Set budget&quot; to start tracking.
          </p>
        )}
      </div>

      {!loading && overBudget.length > 0 && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          <p className="font-semibold">Budget Alert</p>
          <p>
            You&apos;ve exceeded your budget in{" "}
            {overBudget.map((b) => b.category).join(", ")}.
          </p>
        </div>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 font-semibold text-gray-900">Category Budgets</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-5">
            {budgets.map((b) => {
              const pct = b.target
                ? Math.min(100, Math.round((b.spent / b.target) * 100))
                : 0;
              const isEditing = editing === b.category;
              return (
                <div key={b.category} className="flex items-center gap-3">
                  <CategoryIcon category={b.category} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{b.category}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            autoFocus
                            value={draftValue}
                            onChange={(e) => setDraftValue(e.target.value)}
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <button
                            onClick={() => confirmEdit(b.category)}
                            disabled={saving}
                            className="rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : b.target ? (
                        <button
                          onClick={() => startEdit(b.category, b.target)}
                          className="text-gray-500 hover:text-accent"
                        >
                          {format(b.spent)} / {format(b.target)} · {pct}%
                        </button>
                      ) : (
                        <button
                          onClick={() => startEdit(b.category, 0)}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          Set budget
                        </button>
                      )}
                    </div>
                    {b.target > 0 && (
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${
                            b.spent > b.target ? "bg-red-500" : "bg-accent"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
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
