import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getRecent, addRecent as apiAddRecent } from "../services/api";
import { useUser } from "./UserContext";

const RECENT_KEY = "ewaine-recent";
const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const { profile } = useUser();
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });

  const email = profile?.email;

  useEffect(() => {
    if (!email) return;
    getRecent(email)
      .then((data) => {
        if (Array.isArray(data)) {
          setRecent(data);
          try { localStorage.setItem(RECENT_KEY, JSON.stringify(data)); } catch {}
        }
      })
      .catch(() => {});
  }, [email]);

  const addRecent = useCallback((hotel) => {
    setRecent((prev) => {
      const updated = [hotel, ...prev.filter((h) => h.id !== hotel.id)].slice(0, 10);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (email) {
      apiAddRecent({ email, ...hotel, hotelId: hotel.id }).catch(() => {});
    }
  }, [email]);

  return <RecentlyViewedContext.Provider value={{ recent, addRecent }}>{children}</RecentlyViewedContext.Provider>;
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
