import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, List, X, Search, MapPin, Globe, Star, ExternalLink } from "lucide-react";
import { getHotels, getDestinations } from "../services/api";
import { searchLocation, searchHotels } from "../services/tripadvisor";
import { mapSearchResult } from "../services/tripMapper";
import HotelCard from "../components/HotelCard";
import BackToTop from "../components/BackToTop";

const amenitiesList = ["Swimming Pool", "WiFi", "Restaurant", "Gym", "Parking", "Pet Friendly", "Air Conditioning", "Free Breakfast"];

export default function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [tripMode, setTripMode] = useState(false);
  const [trip, setTrip] = useState({ hotels: [], loading: false, error: "" });

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const searchQuery = searchParams.get("search") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";

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

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (filters.location) params.location = filters.location;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.rating) params.rating = filters.rating;
      if (filters.amenities.length) params.amenities = filters.amenities.join(",");
      if (sort !== "default") params.sort = sort;

      const data = await getHotels(params);
      setHotels(data);
      const uniqueCities = [...new Set(data.map((h) => h.city).filter(Boolean))].sort();
      setCities(uniqueCities);
    } catch {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sort]);

  useEffect(() => {
    getDestinations()
      .then((data) => setDestinations(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!tripMode) fetchHotels();
  }, [tripMode, fetchHotels]);

  const [page, setPage] = useState(1);
  const perPage = 6;
  const totalPages = Math.ceil(hotels.length / perPage);
  const paginated = hotels.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters, sort]);

  useEffect(() => {
    if (!tripMode || !searchQuery) return;
    let cancelled = false;
    setTrip({ hotels: [], loading: true, error: "" });
    const ci = checkIn || new Date().toISOString().split("T")[0];
    const co = checkOut || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    searchLocation(searchQuery)
      .then((locations) => {
        if (cancelled) return null;
        if (!locations?.length) { setTrip({ hotels: [], loading: false, error: "Location not found on TripAdvisor" }); return null; }
        return searchHotels({ geoId: locations[0].geoId, checkIn: ci, checkOut: co, pageNumber: 1 });
      })
      .then((result) => {
        if (cancelled || !result) return;
        const mapped = (result?.data || []).map(mapSearchResult);
        const seen = new Set();
        setTrip({ hotels: mapped.filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; }), loading: false, error: "" });
      })
      .catch((err) => {
        if (cancelled) return;
        setTrip({ hotels: [], loading: false, error: err.message || "Failed to fetch TripAdvisor results" });
      });
    return () => { cancelled = true; };
  }, [tripMode, searchQuery, checkIn, checkOut]);

  const featuredTripHotels = useMemo(() => [...trip.hotels].sort((a, b) => b.rating - a.rating).slice(0, 4), [trip.hotels]);

  const [destSearch, setDestSearch] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{tripMode ? "TripAdvisor Results" : "Hotels"}</h1>
          <p className="text-text-secondary">
            {tripMode
              ? trip.hotels.length ? `${trip.hotels.length} properties found on TripAdvisor` : ""
              : `${hotels.length} properties found`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border dark:border-dark-border rounded-xl overflow-hidden">
            <button
              onClick={() => { setTripMode(false); setTrip({ hotels: [], loading: false, error: "" }); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${!tripMode ? "bg-primary text-white" : "hover:bg-surface-alt"}`}
            >
              Our Hotels
            </button>
            <button
              onClick={() => { setTripMode(true); if (!searchQuery) setSearchParams({ search: 'Lagos' }); }}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${tripMode ? "bg-primary text-white" : "hover:bg-surface-alt"}`}
            >
              <Globe className="w-4 h-4" />
              TripAdvisor
            </button>
          </div>
          {!tripMode && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {!tripMode && (
          <aside className={`${showFilters ? "fixed inset-0 z-50 flex" : "hidden"} lg:relative lg:block lg:w-64 flex-shrink-0`}>
            <div className={`${showFilters ? "w-full max-w-sm bg-white dark:bg-dark-surface p-6 overflow-y-auto" : "w-full"} lg:bg-transparent lg:p-0 lg:overflow-visible`}>
              {showFilters && (
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="font-bold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})} placeholder="Hotel name..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                  <select value={filters.rating} onChange={(e) => updateFilter("rating", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Any Rating</option>
                    {[4.5, 4, 3.5, 3].map((r) => <option key={r} value={r}>{r}+ Stars</option>)}
                  </select>
                </div>
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
        )}

        {/* Hotel Listings */}
        <div className="flex-1">
          {tripMode ? (
            trip.loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : trip.error ? (
              <div className="text-center py-20">
                <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">TripAdvisor Search Error</h3>
                <p className="text-text-secondary mb-4">{trip.error}</p>
                <button onClick={() => setTripMode(false)} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">Back to Our Hotels</button>
              </div>
            ) : trip.hotels.length === 0 && searchQuery ? (
              <div className="text-center py-20">
                <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No TripAdvisor results</h3>
                <p className="text-text-secondary mb-4">Try searching for a different destination.</p>
                <button onClick={() => setTripMode(false)} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">Back to Our Hotels</button>
              </div>
            ) : trip.hotels.length === 0 && !searchQuery ? (
              <div className="text-center py-12 max-w-lg mx-auto">
                <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Search TripAdvisor</h3>
                <p className="text-text-secondary mb-6">Pick a destination or type one below.</p>
                <form onSubmit={(e) => { e.preventDefault(); const q = e.target.destination.value.trim(); if (q) { setSearchParams({ search: q }); } }} className="flex gap-2 mb-8">
                  <input name="destination" placeholder="e.g. Lagos, Accra, Nairobi..." className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
                  <button type="submit" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap">Search</button>
                </form>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destinations.map((d) => (
                    <button key={d.id} onClick={() => setSearchParams({ search: d.name })}
                      className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-lg transition-all"
                    >
                      <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                        <p className="text-white font-semibold text-sm">{d.name}</p>
                        <p className="text-white/60 text-xs">{d.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={(e) => { e.preventDefault(); if (destSearch.trim()) { setSearchParams({ search: destSearch.trim() }); setDestSearch(""); } }} className="flex gap-2 mb-4">
                  <input value={destSearch} onChange={(e) => setDestSearch(e.target.value)} placeholder="Search other destinations..." className="flex-1 px-4 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap">Search</button>
                </form>
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
                  {destinations.map((d) => (
                    <button key={d.id} onClick={() => setSearchParams({ search: d.name })}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-alt dark:bg-dark-surface text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {trip.hotels.map((hotel, i) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <Link to={`/hotel/${hotel.id}?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}${hotel.commerceUrl ? `&commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="block relative aspect-[4/3] overflow-hidden">
                        <img
                          src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                          alt={hotel.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {hotel.provider && (
                          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {hotel.provider}
                          </span>
                        )}
                      </Link>
                      <div className="p-4">
                        <Link to={`/hotel/${hotel.id}?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}${hotel.commerceUrl ? `&commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1 block mb-1">
                          {hotel.name}
                        </Link>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-secondary text-secondary" />
                          <span className="text-sm font-medium">{hotel.rating}</span>
                          <span className="text-xs text-text-secondary">({hotel.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-primary">${hotel.price}</span>
                            <span className="text-xs text-text-secondary"> / night</span>
                          </div>
                          <Link
                            to={`/hotel/${hotel.id}?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}${hotel.commerceUrl ? `&commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`}
                            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {featuredTripHotels.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border dark:border-dark-border">
                    <h2 className="text-2xl font-bold mb-2">Featured on TripAdvisor</h2>
                    <p className="text-text-secondary text-sm mb-6">Top-rated hotels from your search</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {featuredTripHotels.map((hotel, i) => (
                        <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                          className="group bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                        >
                          <Link to={`/hotel/${hotel.id}?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}${hotel.commerceUrl ? `&commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="block relative aspect-[4/3] overflow-hidden">
                            <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'} alt={hotel.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <span className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                          </Link>
                          <div className="p-3">
                            <Link to={`/hotel/${hotel.id}?checkIn=${checkIn || ''}&checkOut=${checkOut || ''}${hotel.commerceUrl ? `&commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1 block mb-1">{hotel.name}</Link>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-3 h-3 fill-secondary text-secondary" />
                              <span className="text-xs font-medium">{hotel.rating}</span>
                              <span className="text-[10px] text-text-secondary">({hotel.reviews})</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-primary">${hotel.price}</span>
                              <span className="text-[10px] text-text-secondary">{hotel.provider}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
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
