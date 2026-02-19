import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data.token; // assuming { token: "..." }
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data; // might return { message: "..." }
};

export const getUserProfile = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};
