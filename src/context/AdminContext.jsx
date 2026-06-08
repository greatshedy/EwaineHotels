import { createContext, useContext, useState, useCallback } from "react";
import { getHotels, saveHotels } from "../data/hotelStore";

const AUTH_KEY = "ewaine-admin-auth";
const BOOKINGS_KEY = "ewaine-bookings";

const AdminContext = createContext(null);

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.expiresAt > Date.now()) return data;
    localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
  return null;
}

function loadStoredBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    /* ignore */
  }
  return [];
}

function saveBookings(data) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function AdminProvider({ children }) {
  const initAuth = loadStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!!initAuth);
  const [adminUser, setAdminUser] = useState(initAuth);
  const [hotels, setHotels] = useState(() => getHotels());
  const [bookings, setBookings] = useState(() => loadStoredBookings());

  const login = useCallback((email, password) => {
    if (email !== "admin@ewaine.com" || password !== "admin123") return false;
    const data = {
      email,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
    setIsAuthenticated(true);
    setAdminUser(data);
    return true;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false);
    setAdminUser(null);
  }, []);

  const refreshHotels = useCallback(() => {
    setHotels([...getHotels()]);
  }, []);

  const addHotel = useCallback((hotel) => {
    const all = getHotels();
    const maxId = all.reduce((max, h) => Math.max(max, h.id), 0);
    const newHotel = {
      ...hotel,
      id: maxId + 1,
      slug: hotel.name.toLowerCase().replace(/\s+/g, "-"),
      reviews: 0,
      latitude: 0,
      longitude: 0,
    };
    all.push(newHotel);
    saveHotels(all);
    setHotels([...all]);
    return newHotel;
  }, []);

  const updateHotel = useCallback((id, updates) => {
    const all = getHotels();
    const idx = all.findIndex((h) => h.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...updates };
    saveHotels(all);
    setHotels([...all]);
    return true;
  }, []);

  const deleteHotel = useCallback((id) => {
    const all = getHotels().filter((h) => h.id !== id);
    saveHotels(all);
    setHotels(all);
  }, []);

  const addBooking = useCallback(
    (booking) => {
      const newBooking = {
        ...booking,
        id: Date.now(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const all = [...bookings, newBooking];
      setBookings(all);
      saveBookings(all);
      return newBooking;
    },
    [bookings]
  );

  const updateBookingStatus = useCallback(
    (id, status) => {
      const all = bookings.map((b) =>
        b.id === id ? { ...b, status } : b
      );
      setBookings(all);
      saveBookings(all);
    },
    [bookings]
  );

  const getRevenue = useCallback(() => {
    return bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  }, [bookings]);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        loading: false,
        login,
        logout,
        hotels,
        refreshHotels,
        addHotel,
        updateHotel,
        deleteHotel,
        bookings,
        addBooking,
        updateBookingStatus,
        getRevenue,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
