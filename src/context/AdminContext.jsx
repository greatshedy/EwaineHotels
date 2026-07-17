import { createContext, useContext, useState, useCallback } from "react";
import {
  login as apiLogin,
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  getBookings,
  createBooking,
  updateBookingStatus,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSettings,
  updateSettings,
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  deleteMultipleBlogPosts,
  setToken,
  getToken,
} from "../services/api";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [adminUser, setAdminUser] = useState(() => {
    const token = getToken();
    return token ? { token } : null;
  });
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      setToken(data.token);
      setIsAuthenticated(true);
      setAdminUser({ token: data.token, email: data.email });
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    setAdminUser(null);
    setHotels([]);
    setBookings([]);
    setTestimonials([]);
    setWhatsapp("");
    setBlogPosts([]);
  }, []);

  const refreshHotels = useCallback(async () => {
    try {
      const data = await getHotels();
      setHotels(data);
    } catch {}
  }, []);

  const refreshBookings = useCallback(async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch {}
  }, []);

  const refreshTestimonials = useCallback(async () => {
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch {}
  }, []);

  const addHotel = useCallback(async (hotel) => {
    try {
      const created = await createHotel(hotel);
      setHotels((prev) => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  }, []);

  const updateHotelCtx = useCallback(async (id, updates) => {
    try {
      const updated = await updateHotel(id, updates);
      setHotels((prev) => prev.map((h) => (h.id === id ? updated : h)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteHotelCtx = useCallback(async (id) => {
    try {
      await deleteHotel(id);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch {}
  }, []);

  const addBooking = useCallback(async (booking) => {
    try {
      const created = await createBooking(booking);
      setBookings((prev) => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  }, []);

  const updateBookingStatusCtx = useCallback(async (id, status) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch {}
  }, []);

  const addTestimonial = useCallback(async (data) => {
    try {
      const created = await createTestimonial(data);
      setTestimonials((prev) => [...prev, created]);
      return created;
    } catch {
      return null;
    }
  }, []);

  const updateTestimonialCtx = useCallback(async (id, data) => {
    try {
      const updated = await updateTestimonial(id, data);
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteTestimonialCtx = useCallback(async (id) => {
    try {
      await deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      setWhatsapp(data.whatsapp || "");
    } catch {}
  }, []);

  const updateWhatsApp = useCallback(async (number) => {
    try {
      const data = await updateSettings(number);
      setWhatsapp(data.whatsapp || "");
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshBlogPosts = useCallback(async () => {
    try {
      const data = await getBlogPosts(true);
      const unique = [...new Map((data || []).map((p) => [p.id, p])).values()];
      setBlogPosts(unique);
    } catch {}
  }, []);

  const addBlogPost = useCallback(async (data) => {
    try {
      const created = await createBlogPost(data);
      setBlogPosts((prev) => [created, ...prev]);
      return created;
    } catch {
      return null;
    }
  }, []);

  const updateBlogPostCtx = useCallback(async (id, data) => {
    try {
      const updated = await updateBlogPost(id, data);
      setBlogPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteBlogPostCtx = useCallback(async (id) => {
    try {
      await deleteBlogPost(id);
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }, []);

  const deleteMultipleBlogPostsCtx = useCallback(async (ids) => {
    try {
      await deleteMultipleBlogPosts(ids);
      setBlogPosts((prev) => prev.filter((p) => !ids.includes(p.id)));
      return true;
    } catch {
      return false;
    }
  }, []);

  const getRevenue = useCallback(() => {
    return bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  }, [bookings]);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        loading,
        login,
        logout,
        hotels,
        refreshHotels,
        addHotel,
        updateHotel: updateHotelCtx,
        deleteHotel: deleteHotelCtx,
        bookings,
        refreshBookings,
        addBooking,
        updateBookingStatus: updateBookingStatusCtx,
        testimonials,
        whatsapp,
        refreshSettings,
        updateWhatsApp,
        blogPosts,
        refreshBlogPosts,
        addBlogPost,
        updateBlogPost: updateBlogPostCtx,
        deleteBlogPost: deleteBlogPostCtx,
        deleteMultipleBlogPosts: deleteMultipleBlogPostsCtx,
        refreshTestimonials,
        addTestimonial,
        updateTestimonial: updateTestimonialCtx,
        deleteTestimonial: deleteTestimonialCtx,
        getRevenue,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
