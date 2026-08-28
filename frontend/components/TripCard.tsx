// Reusable TripCard component

function formatBudget(amount: number): string {
  return `USD ${amount.toLocaleString("en-US")}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function getDestinationIcon(destination: string): string {
  const map: Record<string, string> = {
    japan        : "🇯🇵", tokyo        : "🇯🇵",
    indonesia    : "🇮🇩", bali         : "🇮🇩", jakarta      : "🇮🇩",
    singapore    : "🇸🇬",
    thailand     : "🇹🇭", bangkok      : "🇹🇭",
    malaysia     : "🇲🇾", "kuala lumpur": "🇲🇾",
    france       : "🇫🇷", paris        : "🇫🇷",
    italy        : "🇮🇹", rome         : "🇮🇹",
    usa          : "🇺🇸", "new york"   : "🇺🇸", "los angeles": "🇺🇸",
    uk           : "🇬🇧", london       : "🇬🇧",
    australia    : "🇦🇺", sydney       : "🇦🇺",
    korea        : "🇰🇷", seoul        : "🇰🇷",
    china        : "🇨🇳", beijing      : "🇨🇳", shanghai     : "🇨🇳",
    india        : "🇮🇳",
    vietnam      : "🇻🇳", "ho chi minh": "🇻🇳",
    philippines  : "🇵🇭", manila       : "🇵🇭",
    spain        : "🇪🇸", barcelona    : "🇪🇸",
    germany      : "🇩🇪", berlin       : "🇩🇪",
    netherlands  : "🇳🇱", amsterdam    : "🇳🇱",
    switzerland  : "🇨🇭",
    turkey       : "🇹🇷", istanbul     : "🇹🇷",
    egypt        : "🇪🇬", cairo        : "🇪🇬",
    brazil       : "🇧🇷",
    mexico       : "🇲🇽",
    canada       : "🇨🇦",
    maldives     : "🇲🇻",
    dubai        : "🇦🇪", uae          : "🇦🇪",
  };
  const key = destination.toLowerCase();
  for (const [name, flag] of Object.entries(map)) {
    if (key.includes(name)) return flag;
  }
  return "🌍";
}

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    backpacker : "border-[#c0392b] text-[#c0392b] bg-[#c0392b]/10",
    standard   : "border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/10",
    luxury     : "border-[#c0392b] text-[#c0392b] bg-[#c0392b]/10",
  };
  const style = styles[category?.toLowerCase()] ?? "border-slate-300 text-slate-400";
  return (
    <span className={`border px-2 py-0.5 text-xs uppercase tracking-widest font-bold ${style}`}>
      {category}
    </span>
  );
}

function TravelStyleBadge({ style }: { style: string }) {
  const icons: Record<string, string> = {
    solo     : "🎒",
    family   : "👨‍👩‍👧",
    business : "💼",
  };
  const icon = icons[style?.toLowerCase()] ?? "✈️";
  return (
    <span className="border border-[#e2e8f0] bg-[#f8faf9] text-[#64748b] px-2 py-0.5 text-xs uppercase tracking-widest font-bold">
      {icon} {style}
    </span>
  );
}

export function TripCard({ trip, showDetailsButton = false }: { trip: any; showDetailsButton?: boolean }) {
  return (
    <div className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#c0392b] p-4 hover:border-l-[#c9a84c] hover:shadow-md transition shadow-sm">

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0fdf8] border border-[#c0392b]/30 flex items-center justify-center text-xl flex-shrink-0">
            {getDestinationIcon(trip.destination)}
          </div>
          <div>
            <h3 className="text-[#1a1a2e] font-bold uppercase tracking-widest text-sm">
              {trip.destination}
            </h3>
            {trip.created_at && (
              <p className="text-[#94a3b8] text-xs mt-0.5">
                Submitted {formatDate(trip.created_at)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {trip.category     && <CategoryBadge   category={trip.category}   />}
          {trip.travel_style && <TravelStyleBadge style={trip.travel_style}  />}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs border-t border-[#e2e8f0] pt-3 mt-1">
        <div className="flex flex-wrap gap-4">
          <p className="text-[#94a3b8]">
            📅 <span className="text-[#475569]">{trip.days} days</span>
          </p>
          <p className="text-[#94a3b8]">
            💰 <span className="text-[#475569]">{formatBudget(trip.budget)}</span>
          </p>
          <p className="text-[#94a3b8]">
            📊 <span className="text-[#475569]">{formatBudget(trip.daily_budget ?? 0)} / day</span>
          </p>
        </div>

        {showDetailsButton && trip.id && (
          <a
            href      = {`/trips/${trip.id}`}
            className = "inline-block bg-[#c0392b] text-white text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[#a93226] transition flex-shrink-0"
          >
            Show Details →
          </a>
        )}
      </div>

    </div>
  );
}
