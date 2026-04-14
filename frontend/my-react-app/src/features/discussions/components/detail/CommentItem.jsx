import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowBigUp,
  ArrowBigDown,
  Award,
  AlertTriangle,
  Reply,
  CornerDownRight,
  Send,
  MoreHorizontal,
} from "lucide-react";
import ActionMenu from "../../../../components/ui/ActionMenu";
import DeleteAction from "../../../../components/DeleteAction";
import ButtonLoader from "../../../../components/ui/ButtonLoader";

const CommentItem = ({
  comment,
  discussion,
  user,
  depth = 0,
  isAuthenticated,
  handleCommentVote,
  handleReportClick,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReplySubmit,
  addCommentMutation,
  commentVoteMutation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);

  const isAuthor = comment.user_id === discussion.user_id;
  const repliesBatchSize = 10;

  const isCommentOwner =
    isAuthenticated &&
    user &&
    String(comment.user_id) === String(user.portal_user_id || user.user_id);

  return (
    <div className={`${depth > 0 ? "ml-2 sm:ml-6 mt-3" : ""}`}>
      <div className="flex gap-1.5">
        {depth > 0 && (
          <div className="flex-shrink-0 w-0.5 bg-purple-200/50 rounded-full" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 bg-[var(--bg-active)] rounded-full flex items-center justify-center font-black text-[var(--text-muted)] text-[9px] shadow-sm border border-[var(--border-main)]">
              {comment.full_name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-[var(--text-main)]">
                  {comment.full_name}
                </span>
                {isAuthor && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-purple-600 text-white px-1.5 py-0.5 rounded tracking-widest shadow-sm">
                    <Award className="w-2.5 h-2.5" /> Author
                  </span>
                )}
              </div>
              <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-active)]/50 p-3 rounded-lg border border-[var(--border-main)] text-[var(--text-main)] text-[13px] leading-relaxed mb-1.5">
            {comment.content}
          </div>

          <div className="flex items-center gap-1 ml-1 mb-2">
            <div className="flex items-center gap-0.5 mr-2 bg-[var(--bg-active)] rounded-lg p-0.5 border border-[var(--border-main)]">
              <button
                onClick={() =>
                  handleCommentVote(comment.comment_id, 1, comment.user_vote)
                }
                disabled={commentVoteMutation?.isPending}
                className={`p-1 rounded-md transition-all ${comment.user_vote === 1 ? "text-purple-600 bg-purple-50" : "text-[var(--text-muted)] hover:text-purple-500"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {commentVoteMutation?.isPending ? (
                  <ButtonLoader size={16} />
                ) : (
                  <ArrowBigUp
                    className={`w-4 h-4 ${comment.user_vote === 1 ? "fill-purple-600" : ""}`}
                  />
                )}
              </button>
              <span
                className={`text-xs font-black px-1 min-w-[1.2rem] text-center ${comment.user_vote === 1 ? "text-purple-600" : "text-[var(--text-muted)]"}`}
              >
                {comment.likes_count || 0}
              </span>
              <button
                onClick={() =>
                  handleCommentVote(comment.comment_id, -1, comment.user_vote)
                }
                disabled={commentVoteMutation?.isPending}
                className={`p-1 rounded-md transition-all ${comment.user_vote === -1 ? "text-red-600 bg-red-50" : "text-[var(--text-muted)] hover:text-red-500"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {commentVoteMutation?.isPending ? (
                  <ButtonLoader size={16} />
                ) : (
                  <ArrowBigDown
                    className={`w-4 h-4 ${comment.user_vote === -1 ? "fill-red-600" : ""}`}
                  />
                )}
              </button>
            </div>

            <button
              onClick={() => setReplyingTo(comment.comment_id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-purple-600 transition-all"
            >
              <Reply className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Reply
              </span>
            </button>

            <ActionMenu
              actions={[
                ...(isCommentOwner
                  ? [
                      {
                        render: () => (
                          <DeleteAction
                            targetType="comment"
                            targetId={comment.comment_id}
                            label="Delete"
                            iconClassName="w-3 h-3"
                            buttonClassName="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors duration-150"
                          />
                        ),
                      },
                    ]
                  : [
                      {
                        label: "Report",
                        icon: <AlertTriangle className="w-3 h-3" />,
                        onClick: () =>
                          handleReportClick(comment.comment_id, "comment"),
                        variant: "danger",
                      },
                    ]),
              ]}
              trigger={<MoreHorizontal className="w-4 h-4" />}
            />
          </div>

          <AnimatePresence>
            {replyingTo === comment.comment_id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <form
                  onSubmit={(event) =>
                    handleReplySubmit(event, comment.comment_id)
                  }
                  className="border border-purple-200 rounded-lg p-2 bg-purple-50/30"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <CornerDownRight className="w-3.5 h-3.5 text-purple-400 mt-2.5" />
                    <textarea
                      value={replyContent}
                      onChange={(event) => setReplyContent(event.target.value)}
                      placeholder={`Reply to ${comment.full_name}...`}
                      className="flex-1 p-2 text-sm bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg outline-none focus:border-purple-300 min-h-[68px] resize-none text-[var(--text-main)]"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 text-xs font-black text-[var(--text-muted)] hover:bg-[var(--bg-active)] rounded-lg uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !replyContent.trim() || addCommentMutation.isPending
                      }
                      className="bg-purple-600 text-white px-5 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {addCommentMutation.isPending ? (
                        <ButtonLoader size={14} />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      Reply
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {comment.replies?.length > 0 && (
            <div className="mt-2">
              {!isExpanded ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-[11px] font-black text-[var(--text-muted)] hover:text-purple-600 flex items-center gap-2 tracking-widest uppercase ml-4"
                >
                  <div className="w-6 h-[1px] bg-[var(--border-main)]" />
                  View {comment.replies.length} replies
                </button>
              ) : (
                <>
                  <div className="space-y-3">
                    {comment.replies
                      .slice(0, visibleCount * repliesBatchSize)
                      .map((reply) => (
                        <CommentItem
                          key={reply.comment_id}
                          comment={reply}
                          discussion={discussion}
                          user={user}
                          depth={depth + 1}
                          isAuthenticated={isAuthenticated}
                          handleCommentVote={handleCommentVote}
                          handleReportClick={handleReportClick}
                          replyingTo={replyingTo}
                          setReplyingTo={setReplyingTo}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          handleReplySubmit={handleReplySubmit}
                          addCommentMutation={addCommentMutation}
                          commentVoteMutation={commentVoteMutation}
                        />
                      ))}
                  </div>
                  <div className="flex items-center gap-4 ml-4 mt-3">
                    {comment.replies.length >
                      visibleCount * repliesBatchSize && (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 1)}
                        className="text-[11px] font-black text-purple-600 hover:text-purple-700 tracking-widest uppercase"
                      >
                        Load more replies
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsExpanded(false);
                        setVisibleCount(1);
                      }}
                      className="text-[11px] font-black text-[var(--text-muted)] hover:text-[var(--text-main)] tracking-widest uppercase"
                    >
                      Hide replies
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
