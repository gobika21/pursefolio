import { clearSession, getToken } from "../../lib/auth";

export type TransactionType = "income" | "expense";

export type Transaction = {
  _id: string;
  title: string;
  amount: number;
  category?: string;
  type: TransactionType;
  paymentMethod?: string;
  notes?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TransactionInput = {
  title: string;
  amount: number;
  category?: string;
  type: TransactionType;
  paymentMethod?: string;
  notes?: string;
  date: string;
};

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(status: number) {
  if (status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch("/api/expenses", {
    cache: "no-store",
    headers: authHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error("Unable to load transactions");
  }
  return res.json();
}

export async function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  const result = await res.json();
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error(result.message || "Unable to save transaction");
  }
  return result;
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    handleUnauthorized(res.status);
    throw new Error("Unable to delete transaction");
  }
}
