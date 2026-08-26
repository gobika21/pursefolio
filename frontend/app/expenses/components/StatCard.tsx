type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  accent: string;
};

export default function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
    </div>
  );
}
