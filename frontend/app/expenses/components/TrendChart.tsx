import { BucketMode, bucketLabel } from "../lib/trend";

type TrendChartProps = {
  data: [string, { income: number; expense: number }][];
  mode: BucketMode;
  format: (amount: number) => string;
};

const GRID_STEPS = [1, 0.75, 0.5, 0.25, 0];

export default function TrendChart({ data, mode, format }: TrendChartProps) {
  const maxValue = Math.max(1, ...data.map(([, v]) => Math.max(v.income, v.expense)));
  const netFloor = -maxValue * 0.3;
  const netRange = maxValue - netFloor;
  // minmax(..., 1fr) so columns always fill the container width exactly —
  // required for the line overlay's percentage-based x positions to line up with the bars.
  const columns = `repeat(${data.length}, minmax(48px, 1fr))`;

  function netY(net: number) {
    const clamped = Math.max(netFloor, Math.min(maxValue, net));
    return 100 - ((clamped - netFloor) / netRange) * 100;
  }

  const netPoints = data.map(([, v], i) => ({
    x: ((i + 0.5) / data.length) * 100,
    y: netY(v.income - v.expense),
  }));
  const linePath = netPoints.map((p) => `${p.x},${p.y}`).join(" L ");

  return (
    <div className="flex gap-3">
      <div className="flex h-56 w-16 shrink-0 flex-col justify-between py-1 text-right text-[11px] text-gray-400">
        {GRID_STEPS.map((step) => (
          <span key={step}>{format(maxValue * step)}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto">
        <div className="relative h-56 min-w-[320px]">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
            {GRID_STEPS.map((step) => (
              <div key={step} className="border-t border-gray-100" />
            ))}
          </div>

          <div
            className="relative grid h-full items-end gap-6 pb-1"
            style={{ gridTemplateColumns: columns }}
          >
            {data.map(([key, v]) => {
              const incomePct = Math.max(2, (v.income / maxValue) * 100);
              const expensePct = Math.max(2, (v.expense / maxValue) * 100);
              const net = v.income - v.expense;
              return (
                <div key={key} className="group relative flex h-full items-end justify-center gap-1.5">
                  <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden w-max -translate-x-1/2 -translate-y-full flex-col gap-0.5 rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg group-hover:flex">
                    <span className="font-semibold">{bucketLabel(key, mode)}</span>
                    <span className="text-green-300">Income: {format(v.income)}</span>
                    <span className="text-red-300">Expense: {format(v.expense)}</span>
                    <span className="text-cream-dark">Net: {format(net)}</span>
                  </div>
                  <div
                    className="w-4 rounded-t-md bg-green-400 transition-[height] group-hover:bg-green-500"
                    style={{ height: `${incomePct}%` }}
                  />
                  <div
                    className="w-4 rounded-t-md bg-[#e8756a] transition-[height] group-hover:bg-[#e85d4e]"
                    style={{ height: `${expensePct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* SVG only draws the connecting line — straight segments stay correct under a
              non-uniform stretch, but circles would distort into ellipses, so dots are
              plain HTML below instead. */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={`M ${linePath}`}
              fill="none"
              stroke="#1b2340"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {netPoints.map((p, i) => (
            <div
              key={i}
              className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy bg-white"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
        </div>

        <div className="mt-1 grid min-w-[320px]" style={{ gridTemplateColumns: columns }}>
          {data.map(([key]) => (
            <span key={key} className="whitespace-nowrap text-center text-xs text-gray-500">
              {bucketLabel(key, mode)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
