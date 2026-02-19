import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiscussion } from "../services/discussion";
import { useNavigate } from "react-router-dom";

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["discussions"]);
      navigate(`/portal/discussions/${data.discussion_id}`);
    },
  });
};
