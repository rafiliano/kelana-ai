"use client";

import { useState, useEffect } from "react";
import { getTrips, searchTrips } from "@/services/tripService";
import { TripCard } from "@/components/TripCard";
import { NavBar } from "@/components/NavBar";

type SortOption = "latest" | "oldest" | "budget_high";

function sortTrips(data: any[], sort: SortOption): any[] {
  return [...data].sort((a, b) => {
    if (sort === "latest")      return b.id - a.id;
    if (sort === "oldest")      return a.id - b.id;
    if (sort === "budget_high") return b.budget - a.budget;
    return 0;
  });
}

export default function TripsPage() {
  const [trips, setTrips]                       = useState<any[]>([]);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [travelStyleQuery, setTravelStyleQuery] = useState("");
  const [sortBy, setSortBy]                     = useState<SortOption>("latest");
  const [loading, setLoading]                   = useState(true);
  const [page, setPage]                         = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    getTrips().then((data) => {
      setTrips(sortTrips(data, sortBy));
      setLoading(false);
    });
  }, []);

  const handleSearch = async (destination: string, travelStyle: string) => {
    setLoading(true);
    setPage(1); // reset to first page on search
    const data = destination.trim() || travelStyle.trim()
      ? await searchTrips(destination, travelStyle)
      : await getTrips();
    setTrips(sortTrips(data, sortBy));
    setLoading(false);
  };

  const handleSort = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1); // reset to first page on sort
    setTrips(prev => sortTrips(prev, sort));
  };

  const totalPages  = Math.ceil(trips.length / PAGE_SIZE);
  const paginated   = trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col items-center">

      <NavBar />

      <div className="w-full max-w-5xl p-4 md:p-6 flex flex-col gap-4">

        {/* Search + Sort bar */}
        <div className="bg-white border border-[#e2e8f0] p-4 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="flex-1">
            <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Search Destination</p>
            <input
              value       = {destinationQuery}
              onChange    = {(e) => {
                setDestinationQuery(e.target.value);
                handleSearch(e.target.value, travelStyleQuery);
              }}
              placeholder = "e.g. Japan"
              className   = "bg-transparent w-full outline-none text-[#1a1a2e] placeholder-[#cbd5e1] text-sm"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Trip Style</p>
            <select
              value     = {travelStyleQuery}
              onChange  = {(e) => {
                setTravelStyleQuery(e.target.value);
                handleSearch(destinationQuery, e.target.value);
              }}
              className = "bg-white w-full outline-none text-[#1a1a2e] text-sm cursor-pointer"
            >
              <option value="">All</option>
              <option value="Solo">Solo</option>
              <option value="Family">Family</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#c0392b] uppercase tracking-widest mb-1">Sort By</p>
            <select
              value     = {sortBy}
              onChange  = {(e) => handleSort(e.target.value as SortOption)}
              className = "bg-white w-full outline-none text-[#1a1a2e] text-sm cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Highest Budget</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-[#c0392b] text-xs uppercase tracking-widest text-center py-8 animate-pulse">
            Loading...
          </p>
        ) : !trips || trips.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] p-12 shadow-sm flex flex-col items-center gap-6">
            <p className="text-[#c9a84c] text-3xl">✦</p>
            <p className="text-[#94a3b8] text-xs uppercase tracking-widest text-center">
              {destinationQuery || travelStyleQuery ? "No trips match your search." : "No trips found yet."}
            </p>
            {!destinationQuery && !travelStyleQuery && (
              <>
                <p className="text-[#64748b] text-xs uppercase tracking-widest text-center">
                  Start planning your first adventure!
                </p>
                <a
                  href      = "/"
                  className = "bg-[#c0392b] text-white font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-[#a93226] transition"
                >
                  Plan My Trip
                </a>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {paginated.map((trip: any) => (
                <TripCard key={trip.id} trip={trip} showDetailsButton={true} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4 mt-2">
                <p className="text-xs text-[#94a3b8] uppercase tracking-widest">
                  Page {page} of {totalPages} — {trips.length} trips
                </p>
                <div className="flex gap-2">
                  <button
                    onClick   = {() => setPage(p => Math.max(1, p - 1))}
                    disabled  = {page === 1}
                    className = "px-3 py-1.5 text-xs font-bold uppercase border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key       = {p}
                      onClick   = {() => setPage(p)}
                      className = {`px-3 py-1.5 text-xs font-bold uppercase border transition
                        ${p === page
                          ? "bg-[#c0392b] text-white border-[#c0392b]"
                          : "border-[#e2e8f0] text-[#64748b] hover:border-[#c0392b] hover:text-[#c0392b]"
                        }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick   = {() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled  = {page === totalPages}
                    className = "px-3 py-1.5 text-xs font-bold uppercase border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      <footer className="w-full max-w-5xl border-t border-[#e2e8f0] mt-auto px-4 py-4 text-center">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
      </footer>

    </div>
  );
}
