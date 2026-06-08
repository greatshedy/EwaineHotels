import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Hotels = lazy(() => import("./pages/Hotels"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const Favorites = lazy(() => import("./pages/Favorites"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
