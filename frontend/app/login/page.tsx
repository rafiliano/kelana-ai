"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, saveUserName, saveUserEmail, fetchMe } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function LoginPage() {
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginUser(form.email, form.password);
      // Fetch full name from backend and save to localStorage
      const profile = await fetchMe();
      saveUserName(profile.name);
      saveUserEmail(profile.email);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <NavBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#1a1a2e]"
                style={{ fontFamily: "var(--font-cinzel)" }}>
              Welcome Back
            </h2>
            <p className="text-[#94a3b8] text-sm mt-2">
              Sign in to continue planning your adventure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] p-6 shadow-md flex flex-col gap-4">

            <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
              <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Email</p>
              <input
                name        = "email"
                type        = "email"
                value       = {form.email}
                onChange    = {handleChange}
                placeholder = "you@example.com"
                className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
              />
            </div>

            <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
              <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Password</p>
              <input
                name        = "password"
                type        = "password"
                value       = {form.password}
                onChange    = {handleChange}
                placeholder = "••••••••"
                className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
              />
            </div>

            {error && (
              <div className="border border-[#c0392b] bg-[#fdf2f2] p-3 text-[#c0392b] text-xs uppercase tracking-widest">
                ⚠ {error}
              </div>
            )}

            <button
              type      = "submit"
              disabled  = {loading}
              className = "w-full bg-[#c0392b] text-white font-bold py-3 uppercase tracking-widest hover:bg-[#a93226] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-[#94a3b8]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#c0392b] font-bold hover:underline">
                Register
              </Link>
            </p>

          </form>
        </div>
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white p-4 text-center">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
          © 2026 KelanaAI
        </p>
      </footer>
    </div>
  );
}
