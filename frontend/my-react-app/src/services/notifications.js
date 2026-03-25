import api from "./api";

export const getNotifications = async (limit = 10) => {
  const response = await api.get(`/api/notifications?limit=${limit}`);
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/api/notifications/read/${id}`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
};

export const clearNotifications = async () => {
  const response = await api.delete(`/api/notifications/clear`);
  return response.data;
};

// NEW: get unread count only
export const getUnreadCount = async () => {
  const response = await api.get("/api/notifications?unreadOnly=true&limit=1");
  // If backend returns count in headers or separate endpoint, adjust.
  // Assuming it returns an array of unread notifications; we can count.
  // For efficiency, best if backend has /notifications/unread/count
  // We'll simulate by fetching first page and counting.
  return response.data.length;
};
