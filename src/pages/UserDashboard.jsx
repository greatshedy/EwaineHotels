import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, CalendarCheck, DollarSign, TrendingUp,
  Heart, Eye, Building2, ArrowRight, Edit3, LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { useFavorites } from "../context/FavoritesContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { getBookings } from "../services/api";

const statusColors = {
  pending: "bg-secondary/10 text-secondary",
  confirmed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

export default function UserDashboard() {
  const { profile, saveProfile, clearProfile, logout } = useUser();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const { recent } = useRecentlyViewed();

  const [editing, setEditing] = useState(!profile);
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (!profile?.email) {
      setBookings([]);
      return;
    }
    setBookingsLoading(true);
    getBookings(profile.email)
      .then((data) => setBookings(data || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false));
  }, [profile]);

  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const activeBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    saveProfile({ name, email, phone });
    setEditing(false);
    toast.success("Profile saved!");
  };

  const handleClearProfile = () => {
    clearProfile();
    setName("");
    setEmail("");
    setPhone("");
    setEditing(true);
    toast.success("Profile cleared");
  };

  const handleLogout = () => {
    logout();
    setName("");
    setEmail("");
    setPhone("");
    setEditing(true);
    toast.success("Logged out");
    navigate("/");
  };

  const statCards = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Active Bookings",
      value: activeBookings.length,
      icon: TrendingUp,
      color: "text-accent bg-accent/10",
    },
    {
      label: "Total Spent",
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success bg-success/10",
    },
    {
      label: "Saved Hotels",
      value: favorites.length,
      icon: Heart,
      color: "text-error bg-error/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Heading */}
        <motion.div variants={item}>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Manage your bookings and profile
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={item}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border p-6"
        >
          {editing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Your Profile</h2>
                  <p className="text-sm text-text-secondary">
                    Enter your details to track bookings
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone (optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
                >
                  Save Profile
                </button>
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile.name);
                      setEmail(profile.email);
                      setPhone(profile.phone || "");
                      setEditing(false);
                    }}
                    className="px-5 py-2 text-sm font-medium rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{profile?.name}</h2>
                    <p className="text-sm text-text-secondary">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-primary transition-colors"
                    title="Edit profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-error transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        {profile && (
          <motion.div
            variants={item}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-border dark:border-dark-border"
                >
                  <div className={`p-2 rounded-xl w-fit ${s.color} mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-text-secondary">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* My Bookings */}
        <motion.div
          variants={item}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">My Bookings</h2>
            {profile && (
              <span className="text-xs text-text-secondary">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {bookingsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !profile ? (
            <div className="text-center py-10">
              <CalendarCheck className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
              <p className="text-text-secondary">
                Save your profile above to track bookings
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <CalendarCheck className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
              <p className="text-text-secondary mb-4">
                No bookings found for this email
              </p>
              <Link
                to="/hotels"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Browse Hotels <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-border dark:border-dark-border">
                    <th className="pb-3 font-medium">Hotel</th>
                    <th className="pb-3 font-medium">Room</th>
                    <th className="pb-3 font-medium">Check-in</th>
                    <th className="pb-3 font-medium">Check-out</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .slice()
                    .reverse()
                    .map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-border/50 dark:border-dark-border/50"
                      >
                        <td className="py-3 font-medium">
                          <Link
                            to={`/hotel/${b.hotelId}`}
                            className="hover:text-primary transition-colors"
                          >
                            {b.hotelName}
                          </Link>
                        </td>
                        <td className="py-3 text-text-secondary">
                          {b.roomType}
                        </td>
                        <td className="py-3">
                          {new Date(b.checkIn).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {new Date(b.checkOut).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium">${b.totalPrice}</td>
                        <td className="py-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              statusColors[b.status] || statusColors.pending
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Recently Viewed */}
        {recent.length > 0 && (
          <motion.div variants={item}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-bold">Recently Viewed</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
              {recent.slice(0, 6).map((h) => (
                <Link
                  key={h.id}
                  to={`/hotel/${h.id}`}
                  className="flex-shrink-0 w-56 snap-start group"
                >
                  <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm border border-border dark:border-dark-border group-hover:shadow-md transition-shadow">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={h.image}
                        alt={h.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm truncate">
                        {h.name}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {h.city}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-primary">
                          ${h.price}
                        </span>
                        <span className="text-xs text-secondary">
                          ★ {h.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          variants={item}
          className="flex flex-wrap gap-3 pb-8"
        >
          {!profile && (
            <Link
              to="/hotels"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
            >
              <Building2 className="w-4 h-4" /> Browse Hotels
            </Link>
          )}
          <Link
            to="/favorites"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors text-sm font-medium"
          >
            <Heart className="w-4 h-4 text-error" /> Favorites
            {favorites.length > 0 && (
              <span className="text-xs text-text-secondary">
                ({favorites.length})
              </span>
            )}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
