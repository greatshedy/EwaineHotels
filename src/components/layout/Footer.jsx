import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
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
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.69 2.89 2.89 0 0 1-2.88-2.69 2.89 2.89 0 0 1 2.88-2.69c.5 0 .97.13 1.38.35V8.65a6.27 6.27 0 0 0-1.38-.18A6.34 6.34 0 0 0 0 14.78a6.34 6.34 0 0 0 6.31 6.31 6.34 6.34 0 0 0 6.31-6.31V9.74c.89.7 2 1.13 3.26 1.17 0 0 .17 0 .26-.01v-3.1c-.38.01-.75-.05-1.05-.2a4.91 4.91 0 0 1-1.5-.91Z" />
              </svg>
            </a>
            <a href="https://www.x.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="text-dark-text-secondary hover:text-primary transition-colors" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
