import { createContext, useContext, useState, useCallback } from "react";

const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ewaine-recent") || "[]"); } catch { return []; }
  });

  const addRecent = useCallback((hotel) => {
    setRecent((prev) => {
      const updated = [hotel, ...prev.filter((h) => h.id !== hotel.id)].slice(0, 10);
      localStorage.setItem("ewaine-recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return <RecentlyViewedContext.Provider value={{ recent, addRecent }}>{children}</RecentlyViewedContext.Provider>;
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
