"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

// Split the AI recommendation into day sections
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

// Get a destination image from Unsplash (free, no API key needed)
function getDestinationImageUrl(destination: string): string {
  return `https://source.unsplash.com/800x300/?${encodeURIComponent(destination)},travel`;
}

export default function Home() {
  const [form, setForm] = useState({
    destination  : "",
    budget       : "",
    days         : "",
    travel_style : "Backpacker",
  });

  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.destination || !form.budget || !form.days) {
      setError("Please fill in all fields before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/trips", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({
          destination  : form.destination,
          budget       : parseFloat(form.budget),
          days         : parseInt(form.days),
          travel_style : form.travel_style,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a0e] flex flex-col font-mono">

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-6">

        {/* Header */}
        <div className="w-full max-w-5xl mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f5e642] uppercase tracking-widest drop-shadow-[4px_4px_0px_#2d6a4f]">
            ► KelanaAI ◄
          </h1>
          <p className="text-[#52b788] text-xs tracking-widest uppercase mt-1">
            [ Plan your next adventure ]
          </p>
        </div>

        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">

          {/* Left — Form */}
          <div className="border-4 border-[#f5e642] bg-[#0d2b1a] p-5 w-full lg:w-96 shadow-[6px_6px_0px_#2d6a4f] flex-shrink-0">
            <p className="text-[#52b788] text-xs uppercase tracking-widest mb-4">▸ Trip Details</p>

            <div className="space-y-3">
              <div className="border-2 border-[#52b788] p-3">
                <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Destination</p>
                <input
                  name        = "destination"
                  value       = {form.destination}
                  onChange    = {handleChange}
                  placeholder = "Japan"
                  className   = "bg-transparent w-full outline-none text-[#f5e642] placeholder-[#2d6a4f] text-sm"
                />
              </div>

              <div className="border-2 border-[#52b788] p-3">
                <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Budget (USD)</p>
                <input
                  name        = "budget"
                  value       = {form.budget}
                  onChange    = {handleChange}
                  placeholder = "2000"
                  type        = "number"
                  className   = "bg-transparent w-full outline-none text-[#f5e642] placeholder-[#2d6a4f] text-sm"
                />
              </div>

              <div className="border-2 border-[#52b788] p-3">
                <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Days</p>
                <input
                  name        = "days"
                  value       = {form.days}
                  onChange    = {handleChange}
                  placeholder = "5"
                  type        = "number"
                  className   = "bg-transparent w-full outline-none text-[#f5e642] placeholder-[#2d6a4f] text-sm"
                />
              </div>

              <div className="border-2 border-[#52b788] p-3">
                <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Travel Style</p>
                <select
                  name      = "travel_style"
                  value     = {form.travel_style}
                  onChange  = {handleChange}
                  className = "bg-[#0d2b1a] w-full outline-none text-[#f5e642] text-sm cursor-pointer"
                >
                  <option value="Backpacker">Backpacker</option>
                  <option value="Family">Family</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 border-2 border-[#e76f51] p-3 text-[#e76f51] text-xs uppercase tracking-widest">
                ⚠ {error}
              </div>
            )}

            <button
              onClick   = {handleSubmit}
              disabled  = {loading}
              className = "mt-4 w-full border-4 border-[#f5e642] bg-[#f5e642] text-black font-bold py-3 uppercase tracking-widest hover:bg-[#0d2b1a] hover:text-[#f5e642] transition shadow-[4px_4px_0px_#2d6a4f] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "► Generating..." : "► Generate AI Trip"}
            </button>

            {/* Trip Summary */}
            {result && (
              <div className="mt-4 border-2 border-[#e76f51] p-4 space-y-2 text-sm">
                <p className="text-[#f5e642] uppercase tracking-widest mb-2 text-xs">[ Trip Summary ]</p>
                <p className="text-[#74c69d]">▸ <span className="text-white">Destination :</span> {result.destination}</p>
                <p className="text-[#74c69d]">▸ <span className="text-white">Budget :</span> {result.budget} USD</p>
                <p className="text-[#74c69d]">▸ <span className="text-white">Travel Style :</span> {result.travel_style ?? form.travel_style}</p>
                <p className="text-[#74c69d]">▸ <span className="text-white">Category :</span> {result.category}</p>
                <p className="text-[#74c69d]">▸ <span className="text-white">Daily Budget :</span> {result.daily_budget?.toFixed(2)} USD/day</p>
              </div>
            )}
          </div>

          {/* Right — Results */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Loading state */}
            {loading && (
              <div className="border-4 border-[#52b788] bg-[#0d2b1a] p-8 shadow-[4px_4px_0px_#f5e642] flex flex-col items-center justify-center gap-4">
                <p className="text-[#f5e642] uppercase tracking-widest text-sm animate-pulse">
                  ► Generating your trip...
                </p>
                <div className="flex gap-2">
                  {[0,1,2,3,4].map(i => (
                    <div
                      key       = {i}
                      className = "w-3 h-3 bg-[#f5e642] animate-bounce"
                      style     = {{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-[#52b788] text-xs uppercase tracking-widest">
                  [ Contacting AWS Bedrock... ]
                </p>
              </div>
            )}

            {/* Destination hero image */}
            {result && (
              <div className="border-4 border-[#f5e642] overflow-hidden shadow-[4px_4px_0px_#52b788]">
                <img
                  src       = {getDestinationImageUrl(result.destination)}
                  alt       = {result.destination}
                  className = "w-full h-40 object-cover"
                  onError   = {(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="bg-[#0d2b1a] px-4 py-2">
                  <p className="text-[#f5e642] text-xs uppercase tracking-widest">
                    ► {result.destination} — {form.days} Days
                  </p>
                </div>
              </div>
            )}

            {/* AI Recommendation split by day */}
            {result?.ai_recommendation && splitByDay(result.ai_recommendation).map((day, i) => (
              <div
                key       = {i}
                className = "border-4 border-[#52b788] bg-[#0d2b1a] p-5 shadow-[4px_4px_0px_#f5e642]"
              >
                <p className="text-[#f5e642] font-bold uppercase tracking-widest text-sm mb-3 border-b border-[#2d6a4f] pb-2">
                  ► {day.title}
                </p>
                <div className="prose prose-invert prose-sm max-w-none
                  prose-headings:text-[#74c69d] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-xs
                  prose-p:text-[#d8f3dc] prose-p:leading-relaxed prose-p:text-sm
                  prose-li:text-[#74c69d] prose-li:marker:text-[#e76f51] prose-li:text-sm
                  prose-strong:text-[#f5e642]
                  prose-hr:border-[#2d6a4f]">
                  <ReactMarkdown>{day.content}</ReactMarkdown>
                </div>
              </div>
            ))}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#2d6a4f] bg-[#0d2b1a] p-4 text-center font-mono">
        <p className="text-[#52b788] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
        <div className="flex justify-center gap-6 mt-2">
          <a href="https://github.com/rafiliano" target="_blank" className="text-[#f5e642] text-xs hover:text-white uppercase tracking-widest">
            ► GitHub
          </a>
          <a href="http://localhost:8000/docs" target="_blank" className="text-[#f5e642] text-xs hover:text-white uppercase tracking-widest">
            ► API Docs
          </a>
        </div>
      </footer>

    </div>
  );
}
