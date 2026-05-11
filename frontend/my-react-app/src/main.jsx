import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

if (typeof window !== "undefined") {
  document.addEventListener(
    "click",
    (e) => {

      const target = e.target.closest("button, input[type='submit'], input[type='button']");
      if (!target) return;

      if (target.dataset.clickLocked === "true") {
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      target.dataset.clickLocked = "true";
      setTimeout(() => {
        if (target) {
          delete target.dataset.clickLocked;
        }
      }, 350);
    },
    true
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
