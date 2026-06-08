import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight, Wifi, Waves, Dumbbell, Car, Wind, Coffee, PawPrint } from "lucide-react";
import hotelsData from "../data/hotels.json";
import HotelCard from "../components/HotelCard";
import Button from "../components/Button";
import BackToTop from "../components/BackToTop";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

const amenityIcons = {
  "Swimming Pool": Waves, WiFi: Wifi, Restaurant: Utensils, Gym: Dumbbell, Parking: Car,
  "Air Conditioning": Wind, "Free Breakfast": Coffee, "Pet Friendly": PawPrint,
};

function Utensils() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>; }

export default function HotelDetails() {
  const { id } = useParams();
  const hotel = hotelsData.find((h) => h.id === Number(id));
  const { addRecent } = useRecentlyViewed();
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (hotel) addRecent({ id: hotel.id, name: hotel.name, city: hotel.city, price: hotel.price, rating: hotel.rating, image: hotel.images[0] });
    window.scrollTo(0, 0);
  }, [hotel]);

  if (!hotel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center"><h2 className="text-2xl font-bold mb-2">Hotel Not Found</h2><p className="text-text-secondary mb-4">The hotel you are looking for does not exist.</p><Link to="/hotels" className="text-primary font-semibold hover:underline">Browse Hotels</Link></div>
      </div>
    );
  }

  const related = hotelsData.filter((h) => h.city === hotel.city && h.id !== hotel.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/hotels" className="hover:text-primary">Hotels</Link>
        <span>/</span>
        <span className="text-text truncate">{hotel.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
            <motion.img key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={hotel.images[imgIdx]} alt={hotel.name} className="w-full h-full object-cover" />
            {hotel.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((p) => (p === 0 ? hotel.images.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setImgIdx((p) => (p === hotel.images.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {hotel.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {hotel.images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Hotel Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{hotel.address}, {hotel.city}, {hotel.state}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-secondary text-secondary" />{hotel.rating} ({hotel.reviews} reviews)</span>
            </div>
            <p className="text-text-secondary leading-relaxed">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {hotel.amenities.map((a) => {
                const Icon = amenityIcons[a] || Utensils;
                return (
                  <div key={a} className="flex items-center gap-2 p-3 rounded-xl bg-surface-alt dark:bg-dark-surface">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{a}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Types */}
          <div>
            <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
            <div className="space-y-3">
              {hotel.roomTypes.map((r) => (
                <div key={r.type} className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-dark-border">
                  <div><h3 className="font-semibold">{r.type}</h3><p className="text-sm text-text-secondary">{r.available} rooms left</p></div>
                  <div className="text-right"><span className="text-xl font-bold text-primary">${r.price}</span><span className="text-xs text-text-secondary"> / night</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div>
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="rounded-2xl overflow-hidden h-64 bg-surface-alt dark:bg-dark-surface flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">{hotel.address}</p>
                <p className="text-xs text-text-secondary mt-1">Lat: {hotel.latitude}, Lng: {hotel.longitude}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-surface-alt dark:bg-dark-surface">
            {hotel.phone && <a href={`tel:${hotel.phone}`} className="flex items-center gap-2 text-sm hover:text-primary"><Phone className="w-4 h-4" />{hotel.phone}</a>}
            {hotel.email && <a href={`mailto:${hotel.email}`} className="flex items-center gap-2 text-sm hover:text-primary"><Mail className="w-4 h-4" />{hotel.email}</a>}
            {hotel.website && <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary"><Globe className="w-4 h-4" />Website</a>}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-4">Guest Reviews</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border dark:border-dark-border">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={`https://i.pravatar.cc/40?img=${i + 20}`} alt="" className="w-10 h-10 rounded-full" />
                    <div><p className="font-semibold text-sm">Guest {i}</p><div className="flex">{[...Array(5)].map((_, j) => <Star key={j} className={`w-3.5 h-3.5 ${j < 4 ? "fill-secondary text-secondary" : "text-border"}`} />)}</div></div>
                  </div>
                  <p className="text-sm text-text-secondary">Amazing stay! The room was spotless and the staff went above and beyond to make us feel welcome.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Hotels */}
          {related.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Similar Hotels in {hotel.city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.map((h, i) => <HotelCard key={h.id} hotel={h} index={i} />)}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="glass rounded-2xl p-6 space-y-4">
              <div>
                <span className="text-3xl font-bold text-primary">${hotel.price}</span>
                <span className="text-text-secondary text-sm"> / night</span>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium mb-1">Check-in</label><input type="date" className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-xs font-medium mb-1">Check-out</label><input type="date" className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-xs font-medium mb-1">Guests</label><select className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}</select></div>
              </div>
              <Button size="lg" className="w-full">Book Now</Button>
              <p className="text-xs text-text-secondary text-center">You will not be charged yet</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold text-sm mb-2">Hotel Policies</h3>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>Check-in: 2:00 PM - 11:00 PM</li>
                <li>Check-out: 11:00 AM</li>
                <li>Free cancellation up to 24 hours before</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
