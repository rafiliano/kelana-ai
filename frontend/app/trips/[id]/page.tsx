// Shows a single trip detail page
import { getTrip } from "@/services/tripService"
import { TripCard } from "@/components/TripCard"
import { NavBar } from "@/components/NavBar"
import ReactMarkdown from "react-markdown"

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

// Alternate left border colors per day for visual variety
const dayColors = [
  "border-l-[#c0392b]",
  "border-l-[#c9a84c]",
  "border-l-[#c0392b]",
  "border-l-[#6366f1]",
  "border-l-[#e8836a]",
];

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip    = await getTrip(parseInt(id))

  if (!trip || trip.detail) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex flex-col">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-[#c0392b] uppercase tracking-widest text-sm">
            ⚠ Trip not found
          </p>
          <a
            href      = "/trips"
            className = "bg-[#c0392b] text-white font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-[#a93226] transition"
          >
            Back to Trip History
          </a>
        </div>
      </div>
    )
  }

  const sections = trip.ai_recommendation ? splitByDay(trip.ai_recommendation) : [];

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">

      <NavBar />

      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-5xl flex flex-col gap-4">

          {/* Trip summary card */}
          <TripCard trip={trip} />

          {/* Day boxes */}
          {sections.length > 0 && (
            <>
              <p className="text-[#c9a84c] text-xs uppercase tracking-widest font-bold"
                 style={{ fontFamily: "var(--font-cinzel)" }}>
                ✦ AI Itinerary
              </p>

              {sections.map((section, i) => (
                <div
                  key       = {i}
                  className = {`bg-white border border-[#e2e8f0] border-l-4 ${dayColors[i % dayColors.length]} p-5 shadow-sm`}
                >
                  {/* Day title */}
                  <p className="font-bold uppercase tracking-widest text-sm mb-3 pb-2 border-b border-[#e2e8f0] text-[#1a1a2e]"
                     style={{ fontFamily: "var(--font-cinzel)" }}>
                    {section.title}
                  </p>

                  {/* Day content */}
                  <div className="prose prose-sm max-w-none
                    prose-headings:text-[#c0392b] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-xs
                    prose-p:text-[#334155] prose-p:leading-relaxed prose-p:text-sm
                    prose-li:text-[#475569] prose-li:marker:text-[#c0392b] prose-li:text-sm
                    prose-strong:text-[#1a1a2e]
                    prose-hr:border-[#e2e8f0]">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}

          <a
            href      = "/trips"
            className = "border border-[#c0392b] text-[#c0392b] font-bold px-6 py-3 uppercase tracking-widest text-xs text-center hover:bg-[#c0392b] hover:text-white transition"
          >
            ◄ Back to Trip History
          </a>

        </div>
      </div>

      <footer className="border-t border-[#e2e8f0] p-4 text-center bg-white">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
      </footer>

    </div>
  )
}
