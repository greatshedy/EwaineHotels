import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import logo from "../../assets/ewainehotel.png";
import facebookIcon from "../../assets/facebook.png";
import instagramIcon from "../../assets/instagram.png";
import tiktokIcon from "../../assets/tik-tok.png";
import twitterIcon from "../../assets/twitter.png";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "Plot H3, No 10 Obafemi Awolowo Way, Alpha Plaza, CBD Alausa Ikeja, Lagos, Nigeria" },
  { icon: Phone, label: "Phone", value: "+234 907 771 1825", href: "tel:+2349077711825" },
  { icon: MessageCircle, label: "WhatsApp", value: "+234 907 771 1825", href: "https://wa.me/2349077711825" },
  { icon: Clock, label: "Hours", value: "Mon–Sat: 8:00 AM – 6:00 PM" },
];

const contactEmails = [
  { label: "Support", email: "support@ewainehotels.com" },
];

const linkSections = [
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
          {linkSections.map((s) => (
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
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 mb-4">
              {contactInfo.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-2 text-sm text-dark-text-secondary hover:text-primary transition-colors">
                      <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item.value}</span>
                    </a>
                  ) : (
                    <span className="flex items-start gap-2 text-sm text-dark-text-secondary">
                      <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item.value}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-dark-text-secondary mb-2">Email</h4>
            <ul className="space-y-2">
              {contactEmails.map((item) => (
                <li key={item.email}>
                  <a href={`mailto:${item.email}`}
                    className="flex items-center gap-2 text-sm text-dark-text-secondary hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-text-secondary">&copy; {new Date().getFullYear()} EwaineHotels. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Facebook">
              <img src={facebookIcon} alt="Facebook" className="w-5 h-5 brightness-0 invert" />
            </a>
            <a href="https://www.instagram.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" className="w-5 h-5 brightness-0 invert" />
            </a>
            <a href="https://www.tiktok.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity" aria-label="TikTok">
              <img src={tiktokIcon} alt="TikTok" className="w-5 h-5 brightness-0 invert" />
            </a>
            <a href="https://www.x.com/ewainehotels" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity" aria-label="X">
              <img src={twitterIcon} alt="X" className="w-5 h-5 brightness-0 invert" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
