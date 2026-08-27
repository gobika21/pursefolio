import { redirect } from "next/navigation";

export default function AddTransactionPage() {
  redirect("/expenses/transactions");
}
