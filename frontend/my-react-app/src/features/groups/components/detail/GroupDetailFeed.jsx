import {
  MessagesSquare,
  Lock,
  Megaphone,
  Type,
  Code,
  Loader2,
  Send,
  Trash2,
  FileUp,
  Download,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  resourceFile,
  setResourceFile,
  answerDrafts,
  setAnswerDrafts,
  editingAnswerId,
  setEditingAnswerId,
  editingAnswerText,
  setEditingAnswerText,
  createPostMutation,
  deletePostMut,
  editQaAnswerMut,
  handlePostSubmit,
  handleQaAnswerCreate,
  handleStartEditAnswer,
  handleSaveEditedAnswer,
  messagesContainerRef,
  messagesEndRef,
}) => {
  const confirmAndDeletePost = (postId, reason, label = "this item") => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${label}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    deletePostMut.mutate({ postId, reason });
  };

  return (
    <>
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth ${
          activeSection === "discussion" || activeSection === "general"
            ? "bg-(--bg-main)"
            : "bg-(--bg-main)/30"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {!isMember ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-60">
                <div className="w-20 h-20 rounded-full bg-(--bg-active) flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-(--text-muted)" />
                </div>
                <p className="font-bold text-(--text-muted) text-sm">
                  You must join this group to view the network archives.
                </p>
              </div>
            ) : (
              <>
                {activeSection !== "discussion" &&
                  activeSection !== "general" && (
                    <div className="mb-8 max-w-4xl mx-auto">
                      {activeSection !== "notice_board" || isAdmin ? (
                        <div className="bg-(--bg-card) border border-(--border-main) border-x-0 sm:border-x rounded-4xl p-5 shadow-sm group">
                          <div className="flex gap-4">
                            <Avatar
                              src={user?.profile_image}
                              name={user?.full_name}
                              size="md"
                            />
                            <div className="flex-1">
                              <textarea
                                rows="2"
                                placeholder={
                                  activeSection === "qa"
                                    ? "Ask your question..."
                                    : activeSection === "resources"
                                      ? "Add a short note for this resource (optional)..."
                                      : "Initialize data sequence..."
                                }
                                value={newPost}
                                onChange={(event) =>
                                  setNewPost(event.target.value)
                                }
                                className="w-full bg-(--bg-active) p-4 border border-(--border-main) rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder:text-(--text-muted) text-(--text-main)"
                              />
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex gap-2 text-(--text-muted)">
                                  <Type className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                                  <Code className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={handlePostSubmit}
                                  isLoading={createPostMutation.isPending}
                                  disabled={
                                    activeSection === "resources"
                                      ? !resourceFile
                                      : !newPost.trim()
                                  }
                                >
                                  {activeSection === "qa" ? "Ask" : "Publish"}
                                </Button>
                              </div>
                              {activeSection === "resources" && (
                                <div className="mt-3">
                                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-muted) cursor-pointer hover:text-purple-600">
                                    <FileUp className="w-4 h-4 text-purple-600"  />
                                    Upload resource
                                    <input
                                      type="file"
                                      className="hidden"
                                      onChange={(event) =>
                                        setResourceFile(
                                          event.target.files?.[0] || null,
                                        )
                                      }
                                    />
                                  </label>
                                  <p className="text-[11px] text-(--text-muted) mt-1">
                                    image/file (max 5MB)
                                  </p>
                                  {resourceFile && (
                                    <p className="text-xs text-(--text-muted) mt-2">
                                      Selected: {resourceFile.name}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-(--bg-active) border border-(--border-main) rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                          <Megaphone className="w-8 h-8 text-(--text-muted) mb-3" />
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
                      <MessagesSquare className="w-12 h-12 text-(--text-muted) mb-4" />
                      <p className="font-black uppercase tracking-[0.2em] text-(--text-muted) text-xs">
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
                                <span className="text-[10px] text-(--text-muted) font-bold uppercase">
                                  {new Date(post.created_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                                <span className="text-[10px] text-(--text-muted) font-black tracking-wider">
                                  {isMe ? "You" : post.full_name}
                                </span>
                              </div>
                              <div
                                className={`px-4 py-2.5 rounded-[1.25rem] text-sm font-medium ${
                                  isMe
                                    ? "bg-purple-600 text-white rounded-tr-none"
                                    : "bg-(--bg-active) text-(--text-main) border-(--border-main) rounded-tl-none border"
                                }`}
                              >
                                {post.content}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (activeSection === "qa") {
                        const answer = post.answer;
                        const answerIsEditing = editingAnswerId === answer?.post_id;

                        return (
                          <div
                            key={post.post_id}
                            className="bg-(--bg-card) border border-(--border-main) border-x-0 sm:border-x p-6 rounded-3xl shadow-sm"
                          >
                            <header className="flex items-center justify-between mb-3">
                              <div className="flex gap-2 items-center">
                                <span className="font-bold text-(--text-main)">
                                  {post.full_name}
                                </span>
                                <Badge color="emerald" size="sm">
                                  Question
                                </Badge>
                              </div>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    confirmAndDeletePost(
                                      post.post_id,
                                      "Deleted by group admin",
                                      "this question",
                                    )
                                  }
                                  className="text-(--text-muted) hover:text-red-500"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </header>
                            <div className="text-(--text-main) text-sm whitespace-pre-wrap mb-4">
                              {post.content}
                            </div>

                            {answer ? (
                              <div className="bg-(--bg-active) border border-(--border-main) rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-(--text-muted)">
                                    Answer by {answer.full_name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {isAdmin && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          confirmAndDeletePost(
                                            answer.post_id,
                                            "Deleted by group admin",
                                            "this answer",
                                          )
                                        }
                                        className="text-(--text-muted) hover:text-red-500"
                                        title="Delete answer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    {isAdmin && !answerIsEditing && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStartEditAnswer(
                                            answer.post_id,
                                            answer.content,
                                          )
                                        }
                                        className="text-(--text-muted) hover:text-blue-500"
                                        title="Edit answer"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {answerIsEditing ? (
                                  <div className="space-y-2">
                                    <textarea
                                      rows="3"
                                      value={editingAnswerText}
                                      onChange={(event) =>
                                        setEditingAnswerText(event.target.value)
                                      }
                                      className="w-full bg-(--bg-card) p-3 border border-(--border-main) rounded-xl text-sm focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => setEditingAnswerId(null)}
                                        variant="ghost"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleSaveEditedAnswer}
                                        isLoading={editQaAnswerMut.isPending}
                                      >
                                        <Save className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-(--text-main) text-sm whitespace-pre-wrap">
                                    {answer.content}
                                  </div>
                                )}
                              </div>
                            ) : (
                              isAdmin && (
                                <div className="space-y-2">
                                  <textarea
                                    rows="2"
                                    placeholder="Write the official answer..."
                                    value={answerDrafts[post.post_id] || ""}
                                    onChange={(event) =>
                                      setAnswerDrafts((prev) => ({
                                        ...prev,
                                        [post.post_id]: event.target.value,
                                      }))
                                    }
                                    className="w-full bg-(--bg-active) p-3 border border-(--border-main) rounded-xl text-sm focus:outline-none"
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleQaAnswerCreate(post.post_id)
                                      }
                                    >
                                      Publish Answer
                                    </Button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={post.post_id}
                          className="bg-(--bg-card) border border-(--border-main) border-x-0 sm:border-x p-6 rounded-3xl shadow-sm hover:border-purple-200 transition-colors"
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
                                  <span className="font-bold text-(--text-main) leading-none">
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
                                <span className="text-[10px] text-(--text-muted) font-bold">
                                  {new Date(
                                    post.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </header>
                              <div className="text-(--text-muted) text-sm whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </div>
                              {activeSection === "resources" && post.file_url && (
                                <div className="mt-3 flex items-center justify-between gap-3">
                                  <a
                                    href={post.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-purple-600 hover:underline"
                                  >
                                    <Download className="w-4 h-4" />
                                    {post.file_name || "Download resource"}
                                  </a>
                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        confirmAndDeletePost(
                                          post.post_id,
                                          "Deleted by group admin",
                                          "this resource",
                                        )
                                      }
                                      className="text-(--text-muted) hover:text-red-500"
                                      title="Delete resource"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              )}
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
          </motion.div>
        </AnimatePresence>
      </div>

      {isMember &&
        (activeSection === "discussion" || activeSection === "general") && (
          <div className="p-4 md:p-6 bg-(--bg-card) border-t border-(--border-main)">
            <form
              onSubmit={handlePostSubmit}
              className="max-w-4xl mx-auto flex items-center gap-3"
            >
              <div className="flex-1 bg-(--bg-active) rounded-2xl flex items-center px-4 py-3 border border-(--border-main) focus-within:ring-2 focus-within:ring-purple-200">
                <input
                  type="text"
                  value={newPost}
                  onChange={(event) => setNewPost(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none placeholder:text-(--text-muted) text-(--text-main)"
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
