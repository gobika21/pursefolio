export const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Income",
  "Others",
] as const;

export const BUDGET_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Others",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#e8934a",
  Transport: "#1b2340",
  Shopping: "#e85d4e",
  "Bills & Utilities": "#c9a24a",
  Entertainment: "#8a6bb0",
  Income: "#8fae8b",
  Others: "#8a8580",
};

export function colorForCategory(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Others;
}
