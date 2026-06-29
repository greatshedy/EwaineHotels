import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight,
  Wifi, Waves, Dumbbell, Car, Wind, Coffee, PawPrint, X, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { getHotel, createBooking, getHotels, getSettings } from "../services/api";
import { getHotelDetails as fetchTripDetails } from "../services/tripadvisor";
import { mapDetailResult } from "../services/tripMapper";
import HotelCard from "../components/HotelCard";
import Button from "../components/Button";
import BackToTop from "../components/BackToTop";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { useUser } from "../context/UserContext";

const amenityIcons = {
  "Swimming Pool": Waves, WiFi: Wifi, Restaurant: Utensils, Gym: Dumbbell, Parking: Car,
  "Air Conditioning": Wind, "Free Breakfast": Coffee, "Pet Friendly": PawPrint,
};

function Utensils() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>; }

function RatingStars({ value }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(value) ? "fill-secondary text-secondary" : "text-border"}`} />
      ))}
    </div>
  );
}

export default function HotelDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const commerceUrlParam = searchParams.get("commerceUrl") || "";

  const { addRecent } = useRecentlyViewed();
  const { profile } = useUser();
  const [imgIdx, setImgIdx] = useState(0);
  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [guestName, setGuestName] = useState(profile?.name || "");
  const [guestEmail, setGuestEmail] = useState(profile?.email || "");
  const [guestPhone, setGuestPhone] = useState(profile?.phone || "");

  const [hotel, setHotel] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tripState, setTripState] = useState({ hotel: null, loading: false, error: "" });
  const [whatsappNumber, setWhatsappNumber] = useState("2348080769019");

  const isTripAdvisor = !hotel && !loading && !error;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const numericId = Number(id);
    if (!isNaN(numericId)) {
      getHotel(numericId)
        .then((data) => {
          if (cancelled) return;
          setHotel(data);
          setLoading(false);
          if (data?.city) {
            getHotels({ location: data.city })
              .then((all) => {
                if (!cancelled) setRelated((all || []).filter((h) => h.id !== numericId).slice(0, 4));
              })
              .catch(() => {});
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message || "Failed to load hotel");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    getSettings()
      .then((data) => { if (data?.whatsapp) setWhatsappNumber(data.whatsapp); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isTripAdvisor || loading) return;
    let cancelled = false;
    setTripState({ hotel: null, loading: true, error: "" });
    const ci = checkInParam || new Date().toISOString().split("T")[0];
    const co = checkOutParam || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    fetchTripDetails({ id, checkIn: ci, checkOut: co })
      .then((data) => { if (!cancelled) setTripState({ hotel: { ...mapDetailResult(data), commerceUrl: commerceUrlParam }, loading: false, error: "" }); })
      .catch((err) => { if (!cancelled) setTripState({ hotel: null, loading: false, error: err.message || "Failed to load hotel" }); });
    return () => { cancelled = true; };
  }, [id, isTripAdvisor, loading, checkInParam, checkOutParam, commerceUrlParam]);

  const displayHotel = tripState.hotel || hotel;

  useEffect(() => {
    if (displayHotel) {
      addRecent({ id: displayHotel.id, name: displayHotel.name, city: displayHotel.city || "", price: displayHotel.price, rating: displayHotel.rating, image: displayHotel.images[0] });
    }
    window.scrollTo(0, 0);
  }, [displayHotel, addRecent]);

  if (loading || tripState.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tripState.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load hotel</h2>
          <p className="text-text-secondary mb-4">{tripState.error}</p>
          <Link to="/hotels" className="text-primary font-semibold hover:underline">Browse Hotels</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to load hotel</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <Link to="/hotels" className="text-primary font-semibold hover:underline">Browse Hotels</Link>
        </div>
      </div>
    );
  }

  if (!displayHotel) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center"><h2 className="text-2xl font-bold mb-2">Hotel Not Found</h2><p className="text-text-secondary mb-4">The hotel you are looking for does not exist.</p><Link to="/hotels" className="text-primary font-semibold hover:underline">Browse Hotels</Link></div>
      </div>
    );
  }

  const roomPrice = displayHotel.roomTypes?.find((r) => r.type === selectedRoom)?.price || displayHotel.price;
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

  const hasBooking = !isTripAdvisor && displayHotel.roomTypes?.length > 0;

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

  const handleConfirmBooking = async () => {
    if (!guestName || !guestEmail) {
      toast.error("Please fill in your name and email");
      return;
    }
    try {
      const booking = await createBooking({
        hotelId: displayHotel.id,
        hotelName: displayHotel.name,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guests,
        roomType: selectedRoom || displayHotel.roomTypes?.[0]?.type || "Standard",
        totalPrice: roomPrice * nights,
      });
      setShowBooking(false);
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
      const msg = encodeURIComponent(
        `New Booking!\n\nHotel: ${displayHotel.name}\nGuest: ${guestName}\nEmail: ${guestEmail}\nPhone: ${guestPhone || "N/A"}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nGuests: ${guests}\nRoom: ${selectedRoom || displayHotel.roomTypes?.[0]?.type || "Standard"}\nTotal: $${roomPrice * nights}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
      toast.success("Booking submitted! Awaiting confirmation.");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Booking failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/hotels" className="hover:text-primary">Hotels</Link>
        <span>/</span>
        <span className="text-text truncate">{displayHotel.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
            <motion.img key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={displayHotel.images[imgIdx] || displayHotel.images[0]} alt={displayHotel.name} className="w-full h-full object-cover" />
            {displayHotel.images.length > 1 && (
              <>
                <button onClick={() => setImgIdx((p) => (p === 0 ? displayHotel.images.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setImgIdx((p) => (p === displayHotel.images.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {displayHotel.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          {displayHotel.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {displayHotel.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Hotel Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{displayHotel.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{displayHotel.address}{displayHotel.city ? `, ${displayHotel.city}` : ''}{displayHotel.state ? `, ${displayHotel.state}` : ''}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-secondary text-secondary" />{displayHotel.rating} ({displayHotel.reviews} reviews)</span>
              {isTripAdvisor && displayHotel.provider && (
                <span className="text-xs bg-surface-alt dark:bg-dark-bg px-2 py-1 rounded-lg">via {displayHotel.provider}</span>
              )}
            </div>
            {displayHotel.priceSummary && (
              <p className="text-sm text-primary font-medium mb-2" dangerouslySetInnerHTML={{ __html: displayHotel.priceSummary }} />
            )}
            <p className="text-text-secondary leading-relaxed">{displayHotel.description}</p>
          </div>

          {/* Tags */}
          {isTripAdvisor && displayHotel.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayHotel.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          )}

          {/* Amenities */}
          {displayHotel.amenities?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {displayHotel.amenities.map((a) => {
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
          )}

          {/* Room Types */}
          {displayHotel.roomTypes?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
              <div className="space-y-3">
                {displayHotel.roomTypes.map((r) => (
                  <div key={r.type} className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-dark-border">
                    <div><h3 className="font-semibold">{r.type}</h3><p className="text-sm text-text-secondary">{r.available} rooms left</p></div>
                    <div className="text-right"><span className="text-xl font-bold text-primary">${r.price}</span><span className="text-xs text-text-secondary"> / night</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="rounded-2xl overflow-hidden h-64 bg-surface-alt dark:bg-dark-surface flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">{displayHotel.address || 'Address not available'}</p>
                {displayHotel.latitude ? (
                  <p className="text-xs text-text-secondary mt-1">Lat: {displayHotel.latitude}, Lng: {displayHotel.longitude}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {!isTripAdvisor && (
            <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-surface-alt dark:bg-dark-surface">
              {displayHotel.phone && <a href={`tel:${displayHotel.phone}`} className="flex items-center gap-2 text-sm hover:text-primary"><Phone className="w-4 h-4" />{displayHotel.phone}</a>}
              {displayHotel.email && <a href={`mailto:${displayHotel.email}`} className="flex items-center gap-2 text-sm hover:text-primary"><Mail className="w-4 h-4" />{displayHotel.email}</a>}
              {displayHotel.website && <a href={displayHotel.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary"><Globe className="w-4 h-4" />Website</a>}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold mb-4">Guest Reviews</h2>
            <div className="space-y-4">
              {isTripAdvisor && displayHotel.reviewSamples?.length > 0 ? (
                displayHotel.reviewSamples.slice(0, 5).map((r, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={r.avatar || `https://i.pravatar.cc/40?img=${i + 20}`} alt="" className="w-10 h-10 rounded-full" onError={(e) => { if (e.target.src !== `https://i.pravatar.cc/40?img=${i + 20}`) e.target.src = `https://i.pravatar.cc/40?img=${i + 20}`; }} />
                      <div>
                        <p className="font-semibold text-sm">{r.author || 'Guest'}</p>
                        <p className="text-xs text-text-secondary">{r.date}</p>
                      </div>
                    </div>
                    {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                    <p className="text-sm text-text-secondary">{r.text}</p>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={`https://i.pravatar.cc/40?img=${i + 20}`} alt="" className="w-10 h-10 rounded-full" />
                      <div><p className="font-semibold text-sm">Guest {i}</p><RatingStars value={4} /></div>
                    </div>
                    <p className="text-sm text-text-secondary">Amazing stay! The room was spotless and the staff went above and beyond to make us feel welcome.</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Related Hotels */}
          {related.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Similar Hotels in {displayHotel.city}</h2>
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
                {isTripAdvisor && displayHotel.provider && (
                  <p className="text-xs text-text-secondary mt-1">via {displayHotel.provider}</p>
                )}
              </div>

              {hasBooking ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Room Type</label>
                      <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        {displayHotel.roomTypes.map((r) => (
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
                </>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-text-secondary">This hotel is listed on TripAdvisor. Visit their site to book.</p>
                  <a
                    href={displayHotel.commerceUrl || `https://www.tripadvisor.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors w-full justify-center"
                  >
                    View on TripAdvisor <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
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
      {showBooking && hasBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowBooking(false)}>
          <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-border dark:border-dark-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
              <h2 className="font-bold">Confirm Booking</h2>
              <button onClick={() => setShowBooking(false)} className="p-1 hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-surface-alt dark:bg-dark-bg rounded-xl p-3 space-y-1 text-sm">
                <p className="font-semibold">{displayHotel.name}</p>
                <p className="text-text-secondary">{selectedRoom || displayHotel.roomTypes?.[0]?.type} — ${roomPrice}/night</p>
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
