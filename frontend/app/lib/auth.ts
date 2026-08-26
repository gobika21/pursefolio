import type { CurrencyCode } from "./currency";

const TOKEN_KEY = "expenso_token";
const EMAIL_KEY = "expenso_email";
const CURRENCY_KEY = "expenso_currency";

export function saveSession(
  token: string,
  email: string,
  currency?: CurrencyCode,
) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  if (currency) localStorage.setItem(CURRENCY_KEY, currency);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function getStoredCurrency(): CurrencyCode | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
}

export function setStoredCurrency(currency: CurrencyCode) {
  localStorage.setItem(CURRENCY_KEY, currency);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(CURRENCY_KEY);
}
