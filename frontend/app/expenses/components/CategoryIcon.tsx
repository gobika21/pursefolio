import { iconForCategory } from "../lib/categoryIcons";

export default function CategoryIcon({
  category,
  type,
  size = 40,
}: {
  category?: string;
  type?: "income" | "expense";
  size?: number;
}) {
  const { emoji, bg } = iconForCategory(category, type);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.5 }}
    >
      {emoji}
    </span>
  );
}
