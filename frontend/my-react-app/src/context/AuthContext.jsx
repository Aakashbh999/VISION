import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getUserProfile, updatePresence } from "../services/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken"),
  );

  // Fetch user profile if token exists
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["me", token],
    queryFn: () => getUserProfile(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    onError: () => {
      // Token invalid and refresh failed - force logout.
      logout();
    },
  });

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Clear cached profile immediately so UI reflects logged-out state without reload.
    queryClient.removeQueries({ queryKey: ["me"] });

    setToken(null);
    setRefreshToken(null);
  }, [queryClient]);

  // Listen for logout events from api interceptor
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [logout]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const pingPresence = async () => {
      try {
        await updatePresence();
        if (!cancelled) {
          refetch();
        }
      } catch {
        // Presence updates are best-effort.
      }
    };

    pingPresence();

    const intervalId = window.setInterval(pingPresence, 3 * 60 * 1000);
    const handleFocus = () => pingPresence();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        pingPresence();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, refetch]);

  // Sync token from localStorage (in case it was refreshed by interceptor)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newRefreshToken = localStorage.getItem("refreshToken");
      if (newToken !== token) {
        setToken(newToken);
      }
      if (newRefreshToken !== refreshToken) {
        setRefreshToken(newRefreshToken);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, refreshToken]);

  const login = async (tokens) => {
    let accessToken;

    // Support both old format (string) and new format (object with tokens)
    if (typeof tokens === "string") {
      localStorage.setItem("token", tokens);
      accessToken = tokens;
      setToken(tokens);
    } else {
      localStorage.setItem("token", tokens.accessToken);
      accessToken = tokens.accessToken;
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
        setRefreshToken(tokens.refreshToken);
      }
      setToken(tokens.accessToken);
    }

    try {
      const profile = await queryClient.fetchQuery({
        queryKey: ["me", accessToken],
        queryFn: () => getUserProfile(),
      });

      return profile;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user: token ? data || null : null,
    token,
    isAuthenticated: !!token && !!data,
    isLoading,
    login,
    logout,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
