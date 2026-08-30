"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteTransaction,
  fetchTransactions,
  Transaction,
  TransactionInput,
  TransactionType,
  updateTransaction,
} from "../lib/api";
import { formatDate } from "../lib/format";
import { useCurrency } from "../lib/currency-context";
import CategoryIcon from "../components/CategoryIcon";
import { useAddTransaction } from "../lib/add-transaction-context";
import { CATEGORIES } from "../lib/categories";

// ── Edit modal ──────────────────────────────────────────────────────────────

type EditModalProps = {
  transaction: Transaction;
  onClose: () => void;
  onSaved: (updated: Transaction) => void;
};

function EditModal({ transaction, onClose, onSaved }: EditModalProps) {
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category ?? "");
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [paymentMethod, setPaymentMethod] = useState(
    transaction.paymentMethod ?? "",
  );
  const [notes, setNotes] = useState(transaction.notes ?? "");
  const [date, setDate] = useState(transaction.date.slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const input: TransactionInput = {
        title: title.trim(),
        amount: parseFloat(amount),
        category: category || undefined,
        type,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
        date,
      };
      const updated = await updateTransaction(transaction._id, input);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="flex gap-2">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  type === t
                    ? t === "expense"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Amount + Date side by side */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Amount
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select category</option>
              {CATEGORIES.filter((c) =>
                type === "income" ? c === "Income" : c !== "Income",
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment method */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Payment method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select method</option>
              {["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"].map(
                (m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { format } = useCurrency();
  const { open, refreshKey } = useAddTransaction();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  function load() {
    setLoading(true);
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
      .filter((t) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return (
          t.title.toLowerCase().includes(term) ||
          (t.category || "").toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, typeFilter]);

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete");
    }
  }

  function handleSaved(updated: Transaction) {
    setTransactions((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t)),
    );
  }

  return (
    <div>
      {editTarget && (
        <EditModal
          transaction={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500">
            View and manage all your transactions
          </p>
        </div>
        <button
          onClick={open}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Transaction
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5">
          {(["all", "income", "expense"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setTypeFilter(option)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                typeFilter === option
                  ? "bg-accent text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={t.category} type={t.type} size={36} />
                      <div>
                        <p className="font-medium text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {t.category || "Others"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        t.type === "income"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {format(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditTarget(t)}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
