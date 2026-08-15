import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests > 1) params.set("guests", guests);
    navigate(`/hotels?${params.toString()}`);
  };

  const fieldClasses =
    "w-full bg-transparent text-sm font-medium text-text focus:outline-none placeholder:text-text-secondary/70";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl lg:rounded-full shadow-2xl shadow-black/20 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 lg:flex lg:items-stretch"
      >
        <label className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer border-b border-r border-border/70 lg:flex-1 lg:border-b-0 lg:border-r hover:bg-gray-50 transition-colors">
          <MapPin className="w-5 h-5 text-text-secondary shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text">Where to?</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Destination, hotel name..."
              className={fieldClasses}
            />
          </span>
        </label>

        <label className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer border-b border-border/70 lg:flex-1 lg:border-b-0 lg:border-r hover:bg-gray-50 transition-colors">
          <Calendar className="w-5 h-5 text-text-secondary shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text">Check-in</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className={fieldClasses}
            />
          </span>
        </label>

        <label className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer border-r border-border/70 lg:flex-1 lg:border-b-0 lg:border-r hover:bg-gray-50 transition-colors">
          <Calendar className="w-5 h-5 text-text-secondary shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text">Check-out</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={fieldClasses}
            />
          </span>
        </label>

        <label className="flex items-center gap-3 px-4 sm:px-5 py-3.5 cursor-pointer lg:flex-1 lg:border-b-0 lg:border-r-0 hover:bg-gray-50 transition-colors">
          <Users className="w-5 h-5 text-text-secondary shrink-0" />
          <span className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text">Who</span>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-medium text-text focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="col-span-2 lg:col-span-1 lg:w-auto flex items-center justify-center gap-2 px-6 py-4 lg:py-3.5 lg:px-7 lg:mx-3 bg-primary text-white font-semibold rounded-none lg:rounded-full hover:bg-primary-dark transition-colors"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </form>
    </div>
  );
}
