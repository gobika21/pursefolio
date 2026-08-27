export const CURRENCIES = [
  { code: "USD", country: "United States", name: "US Dollar" },
  { code: "EUR", country: "Eurozone", name: "Euro" },
  { code: "GBP", country: "United Kingdom", name: "British Pound" },
  { code: "INR", country: "India", name: "Indian Rupee" },
  { code: "AED", country: "UAE", name: "UAE Dirham" },
  { code: "CAD", country: "Canada", name: "Canadian Dollar" },
  { code: "AUD", country: "Australia", name: "Australian Dollar" },
  { code: "JPY", country: "Japan", name: "Japanese Yen" },
  { code: "CNY", country: "China", name: "Chinese Yuan" },
  { code: "SGD", country: "Singapore", name: "Singapore Dollar" },
  { code: "CHF", country: "Switzerland", name: "Swiss Franc" },
  { code: "SEK", country: "Sweden", name: "Swedish Krona" },
  { code: "NOK", country: "Norway", name: "Norwegian Krone" },
  { code: "DKK", country: "Denmark", name: "Danish Krone" },
  { code: "NZD", country: "New Zealand", name: "New Zealand Dollar" },
  { code: "HKD", country: "Hong Kong", name: "Hong Kong Dollar" },
  { code: "KRW", country: "South Korea", name: "South Korean Won" },
  { code: "ZAR", country: "South Africa", name: "South African Rand" },
  { code: "BRL", country: "Brazil", name: "Brazilian Real" },
  { code: "MXN", country: "Mexico", name: "Mexican Peso" },
  { code: "THB", country: "Thailand", name: "Thai Baht" },
  { code: "IDR", country: "Indonesia", name: "Indonesian Rupiah" },
  { code: "MYR", country: "Malaysia", name: "Malaysian Ringgit" },
  { code: "PHP", country: "Philippines", name: "Philippine Peso" },
  { code: "VND", country: "Vietnam", name: "Vietnamese Dong" },
  { code: "SAR", country: "Saudi Arabia", name: "Saudi Riyal" },
  { code: "QAR", country: "Qatar", name: "Qatari Riyal" },
  { code: "KWD", country: "Kuwait", name: "Kuwaiti Dinar" },
  { code: "EGP", country: "Egypt", name: "Egyptian Pound" },
  { code: "NGN", country: "Nigeria", name: "Nigerian Naira" },
  { code: "PKR", country: "Pakistan", name: "Pakistani Rupee" },
  { code: "BDT", country: "Bangladesh", name: "Bangladeshi Taka" },
  { code: "LKR", country: "Sri Lanka", name: "Sri Lankan Rupee" },
  { code: "TRY", country: "Turkey", name: "Turkish Lira" },
  { code: "RUB", country: "Russia", name: "Russian Ruble" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function symbolForCurrency(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

export function labelForCurrency(currency: string): string {
  const entry = CURRENCIES.find((c) => c.code === currency);
  if (!entry) return currency;
  return `${entry.code} (${symbolForCurrency(entry.code)}) — ${entry.name}, ${entry.country}`;
}
