import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsRead } from "../services/notifications";
import { toastSuccess } from "../utils/toast";

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (data) => {
      toastSuccess(data.message);
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadCount"]);
    },
  });
};
