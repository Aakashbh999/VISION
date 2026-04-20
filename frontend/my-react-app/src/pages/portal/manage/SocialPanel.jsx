import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  UserPlus,
  UserMinus,
  UserRound,
  BadgeInfo,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useFollowUser } from "../../../hooks/useProfile";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import ButtonLoader from "../../../components/ui/ButtonLoader";
import SimplePagination from "../../../components/ui/SimplePagination";
import SegmentedControl from "../../../components/ui/SegmentedControl";
import profileService from "../../../services/profile";
import { formatDistanceToNow } from "date-fns";

const SOCIAL_PAGE_SIZE = 8;

const SocialPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubTab = searchParams.get("sub") || "followers";
  const [socialTab, setSocialTab] = useState(initialSubTab);

  useEffect(() => {
    const subFromUrl = searchParams.get("sub");
    if (subFromUrl && subFromUrl !== socialTab) {
      setSocialTab(subFromUrl);
    }
  }, [searchParams]);

  const handleSocialTabChange = (newTab) => {
    setSocialTab(newTab);
    setSearchParams((prev) => {
      prev.set("sub", newTab);
      return prev;
    });
  };
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const followMut = useFollowUser();

  const followersQuery = useQuery({
    queryKey: ["social", "followers", followersPage],
    queryFn: () =>
      profileService.getFollowers("me", followersPage, SOCIAL_PAGE_SIZE),
    enabled: socialTab === "followers",
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });

  const followingQuery = useQuery({
    queryKey: ["social", "following", followingPage],
    queryFn: () =>
      profileService.getFollowing("me", followingPage, SOCIAL_PAGE_SIZE),
    enabled: socialTab === "following",
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });

  const activeQuery = socialTab === "followers" ? followersQuery : followingQuery;
  const socialUsers = useMemo(() => activeQuery.data?.data || [], [activeQuery.data]);
  const pagination = activeQuery.data?.pagination || { page: 1, totalPages: 1 };

  const currentPage = socialTab === "followers" ? followersPage : followingPage;
  const setCurrentPage =
    socialTab === "followers" ? setFollowersPage : setFollowingPage;

  useEffect(() => {
    if (!socialUsers.length) { setSelectedUser(null); return; }
    const stillVisible = selectedUser
      ? socialUsers.some((u) => u.user_id === selectedUser.user_id)
      : false;
    if (!stillVisible) setSelectedUser(socialUsers[0]);
  }, [socialUsers, selectedUser]);

  useEffect(() => {
    setSelectedUser(null);
    setFollowersPage(1);
    setFollowingPage(1);
  }, [socialTab]);

  const handleSocialAction = () => {
    if (!selectedUser) return;
    followMut.mutate({
      userId: selectedUser.user_id,
      isFollowing: Boolean(selectedUser.is_following),
    });
  };

  const getUserSubtitle = (user) => {
    if (user.is_mutual) return "Friends";
    if (socialTab === "followers")
      return user.is_following ? "Following back" : "Follows you";
    return "You follow this user";
  };

  const tabOptions = [
    { value: "followers", label: "Followers" },
    { value: "following", label: "Following" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
      {/* Sub-header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-[var(--text-main)] leading-tight">
            Social Connections
          </h2>
          <p className="text-[var(--text-muted)] mt-1 text-sm sm:text-base leading-relaxed">
            Review who follows you, who you follow, and manage each connection
            from one place.
          </p>
        </div>
        <SegmentedControl
          options={tabOptions}
          value={socialTab}
          onChange={handleSocialTabChange}
          className="w-full lg:w-auto"
        />
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.75fr)] gap-4 sm:gap-6 items-start">
        {/* User list */}
        <div className="relative">
          <div
            className={`transition-opacity duration-300 ${activeQuery.isFetching ? "opacity-60" : "opacity-100"}`}
          >
            {socialUsers.length === 0 ? (
              <div className="py-14 sm:py-20 text-center bg-[var(--bg-active)] rounded-3xl border border-dashed border-[var(--border-main)]">
                <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                <h3 className="text-lg font-black text-[var(--text-main)] mb-1">
                  No {socialTab} yet
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {socialTab === "followers"
                    ? "No one is following you yet."
                    : "You aren't following anyone yet."}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {socialUsers.map((user) => {
                  const isSelected = selectedUser?.user_id === user.user_id;
                  const subtitle = getUserSubtitle(user);

                  const rowContent = (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center overflow-hidden shrink-0">
                        {user.profile_image ? (
                          <img
                            src={user.profile_image}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserRound className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-[var(--text-main)] truncate">
                            {user.full_name}
                          </p>
                          {user.is_mutual && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/15 text-purple-500 border border-purple-500/30">
                              Friends
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-muted)] truncate">
                          {subtitle}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Followed{" "}
                          {formatDistanceToNow(new Date(user.followed_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </>
                  );

                  return (
                    <React.Fragment key={user.user_id}>
                      {/* Mobile: navigate to profile */}
                      <Link
                        to={`/profile/${user.user_id}`}
                        className="xl:hidden w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 bg-[var(--bg-card)] border-[var(--border-main)] hover:bg-[var(--bg-active)]"
                      >
                        {rowContent}
                        <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                      </Link>
                      {/* Desktop: select to view detail */}
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className={`hidden xl:flex w-full text-left p-4 rounded-2xl border transition-all items-center gap-4 ${
                          isSelected
                            ? "bg-[var(--bg-active)] border-purple-500/40 shadow-sm"
                            : "bg-[var(--bg-card)] border-[var(--border-main)] hover:bg-[var(--bg-active)]"
                        }`}
                      >
                        {rowContent}
                        <ChevronRight
                          className={`w-5 h-5 shrink-0 ${isSelected ? "text-purple-600" : "text-[var(--text-muted)]"}`}
                        />
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loading overlay */}
          {(activeQuery.isFetching || activeQuery.isLoading) && (
            <div className="absolute inset-0 flex justify-center items-center bg-[var(--bg-active)]/50 backdrop-blur-sm rounded-3xl z-10">
              <LoadingSpinner />
            </div>
          )}

          <SimplePagination
            page={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Selected user detail */}
        <div className="hidden xl:block bg-[var(--bg-active)] rounded-3xl border border-[var(--border-main)] p-4 sm:p-6 sticky top-6">
          {selectedUser ? (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center overflow-hidden shrink-0">
                  {selectedUser.profile_image ? (
                    <img
                      src={selectedUser.profile_image}
                      alt={selectedUser.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-7 h-7 text-purple-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-[var(--text-main)] truncate">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {getUserSubtitle(selectedUser)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/profile/${selectedUser.user_id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] font-bold hover:bg-[var(--bg-main)] hover:shadow-sm transition-all"
                >
                  View Profile <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleSocialAction}
                  disabled={followMut.isPending}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 ${
                    selectedUser.is_following
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {followMut.isPending ? (
                    <ButtonLoader size={16} />
                  ) : selectedUser.is_following ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {followMut.isPending
                    ? "Wait..."
                    : selectedUser.is_following
                      ? "Unfollow"
                      : "Follow"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-14">
              <BadgeInfo className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-black text-[var(--text-main)] mb-2">
                Select a user
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                Choose a follower or following entry to view the profile and
                perform actions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error messages */}
      {socialTab === "followers" && followersQuery.error && (
        <div className="text-center py-4 text-sm text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20">
          Failed to load followers.
        </div>
      )}
      {socialTab === "following" && followingQuery.error && (
        <div className="text-center py-4 text-sm text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20">
          Failed to load following.
        </div>
      )}
    </div>
  );
};

export default SocialPanel;
