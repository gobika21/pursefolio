"use client";

import { useAddTransaction } from "../lib/add-transaction-context";

export default function Toast() {
  const { toast } = useAddTransaction();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <span className="text-green-400">✓</span>
      {toast}
    </div>
  );
}
