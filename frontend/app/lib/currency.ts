export type CurrencyCode = "INR" | "AED" | "CAD";

export const CURRENCIES: {
  code: CurrencyCode;
  country: string;
  locale: string;
  label: string;
  symbol: string;
}[] = [
  { code: "INR", country: "India", locale: "en-IN", label: "INR (₹) - Indian Rupee", symbol: "₹" },
  { code: "AED", country: "Dubai (UAE)", locale: "en-AE", label: "AED (د.إ) - UAE Dirham", symbol: "د.إ" },
  { code: "CAD", country: "Canada", locale: "en-CA", label: "CAD ($) - Canadian Dollar", symbol: "$" },
];

export function localeForCurrency(currency: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
}

export function symbolForCurrency(currency: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹";
}
