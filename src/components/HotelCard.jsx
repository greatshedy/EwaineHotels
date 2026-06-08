import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, Wifi, Waves, Dumbbell, Car, Wind, Coffee, PawPrint } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";

const amenityIcons = {
  "Swimming Pool": Waves,
  WiFi: Wifi,
  Gym: Dumbbell,
  Parking: Car,
  "Air Conditioning": Wind,
  "Free Breakfast": Coffee,
  "Pet Friendly": PawPrint,
};

export default function HotelCard({ hotel, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(hotel.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/hotel/${hotel.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {hotel.featured && (
          <span className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {hotel.images.length} Photos
        </span>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <Link to={`/hotel/${hotel.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
              {hotel.name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-text-secondary mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{hotel.city}, {hotel.state}</span>
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleFavorite(hotel.id); }}
            className={`p-2 rounded-full transition-colors ${fav ? "text-error" : "text-text-secondary hover:text-error"}`}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-secondary text-secondary" />
          <span className="text-sm font-medium">{hotel.rating}</span>
          <span className="text-xs text-text-secondary">({hotel.reviews} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {hotel.amenities.slice(0, 4).map((a) => {
            const Icon = amenityIcons[a];
            return (
              <span key={a} className="inline-flex items-center gap-1 text-xs bg-surface-alt dark:bg-dark-bg px-2 py-1 rounded-lg text-text-secondary">
                {Icon && <Icon className="w-3 h-3" />}
                {a}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">${hotel.price}</span>
            <span className="text-xs text-text-secondary"> / night</span>
          </div>
          <Link
            to={`/hotel/${hotel.id}`}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
