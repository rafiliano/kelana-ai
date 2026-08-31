"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerUser(form.name, form.email, form.password);
      // Redirect to login after successful registration
      router.push("/login?registered=true");
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
              Create Account
            </h2>
            <p className="text-[#94a3b8] text-sm mt-2">
              Start planning your adventures today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] p-6 shadow-md flex flex-col gap-4">

            <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
              <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Name</p>
              <input
                name        = "name"
                type        = "text"
                value       = {form.name}
                onChange    = {handleChange}
                placeholder = "Your name"
                className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
              />
            </div>

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
                placeholder = "Min. 6 characters"
                className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
              />
            </div>

            <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
              <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Confirm Password</p>
              <input
                name        = "confirm"
                type        = "password"
                value       = {form.confirm}
                onChange    = {handleChange}
                placeholder = "Repeat your password"
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-[#94a3b8]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#c0392b] font-bold hover:underline">
                Sign In
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
