import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  voteOnDiscussion,
  toggleSaveDiscussion,
} from "../services/discussionApi";

const updateDiscussionVote = (discussion, nextVoteType) => {
  if (!discussion) return discussion;

  const previousVote = Number(discussion.user_vote || 0);
  const currentCount = Number(discussion.like_count || discussion.likes || 0);

  let nextCount = currentCount;
  if (previousVote === 1 && nextVoteType !== 1) {
    nextCount -= 1;
  } else if (previousVote !== 1 && nextVoteType === 1) {
    nextCount += 1;
  }

  return {
    ...discussion,
    user_vote: nextVoteType,
    like_count: Math.max(0, nextCount),
    likes: Math.max(0, nextCount),
  };
};

export const useDiscussionActions = ({ user, queryClient }) => {
  const [loadingLike, setLoadingLike] = useState(null);
  const [loadingSave, setLoadingSave] = useState(null);

  const likeMutation = useMutation({
    mutationFn: ({ discussionId, voteType }) =>
      voteOnDiscussion(discussionId, voteType),
    onMutate: ({ discussionId }) => {
      setLoadingLike(discussionId);
    },
    onSuccess: (response, variables) => {
      const nextVoteType = Number(response?.voteType ?? 0);

      queryClient.setQueriesData(
        { queryKey: ["discussions"] },
        (currentData) => {
          if (Array.isArray(currentData)) {
            return currentData.map((discussion) =>
              String(discussion.discussion_id) ===
              String(variables.discussionId)
                ? updateDiscussionVote(discussion, nextVoteType)
                : discussion,
            );
          }

          if (
            currentData?.discussions &&
            Array.isArray(currentData.discussions)
          ) {
            return {
              ...currentData,
              discussions: currentData.discussions.map((discussion) =>
                String(discussion.discussion_id) ===
                String(variables.discussionId)
                  ? updateDiscussionVote(discussion, nextVoteType)
                  : discussion,
              ),
            };
          }

          if (currentData?.data && Array.isArray(currentData.data)) {
            return {
              ...currentData,
              data: currentData.data.map((discussion) =>
                String(discussion.discussion_id) ===
                String(variables.discussionId)
                  ? updateDiscussionVote(discussion, nextVoteType)
                  : discussion,
              ),
            };
          }

          return currentData;
        },
      );

      // Skip immediate refetch here to avoid stale payload snapping counts back.
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error || "Failed to vote on discussion",
      );
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

    likeMutation.mutate({ discussionId, voteType: 1 });
  };

  const handleDownvote = (event, discussionId, currentVote) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info("Log in to vote on discussions");
      return;
    }

    likeMutation.mutate({ discussionId, voteType: -1 });
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
    handleLike,
    handleDownvote,
    handleSave,
    handleShare,
  };
};
