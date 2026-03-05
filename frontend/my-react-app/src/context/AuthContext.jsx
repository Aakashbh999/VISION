import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getUserProfile } from "../services/auth";
import { useQuery } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken"),
  );
  const [user, setUser] = useState(null);

  // Fetch user profile if token exists
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["me", token],
    queryFn: () => getUserProfile(token),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

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

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (error) {
      // Token invalid and refresh failed – logout
      logout();
    }
  }, [data, error, logout]);

  const login = (tokens) => {
    // Support both old format (string) and new format (object with tokens)
    if (typeof tokens === "string") {
      localStorage.setItem("token", tokens);
      setToken(tokens);
    } else {
      localStorage.setItem("token", tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
        setRefreshToken(tokens.refreshToken);
      }
      setToken(tokens.accessToken);
    }
    refetch();
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
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
