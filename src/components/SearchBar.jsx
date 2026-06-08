import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/hotels?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/hotels");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass rounded-2xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Destination, hotel name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input type="date" className="pl-10 pr-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all w-full sm:w-auto" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input type="date" className="pl-10 pr-4 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all w-full sm:w-auto" />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <select className="pl-10 pr-8 py-3 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none w-full sm:w-auto">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search
        </Button>
      </form>
    </motion.div>
  );
}
