import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../services/feed";

export const useFeed = (input = 10) => {
  const params =
    typeof input === "number"
      ? { limit: input, page: 1 }
      : {
          limit: input?.limit || 10,
          page: input?.page || 1,
          search: input?.search || "",
          actionType: input?.actionType || "",
          tab: input?.tab || "for-you",
        };

  return useQuery({
    queryKey: ["feed", params],
    queryFn: () => getFeed(params),
    staleTime: 2 * 60 * 1000,
  });
};
