"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getTrip } from "@/services/tripService";
import { TripCard } from "@/components/TripCard";
import { NavBar } from "@/components/NavBar";
import { isLoggedIn } from "@/services/authService";
import ReactMarkdown from "react-markdown";

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

const dayAccents = [
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-indigo-400",
  "border-l-teal-500",
  "border-l-cyan-500",
];

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }                  = use(params);
  const [trip, setTrip]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    getTrip(parseInt(id)).then((data) => {
      if (!data || data.detail) setNotFound(true);
      else setTrip(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-blue-500 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500 text-sm">Trip not found</p>
          <a href="/trips"
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-blue-700 transition">
            Back to My Trips
          </a>
        </div>
      </div>
    );
  }

  const sections = trip?.ai_recommendation ? splitByDay(trip.ai_recommendation) : [];

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <NavBar />

      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-5xl flex flex-col gap-4">

          <TripCard trip={trip} />

          {sections.length > 0 && (
            <>
              <p className="text-green-600 text-sm font-semibold px-1">
                ✦ AI Itinerary
              </p>

              {sections.map((section, i) => (
                <div key={i}
                  className={`bg-white rounded-2xl border border-blue-100 border-l-4 ${dayAccents[i % dayAccents.length]} p-5 shadow-sm`}>
                  <p className="font-bold text-sm mb-3 pb-2 border-b border-blue-50 text-slate-700">
                    {section.title}
                  </p>
                  <div className="prose prose-sm max-w-none
                    prose-headings:text-blue-600 prose-headings:font-bold prose-headings:text-xs
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm
                    prose-li:text-slate-500 prose-li:marker:text-blue-400 prose-li:text-sm
                    prose-strong:text-slate-800">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}

          <a href="/trips"
            className="border border-blue-300 text-blue-600 font-semibold px-6 py-3 rounded-2xl text-sm text-center hover:bg-blue-600 hover:text-white transition">
            ◄ Back to My Trips
          </a>

        </div>
      </div>

      <footer className="border-t border-blue-100 p-4 text-center bg-white mt-4">
        <p className="text-slate-400 text-xs">© 2026 KelanaAI — Built with FastAPI & Next.js</p>
      </footer>
    </div>
  );
}
