import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  MessageSquare,
  Users,
  Trash2,
  ArrowRight,
  Search,
  UserPlus,
  UserMinus,
  UserRound,
  BadgeInfo,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMyResources } from "../../hooks/useMyResources";
import { useFollowUser } from "../../hooks/useProfile";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import Pagination from "../../components/ui/Pagination";
import { formatDistanceToNow } from "date-fns";
import DeleteAction from "../../components/DeleteAction";
import profileService from "../../services/profile";
import { getManagedGroups } from "../../services/group";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";

const SOCIAL_PAGE_SIZE = 8;

const ManageContent = () => {
  const [activeTab, setActiveTab] = useState("resources");
  const [socialTab, setSocialTab] = useState("followers");
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [selectedSocialUser, setSelectedSocialUser] = useState(null);

  const { data: resources = [], isLoading: loadingResources } =
    useMyResources();
  const followMut = useFollowUser();

  const followersQuery = useQuery({
    queryKey: ["social", "followers", followersPage],
    queryFn: () =>
      profileService.getFollowers("me", followersPage, SOCIAL_PAGE_SIZE),
    enabled: activeTab === "social" && socialTab === "followers",
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const followingQuery = useQuery({
    queryKey: ["social", "following", followingPage],
    queryFn: () =>
      profileService.getFollowing("me", followingPage, SOCIAL_PAGE_SIZE),
    enabled: activeTab === "social" && socialTab === "following",
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const groupsQuery = useQuery({
    queryKey: ["manage", "groups"],
    queryFn: () => getManagedGroups(),
    enabled: activeTab === "groups",
  });
  const managedGroups = groupsQuery.data || [];

  const activeSocialQuery =
    socialTab === "followers" ? followersQuery : followingQuery;
  const socialUsers = useMemo(
    () => activeSocialQuery.data?.data || [],
    [activeSocialQuery.data],
  );
  const socialPagination = activeSocialQuery.data?.pagination || {
    page: 1,
    totalPages: 1,
  };

  useEffect(() => {
    if (activeTab !== "social") return;
    if (!socialUsers.length) {
      setSelectedSocialUser(null);
      return;
    }

    const stillVisible = selectedSocialUser
      ? socialUsers.some((user) => user.user_id === selectedSocialUser.user_id)
      : false;

    if (!stillVisible) {
      setSelectedSocialUser(socialUsers[0]);
    }
  }, [activeTab, socialUsers, selectedSocialUser]);

  useEffect(() => {
    setSelectedSocialUser(null);
    if (socialTab === "followers") {
      setFollowersPage(1);
    } else {
      setFollowingPage(1);
    }
  }, [socialTab]);

  const handleSocialAction = () => {
    if (!selectedSocialUser) return;
    followMut.mutate({
      userId: selectedSocialUser.user_id,
      isFollowing: Boolean(selectedSocialUser.is_following),
    });
  };

  const socialActionLabel = useMemo(() => {
    if (!selectedSocialUser) return "";
    if (selectedSocialUser.is_following) return "Unfollow";
    return socialTab === "followers" ? "Follow Back" : "Follow";
  }, [selectedSocialUser, socialTab]);

  const socialActionIcon = selectedSocialUser?.is_following
    ? UserMinus
    : UserPlus;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Header */}
      <SurfaceCard className="p-5 sm:p-8">
        <div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight mb-1 sm:mb-2 leading-tight">
            Manage Content
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-2xl">
            Keep track of all the resources, discussions, and groups you've
            created across VISION.
          </p>
        </div>
      </SurfaceCard>

      {/* Tabs */}
      <SurfaceCard className="p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "resources"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          My Resources
        </button>
        <button
          onClick={() => setActiveTab("discussions")}
          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "discussions"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          My Discussions
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "groups"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <Users className="w-5 h-5" />
          My Groups
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === "social"
              ? "bg-purple-50 text-purple-600"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
          }`}
        >
          <UserRound className="w-5 h-5" />
          Social
        </button>
      </SurfaceCard>

      {/* Tab Content */}
      <SurfaceCard className="overflow-hidden min-h-[400px]" padding="none">
        {activeTab === "resources" && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-2xl font-black text-[var(--text-main)] leading-tight">
                Resource Uploads
              </h2>
              <Link
                to="/resources/my"
                className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View in Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingResources ? (
              <div className="py-14 sm:py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : resources.length === 0 ? (
              <SurfaceCard className="text-center py-14 sm:py-20 bg-(--bg-active) border-dashed border-2">
                <EmptyState
                  icon={BookOpen}
                  title="No Resources Found"
                  description="You haven't uploaded any resources yet."
                  actionText="Go to Library"
                  actionHref="/resources"
                />
              </SurfaceCard>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-main)]">
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Title
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Type
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Date
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider">
                        Status
                      </th>
                      <th className="pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-main)]">
                    {resources.map((resource) => (
                      <tr
                        key={resource.resource_id}
                        className="group hover:bg-[var(--bg-active)] transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-bold text-[var(--text-main)] mb-1 truncate max-w-xs">
                            {resource.title}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-muted)] capitalize text-sm">
                          {resource.resource_type}
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-muted)] text-sm">
                          {formatDistanceToNow(new Date(resource.created_at), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              resource.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : resource.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {resource.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <DeleteAction
                            targetType="resource"
                            targetId={resource.resource_id}
                            itemName={resource.title}
                            buttonClassName="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            iconClassName="w-5 h-5"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "discussions" && (
            <div className="p-4 sm:p-6 md:p-8 text-center py-16 sm:py-20">
              <EmptyState
                icon={MessageSquare}
                title="My Discussions"
                description="Manage your discussion threads here."
                actionText="Go to My Posts"
                actionHref="/discussions/my-posts"
              />
            </div>
        )}

        {activeTab === "groups" && (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-2xl font-black text-[var(--text-main)] leading-tight">
                My Managed Groups
              </h2>
            </div>

            {groupsQuery.isLoading ? (
              <div className="py-14 sm:py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : managedGroups.length === 0 ? (
              <SurfaceCard className="text-center py-14 sm:py-20 bg-(--bg-active) border-dashed border-2">
                <EmptyState
                  icon={Users}
                  title="No Groups Managed"
                  description="You are not an admin or co-leader of any groups yet."
                  actionText="Discover Groups"
                  actionHref="/groups"
                />
              </SurfaceCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {managedGroups.map((group) => (
                  <Link
                    key={group.group_id}
                    to={`/groups/${group.group_id}`}
                    className="block bg-[var(--bg-main)] rounded-2xl border border-[var(--border-main)] overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 group/card focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <div className="h-24 sm:h-32 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center relative overflow-hidden">
                      {group.group_image ? (
                        <img
                          src={group.group_image}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-10 h-10 text-purple-400" />
                      )}

                      {group.privacy_type !== "public" && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          {group.privacy_type}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-lg text-[var(--text-main)] line-clamp-1 group-hover/card:text-purple-600 transition-colors mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                          {group.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 bg-[var(--bg-active)] p-2.5 rounded-xl border border-[var(--border-main)]">
                        <div className="flex items-center gap-1.5 text-[var(--text-main)] font-bold text-sm">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span>{group.members_count || 1}</span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            group.my_role === "owner"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          }`}
                        >
                          {group.my_role === "owner" ? "Owner" : "Co-Admin"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "social" && (
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-[var(--text-main)] leading-tight">
                  Social Connections
                </h2>
                <p className="text-[var(--text-muted)] mt-1 text-sm sm:text-base leading-relaxed">
                  Review who follows you, who you follow, and manage each
                  connection from one place.
                </p>
              </div>

              <div className="flex bg-[var(--bg-active)] rounded-2xl p-1 border border-[var(--border-main)] w-full lg:w-auto">
                {[
                  { key: "followers", label: "Followers" },
                  { key: "following", label: "Following" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSocialTab(item.key)}
                    className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      socialTab === item.key
                        ? "bg-[var(--bg-card)] text-purple-500 border border-[var(--border-main)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.75fr)] gap-4 sm:gap-6 items-start">
              <div className="space-y-4">
                {(activeSocialQuery.isLoading ||
                  activeSocialQuery.isFetching) &&
                !socialUsers.length ? (
                  <div className="py-16 sm:py-24 flex justify-center bg-[var(--bg-active)] rounded-3xl border border-[var(--border-main)]">
                    <LoadingSpinner />
                  </div>
                ) : socialUsers.length === 0 ? (
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
                  <>
                    <div className="grid gap-3">
                      {socialUsers.map((user) => {
                        const isSelected =
                          selectedSocialUser?.user_id === user.user_id;
                        const subtitle = user.is_mutual
                          ? "Friends"
                          : socialTab === "followers"
                            ? user.is_following
                              ? "Following back"
                              : "Follows you"
                            : "You follow this user";

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
                                {formatDistanceToNow(
                                  new Date(user.followed_at),
                                  { addSuffix: true },
                                )}
                              </p>
                            </div>
                          </>
                        );

                        return (
                          <React.Fragment key={user.user_id}>
                            <Link
                              to={`/profile/${user.user_id}`}
                              className="xl:hidden w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 bg-[var(--bg-card)] border-[var(--border-main)] hover:bg-[var(--bg-active)]"
                            >
                              {rowContent}
                              <ChevronRight className="w-5 h-5 shrink-0 text-[var(--text-muted)]" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setSelectedSocialUser(user)}
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

                    {socialPagination.totalPages > 1 && (
                      <Pagination
                        currentPage={socialPagination.page}
                        totalPages={socialPagination.totalPages}
                        onPageChange={
                          socialTab === "followers"
                            ? setFollowersPage
                            : setFollowingPage
                        }
                      />
                    )}
                  </>
                )}
              </div>

              <div className="hidden xl:block bg-[var(--bg-active)] rounded-3xl border border-[var(--border-main)] p-4 sm:p-6 sticky top-6">
                {selectedSocialUser ? (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-main)] flex items-center justify-center overflow-hidden shrink-0">
                        {selectedSocialUser.profile_image ? (
                          <img
                            src={selectedSocialUser.profile_image}
                            alt={selectedSocialUser.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserRound className="w-7 h-7 text-purple-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-[var(--text-main)] truncate">
                          {selectedSocialUser.full_name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          {selectedSocialUser.is_mutual
                            ? "Friends"
                            : socialTab === "followers"
                              ? selectedSocialUser.is_following
                                ? "Following back"
                                : "Follows you"
                              : "You follow this user"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link
                        to={`/profile/${selectedSocialUser.user_id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] font-bold hover:bg-[var(--bg-main)] hover:shadow-sm transition-all"
                      >
                        View Profile <ArrowRight className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleSocialAction}
                        disabled={followMut.isPending}
                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 ${
                          selectedSocialUser.is_following
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        {followMut.isPending ? (
                          <ButtonLoader size={16} />
                        ) : (
                          React.createElement(socialActionIcon, {
                            className: "w-4 h-4",
                          })
                        )}
                        {followMut.isPending ? "Wait..." : socialActionLabel}
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
                      Choose a follower or following entry to view the profile
                      and perform actions.
                    </p>
                  </div>
                )}
              </div>
            </div>

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
        )}
      </SurfaceCard>
    </div>
  );
};

export default ManageContent;
