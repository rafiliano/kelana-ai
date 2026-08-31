"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, isLoggedIn } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function ProfilePage() {
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    fetchMe()
      .then(setProfile)
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-lg">

          {loading && (
            <p className="text-center text-[#c0392b] text-xs uppercase tracking-widest animate-pulse mt-12">
              Loading...
            </p>
          )}

          {error && (
            <p className="text-center text-[#c0392b] text-xs uppercase tracking-widest mt-12">
              ⚠ {error}
            </p>
          )}

          {profile && (
            <div className="flex flex-col gap-4">

              {/* Avatar + Name hero */}
              <div className="bg-white border border-[#e2e8f0] p-8 shadow-md flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-[#c0392b] text-white flex items-center justify-center text-4xl font-black uppercase rounded-none">
                  {profile.name[0]}
                </div>
                <h1 className="text-3xl font-black text-[#1a1a2e] tracking-wide"
                    style={{ fontFamily: "var(--font-cinzel)" }}>
                  {profile.name}
                </h1>
                <p className="text-[#94a3b8] text-sm">{profile.email}</p>
                <p className="text-[#cbd5e1] text-xs uppercase tracking-widest">
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white border border-[#e2e8f0] p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Total Trips Generated</p>
                    <p className="text-4xl font-black text-[#1a1a2e]"
                       style={{ fontFamily: "var(--font-cinzel)" }}>
                      {profile.total_trips}
                    </p>
                  </div>
                  <span className="text-5xl opacity-20">✈️</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href      = "/"
                  className = "flex-1 bg-[#c0392b] text-white font-bold py-3 uppercase tracking-widest text-xs text-center hover:bg-[#a93226] transition"
                >
                  Plan a Trip
                </a>
                <a
                  href      = "/trips"
                  className = "flex-1 border border-[#c0392b] text-[#c0392b] font-bold py-3 uppercase tracking-widest text-xs text-center hover:bg-[#c0392b] hover:text-white transition"
                >
                  Trip History
                </a>
              </div>

            </div>
          )}
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
