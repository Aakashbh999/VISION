import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

// Global fix for mobile double-click/fast-tap issues
if (typeof window !== "undefined") {
  document.addEventListener(
    "click",
    (e) => {
      // Find the closest interactive target
      const target = e.target.closest("button, input[type='submit'], input[type='button']");
      if (!target) return;

      // If the target is locked, intercept and kill the event instantly
      if (target.dataset.clickLocked === "true") {
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      // Lock the target for 350ms to prevent ghost clicks / double taps
      target.dataset.clickLocked = "true";
      setTimeout(() => {
        if (target) {
          delete target.dataset.clickLocked;
        }
      }, 350);
    },
    true // Use capture phase to run before React's synthetic event system
  );
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
