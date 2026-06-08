import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight,
  Wifi, Waves, Dumbbell, Car, Wind, Coffee, PawPrint, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getHotels } from "../data/hotelStore";
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
  const hotel = getHotels().find((h) => h.id === Number(id));
  const { addRecent } = useRecentlyViewed();
  const [imgIdx, setImgIdx] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

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

  const related = getHotels().filter((h) => h.city === hotel.city && h.id !== hotel.id).slice(0, 4);

  const roomPrice = hotel.roomTypes.find((r) => r.type === selectedRoom)?.price || hotel.price;
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setShowBooking(true);
  };

  const handleConfirmBooking = () => {
    if (!guestName || !guestEmail) {
      toast.error("Please fill in your name and email");
      return;
    }
    const booking = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests,
      roomType: selectedRoom || hotel.roomTypes[0]?.type || "Standard",
      totalPrice: roomPrice * nights,
    };
    try {
      const stored = JSON.parse(localStorage.getItem("ewaine-bookings") || "[]");
      stored.push({ ...booking, id: Date.now(), status: "pending", createdAt: new Date().toISOString() });
      localStorage.setItem("ewaine-bookings", JSON.stringify(stored));
    } catch {
      /* ignore */
    }
    setShowBooking(false);
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    toast.success("Booking submitted! Awaiting confirmation.");
  };

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
                <span className="text-3xl font-bold text-primary">${roomPrice}</span>
                <span className="text-text-secondary text-sm"> / night</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Room Type</label>
                  <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {hotel.roomTypes.map((r) => (
                      <option key={r.type} value={r.type}>{r.type} - ${r.price}</option>
                    ))}
                  </select>
                </div>
                <div><label className="block text-xs font-medium mb-1">Check-in</label><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-xs font-medium mb-1">Check-out</label><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                <div><label className="block text-xs font-medium mb-1">Guests</label><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}</select></div>
              </div>
              <div className="flex items-center justify-between text-sm text-text-secondary">
                <span>${roomPrice} x {nights} night{nights > 1 ? "s" : ""}</span>
                <span className="font-bold text-primary text-lg">${roomPrice * nights}</span>
              </div>
              <Button size="lg" className="w-full" onClick={handleBookNow}>Book Now</Button>
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

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowBooking(false)}>
          <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-border dark:border-dark-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
              <h2 className="font-bold">Confirm Booking</h2>
              <button onClick={() => setShowBooking(false)} className="p-1 hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-surface-alt dark:bg-dark-bg rounded-xl p-3 space-y-1 text-sm">
                <p className="font-semibold">{hotel.name}</p>
                <p className="text-text-secondary">{selectedRoom || hotel.roomTypes[0]?.type} — ${roomPrice}/night</p>
                <p className="text-text-secondary">{new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}</p>
                <p className="text-text-secondary">{guests} guest{guests > 1 ? "s" : ""} · {nights} night{nights > 1 ? "s" : ""}</p>
                <p className="text-lg font-bold text-primary">Total: ${roomPrice * nights}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="John Doe" className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="john@example.com" className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+234 800 000 0000" className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <Button size="lg" className="w-full" onClick={handleConfirmBooking}>Confirm Booking</Button>
            </div>
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  );
}
