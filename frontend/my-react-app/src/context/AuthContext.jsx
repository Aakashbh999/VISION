import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { getUserProfile, updatePresence, refreshAccessToken } from "../services/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

const getTokenExpiryMs = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch (err) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken"),
  );

  const refreshTimerRef = useRef(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["me", token],
    queryFn: () => getUserProfile(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    queryClient.clear();

    setToken(null);
    setRefreshToken(null);

    window.dispatchEvent(new CustomEvent("auth:loggedOut"));
  }, [queryClient]);

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
    if (!token || !refreshToken) return;

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;

    const msUntilExpiry = expiryMs - Date.now();

    const REFRESH_THRESHOLD_MS = 7 * 60 * 1000;
    const msUntilRefresh = msUntilExpiry - REFRESH_THRESHOLD_MS;

    if (msUntilRefresh <= 0) return;

    refreshTimerRef.current = setTimeout(async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) return;

      try {
        const tokens = await refreshAccessToken(storedRefreshToken);
        localStorage.setItem("token", tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem("refreshToken", tokens.refreshToken);
          setRefreshToken(tokens.refreshToken);
        }
        setToken(tokens.accessToken);
      } catch {

      }
    }, msUntilRefresh);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [token, refreshToken]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const pingPresence = async () => {
      try {
        await updatePresence();
      } catch {

      }
    };

    pingPresence();

    const intervalId = window.setInterval(pingPresence, 3 * 60 * 1000);
    const handleFocus = () => {
      if (!cancelled) pingPresence();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) {
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
  }, [token]);

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
