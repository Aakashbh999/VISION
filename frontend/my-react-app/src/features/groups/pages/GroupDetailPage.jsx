import { useGroupDetailState } from "../hooks/useGroupDetailState";
import GroupDetailHeader from "../components/detail/GroupDetailHeader";
import GroupDetailFeed from "../components/detail/GroupDetailFeed";
import GroupDetailSidebar from "../components/detail/GroupDetailSidebar";
import {
  GroupDetailLoadingView,
  GroupDetailErrorView,
  GroupDetailPrivateView,
} from "../components/detail/GroupDetailStateViews";

const GroupDetail = () => {
  const {
    id,
    user,
    group,
    groupLoading,
    groupError,
    members,
    joinRequests,
    feedPosts,
    isOwner,
    canManageUsers,
    isAdmin,
    isMember,
    isFetchingNextPage,
    newPost,
    setNewPost,
    activeSection,
    messageSearch,
    setMessageSearch,
    showSearch,
    setShowSearch,
    showAdminPanel,
    setShowAdminPanel,
    isSidebarOpen,
    setIsSidebarOpen,
    messagesEndRef,
    messagesContainerRef,
    appointCoAdminMut,
    removeCoAdminMut,
    updatePermissionMut,
    approveRequestMut,
    declineRequestMut,
    expandCapacityMut,
    requestJoinMut,
    joinGroupMut,
    createPostMutation,
    handlePostSubmit,
    handleJoinAction,
    handleSectionChange,
  } = useGroupDetailState();

  if (groupLoading) {
    return <GroupDetailLoadingView />;
  }

  if (groupError || !group) {
    return <GroupDetailErrorView />;
  }

  // Private View Filter
  if (!isMember && group.privacy_type === "private") {
    return <GroupDetailPrivateView />;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-4 md:-m-6 lg:-m-8 bg-[var(--bg-main)]/50 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-card)] relative">
          <GroupDetailHeader
            id={id}
            group={group}
            activeSection={activeSection}
            isMember={isMember}
            isAdmin={isAdmin}
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            setIsSidebarOpen={setIsSidebarOpen}
            showSearch={showSearch}
            setShowSearch={setShowSearch}
            messageSearch={messageSearch}
            setMessageSearch={setMessageSearch}
            handleJoinAction={handleJoinAction}
            isJoining={joinGroupMut.isPending || requestJoinMut.isPending}
          />

          <GroupDetailFeed
            user={user}
            group={group}
            isMember={isMember}
            isAdmin={isAdmin}
            activeSection={activeSection}
            feedPosts={feedPosts}
            isFetchingNextPage={isFetchingNextPage}
            newPost={newPost}
            setNewPost={setNewPost}
            createPostMutation={createPostMutation}
            handlePostSubmit={handlePostSubmit}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
          />
        </div>

        <GroupDetailSidebar
          id={id}
          user={user}
          group={group}
          members={members}
          joinRequests={joinRequests}
          isOwner={isOwner}
          isAdmin={isAdmin}
          canManageUsers={canManageUsers}
          showAdminPanel={showAdminPanel}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeSection={activeSection}
          handleSectionChange={handleSectionChange}
          appointCoAdminMut={appointCoAdminMut}
          removeCoAdminMut={removeCoAdminMut}
          updatePermissionMut={updatePermissionMut}
          approveRequestMut={approveRequestMut}
          declineRequestMut={declineRequestMut}
          expandCapacityMut={expandCapacityMut}
        />
      </div>
    </div>
  );
};

export default GroupDetail;
