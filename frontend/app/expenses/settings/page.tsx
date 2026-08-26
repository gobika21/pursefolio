"use client";

import { CURRENCIES, CurrencyCode } from "../../lib/currency";
import { useCurrency } from "../lib/currency-context";

export default function SettingsPage() {
  const { currency, setCurrency, saving } = useCurrency();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mb-6 text-sm text-gray-500">
        Manage your account and preferences
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">
            Name and profile editing are coming soon.
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-semibold text-gray-900">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                value={currency}
                disabled={saving}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-60"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} — {c.country}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                {saving ? "Saving…" : "Applies across dashboards, budgets & goals."}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Theme
              </label>
              <div className="flex gap-2">
                {["Light", "Dark", "System"].map((theme, i) => (
                  <button
                    key={theme}
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      i === 0
                        ? "bg-accent text-white"
                        : "border border-gray-300 text-gray-600"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Theme switching is coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
