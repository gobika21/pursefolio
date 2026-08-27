"use client";

import { useState } from "react";
import { BucketMode, bucketLabel } from "../lib/trend";

type AreaTrendChartProps = {
  data: [string, { income: number; expense: number }][];
  mode: BucketMode;
  format: (amount: number) => string;
};

const GRID_STEPS = [1, 0.75, 0.5, 0.25, 0];

export default function AreaTrendChart({ data, mode, format }: AreaTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const maxValue = Math.max(1, ...data.map(([, v]) => Math.max(v.income, v.expense))) * 1.1;
  const n = data.length;

  const xFor = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const yFor = (value: number) => 100 - (value / maxValue) * 100;

  function areaPath(key: "income" | "expense") {
    const pts = data.map(([, v], i) => [xFor(i), yFor(v[key])]);
    const top = pts.map((p) => p.join(",")).join(" L ");
    return `M ${pts[0][0]},100 L ${top} L ${pts[pts.length - 1][0]},100 Z`;
  }

  function linePath(key: "income" | "expense") {
    const pts = data.map(([, v], i) => [xFor(i), yFor(v[key])]);
    return `M ${pts.map((p) => p.join(",")).join(" L ")}`;
  }

  const showEveryLabel = n <= 10;
  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="flex gap-3">
      <div className="flex h-56 w-16 shrink-0 flex-col justify-between py-1 text-right text-[11px] text-gray-400">
        {GRID_STEPS.map((step) => (
          <span key={step}>{format(maxValue * step)}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="relative h-56 min-w-[420px]">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
            {GRID_STEPS.map((step) => (
              <div key={step} className="border-t border-gray-100" />
            ))}
          </div>

          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d={areaPath("expense")} fill="#e85d4e" fillOpacity={0.15} />
            <path
              d={linePath("expense")}
              fill="none"
              stroke="#e85d4e"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
            <path d={areaPath("income")} fill="#22c55e" fillOpacity={0.18} />
            <path
              d={linePath("income")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute h-full w-px bg-navy/20"
              style={{ left: `${xFor(hoverIndex!)}%` }}
            />
          )}

          {data.map((entry, i) => (
            <div
              key={entry[0]}
              className="absolute top-0 h-full -translate-x-1/2"
              style={{
                left: `${xFor(i)}%`,
                width: `${100 / n}%`,
              }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
            >
              {hoverIndex === i && (
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 flex w-max -translate-x-1/2 -translate-y-full flex-col gap-0.5 rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg">
                  <span className="font-semibold">{bucketLabel(entry[0], mode)}</span>
                  <span className="text-green-300">Income: {format(entry[1].income)}</span>
                  <span className="text-red-300">Expense: {format(entry[1].expense)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative mt-1 h-4 min-w-[420px]">
          {data.map(([key], i) => {
            if (!showEveryLabel && i % 2 !== 0) return null;
            return (
              <span
                key={key}
                className="absolute -translate-x-1/2 whitespace-nowrap text-xs text-gray-500"
                style={{ left: `${xFor(i)}%` }}
              >
                {bucketLabel(key, mode)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
