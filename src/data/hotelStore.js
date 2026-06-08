import defaultHotels from "./hotels.json";

const STORAGE_KEY = "ewaine-hotels";

let cached = null;

export function getHotels() {
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cached = JSON.parse(stored);
      if (Array.isArray(cached) && cached.length > 0) return cached;
    }
  } catch {
    /* ignore */
  }
  cached = [...defaultHotels];
  return cached;
}

export function saveHotels(hotels) {
  cached = hotels;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  } catch {
    /* ignore */
  }
}

export function resetHotels() {
  cached = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
