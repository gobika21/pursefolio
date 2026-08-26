import AuthGuard from "./components/AuthGuard";
import Sidebar from "./components/Sidebar";
import { CurrencyProvider } from "./lib/currency-context";

export default function ExpensesLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <CurrencyProvider>
        <div className="flex min-h-screen bg-cream">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden p-8">{children}</main>
        </div>
      </CurrencyProvider>
    </AuthGuard>
  );
}
