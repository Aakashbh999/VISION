import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResource } from "../services/resource";
import { toast } from "react-toastify";

export const useUploadResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadResource(formData),
    onSuccess: (data) => {
      toast.success(data?.message || "Resource uploaded! It is now pending approval.");
      queryClient.invalidateQueries(["my-resources"]);
      // Also invalidate pending resources if the user is a moderator and looking at the queue
      queryClient.invalidateQueries(["pending-resources"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to upload resource");
    },
  });
};
