import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { getHotels } from "../services/api";
import HotelCard from "../components/HotelCard";

export default function Favorites() {
  const { favorites } = useFavorites();
  const [favHotels, setFavHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setFavHotels([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getHotels()
      .then((data) => {
        setFavHotels((data || []).filter((h) => favorites.includes(h.id)));
      })
      .catch(() => setFavHotels([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
      <p className="text-text-secondary mb-8">{favHotels.length} saved hotels</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favHotels.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <Heart className="w-16 h-16 text-text-secondary/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-text-secondary mb-6">Start saving hotels you love by tapping the heart icon.</p>
          <Link to="/hotels" className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors inline-block">Browse Hotels</Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favHotels.map((hotel, i) => (
            <HotelCard key={hotel.id} hotel={hotel} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
