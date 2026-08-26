"use client";

import { useCurrency } from "../lib/currency-context";

const GOALS = [
  { name: "Buy a New Car", target: 250000, saved: 145000, date: "Dec 31, 2024" },
  { name: "Europe Trip", target: 150000, saved: 75000, date: "Aug 15, 2024" },
  { name: "Emergency Fund", target: 100000, saved: 60000, date: "Mar 31, 2025" },
  { name: "New iPhone", target: 80000, saved: 40000, date: "Aug 31, 2024" },
];

export default function GoalsPage() {
  const { format } = useCurrency();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-500">Track your savings goals</p>
        </div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
          + Add Goal
        </button>
      </div>

      <p className="mb-4 rounded-lg bg-cream-dark px-4 py-2 text-xs text-navy">
        Goals aren&apos;t saved to your account yet — this view is a preview
        of the upcoming feature.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GOALS.map((goal) => {
          const pct = Math.round((goal.saved / goal.target) * 100);
          return (
            <div
              key={goal.name}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-gray-900">{goal.name}</p>
                <span className="text-xs text-gray-500">Target: {goal.date}</span>
              </div>
              <div className="mb-1 flex justify-between text-sm text-gray-600">
                <span>{format(goal.saved)} saved</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                of {format(goal.target)} goal
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
