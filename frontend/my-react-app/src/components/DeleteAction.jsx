import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { deleteDiscussion, softDeleteComment } from "../services/discussion";
import { softDeleteResource } from "../services/resource";
import { softDeleteGroup, softDeleteGroupPost } from "../services/group";
import { showToast } from "../utils/toast";

const CONFIG = {
  discussion: {
    entityType: "post",
    title: "Delete Discussion?",
    description:
      "This discussion will be archived and recorded for moderation.",
    mutationFn: (targetId) => deleteDiscussion(targetId),
    successMessage: "Discussion deleted successfully.",
    invalidateKeys: [["discussions"], ["myPosts"]],
  },
  comment: {
    entityType: "comment",
    title: "Delete Comment?",
    description:
      "This comment will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteComment(targetId, reason),
    successMessage: "Comment deleted successfully.",
    invalidateKeys: [["discussion"]],
  },
  resource: {
    entityType: "resource",
    title: "Delete Resource?",
    description:
      "This resource will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteResource(targetId, reason),
    successMessage: "Resource deleted successfully.",
    invalidateKeys: [["resources"], ["myResources"]],
  },
  group: {
    entityType: "group",
    title: "Delete Group?",
    description: "This group will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteGroup(targetId, reason),
    successMessage: "Group deleted successfully.",
    invalidateKeys: [["groups"]],
  },
  group_post: {
    entityType: "post",
    title: "Delete Post?",
    description:
      "This group post will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteGroupPost(targetId, reason),
    successMessage: "Post deleted successfully.",
    invalidateKeys: [["groupPosts"]],
  },
};

export default function DeleteAction({
  targetType,
  targetId,
  itemName,
  onDeleted,
  buttonClassName = "p-1.5 text-gray-500 hover:text-red-600 rounded",
  iconClassName = "w-4 h-4",
  label,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const config = CONFIG[targetType];

  const mutation = useMutation({
    mutationFn: (reason) => config.mutationFn(targetId, reason),
    onSuccess: async () => {
      await Promise.all(
        config.invalidateKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      showToast.success(config.successMessage);
      onDeleted?.();
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Delete failed.");
    },
  });

  if (!config) return null;

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
        }}
        disabled={disabled || mutation.isPending}
        className={buttonClassName}
      >
        {label || <Trash2 className={iconClassName} />}
      </button>

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={async (reason) => {
          await mutation.mutateAsync(reason);
          setIsOpen(false);
        }}
        title={config.title}
        description={config.description}
        isPending={mutation.isPending}
        itemName={itemName}
        entityType={config.entityType}
      />
    </>
  );
}
