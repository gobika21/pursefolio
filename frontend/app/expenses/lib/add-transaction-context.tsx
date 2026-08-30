"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AddTransactionContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  refreshKey: number;
  notifySaved: () => void;
  toast: string | null;
};

const AddTransactionContext =
  createContext<AddTransactionContextValue | null>(null);

export function AddTransactionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const notifySaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setToast("Transaction saved!");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <AddTransactionContext.Provider
      value={{ isOpen, open, close, refreshKey, notifySaved, toast }}
    >
      {children}
    </AddTransactionContext.Provider>
  );
}

export function useAddTransaction() {
  const ctx = useContext(AddTransactionContext);
  if (!ctx) {
    throw new Error("useAddTransaction must be used within AddTransactionProvider");
  }
  return ctx;
}
