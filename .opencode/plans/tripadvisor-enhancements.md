# TripAdvisor Enhancements Plan

## Overview
5 changes to make TripAdvisor auto-load Lagos, add clickable destination cards, show featured TripAdvisor hotels, and cache API results.

---

## 1. NEW: `src/services/tripCache.js`
localStorage-based caching layer for TripAdvisor API results.

```js
const PREFIX = 'ta-v1-'
const TTL = 24 * 60 * 60 * 1000  // 24 hours

export function getTripCache(key) { ... }   // returns cached data or null
export function setTripCache(key, data) { ... }  // stores with timestamp
export function clearTripCache() { ... }
```

Cache key format: `ta-v1-{searchQuery}-{checkIn}-{checkOut}`

---

## 2. EDIT: `src/services/tripadvisor.js`
Add cache check wrapper to `searchHotels`:
- Before API call → check `getTripCache(key)` → return cached Promise if exists
- After successful API → `setTripCache(key, result)`
- Only cache `searchHotels` results (not `searchLocation` — geoId lookup is cheap)

---

## 3. EDIT: `src/pages/Hotels.jsx` — 4 changes

### Change A — Auto-load Lagos as default
When `tripMode` activates and `!searchQuery`:
- `setSearchParams({ search: 'Lagos' })`  → triggers the existing `useEffect` → fetches TripAdvisor Lagos hotels

### Change B — Destination cards (Hotels page)
In TripAdvisor mode, show a row of clickable destination cards:
- Import `destinationsData` from `../data/destinations.json`
- Render 6 cards in a horizontal flex row above the search input
- Each card: image, city name, country
- Clicking a card → `setSearchParams({ search: dest.name })` → fetches TripAdvisor for that city

### Change C — Featured TripAdvisor Hotels section
Below the main TripAdvisor grid, add a section:
- Heading: "Featured on TripAdvisor"
- Show top 4-6 rated hotels from the **currently loaded** search results (sorted by rating, no extra API call)
- Uses HotelCard-style layout in a grid, but with a "Featured TripAdvisor" badge
- **When no search results yet**: auto-load Lagos default which populates this section

### Change D — Compact search bar in TripAdvisor mode
Above the destination cards, show a small search input allowing users to type any destination:
- `<input>` with placeholder "Search other destinations..."
- On submit → `setSearchParams({ search: inputValue })`

---

## 4. EDIT: `src/pages/Home.jsx` — Clickable destination cards
Wrap each existing destination card in a `<Link to={`/hotels?search=${d.name}`}>`:
- Current: `<motion.div key={d.id} ...>` is a static div
- New: `<Link to={...}><motion.div ...></Link>` — clicking navigates to Hotels page filtered by that city

No visual changes — cards look the same, just become clickable.

---

## Files changed
| File | Action |
|------|--------|
| `src/services/tripCache.js` | **NEW** — caching layer |
| `src/services/tripadvisor.js` | **EDIT** — wrap `searchHotels` with cache check |
| `src/pages/Hotels.jsx` | **EDIT** — auto-Lagos, destination cards, featured section, search bar |
| `src/pages/Home.jsx` | **EDIT** — wrap destination cards in Link |
