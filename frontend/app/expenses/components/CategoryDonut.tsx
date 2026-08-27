import { colorForCategory } from "../lib/categories";

type CategoryDonutProps = {
  data: [string, number][];
  format: (amount: number) => string;
};

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 78;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CategoryDonut({ data, format }: CategoryDonutProps) {
  const total = data.reduce((sum, [, amount]) => sum + amount, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
        {data.map(([category, amount]) => {
          const fraction = amount / total;
          const length = fraction * CIRCUMFERENCE;
          const circle = (
            <circle
              key={category}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={colorForCategory(category)}
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            >
              <title>{`${category}: ${format(amount)}`}</title>
            </circle>
          );
          offset += length;
          return circle;
        })}
        <text x={CENTER} y={CENTER - 6} textAnchor="middle" className="fill-gray-500 text-xs">
          Total spent
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          className="fill-gray-900 text-base font-bold"
        >
          {format(total)}
        </text>
      </svg>

      <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
        {data.map(([category, amount]) => {
          const pct = Math.round((amount / total) * 100);
          return (
            <div key={category} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: colorForCategory(category) }}
                />
                {category}
              </span>
              <span className="whitespace-nowrap text-xs text-gray-500">
                {format(amount)} · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
