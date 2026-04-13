import { describe, expect, it } from "vitest";
import {
  resolveVoteTypeFromResponse,
  updateDiscussionVoteState,
} from "./discussionVote";

describe("resolveVoteTypeFromResponse", () => {
  it("parses camelCase voteType", () => {
    expect(resolveVoteTypeFromResponse({ voteType: 1 }, 0)).toBe(1);
  });

  it("parses snake_case vote_type", () => {
    expect(resolveVoteTypeFromResponse({ vote_type: "1" }, 0)).toBe(1);
  });

  it("parses wrapped response data", () => {
    expect(resolveVoteTypeFromResponse({ data: { voteType: 0 } }, 1)).toBe(0);
  });

  it("supports liked boolean fallback", () => {
    expect(resolveVoteTypeFromResponse({ liked: true }, 0)).toBe(1);
    expect(resolveVoteTypeFromResponse({ user_liked: false }, 1)).toBe(0);
  });

  it("falls back to requested vote when vote field missing", () => {
    expect(resolveVoteTypeFromResponse({ message: "ok" }, 1)).toBe(1);
  });
});

describe("updateDiscussionVoteState", () => {
  it("increments count when switching to upvote", () => {
    const result = updateDiscussionVoteState(
      { user_vote: 0, like_count: 2 },
      1,
    );

    expect(result.user_vote).toBe(1);
    expect(result.user_liked).toBe(true);
    expect(result.like_count).toBe(3);
  });

  it("decrements count when removing upvote", () => {
    const result = updateDiscussionVoteState(
      { user_vote: 1, like_count: 3 },
      0,
    );

    expect(result.user_vote).toBe(0);
    expect(result.user_liked).toBe(false);
    expect(result.like_count).toBe(2);
  });

  it("uses user_liked fallback when user_vote missing", () => {
    const result = updateDiscussionVoteState(
      { user_liked: true, likes: 4 },
      0,
    );

    expect(result.user_vote).toBe(0);
    expect(result.like_count).toBe(3);
  });

  it("does not go below zero", () => {
    const result = updateDiscussionVoteState(
      { user_vote: 1, like_count: 0 },
      0,
    );

    expect(result.like_count).toBe(0);
  });
});
