"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { generateTrip } from "@/services/tripService";
import { NavBar } from "@/components/NavBar";

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

  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">

      <NavBar />

      {/* Loading popup overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white border-2 border-[#c0392b] p-10 flex flex-col items-center gap-6 shadow-xl max-w-sm w-full mx-4">
            <p className="text-[#c9a84c] uppercase tracking-widest text-sm animate-pulse text-center"
               style={{ fontFamily: "var(--font-cinzel)" }}>
              ✦ Generating your trip...
            </p>
            <div className="flex gap-2">
              {[0,1,2,3,4].map(i => (
                <div
                  key       = {i}
                  className = "w-3 h-3 bg-[#c0392b] rounded-full animate-bounce"
                  style     = {{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-[#94a3b8] text-xs uppercase tracking-widest text-center">
              Contacting AWS Bedrock...
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">

        {/* Hero text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#1a1a2e] tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-cinzel)" }}>
            Where will your journey<br />
            <span className="text-[#c0392b]">take you next?</span>
          </h2>
          <p className="text-[#94a3b8] text-sm mt-3 tracking-widest uppercase">
            Powered by AI — your itinerary in seconds
          </p>
        </div>

        {/* Centered form */}
        <div className="w-full max-w-xl">
          <div className="bg-white border border-[#e2e8f0] p-6 shadow-md">

            <div className="space-y-4">
              <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
                <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Destination</p>
                <input
                  name        = "destination"
                  value       = {form.destination}
                  onChange    = {handleChange}
                  placeholder = "Japan"
                  className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
                />
              </div>

              <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
                <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Budget (USD)</p>
                <input
                  name        = "budget"
                  value       = {form.budget}
                  onChange    = {handleChange}
                  placeholder = "2000"
                  type        = "number"
                  className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
                />
              </div>

              <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
                <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Days</p>
                <input
                  name        = "days"
                  value       = {form.days}
                  onChange    = {handleChange}
                  placeholder = "5"
                  type        = "number"
                  className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
                />
              </div>

              <div className="border border-[#e2e8f0] p-3 focus-within:border-[#c0392b] transition">
                <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Travel Style</p>
                <select
                  name      = "travel_style"
                  value     = {form.travel_style}
                  onChange  = {handleChange}
                  className = "bg-white w-full outline-none text-[#1a1a2e] text-sm cursor-pointer"
                >
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mt-4 border border-[#c0392b] p-3 text-[#c0392b] text-xs uppercase tracking-widest bg-[#fdf2f2]">
                ⚠ {error}
              </div>
            )}

            <button
              onClick   = {handleSubmit}
              disabled  = {loading}
              className = "mt-5 w-full bg-[#c0392b] text-white font-bold py-3 uppercase tracking-widest hover:bg-[#a93226] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "✦ Generate AI Trip"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="w-full max-w-5xl mt-8 flex flex-col gap-4">
            <div className="border border-[#c0392b] overflow-hidden shadow-md">
              <img
                src       = {getDestinationImageUrl(result.destination)}
                alt       = {result.destination}
                className = "w-full h-48 object-cover"
                onError   = {(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="bg-white px-4 py-2 border-t border-[#c0392b]">
                <p className="text-[#c9a84c] text-xs uppercase tracking-widest">
                  ✦ {result.destination} — {form.days} Days
                </p>
              </div>
            </div>

            {splitByDay(result.ai_recommendation ?? "").map((day, i) => (
              <div key={i} className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#c0392b] p-5 shadow-sm">
                <p className="text-[#c9a84c] font-bold uppercase tracking-widest text-sm mb-3 pb-2 border-b border-[#e2e8f0]"
                   style={{ fontFamily: "var(--font-cinzel)" }}>
                  ✦ {day.title}
                </p>
                <div className="prose prose-sm max-w-none
                  prose-headings:text-[#c0392b] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-xs
                  prose-p:text-[#334155] prose-p:leading-relaxed prose-p:text-sm
                  prose-li:text-[#475569] prose-li:marker:text-[#c0392b] prose-li:text-sm
                  prose-strong:text-[#1a1a2e]
                  prose-hr:border-[#e2e8f0]">
                  <ReactMarkdown>{day.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white p-4 text-center">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
        <div className="flex justify-center gap-6 mt-2">
          <a href="https://github.com/rafiliano" target="_blank" className="text-[#c0392b] text-xs hover:text-[#c9a84c] uppercase tracking-widest transition">
            GitHub
          </a>
          <a href="http://localhost:8000/docs" target="_blank" className="text-[#c0392b] text-xs hover:text-[#c9a84c] uppercase tracking-widest transition">
            API Docs
          </a>
        </div>
      </footer>

    </div>
  );
}
