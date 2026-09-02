"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, saveUserName, saveUserEmail, fetchMe } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function LoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError(null);
    try {
      await loginUser(form.email, form.password);
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
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-2">Sign in to continue planning your adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-blue-100 p-6 shadow-md flex flex-col gap-4">

            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">Email</p>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
            </div>

            <div className="bg-blue-50 rounded-2xl p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">Password</p>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-500 text-xs">⚠ {error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
            </p>

          </form>
        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white p-4 text-center">
        <p className="text-slate-400 text-xs">© 2026 KelanaAI</p>
      </footer>
    </div>
  );
}
