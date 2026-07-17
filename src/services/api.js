import axios from "axios";

const TOKEN_KEY = "ewaine-admin-token";
const USER_TOKEN_KEY = "ewaine-user-token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const wasAdmin = !!localStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_TOKEN_KEY);
      if (wasAdmin && window.location.pathname.startsWith("/ewaine-admin")) {
        window.location.href = "/ewaine-admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function setUserToken(token) {
  if (token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(USER_TOKEN_KEY);
  }
}

// User Auth
export function registerUser(name, email, password) {
  return api.post("/auth/register", { name, email, password }).then((r) => r.data);
}

export function loginUser(email, password) {
  return api.post("/auth/login", { email, password }).then((r) => r.data);
}

export function getProfile() {
  return api.get("/auth/profile").then((r) => r.data);
}

export function updateProfile(data) {
  return api.put("/auth/profile", data).then((r) => r.data);
}

// Favorites
export function getFavorites(email) {
  return api.get("/favorites", { params: { email } }).then((r) => r.data);
}

export function addFavorite(email, hotelId) {
  return api.post("/favorites", { email, hotelId }).then((r) => r.data);
}

export function removeFavorite(email, hotelId) {
  return api.delete(`/favorites/${hotelId}`, { params: { email } }).then((r) => r.data);
}

// Recently Viewed
export function getRecent(email) {
  return api.get("/recent", { params: { email } }).then((r) => r.data);
}

export function addRecent(hotelData) {
  return api.post("/recent", hotelData).then((r) => r.data);
}

// Auth
export function login(email, password) {
  return api.post("/auth/login", { email, password }).then((r) => r.data);
}

export function verifyToken() {
  return api.get("/auth/verify").then((r) => r.data);
}

// Hotels
export function getHotels(params) {
  return api.get("/hotels", { params }).then((r) => r.data);
}

export function getHotel(id) {
  return api.get(`/hotels/${id}`).then((r) => r.data);
}

export function getFeatured() {
  return api.get("/hotels/featured").then((r) => r.data);
}

export function createHotel(data) {
  return api.post("/hotels", data).then((r) => r.data);
}

export function updateHotel(id, data) {
  return api.put(`/hotels/${id}`, data).then((r) => r.data);
}

export function deleteHotel(id) {
  return api.delete(`/hotels/${id}`).then((r) => r.data);
}

// Bookings
export function getBookings(email) {
  const params = email ? { email } : {};
  return api.get("/bookings", { params }).then((r) => r.data);
}

export function createBooking(data) {
  return api.post("/bookings", data).then((r) => r.data);
}

export function updateBookingStatus(id, status) {
  return api.patch(`/bookings/${id}`, { status }).then((r) => r.data);
}

// Destinations
export function getDestinations() {
  return api.get("/destinations").then((r) => r.data);
}

// Testimonials
export function getTestimonials() {
  return api.get("/testimonials").then((r) => r.data);
}

export function createTestimonial(data) {
  return api.post("/testimonials", data).then((r) => r.data);
}

export function updateTestimonial(id, data) {
  return api.put(`/testimonials/${id}`, data).then((r) => r.data);
}

export function deleteTestimonial(id) {
  return api.delete(`/testimonials/${id}`).then((r) => r.data);
}

// Team
export function getTeam() {
  return api.get("/team").then((r) => r.data);
}

// Settings
export function getSettings() {
  return api.get("/settings").then((r) => r.data);
}

export function updateSettings(whatsapp) {
  return api.put("/settings", { whatsapp }).then((r) => r.data);
}

// Blog
export function getBlogPosts(all) {
  const params = all ? { all: "true" } : {};
  return api.get("/blog", { params }).then((r) => r.data);
}

export function getBlogPost(slug) {
  return api.get(`/blog/${slug}`).then((r) => r.data);
}

export function createBlogPost(data) {
  return api.post("/blog", data).then((r) => r.data);
}

export function updateBlogPost(id, data) {
  return api.put(`/blog/${id}`, data).then((r) => r.data);
}

export function deleteBlogPost(id) {
  return api.delete(`/blog/${id}`).then((r) => r.data);
}

export function deleteMultipleBlogPosts(ids) {
  return api.delete("/blog/bulk", { data: { ids } }).then((r) => r.data);
}

export default api;
