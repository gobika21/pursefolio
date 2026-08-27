export type BucketMode = "day" | "week" | "month" | "year";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // move back to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function bucketKey(dateStr: string, mode: BucketMode): string {
  const d = new Date(dateStr);
  switch (mode) {
    case "day":
      return isoDate(d);
    case "week":
      return isoDate(startOfWeek(d));
    case "year":
      return `${d.getFullYear()}`;
    case "month":
    default:
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  }
}

export function bucketLabel(key: string, mode: BucketMode): string {
  switch (mode) {
    case "day": {
      const d = new Date(key);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    case "week": {
      const start = new Date(key);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const sameMonth = start.getMonth() === end.getMonth();
      const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endLabel = end.toLocaleDateString(
        "en-US",
        sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
      );
      return `${startLabel}–${endLabel}`;
    }
    case "year":
      return key;
    case "month":
    default: {
      const [year, month] = key.split("-").map(Number);
      return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  }
}

export function modeForRange(startStr: string, endStr: string): BucketMode {
  const days = (new Date(endStr).getTime() - new Date(startStr).getTime()) / 86_400_000;
  if (days <= 31) return "day";
  if (days <= 370) return "week";
  return "month";
}

function stepDate(d: Date, mode: BucketMode, n: number): Date {
  const next = new Date(d);
  if (mode === "day") next.setDate(d.getDate() + n);
  else if (mode === "week") next.setDate(d.getDate() + 7 * n);
  else if (mode === "month") next.setMonth(d.getMonth() + n);
  else next.setFullYear(d.getFullYear() + n);
  return next;
}

/** Keys for the last `count` buckets ending at today, oldest first — even ones with no data. */
export function recentBucketKeys(mode: BucketMode, count: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(bucketKey(stepDate(now, mode, -i).toISOString(), mode));
  }
  return Array.from(new Set(keys));
}

/** Every bucket key between start and end inclusive — even ones with no data. */
export function bucketKeysInRange(mode: BucketMode, startStr: string, endStr: string): string[] {
  const end = new Date(endStr);
  const keys: string[] = [];
  let cursor = new Date(startStr);
  while (cursor <= end) {
    keys.push(bucketKey(cursor.toISOString(), mode));
    cursor = stepDate(cursor, mode, 1);
  }
  return Array.from(new Set(keys));
}
