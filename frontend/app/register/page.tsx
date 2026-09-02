"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError(null);
    try {
      await registerUser(form.name, form.email, form.password);
      router.push("/login?registered=true");
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
              Create Account
            </h2>
            <p className="text-slate-500 text-sm mt-2">Start planning your adventures today</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-blue-100 p-6 shadow-md flex flex-col gap-4">

            {[
              { name: "name",     label: "Name",             type: "text",     placeholder: "Your name"         },
              { name: "email",    label: "Email",            type: "email",    placeholder: "you@example.com"   },
              { name: "password", label: "Password",         type: "password", placeholder: "Min. 6 characters" },
              { name: "confirm",  label: "Confirm Password", type: "password", placeholder: "Repeat your password" },
            ].map(field => (
              <div key={field.name} className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">{field.label}</p>
                <input name={field.name} type={field.type}
                  value={(form as any)[field.name]} onChange={handleChange}
                  placeholder={field.placeholder}
                  className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
              </div>
            ))}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-500 text-xs">⚠ {error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
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
