export default function Wordmark({
  className = "text-lg",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span className={onDark ? "text-white" : "text-navy"}>Purse</span>
      <span style={{ color: "#f4b400" }}>folio</span>
    </span>
  );
}
