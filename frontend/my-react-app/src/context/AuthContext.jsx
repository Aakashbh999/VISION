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

  // Ref to track the proactive refresh timer so we can cancel it on cleanup
  const refreshTimerRef = useRef(null);

  // Fetch user profile if token exists.
  // onError intentionally NOT set here — network errors or 500s from /me must
  // never log the user out. True 401s are handled by the api.js interceptor
  // which dispatches the "auth:logout" event.
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["me", token],
    queryFn: () => getUserProfile(),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Logout function — clears all state and signals that the system is clean
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Cancel any pending proactive refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Clear all cached data immediately so no data leaks between sessions
    queryClient.clear();

    setToken(null);
    setRefreshToken(null);

    // Signal to api.js that the system is now clean, resetting the
    // isLoggingOut guard so it doesn't block future logout events
    window.dispatchEvent(new CustomEvent("auth:loggedOut"));
  }, [queryClient]);

  // Listen for logout events from the api interceptor
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [logout]);

  // Proactive silent token refresh — refreshes the access token 5 minutes
  // before it expires, instead of waiting for a reactive 401 error.
  useEffect(() => {
    if (!token || !refreshToken) return;

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;

    const msUntilExpiry = expiryMs - Date.now();
    // Refresh 7 minutes before expiry to be safe against clock skew
    const REFRESH_THRESHOLD_MS = 7 * 60 * 1000;
    const msUntilRefresh = msUntilExpiry - REFRESH_THRESHOLD_MS;

    // If already within the threshold, don't schedule — the reactive
    // interceptor in api.js will handle the refresh on the next request.
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
        // Silent refresh failed — the reactive 401 interceptor will handle it
        // on the next API call. Do NOT log out proactively.
      }
    }, msUntilRefresh);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [token, refreshToken]);

  // Presence ping — fire-and-forget heartbeat every 3 minutes.
  // Deliberately does NOT call refetch() to avoid triggering a profile
  // re-fetch that could cascade into a spurious logout on any server error.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const pingPresence = async () => {
      try {
        await updatePresence();
      } catch {
        // Presence updates are best-effort — never logout on failure
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

  // Sync token from localStorage (in case it was refreshed by the interceptor
  // in another tab or the proactive refresh updated it)
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
