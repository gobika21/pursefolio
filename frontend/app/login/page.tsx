"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { saveSession } from "../lib/auth";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      saveSession(result.token, result.email, result.currency);
      router.push("/expenses/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            className="mb-1 block text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
            type="email"
            placeholder="you@example.com"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
          </div>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
            type="password"
            placeholder="••••••••"
            id="password"
            value={password}
            minLength={8}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-dark disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
