import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Loader2, CalendarCheck, MessageCircle, ArrowRight,
} from "lucide-react";
import { verifyPayment, getSettings } from "../services/api";

const DEFAULT_WHATSAPP = "2348080769019";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref") || "";

  const [state, setState] = useState(txRef ? "loading" : "failed");
  const [booking, setBooking] = useState(null);

  const notifyWhatsApp = useCallback((bk) => {
    getSettings()
      .then((settings) => {
        const num = settings?.whatsapp || DEFAULT_WHATSAPP;
        const msg = encodeURIComponent(
          `Payment received! Booking Confirmed.\n\nHotel: ${bk.hotelName}\nGuest: ${bk.guestName}\nEmail: ${bk.guestEmail}\nPhone: ${bk.guestPhone || "N/A"}\nCheck-in: ${bk.checkIn}\nCheck-out: ${bk.checkOut}\nRoom: ${bk.roomType}\nTotal Paid: $${bk.totalPrice}`
        );
        window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!txRef) return;
    let cancelled = false;
    verifyPayment(txRef)
      .then((data) => {
        if (cancelled) return;
        setBooking(data.booking);
        if (data.status === "confirmed") {
          setState("success");
          notifyWhatsApp(data.booking);
        } else {
          setState("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });
    return () => { cancelled = true; };
  }, [txRef, notifyWhatsApp]);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-text-secondary">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const isSuccess = state === "success";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSuccess ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
          {isSuccess ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {isSuccess ? "Payment Successful" : "Payment Not Completed"}
        </h1>
        <p className="text-text-secondary mb-6">
          {isSuccess
            ? "Your booking is confirmed. A confirmation message has been sent via WhatsApp."
            : "We could not confirm your payment. You can try again or contact us for help."}
        </p>

        {booking && (
          <div className="bg-surface-alt dark:bg-dark-bg rounded-xl p-4 space-y-1 text-sm text-left mb-6">
            <p className="font-semibold">{booking.hotelName}</p>
            <p className="text-text-secondary">{booking.roomType} — ${booking.totalPrice}</p>
            <p className="text-text-secondary">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p className="text-xs text-text-secondary font-mono">Ref: {booking.txRef}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {isSuccess ? (
            <>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
                <CalendarCheck className="w-4 h-4" /> View My Bookings
              </Link>
              <a href={`https://wa.me/${DEFAULT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border dark:border-dark-border hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors font-medium">
                <MessageCircle className="w-4 h-4" /> Contact Hotel
              </a>
            </>
          ) : (
            <Link to="/hotels" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">
              Browse Hotels <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
