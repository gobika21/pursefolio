"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getEmail } from "../../lib/auth";

export default function Topbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
  }, []);

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-end gap-4 border-b border-black/5 bg-white px-8 py-3">
      <span className="truncate text-sm font-medium text-gray-600">
        {email || "Signed in"}
      </span>
      <button
        onClick={handleLogout}
        className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        Logout
      </button>
    </header>
  );
}
