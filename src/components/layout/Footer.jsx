import { Link } from "react-router-dom";
import { Mail, Globe, Camera, Music, X } from "lucide-react";
import logo from "../../assets/ewainehotel.png";

const emails = [
  "info@ewainehotels.com",
  "support@ewainehotels.com",
  "finance@ewainehotels.com",
  "corporate@ewainehotels.com",
  "partners@ewainehotels.com",
  "reservations@ewainehotels.com",
];

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
    links: emails.map((email) => ({ label: email, icon: Mail, to: "#" })),
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-bg text-dark-text border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="EwaineHotels" className="h-16 w-auto brightness-0 invert" />
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
            <a href="https://www.facebook.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="Facebook">
              <Globe className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="Instagram">
              <Camera className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="TikTok">
              <Music className="w-5 h-5" />
            </a>
            <a href="https://www.x.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="X">
              <X className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
