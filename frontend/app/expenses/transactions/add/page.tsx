"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTransaction, TransactionType } from "../../lib/api";
import { useCurrency } from "../../lib/currency-context";
import { symbolForCurrency } from "../../../lib/currency";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Income",
  "Others",
];

const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Bank Transfer", "Cash"];

export default function AddTransactionPage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid title and amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransaction({
        title: title.trim(),
        amount: parsedAmount,
        category: category || undefined,
        type,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
        date,
      });
      router.push("/expenses/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
      <p className="mb-6 text-sm text-gray-500">Enter transaction details</p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
      >
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["expense", "income"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize ${
                type === option
                  ? "bg-accent text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Swiggy Order"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${symbolForCurrency(currency)} 0.00`}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
