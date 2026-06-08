import { createContext, useContext, useState, useEffect, useCallback } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ewaine-favorites") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("ewaine-favorites", JSON.stringify(favorites)); }, [favorites]);

  const toggleFavorite = useCallback((id) => setFavorites((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]), []);
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  return <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
