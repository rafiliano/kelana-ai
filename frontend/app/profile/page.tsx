"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, isLoggedIn } from "@/services/authService";
import { NavBar } from "@/components/NavBar";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    fetchMe()
      .then(setProfile)
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-lg">

          {loading && (
            <p className="text-center text-blue-500 text-sm animate-pulse mt-12">Loading...</p>
          )}
          {error && (
            <p className="text-center text-red-500 text-sm mt-12">⚠ {error}</p>
          )}

          {profile && (
            <div className="flex flex-col gap-4">

              {/* Avatar + Name */}
              <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-md flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black">
                  {profile.name[0]}
                </div>
                <h1 className="text-3xl font-black text-slate-800">
                  {profile.name}
                </h1>
                <p className="text-slate-500 text-sm">{profile.email}</p>
                <p className="text-slate-300 text-xs">
                  Member since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1">Total Trips Generated</p>
                  <p className="text-4xl font-black text-slate-800">
                    {profile.total_trips}
                  </p>
                </div>
                <span className="text-5xl opacity-20">✈️</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <a href="/"
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-2xl text-sm text-center hover:bg-blue-700 transition">
                  Plan a Trip
                </a>
                <a href="/trips"
                  className="flex-1 border border-blue-300 text-blue-600 font-semibold py-3 rounded-2xl text-sm text-center hover:bg-blue-50 transition">
                  Trip History
                </a>
              </div>

            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-blue-100 bg-white p-4 text-center">
        <p className="text-slate-400 text-xs">© 2026 KelanaAI</p>
      </footer>
    </div>
  );
}
