"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

type AddTransactionContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  refreshKey: number;
  notifySaved: () => void;
};

const AddTransactionContext = createContext<AddTransactionContextValue | null>(null);

export function AddTransactionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const notifySaved = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <AddTransactionContext.Provider value={{ isOpen, open, close, refreshKey, notifySaved }}>
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
