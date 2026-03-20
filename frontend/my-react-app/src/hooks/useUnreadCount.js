import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../services/notifications";

export const useUnreadCount = (enabled = true) => {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    refetchInterval: enabled ? 60000 : false, // refetch every minute only if enabled
    staleTime: 30000,
    enabled: enabled, // Only run query if enabled
  });
};
