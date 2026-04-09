import api from "./api";

export const getFeed = async ({
  limit = 10,
  page = 1,
  search = "",
  actionType = "",
  tab = "for-you",
} = {}) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("page", String(page));
  if (search) params.set("search", search);
  if (actionType && actionType !== "all") params.set("actionType", actionType);
  if (tab) params.set("tab", tab);

  const response = await api.get(`/feed?${params.toString()}`);
  return response.data;
};
