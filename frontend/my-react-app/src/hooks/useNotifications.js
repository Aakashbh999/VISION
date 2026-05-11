import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notifications";

export const useNotifications = (options = 10, enabledArg = true) => {
  const normalizedOptions =
    typeof options === "number" ? { limit: options } : { ...options };
  const enabled = normalizedOptions.enabled ?? enabledArg;
  delete normalizedOptions.enabled;

  return useQuery({
    queryKey: ["notifications", normalizedOptions],
    queryFn: () => getNotifications(normalizedOptions),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
};
