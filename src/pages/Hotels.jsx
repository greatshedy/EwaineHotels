import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown, Search, MapPin } from "lucide-react";
import hotelsData from "../data/hotels.json";
import HotelCard from "../components/HotelCard";
import BackToTop from "../components/BackToTop";

const amenitiesList = ["Swimming Pool", "WiFi", "Restaurant", "Gym", "Parking", "Pet Friendly", "Air Conditioning", "Free Breakfast"];

export default function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get("search") || "";
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    amenities: searchParams.getAll("amenities"),
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (a) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter((x) => x !== a) : [...prev.amenities, a],
    }));
  };

  const clearFilters = () => {
    setFilters({ location: "", minPrice: "", maxPrice: "", rating: "", amenities: [] });
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    let result = [...hotelsData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((h) => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.state.toLowerCase().includes(q));
    }
    if (filters.location) result = result.filter((h) => h.city.toLowerCase().includes(filters.location.toLowerCase()) || h.state.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.minPrice) result = result.filter((h) => h.price >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((h) => h.price <= Number(filters.maxPrice));
    if (filters.rating) result = result.filter((h) => h.rating >= Number(filters.rating));
    if (filters.amenities.length) result = result.filter((h) => filters.amenities.every((a) => h.amenities.includes(a)));
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [searchQuery, filters, sort]);

  const [page, setPage] = useState(1);
  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const cities = [...new Set(hotelsData.map((h) => h.city))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hotels</h1>
          <p className="text-text-secondary">{filtered.length} properties found</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border dark:border-dark-border rounded-xl overflow-hidden">
            <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-white" : "hover:bg-surface-alt"}`} aria-label="Grid view"><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-white" : "hover:bg-surface-alt"}`} aria-label="List view"><List className="w-4 h-4" /></button>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="default">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="sm:hidden p-2 rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? "fixed inset-0 z-50 flex" : "hidden"} lg:relative lg:block lg:w-64 flex-shrink-0`}>
          <div className={`${showFilters ? "w-full max-w-sm bg-white dark:bg-dark-surface p-6 overflow-y-auto" : "w-full"} lg:bg-transparent lg:p-0 lg:overflow-visible`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
              </div>
            )}
            <div className="space-y-6">
              {/* Search by name */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})} placeholder="Hotel name..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <select value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                    <option value="">All Cities</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                <select value={filters.rating} onChange={(e) => updateFilter("rating", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any Rating</option>
                  {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ Stars</option>)}
                </select>
              </div>
              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <div className="space-y-2">
                  {amenitiesList.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="rounded border-border text-primary focus:ring-primary" />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={clearFilters} className="w-full py-2 text-sm text-text-secondary hover:text-text transition-colors underline">Clear all filters</button>
            </div>
          </div>
          {showFilters && <div className="flex-1 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)} />}
        </aside>

        {/* Hotel Listings */}
        <div className="flex-1">
          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold mb-2">No hotels found</h3>
              <p className="text-text-secondary mb-4">Try adjusting your filters or search criteria.</p>
              <button onClick={clearFilters} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {paginated.map((hotel, i) => (
                  view === "grid" ? (
                    <HotelCard key={hotel.id} hotel={hotel} index={i} />
                  ) : (
                    <motion.div key={hotel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4 p-4 bg-white dark:bg-dark-surface rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                      <img src={hotel.images[0]} alt={hotel.name} loading="lazy" className="w-40 h-32 object-cover rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{hotel.name}</h3>
                        <p className="text-sm text-text-secondary truncate">{hotel.city}, {hotel.state}</p>
                        <div className="flex items-center gap-1 mt-1"><span className="text-sm font-medium">{hotel.rating}</span><span className="text-xs text-text-secondary">({hotel.reviews})</span></div>
                        <div className="mt-2 text-lg font-bold text-primary">${hotel.price}<span className="text-xs text-text-secondary font-normal"> / night</span></div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <button className="p-1.5 rounded-full hover:bg-surface-alt transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
                        <a href={`/hotel/${hotel.id}`} className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">Book</a>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-2 rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt disabled:opacity-40 text-sm">Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? "bg-primary text-white" : "border border-border dark:border-dark-border hover:bg-surface-alt"}`}>{p}</button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-2 rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt disabled:opacity-40 text-sm">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
