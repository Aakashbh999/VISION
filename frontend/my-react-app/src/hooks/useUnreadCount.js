import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../services/notifications";

export const useUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    refetchInterval: enabled ? 60000 : false,
    staleTime: 30000,
    enabled: enabled,
  });
};
