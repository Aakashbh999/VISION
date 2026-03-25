import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  // Backend returns { accessToken, refreshToken, expiresIn, role }
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
    role: response.data.role,
  };
};

export const register = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data; // might return { message: "..." }
};

export const getUserProfile = async () => {
  const response = await api.get("/api/me");
  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post("/api/auth/refresh-token", { refreshToken });
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
  };
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    if (refreshToken) {
      await api.post("/api/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error(error);
    // Ignore logout API errors
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
