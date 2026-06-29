const PREFIX = 'ta-v1-'
const TTL = 24 * 60 * 60 * 1000

export function getTripCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > TTL) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setTripCache(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    /* ignore */
  }
}

export function clearTripCache() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
