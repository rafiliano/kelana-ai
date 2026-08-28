// Shows a single trip detail page
import { getTrip } from "@/services/tripService"
import { TripCard } from "@/components/TripCard"
import { NavBar } from "@/components/NavBar"
import ReactMarkdown from "react-markdown"

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip    = await getTrip(parseInt(id))

  if (!trip || trip.detail) {
    return (
      <div className="min-h-screen bg-[#1a1a0e] flex flex-col font-mono">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-[#e76f51] uppercase tracking-widest text-sm">
            ⚠ Trip not found
          </p>
          <a
            href      = "/trips"
            className = "border-4 border-[#f5e642] bg-[#f5e642] text-black font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-[#0d2b1a] hover:text-[#f5e642] transition"
          >
            ► Back to Trip History
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a0e] flex flex-col font-mono">

      <NavBar />

      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-5xl flex flex-col gap-4">

          <TripCard trip={trip} />

          {trip.ai_recommendation && (
            <div className="border-4 border-[#52b788] bg-[#0d2b1a] p-5 shadow-[4px_4px_0px_#f5e642]">
              <p className="text-[#f5e642] uppercase tracking-widest text-xs mb-4">
                [ AI Recommendation ]
              </p>
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:text-[#f5e642] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider
                prose-p:text-[#d8f3dc] prose-p:leading-relaxed prose-p:text-sm
                prose-li:text-[#74c69d] prose-li:marker:text-[#e76f51] prose-li:text-sm
                prose-strong:text-[#f5e642]
                prose-hr:border-[#2d6a4f]">
                <ReactMarkdown>{trip.ai_recommendation}</ReactMarkdown>
              </div>
            </div>
          )}

          <a
            href      = "/trips"
            className = "border-4 border-[#52b788] bg-[#0d2b1a] text-[#52b788] font-bold px-6 py-3 uppercase tracking-widest text-xs text-center hover:bg-[#52b788] hover:text-black transition shadow-[4px_4px_0px_#2d6a4f]"
          >
            ◄ Back to Trip History
          </a>

        </div>
      </div>

      <footer className="border-t-4 border-[#2d6a4f] p-4 text-center">
        <p className="text-[#52b788] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
      </footer>

    </div>
  )
}
