"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { generateTrip } from "@/services/tripService";
import { NavBar } from "@/components/NavBar";
import { isLoggedIn, getUserName } from "@/services/authService";

function splitByDay(text: string): { title: string; content: string }[] {
  const lines = text.split("\n");
  const days: { title: string; content: string }[] = [];
  let current: { title: string; content: string } | null = null;
  let other = "";
  for (const line of lines) {
    const isDay = /^#{1,3}\s*Day\s*\d+/i.test(line);
    if (isDay) {
      if (current) days.push(current);
      current = { title: line.replace(/^#+\s*/, ""), content: "" };
    } else if (current) {
      current.content += line + "\n";
    } else {
      other += line + "\n";
    }
  }
  if (current) days.push(current);
  if (days.length === 0) return [{ title: "AI Recommendation", content: text }];
  if (other.trim()) days.unshift({ title: "Overview", content: other });
  return days;
}

function getDestinationImageUrl(destination: string): string {
  return `https://source.unsplash.com/800x300/?${encodeURIComponent(destination)},travel`;
}

export default function Home() {
  const [form, setForm] = useState({
    destination  : "",
    budget       : "",
    days         : "",
    travel_style : "Solo",
  });
  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    setUserName(getUserName());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.destination || !form.budget || !form.days) {
      setError("Please fill in all fields before generating.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateTrip({
        destination  : form.destination,
        budget       : parseFloat(form.budget),
        days         : parseInt(form.days),
        travel_style : form.travel_style,
      });
      setResult(data);
      router.push("/trips");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      {/* Loading popup */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-blue-200 p-10 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
            <p className="text-green-600 text-sm font-semibold animate-pulse text-center">
              Generating your trip...
            </p>
            <div className="flex gap-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-400 text-xs text-center">Contacting AWS Bedrock...</p>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">

        {/* Hero */}
        <div className="text-center mb-8">
          {userName && (
            <p className="text-slate-500 text-sm mb-1">Welcome Back!</p>
          )}
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
            {userName ? userName : "Where will your journey"}<br />
            <span className="text-blue-600">
              {userName ? "Where will you go next?" : "take you next?"}
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Powered by AI — your itinerary in seconds
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-3xl border border-blue-100 p-6 shadow-md">
            <div className="space-y-4">

              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Destination</p>
                <input name="destination" value={form.destination} onChange={handleChange}
                  placeholder="Japan"
                  className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
              </div>

              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Budget (USD)</p>
                <input name="budget" value={form.budget} onChange={handleChange}
                  placeholder="2000" type="number"
                  className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
              </div>

              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Days</p>
                <input name="days" value={form.days} onChange={handleChange}
                  placeholder="5" type="number"
                  className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-300 text-sm" />
              </div>

              <div className="bg-blue-50 rounded-2xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">Travel Style</p>
                <select name="travel_style" value={form.travel_style} onChange={handleChange}
                  className="bg-transparent w-full outline-none text-slate-800 text-sm cursor-pointer">
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Business">Business</option>
                </select>
              </div>

            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-500 text-xs">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleSubmit} disabled={loading}
              className="mt-5 w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "✦ Generate AI Trip"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="w-full max-w-5xl mt-8 flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md border border-blue-100">
              <img src={getDestinationImageUrl(result.destination)} alt={result.destination}
                className="w-full h-48 object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")} />
              <div className="bg-white px-4 py-2">
                <p className="text-green-600 text-xs font-semibold">
                  ✦ {result.destination} — {form.days} Days
                </p>
              </div>
            </div>

            {splitByDay(result.ai_recommendation ?? "").map((day, i) => (
              <div key={i} className="bg-white rounded-2xl border border-blue-100 border-l-4 border-l-blue-500 p-5 shadow-sm">
                <p className="text-green-600 font-bold text-sm mb-3 pb-2 border-b border-blue-50">
                  ✦ {day.title}
                </p>
                <div className="prose prose-sm max-w-none
                  prose-headings:text-blue-600 prose-headings:font-bold
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm
                  prose-li:text-slate-500 prose-li:marker:text-blue-400 prose-li:text-sm
                  prose-strong:text-slate-800">
                  <ReactMarkdown>{day.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-blue-100 bg-white p-4 text-center mt-8">
        <p className="text-slate-400 text-xs">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
        <div className="flex justify-center gap-6 mt-2">
          <a href="https://github.com/rafiliano" target="_blank" className="text-blue-500 text-xs hover:text-green-600 transition">GitHub</a>
          <a href="http://localhost:8000/docs" target="_blank" className="text-blue-500 text-xs hover:text-green-600 transition">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
