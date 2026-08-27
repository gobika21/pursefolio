"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../components/Logo";
import Wordmark from "../../components/Wordmark";

const NAV_ITEMS = [
  { href: "/expenses/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/expenses/transactions", label: "Transactions", icon: "💳" },
  { href: "/expenses/analytics", label: "Analytics", icon: "📈" },
  { href: "/expenses/budgets", label: "Budgets", icon: "🎯" },
  { href: "/expenses/goals", label: "Goals", icon: "🏁" },
  { href: "/expenses/categories", label: "Categories", icon: "🏷️" },
  { href: "/expenses/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy text-cream">
      <div className="flex items-center gap-2 px-6 py-6">
        <Logo className="h-8 w-8 text-white" />
        <Wordmark className="text-lg" onDark />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-cream-dark hover:bg-navy-dark hover:text-white"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro — add back later
      <div className="m-3 rounded-xl bg-navy-dark/60 p-4 text-sm">
        <p className="font-semibold text-white">Upgrade to Pro</p>
        <p className="mt-1 text-cream-dark/80">
          Unlock advanced analytics, export data &amp; more.
        </p>
        <button className="mt-3 w-full rounded-lg bg-accent py-2 text-xs font-semibold text-white hover:bg-accent-dark">
          Upgrade Now
        </button>
      </div>
      */}
    </aside>
  );
}
