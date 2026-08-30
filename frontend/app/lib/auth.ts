import type { CurrencyCode } from "./currency";
import { clearStoredCurrency, setStoredCurrency } from "./currency";

const TOKEN_KEY = "expenso_token";
const EMAIL_KEY = "expenso_email";

export function saveSession(
  token: string,
  email: string,
  currency?: CurrencyCode,
) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
  if (currency) setStoredCurrency(currency);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  clearStoredCurrency();
}
