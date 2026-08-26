"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CurrencyCode } from "../../lib/currency";
import { getStoredCurrency, getToken, setStoredCurrency } from "../../lib/auth";
import { formatCurrency } from "./format";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  format: (amount: number) => string;
  saving: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    () => getStoredCurrency() || "INR",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.currency) {
          setCurrencyState(data.currency);
          setStoredCurrency(data.currency);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback(async (next: CurrencyCode) => {
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currency: next }),
      });
      if (!res.ok) throw new Error("Unable to update currency");
      setCurrencyState(next);
      setStoredCurrency(next);
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      format: (amount: number) => formatCurrency(amount, currency),
      saving,
    }),
    [currency, setCurrency, saving],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
