import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  Hotel,
  MessageSquareQuote,
  Settings,
  FileText,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

const sidebarLinks = [
  { to: "/ewaine-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ewaine-admin/hotels", label: "Hotels", icon: Building2 },
  { to: "/ewaine-admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/ewaine-admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/ewaine-admin/settings", label: "Settings", icon: Settings },
  { to: "/ewaine-admin/blog", label: "Blog", icon: FileText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/ewaine-admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-bg text-dark-text flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <NavLink
            to="/ewaine-admin/dashboard"
            className="flex items-center gap-2"
          >
            <Hotel className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">EwaineAdmin</span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/ewaine-admin/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-dark-text-secondary hover:bg-dark-surface hover:text-dark-text"
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-text-secondary hover:bg-dark-surface hover:text-error transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-border dark:border-dark-border lg:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm">EwaineAdmin</span>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
