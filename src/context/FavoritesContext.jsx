import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "../services/api";
import { useUser } from "./UserContext";

const FAV_KEY = "ewaine-favorites";
const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { profile } = useUser();
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
  });

  const email = profile?.email;

  useEffect(() => {
    if (!email) return;
    getFavorites(email)
      .then((ids) => {
        if (Array.isArray(ids)) {
          setFavorites(ids);
          try { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); } catch {}
        }
      })
      .catch(() => {});
  }, [email]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        if (email) apiRemoveFavorite(email, id).catch(() => {});
        const updated = prev.filter((i) => i !== id);
        try { localStorage.setItem(FAV_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      } else {
        if (email) apiAddFavorite(email, id).catch(() => {});
        const updated = [...prev, id];
        try { localStorage.setItem(FAV_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      }
    });
  }, [email]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  return <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
