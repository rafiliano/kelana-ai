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
    backpacker : "border-green-300 text-green-700 bg-green-50",
    standard   : "border-blue-300 text-blue-700 bg-blue-50",
    luxury     : "border-purple-300 text-purple-700 bg-purple-50",
  };
  const style = styles[category?.toLowerCase()] ?? "border-slate-300 text-slate-500";
  return (
    <span className={`border rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>
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
    <span className="border border-slate-200 bg-slate-50 text-slate-600 rounded-full px-2 py-0.5 text-xs font-semibold">
      {icon} {style}
    </span>
  );
}

export function TripCard({ trip, showDetailsButton = false }: { trip: any; showDetailsButton?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 border-l-4 border-l-blue-600 p-4 hover:shadow-md hover:border-l-green-500 transition">

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {getDestinationIcon(trip.destination)}
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-sm">
              {trip.destination}
            </h3>
            {trip.created_at && (
              <p className="text-slate-400 text-xs mt-0.5">
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

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs border-t border-blue-50 pt-3 mt-1">
        <div className="flex flex-wrap gap-4">
          <p className="text-slate-400">
            📅 <span className="text-slate-600">{trip.days} days</span>
          </p>
          <p className="text-slate-400">
            💰 <span className="text-slate-600">{formatBudget(trip.budget)}</span>
          </p>
          <p className="text-slate-400">
            📊 <span className="text-slate-600">{formatBudget(trip.daily_budget ?? 0)} / day</span>
          </p>
        </div>

        {showDetailsButton && trip.id && (
          <a
            href      = {`/trips/${trip.id}`}
            className = "inline-block bg-blue-600 text-white text-xs font-semibold rounded-full px-4 py-1.5 hover:bg-blue-700 transition flex-shrink-0"
          >
            View Details →
          </a>
        )}
      </div>

    </div>
  );
}
