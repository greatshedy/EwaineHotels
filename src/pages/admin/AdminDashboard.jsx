import { useAdmin } from "../../context/AdminContext";
import {
  Building2,
  CalendarCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Total Hotels",
    key: "hotels",
    icon: Building2,
    color: "text-primary bg-primary/10",
  },
  {
    label: "Total Bookings",
    key: "bookings",
    icon: CalendarCheck,
    color: "text-accent bg-accent/10",
  },
  {
    label: "Total Revenue",
    key: "revenue",
    icon: DollarSign,
    color: "text-success bg-success/10",
  },
  {
    label: "Active Bookings",
    key: "active",
    icon: TrendingUp,
    color: "text-secondary bg-secondary/10",
  },
];

export default function AdminDashboard() {
  const { hotels, bookings, getRevenue } = useAdmin();
  const activeBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const revenue = getRevenue();

  const statsData = {
    hotels: hotels.length,
    bookings: bookings.length,
    revenue: `$${revenue.toLocaleString()}`,
    active: activeBookings.length,
  };

  const statusColors = {
    pending: "bg-secondary/10 text-secondary",
    confirmed: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-border dark:border-dark-border"
            >
              <div className={`p-2.5 rounded-xl w-fit ${s.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{statsData[s.key]}</p>
              <p className="text-sm text-text-secondary">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border p-5">
        <h2 className="text-lg font-bold mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-text-secondary">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-border dark:border-dark-border">
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Hotel</th>
                  <th className="pb-3 font-medium">Check-in</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-border/50 dark:border-dark-border/50"
                    >
                      <td className="py-3">{b.guestName}</td>
                      <td className="py-3">{b.hotelName}</td>
                      <td className="py-3">
                        {new Date(b.checkIn).toLocaleDateString()}
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
      </div>
    </div>
  );
}
