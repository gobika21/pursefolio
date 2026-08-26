import { ReactNode } from "react";
import Logo from "./Logo";
import Wordmark from "./Wordmark";

const HIGHLIGHTS = [
  { icon: "📊", text: "Real-time dashboards for balance, income & spend" },
  { icon: "🎯", text: "Budgets and goals that keep you on track" },
  { icon: "🔒", text: "Your data stays private and secure" },
];

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-cream">
      <div className="relative hidden w-1/2 flex-col justify-between bg-navy p-12 text-cream lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-9 text-white" />
            <Wordmark className="text-xl" onDark />
          </div>
          <p className="mt-1 pl-[3px] text-[11px] font-semibold tracking-[0.2em] text-cream-dark/60">
            TRACK · PLAN · GROW
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Take control of your money.
          </h2>
          <p className="mt-3 max-w-sm text-cream-dark/80">
            Track spending, set budgets, and hit your savings goals — all in
            one calm, clear dashboard.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-dark text-lg">
                  {item.icon}
                </span>
                <span className="pt-1.5 text-sm text-cream-dark/90">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-cream-dark/50">
          © {new Date().getFullYear()} Pursefolio. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8 text-navy" />
            <Wordmark className="text-lg" />
          </div>

          <h1 className="text-2xl font-bold text-navy">{title}</h1>
          <p className="mt-1 mb-8 text-sm text-gray-500">{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
