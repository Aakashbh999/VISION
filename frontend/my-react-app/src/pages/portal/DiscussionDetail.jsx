import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useDiscussion,
  useAddComment,
  useVote,
  useCommentVote,
  useToggleSave,
  useDeleteDiscussion,
  useHardDeleteDiscussion,
  useDeleteComment,
  useBoostDiscussion,
} from "../../hooks/useDiscussionHooks";

import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { createReport } from "../../services/report";
import ReportModal from "../../components/modals/ReportModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import ImageLightbox from "../../components/modals/ImageLightbox";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Trash2,
  Edit,
  ChevronLeft,
  Send,
  Award,
  AlertTriangle,
  Reply,
  CornerDownRight,
  Maximize2,
  MoreHorizontal,
  ArrowUp,
  Image as ImageIcon,
} from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import DeleteAction from "../../components/DeleteAction";

/**
 * Recursive Comment Item Component
 */
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
  websiteHoneypot,
  setWebsiteHoneypot,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);

  const isAuthor = comment.user_id === discussion.user_id;
  const maxDepth = 5;
  const repliesBatchSize = 10;

  const isCommentOwner =
    isAuthenticated &&
    user &&
    String(comment.user_id) === String(user.portal_user_id || user.user_id);

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`}>
      <div className="flex gap-2">
        {depth > 0 && (
          <div className="flex-shrink-0 w-0.5 bg-purple-200/50 rounded-full" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-[var(--bg-active)] rounded-full flex items-center justify-center font-black text-[var(--text-muted)] text-[10px] shadow-sm border border-[var(--border-main)]">
              {comment.full_name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--text-main)]">
                  {comment.full_name}
                </span>
                {isAuthor && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-purple-600 text-white px-1.5 py-0.5 rounded tracking-widest shadow-sm">
                    <Award className="w-2.5 h-2.5" /> Author
                  </span>
                )}
              </div>
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg-active)]/50 p-4 rounded-xl border border-[var(--border-main)] text-[var(--text-main)] text-sm leading-relaxed mb-2">
            {comment.content}
          </div>

          <div className="flex items-center gap-1 ml-1 mb-3">
            <div className="flex items-center gap-0.5 mr-3 bg-[var(--bg-active)] rounded-lg p-0.5 border border-[var(--border-main)]">
              <button
                onClick={() =>
                  handleCommentVote(comment.comment_id, 1, comment.user_vote)
                }
                className={`p-1 rounded-md transition-all ${comment.user_vote === 1 ? "text-purple-600 bg-purple-50" : "text-[var(--text-muted)] hover:text-purple-500"}`}
              >
                <ArrowBigUp
                  className={`w-5 h-5 ${comment.user_vote === 1 ? "fill-purple-600" : ""}`}
                />
              </button>
              <span
                className={`text-xs font-black px-1 min-w-[1.2rem] text-center ${comment.user_vote === 1 ? "text-purple-600" : comment.user_vote === -1 ? "text-red-600" : "text-[var(--text-muted)]"}`}
              >
                {comment.likes_count || 0}
              </span>
              <button
                onClick={() =>
                  handleCommentVote(comment.comment_id, -1, comment.user_vote)
                }
                className={`p-1 rounded-md transition-all ${comment.user_vote === -1 ? "text-red-600 bg-red-50" : "text-[var(--text-muted)] hover:text-red-500"}`}
              >
                <ArrowBigDown
                  className={`w-5 h-5 ${comment.user_vote === -1 ? "fill-red-600" : ""}`}
                />
              </button>
            </div>

            <button
              onClick={() => setReplyingTo(comment.comment_id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-purple-600 transition-all"
            >
              <Reply className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Reply</span>
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
                        )
                      },
                    ]
                  : [
                      {
                        label: "Report",
                        icon: <AlertTriangle className="w-3 h-3" />,
                        onClick: () => handleReportClick(comment.comment_id, "comment"),
                        variant: "danger",
                      },
                    ]),
              ]}
              trigger={<MoreHorizontal className="w-4 h-4" />}
            />
          </div>

          {/* Inline Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.comment_id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.comment_id)}
                  className="border-2 border-purple-200 rounded-xl p-2 bg-purple-50/30"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <CornerDownRight className="w-4 h-4 text-purple-400 mt-3" />
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.full_name}...`}
                      className="flex-1 p-2 text-sm bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg outline-none focus:border-purple-300 min-h-[80px] resize-none text-[var(--text-main)]"
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
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-wider hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
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

          {/* INSTAGRAM STYLE REPLIES */}
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
                  <div className="space-y-4">
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
                          websiteHoneypot={websiteHoneypot}
                          setWebsiteHoneypot={setWebsiteHoneypot}
                        />
                      ))}
                  </div>
                  <div className="flex items-center gap-4 ml-4 mt-4">
                    {comment.replies.length > visibleCount * repliesBatchSize && (
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

const DiscussionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [commentSort, setCommentSort] = useState("newest");
  const [commentContent, setCommentContent] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");
  const [lastLevel, setLastLevel] = useState(user?.current_level);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    targetId: null,
    targetType: "",
  });
  const [isReporting, setIsReporting] = useState(false);
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    image: null,
    title: "",
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Hooks
  const { data, isLoading, error } = useDiscussion(id, commentSort);
  const deleteCommentMutation = useDeleteComment(id);
  const addCommentMutation = useAddComment(id);
  const voteMutation = useVote(id);
  const commentVoteMutation = useCommentVote(id);
  const toggleSaveMutation = useToggleSave(id);
  const archiveMutation = useDeleteDiscussion();
  const hardDeleteMutation = useHardDeleteDiscussion();

  useEffect(() => {
    if (user?.current_level > lastLevel) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success(`Level Up! Reached Level ${user.current_level}`, {
        icon: "🚀",
      });
      setLastLevel(user.current_level);
    }
  }, [user?.current_level]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !data)
    return (
      <div className="p-8 text-red-500 text-center font-bold">
        Discussion not found.
      </div>
    );

  const { discussion, comments } = data;

  const handleVote = (voteType) => {
    if (!isAuthenticated) return toast.info("Please login to vote");
    voteMutation.mutate(voteType);
  };

  const handleCommentVote = (commentId, voteType) => {
    if (!isAuthenticated) return toast.info("Please login to vote");
    commentVoteMutation.mutate({ commentId, voteType });
  };

  const handleReplySubmit = (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addCommentMutation.mutate(
      { content: replyContent, parentId, website: websiteHoneypot },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyingTo(null);
          setWebsiteHoneypot("");
        },
      },
    );
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addCommentMutation.mutate(
      { content: commentContent, website: websiteHoneypot },
      {
        onSuccess: () => {
          setCommentContent("");
          setWebsiteHoneypot("");
        },
      },
    );
  };

  // Tree Builder Logic
  const buildCommentTree = (rawComments) => {
    const filtered = rawComments.filter((c) => !c.deleted);
    const commentMap = {};
    const rootComments = [];
    filtered.forEach((c) => (commentMap[c.comment_id] = { ...c, replies: [] }));
    filtered.forEach((c) => {
      if (c.parent_id && commentMap[c.parent_id]) {
        commentMap[c.parent_id].replies.push(commentMap[c.comment_id]);
      } else if (!c.parent_id) {
        rootComments.push(commentMap[c.comment_id]);
      }
    });
    return rootComments;
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 px-4 md:px-0">
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        targetType={reportModal.targetType}
        onReport={async (reason) => {
          setIsReporting(true);
          try {
            await createReport(
              reportModal.targetType,
              reportModal.targetId,
              reason,
            );
            return true;
          } catch (e) {
            toast.error("Report failed");
            throw e;
          } finally {
            setIsReporting(false);
          }
        }}
        isSubmitting={isReporting}
      />

      <ImageLightbox
        isOpen={lightbox.isOpen}
        image={lightbox.image}
        title={lightbox.title}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
      />

      <Link
        to="/discussions"
        className="inline-flex items-center text-xs font-black text-[var(--text-muted)] mb-6 hover:text-purple-600 uppercase tracking-widest"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Feed
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl overflow-hidden shadow-sm"
      >
        {/* Voting Rail */}
        <div className="w-full md:w-14 bg-[var(--bg-active)]/30 flex flex-row md:flex-col items-center justify-center p-2 md:py-6 gap-2 border-b md:border-b-0 md:border-r border-[var(--border-main)]">
          <button
            onClick={() => handleVote(1)}
            disabled={voteMutation.isPending}
            className={`p-1 rounded-lg transition-all ${discussion.user_vote === 1 ? "text-purple-600 bg-purple-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)]"}`}
          >
            {voteMutation.isPending ? (
              <ButtonLoader size={24} />
            ) : (
              <ArrowBigUp
                className={`w-8 h-8 ${discussion.user_vote === 1 ? "fill-purple-600" : ""}`}
              />
            )}
          </button>
          <span
            className={`text-base font-black px-3 py-1 rounded-lg shadow-sm border ${
              discussion.user_vote === 1
                ? "text-purple-600 bg-purple-50 border-purple-200"
                : discussion.user_vote === -1
                  ? "text-red-600 bg-red-50 border-red-200"
                  : "text-[var(--text-main)] bg-[var(--bg-active)] border-[var(--border-main)]"
            }`}
            title="Net Likes"
          >
            {discussion.like_count || 0}
          </span>
          <button
            onClick={() => handleVote(-1)}
            disabled={voteMutation.isPending}
            className={`p-1 rounded-lg transition-all ${discussion.user_vote === -1 ? "text-red-600 bg-red-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)]"}`}
          >
            {voteMutation.isPending ? (
              <ButtonLoader size={24} />
            ) : (
              <ArrowBigDown
                className={`w-8 h-8 ${discussion.user_vote === -1 ? "fill-red-600" : ""}`}
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">
              {discussion.title}
            </h1>
            <ActionMenu
              actions={[
                {
                  label: "Share",
                  icon: <Share2 className="w-4 h-4" />,
                  onClick: () => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied!");
                  },
                },
                ...(String(discussion.user_id) === String(user?.portal_user_id || user?.user_id)
                  ? [
                      {
                        label: "Manage Post",
                        icon: <Edit className="w-4 h-4" />,
                        onClick: () => navigate(`/portal/discussions/${id}/edit`),
                      },
                      {
                        render: () => (
                          <DeleteAction
                            targetType="discussion"
                            targetId={id}
                            label="Delete Post"
                            iconClassName="w-4 h-4"
                            buttonClassName="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors duration-150"
                            onDeleted={() => navigate("/discussions")}
                          />
                        )
                      },
                    ]
                  : [
                      {
                        label: "Report",
                        icon: <AlertTriangle className="w-4 h-4" />,
                        onClick: () => setReportModal({ 
                          isOpen: true, 
                          targetId: id, 
                          targetType: "discussion" 
                        }),
                        variant: "danger",
                      },
                    ]),
              ]}
            />
          </div>

          {discussion.image_url && (
            <div 
              className="relative mb-8 rounded-2xl overflow-hidden border border-[var(--border-main)] group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setLightbox({ isOpen: true, image: discussion.image_url, title: discussion.title })}
            >
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-active)] animate-pulse">
                  <ImageIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
              )}
              <img
                src={discussion.image_url}
                alt={discussion.title}
                onLoad={() => setIsImageLoading(false)}
                className={`w-full max-h-[500px] object-cover transition-all duration-500 group-hover:scale-[1.02] ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-2 rounded-xl text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className="prose prose-purple max-w-none text-[var(--text-main)] mb-10 whitespace-pre-wrap">
            {discussion.content}
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--border-main)] pt-6">
            <button className="flex items-center gap-2 text-xs font-black text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-main)] px-4 py-2 rounded-full">
              <MessageSquare className="w-4 h-4 text-purple-600" />{" "}
              {comments?.length || 0} Comments
            </button>
            <button
              onClick={() => toggleSaveMutation.mutate()}
              disabled={toggleSaveMutation.isPending}
              className={`p-2.5 rounded-full transition-all ${discussion.user_saved ? "text-amber-500 bg-amber-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] border border-[var(--border-main)]"}`}
            >
              {toggleSaveMutation.isPending ? (
                <ButtonLoader size={16} />
              ) : (
                <Bookmark
                  className={`w-4 h-4 ${discussion.user_saved ? "fill-amber-500" : ""}`}
                />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Discussion Thread */}
      <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-6 md:p-8 shadow-sm">
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-10">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full p-4 border-2 border-[var(--border-main)] rounded-2xl outline-none focus:border-purple-200 min-h-[120px] bg-[var(--bg-card)] text-[var(--text-main)]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-purple-700"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-10 p-8 bg-purple-50 rounded-2xl text-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black text-xs uppercase"
            >
              Login to Comment
            </Link>
          </div>
        )}

        <div className="space-y-8">
          {buildCommentTree(comments || []).map((comment, index) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              discussion={discussion}
              user={user}
              isAuthenticated={isAuthenticated}
              handleCommentVote={handleCommentVote}
              handleReportClick={(id, type) =>
                setReportModal({ isOpen: true, targetId: id, targetType: type })
              }
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReplySubmit={handleReplySubmit}
              addCommentMutation={addCommentMutation}
              websiteHoneypot={websiteHoneypot}
              setWebsiteHoneypot={setWebsiteHoneypot}
            />
          ))}
        </div>
      </div>

      {/* Back to Top FAB */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 transition-all z-50 group"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscussionDetail;