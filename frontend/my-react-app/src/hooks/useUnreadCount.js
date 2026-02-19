import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "../services/notifications";

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: getUnreadCount,
    refetchInterval: 60000, // refetch every minute
    staleTime: 30000,
  });
};
