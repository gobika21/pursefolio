"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getToken } from "../../lib/auth";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return <>{children}</>;
}
