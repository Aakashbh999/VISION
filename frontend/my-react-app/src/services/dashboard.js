import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/portal/dashboard");
  return response.data;
};
