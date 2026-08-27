import AuthGuard from "./components/AuthGuard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AddTransactionModal from "./components/AddTransactionModal";
import { CurrencyProvider } from "./lib/currency-context";
import { AddTransactionProvider } from "./lib/add-transaction-context";

export default function ExpensesLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <CurrencyProvider>
        <AddTransactionProvider>
          <div className="flex min-h-screen bg-cream">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="flex-1 overflow-x-hidden p-8">{children}</main>
            </div>
          </div>
          <AddTransactionModal />
        </AddTransactionProvider>
      </CurrencyProvider>
    </AuthGuard>
  );
}
