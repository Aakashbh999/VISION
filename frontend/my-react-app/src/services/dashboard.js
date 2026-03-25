import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/api/portal/dashboard");
  return response.data;
};
