import { CurrencyCode, localeForCurrency } from "../../lib/currency";

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "INR",
): string {
  return new Intl.NumberFormat(localeForCurrency(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
