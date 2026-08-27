export const CATEGORY_ICONS: Record<string, { emoji: string; bg: string }> = {
  "Food & Dining": { emoji: "🍔", bg: "#FDE8D7" },
  Transport: { emoji: "✈️", bg: "#DCEEFB" },
  Shopping: { emoji: "🛍️", bg: "#FBE1F0" },
  "Bills & Utilities": { emoji: "🏠", bg: "#FDF3D0" },
  Entertainment: { emoji: "🎬", bg: "#EAE1FB" },
  Income: { emoji: "💰", bg: "#DFF5E1" },
  Others: { emoji: "📦", bg: "#EDEDED" },
};

export function iconForCategory(category?: string, type?: "income" | "expense") {
  if (category && CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  if (type === "income") return CATEGORY_ICONS.Income;
  return CATEGORY_ICONS.Others;
}
