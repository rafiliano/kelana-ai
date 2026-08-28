// Reusable TripCard component — use anywhere by passing a trip object
export function TripCard({ trip }: { trip: any }) {
  return (
    <div className="border-4 border-[#52b788] bg-[#0d2b1a] p-4 shadow-[4px_4px_0px_#f5e642] font-mono">
      <h3 className="text-[#f5e642] font-bold uppercase tracking-widest text-sm mb-2">
        ► {trip.destination}
      </h3>
      <p className="text-[#74c69d] text-xs">
        {trip.days} days · {trip.budget} USD · {trip.travel_style ?? trip.category}
      </p>
      <p className="text-[#52b788] text-xs mt-1">
        Daily Budget: {trip.daily_budget?.toFixed(2)} USD/day
      </p>
    </div>
  )
}
