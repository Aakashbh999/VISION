export const resolveVoteTypeFromResponse = (response, fallbackVoteType = 0) => {
  const payload =
    response?.data && typeof response.data === "object"
      ? response.data
      : response;

  const rawVoteType =
    payload?.voteType ?? payload?.vote_type ?? payload?.user_vote;

  if (rawVoteType !== undefined && rawVoteType !== null && rawVoteType !== "") {
    const parsedVote = Number(rawVoteType);
    if (Number.isFinite(parsedVote)) {
      return parsedVote;
    }
  }

  if (typeof payload?.user_liked === "boolean") {
    return payload.user_liked ? 1 : 0;
  }

  if (typeof payload?.liked === "boolean") {
    return payload.liked ? 1 : 0;
  }

  const parsedFallback = Number(fallbackVoteType);
  return Number.isFinite(parsedFallback) ? parsedFallback : 0;
};

export const updateDiscussionVoteState = (discussion, nextVoteType) => {
  if (!discussion) return discussion;

  const normalizedVote = discussion.user_vote ?? (discussion.user_liked ? 1 : 0);
  const previousVote = Number(normalizedVote || 0);
  const currentCount = Number(
    discussion.like_count ?? discussion.likes ?? discussion.upvotes ?? 0,
  );

  let nextCount = currentCount;
  if (previousVote === 1 && nextVoteType !== 1) {
    nextCount -= 1;
  } else if (previousVote !== 1 && nextVoteType === 1) {
    nextCount += 1;
  }

  const safeCount = Math.max(0, nextCount);

  return {
    ...discussion,
    user_vote: nextVoteType,
    user_liked: nextVoteType === 1,
    like_count: safeCount,
    likes: safeCount,
    upvotes: safeCount,
  };
};
