import { getTripCache, setTripCache } from './tripCache';

const API_HOST = 'tripadvisor16.p.rapidapi.com';
const BASE_URL = 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels';

const headers = {
  'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
  'x-rapidapi-host': API_HOST,
  'Content-Type': 'application/json',
};

async function fetchFromAPI(url) {
  const response = await fetch(url, { method: 'GET', headers });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  if (!data.status) throw new Error(data.message?.[0] || 'API returned error');
  return data.data;
}

export async function searchLocation(query) {
  const url = `${BASE_URL}/searchLocation?query=${encodeURIComponent(query)}`;
  return fetchFromAPI(url);
}

export async function searchHotels({ geoId, checkIn, checkOut, pageNumber = 1, currencyCode = 'USD' }) {
  const cacheKey = `hotels-${geoId}-${checkIn}-${checkOut}-${pageNumber}`;
  const cached = getTripCache(cacheKey);
  if (cached) return cached;
  const url = `${BASE_URL}/searchHotels?geoId=${geoId}&checkIn=${checkIn}&checkOut=${checkOut}&pageNumber=${pageNumber}&currencyCode=${currencyCode}`;
  const result = await fetchFromAPI(url);
  setTripCache(cacheKey, result);
  return result;
}

export async function getHotelDetails({ id, checkIn, checkOut }) {
  const cacheKey = `details-${id}-${checkIn}-${checkOut}`;
  const cached = getTripCache(cacheKey);
  if (cached) return cached;
  const url = `${BASE_URL}/getHotelDetails?id=${id}&checkIn=${checkIn}&checkOut=${checkOut}`;
  const result = await fetchFromAPI(url);
  setTripCache(cacheKey, result);
  return result;
}
