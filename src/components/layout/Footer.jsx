import { Link } from "react-router-dom";
import { Hotel, Mail, Phone, MapPin } from "lucide-react";

const sections = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "Hotels", to: "/hotels" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "#" },
      { label: "Cancellation Policy", to: "#" },
      { label: "Privacy Policy", to: "#" },
      { label: "Terms of Service", to: "#" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "+234 800 123 4567", icon: Phone, to: "#" },
      { label: "hello@ewainehotels.com", icon: Mail, to: "#" },
      { label: "Lagos, Nigeria", icon: MapPin, to: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-bg text-dark-text border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Hotel className="w-6 h-6 text-primary" />
              <span className="text-gradient">EwaineHotels</span>
            </Link>
            <p className="text-dark-text-secondary text-sm leading-relaxed">
              Discover luxury hotels, budget accommodations, and unforgettable experiences around the world.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="font-semibold mb-4">{s.title}</h3>
              <ul className="space-y-3">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="flex items-center gap-2 text-sm text-dark-text-secondary hover:text-primary transition-colors"
                    >
                      {l.icon && <l.icon className="w-4 h-4" />}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-dark-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-text-secondary">&copy; {new Date().getFullYear()} EwaineHotels. All rights reserved.</p>
          <div className="flex gap-4">
            {["Twitter", "Instagram", "Facebook", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="text-dark-text-secondary hover:text-primary transition-colors text-sm" aria-label={s}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
