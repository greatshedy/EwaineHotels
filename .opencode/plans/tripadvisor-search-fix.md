# Fix: TripAdvisor shows "No results" when no search query is entered

## Problem
Navigating to `/hotels` (without a search query) and clicking "TripAdvisor" shows "No TripAdvisor results" because the `useEffect` at `Hotels.jsx:74` returns early when `searchQuery` is empty:
```js
if (!tripMode || !searchQuery) return;
```
The initial trip state is `{ hotels: [], loading: false, error: "" }`, so the empty-state UI renders.

## Fix
Replace the static empty TripAdvisor state (line 224-230) with a conditional:

1. If `searchQuery` is present but API returned zero results → show existing "No results" message
2. If `searchQuery` is empty (user never searched) → show a **search input** with form, allowing users to search TripAdvisor directly from the Hotels page

### Code changes in `src/pages/Hotels.jsx`

**Current** (lines 224-230):
```jsx
) : trip.hotels.length === 0 ? (
  <div className="text-center py-20">
    <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">No TripAdvisor results</h3>
    <p className="text-text-secondary mb-4">Try searching for a different destination.</p>
    <button onClick={() => setTripMode(false)} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">Back to Our Hotels</button>
  </div>
```

**Replacement**:
```jsx
) : trip.hotels.length === 0 && searchQuery ? (
  <div className="text-center py-20">
    <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">No TripAdvisor results</h3>
    <p className="text-text-secondary mb-4">Try searching for a different destination.</p>
    <button onClick={() => setTripMode(false)} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">Back to Our Hotels</button>
  </div>
) : trip.hotels.length === 0 && !searchQuery ? (
  <div className="text-center py-20 max-w-md mx-auto">
    <Globe className="w-12 h-12 text-text-secondary mx-auto mb-4" />
    <h3 className="text-xl font-bold mb-2">Search TripAdvisor</h3>
    <p className="text-text-secondary mb-6">Enter a destination to find hotels on TripAdvisor.</p>
    <form onSubmit={(e) => { e.preventDefault(); const q = e.target.destination.value.trim(); if (q) { setSearchParams({ search: q }); } }} className="flex gap-2">
      <input name="destination" placeholder="e.g. Lagos, Accra, Nairobi..." className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-white dark:bg-dark-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
      <button type="submit" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap">Search</button>
    </form>
  </div>
```

## UX flow after fix
1. User navigates to `/hotels` → sees static hotels
2. Clicks "TripAdvisor" → sees search prompt with input "e.g. Lagos, Accra, Nairobi..."
3. Types a destination and submits → `setSearchParams({ search: q })` triggers the useEffect → API calls fire → results display
