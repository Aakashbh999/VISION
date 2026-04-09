import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  toggleLikeDiscussion,
  toggleSaveDiscussion,
} from "../services/discussionApi";

export const useDiscussionActions = ({ user, queryClient }) => {
  const [loadingLike, setLoadingLike] = useState(null);
  const [loadingSave, setLoadingSave] = useState(null);
  const [downvotedPosts, setDownvotedPosts] = useState({});

  const likeMutation = useMutation({
    mutationFn: toggleLikeDiscussion,
    onMutate: (discussionId) => {
      setLoadingLike(discussionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onSettled: () => {
      setLoadingLike(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: toggleSaveDiscussion,
    onMutate: (discussionId) => {
      setLoadingSave(discussionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onSettled: () => {
      setLoadingSave(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Failed to save discussion");
    },
  });

  const handleLike = (event, discussionId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info("Log in to vote on discussions");
      return;
    }

    setDownvotedPosts((prev) => ({ ...prev, [discussionId]: false }));
    likeMutation.mutate(discussionId);
  };

  const handleDownvote = (event, discussionId, isCurrentlyLiked) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info("Log in to vote on discussions");
      return;
    }

    const isCurrentlyDownvoted = downvotedPosts[discussionId];

    if (isCurrentlyDownvoted) {
      setDownvotedPosts((prev) => ({ ...prev, [discussionId]: false }));
      return;
    }

    if (isCurrentlyLiked) {
      likeMutation.mutate(discussionId);
    }

    setDownvotedPosts((prev) => ({ ...prev, [discussionId]: true }));
  };

  const handleSave = (event, discussionId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info("Log in to save discussions");
      return;
    }

    saveMutation.mutate(discussionId);
  };

  const handleShare = async (event, discussionId, discussionTitle) => {
    event.preventDefault();
    event.stopPropagation();

    const url = `${window.location.origin}/discussions/${discussionId}`;
    const shareData = {
      title: discussionTitle || "VISION Discussion",
      text: "Check out this discussion on VISION Portal",
      url,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
          } catch {
            toast.error("Failed to share");
          }
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to copy link");
    }
  };

  return {
    loadingLike,
    loadingSave,
    downvotedPosts,
    handleLike,
    handleDownvote,
    handleSave,
    handleShare,
  };
};
