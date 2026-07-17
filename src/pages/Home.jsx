import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, BadgeCheck, Wallet, Headphones, ChevronLeft, ChevronRight, ArrowRight, Mail, Star } from "lucide-react";
import { searchLocation, searchHotels } from "../services/tripadvisor";
import { mapSearchResult } from "../services/tripMapper";
import { getFeatured, getTestimonials, getDestinations } from "../services/api";
import SearchBar from "../components/SearchBar";
import HotelCard from "../components/HotelCard";
import BackToTop from "../components/BackToTop";


const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const reasons = [
  { icon: BadgeCheck, title: "Verified Hotels", desc: "All properties are thoroughly vetted for quality and authenticity." },
  { icon: Wallet, title: "Best Price Guarantee", desc: "We match any lower price and give you an extra 10% off." },
  { icon: Shield, title: "Secure Booking", desc: "Your payment information is encrypted and fully protected." },
  { icon: Headphones, title: "24/7 Support", desc: "Our team is available around the clock to assist you." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [testiIdx, setTestiIdx] = useState(0);
  const [taPicks, setTaPicks] = useState([]);
  const [taLoaded, setTaLoaded] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    getFeatured()
      .then((data) => setFeatured((data || []).slice(0, 6)))
      .catch(() => { });
    getTestimonials()
      .then((data) => setTestimonials(data || []))
      .catch(() => { });
    getDestinations()
      .then((data) => setDestinations(data || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (taLoaded) return;
    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];
    const later = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    searchLocation("Lagos")
      .then((locations) => {
        if (cancelled || !locations?.length) return null;
        return searchHotels({ geoId: locations[0].geoId, checkIn: today, checkOut: later });
      })
      .then((result) => {
        if (cancelled || !result) return;
        const mapped = (result?.data || []).map(mapSearchResult);
        const seen = new Set();
        const unique = mapped.filter((h) => { if (seen.has(h.id)) return false; seen.add(h.id); return true; });
        setTaPicks(unique.sort((a, b) => b.rating - a.rating).slice(0, 3));
        setTaLoaded(true);
      })
      .catch(() => { if (!cancelled) setTaLoaded(true); });
    return () => { cancelled = true; };
  }, [taLoaded]);



  return (
    <div>



      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920"
            alt="Luxury hotel lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect <span className="text-gradient">Stay</span> Anywhere
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover luxury hotels, budget accommodations, and unforgettable experiences around the world.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <SearchBar />
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface dark:from-dark-bg to-transparent" />
      </section>

      {/* Popular Destinations */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-3">Popular Destinations</motion.h2>
          <motion.p variants={fadeUp} className="text-text-secondary max-w-xl mx-auto">Explore our most sought-after destinations across Africa.</motion.p>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((d) => (
            <Link key={d.id} to={`/hotels?search=${d.name}`} className="block">
              <motion.div variants={fadeUp} className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer">
                <img src={d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{d.name}</h3>
                  <p className="text-white/70 text-sm">{d.count} Hotel{d.count !== 1 ? "s" : ""}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Featured Hotels */}
      <section className="py-20 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="flex items-end justify-between mb-10">
            <div>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-3">Featured Hotels</motion.h2>
              <motion.p variants={fadeUp} className="text-text-secondary">Hand-picked accommodations for an exceptional experience.</motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link to="/hotels" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((hotel, i) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/hotels" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              View All Hotels <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TripAdvisor Picks */}
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

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-3">Why Choose Us</motion.h2>
          <motion.p variants={fadeUp} className="text-text-secondary max-w-xl mx-auto">We make booking your perfect stay effortless and secure.</motion.p>
        </motion.div>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r) => (
            <motion.div key={r.title} variants={fadeUp} className="glass rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <r.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{r.title}</h3>
              <p className="text-sm text-text-secondary">{r.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-alt dark:bg-dark-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-bold mb-10">
            What Our Guests Say
          </motion.h2>
          <div className="relative">
            <motion.div key={testiIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="glass rounded-2xl p-8">
              <div className="flex justify-center mb-4">
                {testimonials.length > 0 && [...Array(testimonials[testiIdx]?.rating || 5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-secondary text-secondary" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                ))}
              </div>
              <p className="text-lg italic mb-6">&ldquo;{testimonials[testiIdx]?.text || ""}&rdquo;</p>
              <div className="flex items-center justify-center gap-3">
                <img src={testimonials[testiIdx]?.avatar || ""} alt="" className="w-12 h-12 rounded-full" />
                <div className="text-left">
                  <p className="font-semibold">{testimonials[testiIdx]?.name || ""}</p>
                  <p className="text-sm text-text-secondary">{testimonials[testiIdx]?.role || ""}</p>
                </div>
              </div>
            </motion.div>
            <button onClick={() => setTestiIdx((p) => (p === 0 ? testimonials.length - 1 : p - 1))} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-12 p-2 rounded-full glass hover:bg-white dark:hover:bg-dark-surface transition-colors" aria-label="Previous testimonial">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setTestiIdx((p) => (p === testimonials.length - 1 ? 0 : p + 1))} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-12 p-2 rounded-full glass hover:bg-white dark:hover:bg-dark-surface transition-colors" aria-label="Next testimonial">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 dark:from-primary/10 dark:via-accent/10 dark:to-secondary/10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Stay in the Loop</h2>
            <p className="text-text-secondary mb-6">Subscribe for exclusive deals, new hotel listings, and travel inspiration.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input type="email" placeholder="your@email.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <BackToTop />
    </div>
  );
}
