import api from "./api";

export const getNotifications = async (options = 10) => {
  const normalizedOptions =
    typeof options === "number" ? { limit: options } : { ...options };
  const response = await api.get("/notifications", { params: normalizedOptions });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/read/${id}`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const clearNotifications = async () => {
  const response = await api.delete(`/notifications/clear`);
  return response.data;
};

// NEW: get unread count only
export const getUnreadCount = async () => {
  const response = await api.get("/notifications?unreadOnly=true&limit=1");
  // The backend returns { data: [...], pagination: { total: X } }
  // We extract the total unread count from the pagination metadata
  return response.data?.pagination?.total ?? 0;
};
