import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Search, CheckCircle2, XCircle } from "lucide-react";

const statusColors = {
  pending: "bg-secondary/10 text-secondary",
  confirmed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

export default function AdminBookings() {
  const { bookings, updateBookingStatus } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = bookings.filter(
    (b) =>
      b.guestName?.toLowerCase().includes(search.toLowerCase()) ||
      b.hotelName?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-border dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Guest</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Hotel</th>
                <th className="p-3 font-medium">Room</th>
                <th className="p-3 font-medium">Check-in</th>
                <th className="p-3 font-medium">Check-out</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice()
                .reverse()
                .map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border/50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-bg/30"
                  >
                    <td className="p-3 text-text-secondary font-mono">
                      {b.id?.toString().slice(-6)}
                    </td>
                    <td className="p-3 font-medium">{b.guestName}</td>
                    <td className="p-3 text-text-secondary">{b.guestEmail}</td>
                    <td className="p-3">{b.hotelName}</td>
                    <td className="p-3">{b.roomType || "—"}</td>
                    <td className="p-3">
                      {new Date(b.checkIn).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {new Date(b.checkOut).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">${b.totalPrice}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          statusColors[b.status] || statusColors.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateBookingStatus(b.id, "confirmed")
                              }
                              className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-success transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                updateBookingStatus(b.id, "cancelled")
                              }
                              className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-error transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() =>
                              updateBookingStatus(b.id, "cancelled")
                            }
                            className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-error transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {b.status === "cancelled" && (
                          <button
                            onClick={() =>
                              updateBookingStatus(b.id, "pending")
                            }
                            className="p-2 hover:bg-surface-alt dark:hover:bg-dark-surface rounded-lg text-text-secondary hover:text-secondary transition-colors"
                            title="Reopen"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-text-secondary"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
