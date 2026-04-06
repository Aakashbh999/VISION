import {
  MessagesSquare,
  Lock,
  Megaphone,
  Type,
  Code,
  Loader2,
  Send,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";

const GroupDetailFeed = ({
  user,
  group,
  isMember,
  isAdmin,
  activeSection,
  feedPosts,
  isFetchingNextPage,
  newPost,
  setNewPost,
  createPostMutation,
  handlePostSubmit,
  messagesContainerRef,
  messagesEndRef,
}) => {
  return (
    <>
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth ${
          activeSection === "discussion" || activeSection === "general"
            ? "bg-[var(--bg-main)]"
            : "bg-[var(--bg-main)]/30"
        }`}
      >
        {!isMember ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-60">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-active)] flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="font-bold text-[var(--text-muted)] text-sm">
              You must join this group to view the network archives.
            </p>
          </div>
        ) : (
          <>
            {activeSection !== "discussion" && activeSection !== "general" && (
              <div className="mb-8 max-w-4xl mx-auto">
                {activeSection !== "notice_board" || isAdmin ? (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-4xl p-5 shadow-sm group">
                    <div className="flex gap-4">
                      <Avatar
                        src={user?.profile_image}
                        name={user?.full_name}
                        size="md"
                      />
                      <div className="flex-1">
                        <textarea
                          rows="2"
                          placeholder="Initialize data sequence..."
                          value={newPost}
                          onChange={(event) => setNewPost(event.target.value)}
                          className="w-full bg-[var(--bg-active)] p-4 border border-[var(--border-main)] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2 text-[var(--text-muted)]">
                            <Type className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                            <Code className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                          </div>
                          <Button
                            size="sm"
                            onClick={handlePostSubmit}
                            isLoading={createPostMutation.isPending}
                            disabled={!newPost.trim()}
                          >
                            Publish
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--bg-active)] border border-[var(--border-main)] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <Megaphone className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                    <Badge color="rose">Read-Only Notice Board</Badge>
                  </div>
                )}
              </div>
            )}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-purple-600 w-6 h-6" />
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
              {feedPosts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                  <MessagesSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                  <p className="font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-xs">
                    Awaiting Transmissions
                  </p>
                </div>
              ) : (
                feedPosts.map((post) => {
                  const isMe =
                    String(post.user_id) === String(user?.portal_user_id);

                  if (
                    activeSection === "discussion" ||
                    activeSection === "general"
                  ) {
                    return (
                      <div
                        key={post.post_id}
                        className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <Avatar
                          src={post.profile_image}
                          name={post.full_name}
                          size="xs"
                          className="mt-1"
                        />
                        <div
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                              {new Date(post.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-black tracking-wider">
                              {isMe ? "You" : post.full_name}
                            </span>
                          </div>
                          <div
                            className={`px-4 py-2.5 rounded-[1.25rem] text-sm font-medium ${
                              isMe
                                ? "bg-purple-600 text-white rounded-tr-none"
                                : "bg-[var(--bg-active)] text-[var(--text-main)] border-[var(--border-main)] rounded-tl-none border"
                            }`}
                          >
                            {post.content}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={post.post_id}
                      className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x p-6 rounded-3xl shadow-sm hover:border-purple-200 transition-colors"
                    >
                      <div className="flex gap-4">
                        <Avatar
                          src={post.profile_image}
                          name={post.full_name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <header className="flex items-center justify-between mb-3">
                            <div className="flex gap-2 items-center">
                              <span className="font-bold text-[var(--text-main)] leading-none">
                                {post.full_name}
                              </span>
                              {post.user_id === group.created_by && (
                                <Badge
                                  color="purple"
                                  size="sm"
                                  className="hidden sm:block"
                                >
                                  Master
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </header>
                          <div className="text-[var(--text-muted)] text-sm whitespace-pre-wrap leading-relaxed">
                            {post.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>

      {isMember &&
        (activeSection === "discussion" || activeSection === "general") && (
          <div className="p-4 md:p-6 bg-[var(--bg-card)] border-t border-[var(--border-main)]">
            <form
              onSubmit={handlePostSubmit}
              className="max-w-4xl mx-auto flex items-center gap-3"
            >
              <div className="flex-1 bg-[var(--bg-active)] rounded-2xl flex items-center px-4 py-3 border border-[var(--border-main)] focus-within:ring-2 focus-within:ring-purple-200">
                <input
                  type="text"
                  value={newPost}
                  onChange={(event) => setNewPost(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
                />
              </div>
              <Button
                variant="shiny"
                size="md"
                type="submit"
                disabled={!newPost.trim() || createPostMutation.isPending}
                className="w-12 h-12 p-0 rounded-2xl flex items-center justify-center"
              >
                <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />
              </Button>
            </form>
          </div>
        )}
    </>
  );
};

export default GroupDetailFeed;
