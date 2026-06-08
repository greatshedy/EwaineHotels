import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { AdminProvider } from "./context/AdminContext";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Hotels = lazy(() => import("./pages/Hotels"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminHotels = lazy(() => import("./pages/admin/AdminHotels"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="hotel/:id" element={<HotelDetails />} />
          <Route path="contact" element={<Contact />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        <Route element={<AdminProvider><Outlet /></AdminProvider>}>
          <Route path="ewaine-admin/login" element={<AdminLogin />} />
          <Route
            path="ewaine-admin"
            element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="bookings" element={<AdminBookings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
