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

export type UserProfile = {
  email: string;
  currency: string;
  overallBudget: number;
  categoryBudgets: Record<string, number>;
};

export function authHeaders(): HeadersInit {
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

export async function updateTransaction(
  id: string,
  input: TransactionInput,
): Promise<Transaction> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  const result = await res.json();
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error(result.message || "Unable to update transaction");
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

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch("/api/users/me", { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error("Unable to load profile");
  }
  return res.json();
}

export async function patchBudgets(payload: {
  overallBudget?: number;
  categoryBudgets?: Record<string, number>;
}): Promise<UserProfile> {
  const res = await fetch("/api/users/me/budgets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw new Error(result.message || "Unable to save budget");
  }
  return result;
}
