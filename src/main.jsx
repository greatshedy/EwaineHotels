import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { RecentlyViewedProvider } from "./context/RecentlyViewedContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <FavoritesProvider>
          <RecentlyViewedProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: "12px", padding: "12px 16px" } }} />
          </RecentlyViewedProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
