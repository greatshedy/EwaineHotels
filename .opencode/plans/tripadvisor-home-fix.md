# TripAdvisor Section on Home Page

Match the "Featured Hotels" section **exactly** in layout.

## Exact code changes to `src/pages/Home.jsx`

### Change 1 — Update imports (lines 1, 4, add 3 lines)
```jsx
import { useState, useEffect } from "react";
// ... existing imports ...
import { Shield, BadgeCheck, Wallet, Headphones, ChevronLeft, ChevronRight, ArrowRight, Mail, Star, Globe } from "lucide-react";
import { searchLocation, searchHotels } from "../services/tripadvisor";
import { mapSearchResult } from "../services/tripMapper";
```

### Change 2 — Add state + fetch after `const [testiIdx, setTestiIdx] = useState(0);` (after line 30)
```jsx
const [taPicks, setTaPicks] = useState([]);
const [taLoaded, setTaLoaded] = useState(false);

useEffect(() => {
  if (taLoaded) return;
  let cancelled = false;
  const today = new Date().toISOString().split("T")[0];
  const later = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
  searchLocation("Lagos")
    .then(locations => {
      if (cancelled || !locations?.length) return null;
      return searchHotels({ geoId: locations[0].geoId, checkIn: today, checkOut: later });
    })
    .then(result => {
      if (cancelled || !result) return;
      const mapped = (result?.data || []).map(mapSearchResult);
      const seen = new Set();
      const unique = mapped.filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; });
      setTaPicks(unique.sort((a, b) => b.rating - a.rating).slice(0, 3));
      setTaLoaded(true);
    })
    .catch(() => { if (!cancelled) setTaLoaded(true); });
  return () => { cancelled = true; };
}, [taLoaded]);
```

### Change 3 — Add TripAdvisor section AFTER Featured Hotels section (after line 105)
```jsx
{taPicks.length > 0 && (
  <section className="py-20 bg-surface-alt dark:bg-dark-surface">
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="flex items-end justify-between mb-10">
        <div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-3">TripAdvisor Picks</motion.h2>
          <motion.p variants={fadeUp} className="text-text-secondary">Top-rated hotels from TripAdvisor</motion.p>
        </div>
        <motion.div variants={fadeUp}>
          <Link to="/hotels?search=Lagos" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {taPicks.map((hotel, i) => (
          <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            <Link to={`/hotel/${hotel.id}${hotel.commerceUrl ? `?commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="block relative aspect-[4/3] overflow-hidden">
              <img src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'} alt={hotel.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {hotel.provider && <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">{hotel.provider}</span>}
            </Link>
            <div className="p-4">
              <Link to={`/hotel/${hotel.id}${hotel.commerceUrl ? `?commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1 block mb-1">{hotel.name}</Link>
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span className="text-sm font-medium">{hotel.rating}</span>
                <span className="text-xs text-text-secondary">({hotel.reviews} reviews)</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-primary">${hotel.price}</span>
                  <span className="text-xs text-text-secondary"> / night</span>
                </div>
                <Link to={`/hotel/${hotel.id}${hotel.commerceUrl ? `?commerceUrl=${encodeURIComponent(hotel.commerceUrl)}` : ''}`}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">View</Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center sm:hidden">
        <Link to="/hotels?search=Lagos" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
)}
```
