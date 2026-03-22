import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  // Backend returns { accessToken, refreshToken, expiresIn, role }
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
    role: response.data.role,
  };
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const completeRegistration = async (data) => {
  const response = await api.post("/auth/complete-registration", data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post("/auth/refresh-token", { refreshToken });
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
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error(error);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
