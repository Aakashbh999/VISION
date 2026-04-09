import { useState, useCallback } from "react";
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
    modalSurfaceClassName: "lg:max-w-2xl",
    mutationFn: (targetId, reason) => deleteDiscussion(targetId, reason),
    successMessage: "Discussion deleted.",
    invalidateKeys: ["discussions", "my-posts", "saved-discussions"],
  },
  comment: {
    entityType: "comment",
    title: "Delete Comment?",
    description:
      "This comment will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteComment(targetId, reason),
    successMessage: "Comment deleted.",
    invalidateKeys: ["discussion", "discussions"],
  },
  resource: {
    entityType: "resource",
    title: "Delete Resource?",
    description:
      "This resource will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteResource(targetId, reason),
    successMessage: "Resource deleted.",
    invalidateKeys: ["resources", "my-resources"],
  },
  group: {
    entityType: "group",
    title: "Delete Group?",
    description: "This group will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteGroup(targetId, reason),
    successMessage: "Group deleted.",
    invalidateKeys: ["groups"],
  },
  group_post: {
    entityType: "post",
    title: "Delete Post?",
    description:
      "This group post will be soft-deleted and recorded for moderation.",
    mutationFn: (targetId, reason) => softDeleteGroupPost(targetId, reason),
    successMessage: "Post deleted.",
    invalidateKeys: ["groupPosts"],
  },
};

export default function DeleteAction({
  targetType,
  targetId,
  itemName,
  onDeleted,
  buttonClassName = "p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded transition-colors",
  iconClassName = "w-4 h-4",
  label,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const config = CONFIG[targetType] || null;

  const mutation = useMutation({
    mutationFn: async (reason) => {
      if (!config) throw new Error("Invalid target type");
      return config.mutationFn(targetId, reason);
    },
    onSuccess: async () => {
      if (config?.invalidateKeys) {
        await Promise.all(
          config.invalidateKeys.map((key) =>
            queryClient.invalidateQueries({
              queryKey: [key],
              exact: false,
            }),
          ),
        );
      }

      showToast.success(config?.successMessage || "Deleted");
      setIsOpen(false);
      onDeleted?.();
    },
    onError: (err) => {
      const errorMsg =
        err.response?.data?.error || "Delete failed. Try again.";
      showToast.error(errorMsg);
    },
  });

  const handleOpenModal = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !mutation.isPending) {
        setIsOpen(true);
      }
    },
    [disabled, mutation.isPending],
  );

  if (!config) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={disabled || mutation.isPending}
        className={`${buttonClassName} flex items-center gap-2`}
        title={`Delete ${config.entityType}`}
      >
        {label || <Trash2 className={iconClassName} />}
      </button>

      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(reason) => mutation.mutate(reason)}
        title={config.title}
        description={config.description}
        isPending={mutation.isPending}
        itemName={itemName}
        entityType={config.entityType}
        surfaceClassName={config.modalSurfaceClassName}
      />
    </>
  );
}
