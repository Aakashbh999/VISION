import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notifications";

export const useNotifications = (limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => getNotifications(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enabled, // Only run query if enabled
  });
};
