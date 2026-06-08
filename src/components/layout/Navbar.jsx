import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Moon, Sun, Heart, Hotel, Shield } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useFavorites } from "../../context/FavoritesContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/hotels", label: "Hotels" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { favorites } = useFavorites();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Hotel className="w-6 h-6 text-primary" />
            <span className="text-gradient">EwaineHotels</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-text-secondary"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/favorites" className="relative p-2 hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link
              to="/ewaine-admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border dark:border-dark-border hover:border-primary hover:text-primary transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
            <button onClick={toggle} className="p-2 rounded-full hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors" aria-label="Toggle dark mode">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link to="/favorites" className="relative p-2">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link to="/ewaine-admin" className="p-2 hover:text-primary" aria-label="Admin">
              <Shield className="w-5 h-5" />
            </Link>
            <button onClick={toggle} className="p-2" aria-label="Toggle dark mode">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setOpen(!open)} className="p-2" aria-label="Toggle menu">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 px-4 py-4 space-y-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-text-secondary"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
