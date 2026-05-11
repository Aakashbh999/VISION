import { useGroupDetailState } from "../hooks/useGroupDetailState";
import GroupDetailHeader from "../components/detail/GroupDetailHeader";
import GroupDetailFeed from "../components/detail/GroupDetailFeed";
import GroupDetailSidebar from "../components/detail/GroupDetailSidebar";
import {
  GroupDetailLoadingView,
  GroupDetailErrorView,
  GroupDetailPrivateView,
  GroupDetailNonMemberView,
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
    resourceFile,
    setResourceFile,
    answerDrafts,
    setAnswerDrafts,
    editingAnswerId,
    setEditingAnswerId,
    editingAnswerText,
    setEditingAnswerText,
    activeSection,
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
    removeMemberMut,
    createPostMutation,
    deletePostMut,
    editQaAnswerMut,
    handlePostSubmit,
    handleQaAnswerCreate,
    handleStartEditAnswer,
    handleSaveEditedAnswer,
    handleJoinAction,
    handleSectionChange,
  } = useGroupDetailState();

  if (groupLoading) {
    return <GroupDetailLoadingView />;
  }

  if (groupError || !group) {
    return <GroupDetailErrorView />;
  }

  if (!isMember) {
    if (group.privacy_type === "private") {
      return <GroupDetailPrivateView />;
    }
    return (
      <GroupDetailNonMemberView
        group={group}
        handleJoinAction={handleJoinAction}
        isJoining={joinGroupMut.isPending || requestJoinMut.isPending}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_30%),linear-gradient(180deg,var(--bg-main),var(--bg-main))]">
      <div className="flex h-full min-h-0 flex-col gap-5 p-4 sm:p-5 lg:p-6">
        <GroupDetailHeader
          id={id}
          group={group}
          activeSection={activeSection}
          handleSectionChange={handleSectionChange}
          isMember={isMember}
          isAdmin={isAdmin}
          showAdminPanel={showAdminPanel}
          setShowAdminPanel={setShowAdminPanel}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          handleJoinAction={handleJoinAction}
          isJoining={joinGroupMut.isPending || requestJoinMut.isPending}
        />

        <div className="relative flex-1 min-h-0 overflow-hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 flex min-h-0 max-h-[calc(100vh-1rem)] overflow-y-auto flex-col overflow-hidden rounded-3xl border border-(--border-main) bg-(--bg-card) shadow-sm">
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
              resourceFile={resourceFile}
              setResourceFile={setResourceFile}
              answerDrafts={answerDrafts}
              setAnswerDrafts={setAnswerDrafts}
              editingAnswerId={editingAnswerId}
              setEditingAnswerId={setEditingAnswerId}
              editingAnswerText={editingAnswerText}
              setEditingAnswerText={setEditingAnswerText}
              createPostMutation={createPostMutation}
              deletePostMut={deletePostMut}
              editQaAnswerMut={editQaAnswerMut}
              handlePostSubmit={handlePostSubmit}
              handleQaAnswerCreate={handleQaAnswerCreate}
              handleStartEditAnswer={handleStartEditAnswer}
              handleSaveEditedAnswer={handleSaveEditedAnswer}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
            />
          </div>

          <div className="min-w-0 min-h-0 lg:h-full">
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
              showSectionNavigation={false}
              appointCoAdminMut={appointCoAdminMut}
              removeCoAdminMut={removeCoAdminMut}
              updatePermissionMut={updatePermissionMut}
              approveRequestMut={approveRequestMut}
              declineRequestMut={declineRequestMut}
              expandCapacityMut={expandCapacityMut}
              removeMemberMut={removeMemberMut}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
