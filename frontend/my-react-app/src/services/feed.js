import api from "./api";

export const getFeed = async (limit = 10) => {
  const response = await api.get(`/feed?limit=${limit}`);
  return response.data;
};
