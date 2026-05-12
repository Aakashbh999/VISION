import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResource } from "../services/resource";
import { toast } from "react-toastify";

const getUploadErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.error) return data.error;
  if (data?.message) return data.message;
  return "Server Failure. Please try again later.";
};

export const useUploadResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadResource(formData),
    onSuccess: (data) => {
      toast.success(
        data?.message || "Resource uploaded! It is now pending approval.",
      );
      queryClient.invalidateQueries({ queryKey: ["my-resources"] });

      queryClient.invalidateQueries({ queryKey: ["pending-resources"] });
    },
    onError: (error) => {
      toast.error(getUploadErrorMessage(error));
    },
  });
};
