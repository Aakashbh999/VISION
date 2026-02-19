import { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile } from "../services/auth";
import { useQuery } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  // Fetch user profile if token exists
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["me", token],
    queryFn: () => getUserProfile(token),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (error) {
      // Token invalid – logout
      logout();
    }
  }, [data, error]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
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
