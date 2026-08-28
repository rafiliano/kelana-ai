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

  useEffect(() => {
    getTrips().then((data) => {
      setTrips(sortTrips(data, sortBy));
      setLoading(false);
    });
  }, []);

  const handleSearch = async (destination: string, travelStyle: string) => {
    setLoading(true);
    const data = destination.trim() || travelStyle.trim()
      ? await searchTrips(destination, travelStyle)
      : await getTrips();
    setTrips(sortTrips(data, sortBy));
    setLoading(false);
  };

  const handleSort = (sort: SortOption) => {
    setSortBy(sort);
    setTrips(prev => sortTrips(prev, sort));
  };

  return (
    <div className="min-h-screen bg-[#1a1a0e] flex flex-col items-center font-mono">

      <NavBar />

      <div className="w-full max-w-5xl p-4 md:p-6 flex flex-col gap-4">

        {/* Search + Sort bar */}
        <div className="border-4 border-[#52b788] bg-[#0d2b1a] p-3 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Search Destination</p>
            <input
              value       = {destinationQuery}
              onChange    = {(e) => {
                setDestinationQuery(e.target.value);
                handleSearch(e.target.value, travelStyleQuery);
              }}
              placeholder = "e.g. Japan"
              className   = "bg-transparent w-full outline-none text-[#f5e642] placeholder-[#2d6a4f] text-sm"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Trip Style</p>
            <select
              value     = {travelStyleQuery}
              onChange  = {(e) => {
                setTravelStyleQuery(e.target.value);
                handleSearch(destinationQuery, e.target.value);
              }}
              className = "bg-[#0d2b1a] w-full outline-none text-[#f5e642] text-sm cursor-pointer"
            >
              <option value="">All</option>
              <option value="Solo">Solo</option>
              <option value="Family">Family</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#74c69d] uppercase tracking-widest mb-1">▸ Sort By</p>
            <select
              value     = {sortBy}
              onChange  = {(e) => handleSort(e.target.value as SortOption)}
              className = "bg-[#0d2b1a] w-full outline-none text-[#f5e642] text-sm cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget_high">Highest Budget</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-[#52b788] text-xs uppercase tracking-widest text-center py-8 animate-pulse">
            ► Loading...
          </p>
        ) : !trips || trips.length === 0 ? (
          <div className="border-4 border-[#52b788] bg-[#0d2b1a] p-12 shadow-[4px_4px_0px_#f5e642] flex flex-col items-center gap-6">
            <p className="text-[#f5e642] text-2xl">[ ! ]</p>
            <p className="text-[#52b788] text-xs uppercase tracking-widest text-center">
              {destinationQuery || travelStyleQuery ? "No trips match your search." : "No trips found yet."}
            </p>
            {!destinationQuery && !travelStyleQuery && (
              <>
                <p className="text-[#74c69d] text-xs uppercase tracking-widest text-center">
                  Start planning your first adventure!
                </p>
                <a
                  href      = "/"
                  className = "border-4 border-[#f5e642] bg-[#f5e642] text-black font-bold px-6 py-3 uppercase tracking-widest text-xs hover:bg-[#0d2b1a] hover:text-[#f5e642] transition shadow-[4px_4px_0px_#2d6a4f] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  ► Plan My Trip
                </a>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {trips.map((trip: any) => (
              <a key={trip.id} href={`/trips/${trip.id}`}>
                <TripCard trip={trip} />
              </a>
            ))}
          </div>
        )}

      </div>

      <footer className="w-full max-w-5xl border-t-4 border-[#2d6a4f] mt-auto px-4 py-4 text-center">
        <p className="text-[#52b788] text-xs uppercase tracking-widest">
          © 2026 KelanaAI — Built with FastAPI & Next.js
        </p>
      </footer>

    </div>
  );
}
