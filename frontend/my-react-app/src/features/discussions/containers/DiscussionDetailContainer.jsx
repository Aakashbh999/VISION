import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ChevronLeft } from "lucide-react";
import ReportModal from "../../../components/modals/ReportModal";
import ImageLightbox from "../../../components/modals/ImageLightbox";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DiscussionPostCard from "../components/detail/DiscussionPostCard";
import DiscussionThread from "../components/detail/DiscussionThread";
import { useDiscussionDetailState } from "../hooks/useDiscussionDetailState";
import { buildCommentTree } from "../utils/buildCommentTree";

const DiscussionDetailContainer = () => {
  const {
    id,
    user,
    isAuthenticated,
    data,
    isLoading,
    error,
    navigate,
    commentContent,
    setCommentContent,
    isImageLoading,
    setIsImageLoading,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    reportModal,
    setReportModal,
    isReporting,
    lightbox,
    setLightbox,
    showBackToTop,
    addCommentMutation,
    voteMutation,
    commentVoteMutation,
    toggleSaveMutation,
    handleVote,
    handleCommentVote,
    handleReplySubmit,
    handleCommentSubmit,
    handleOpenReport,
    handleCreateReport,
    scrollToTop,
  } = useDiscussionDetailState();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-red-500 text-center font-bold">
        Discussion not found.
      </div>
    );
  }

  const { discussion, comments } = data;
  const commentTree = buildCommentTree(comments || []);

  return (
    <div className="max-w-5xl mx-auto pb-10 px-0 sm:px-4 md:px-0">
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        targetType={reportModal.targetType}
        onReport={handleCreateReport}
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

      <DiscussionPostCard
        discussion={discussion}
        comments={comments}
        user={user}
        id={id}
        navigate={navigate}
        isImageLoading={isImageLoading}
        setIsImageLoading={setIsImageLoading}
        setLightbox={setLightbox}
        voteMutation={voteMutation}
        toggleSaveMutation={toggleSaveMutation}
        onVote={handleVote}
        onOpenReport={handleOpenReport}
      />

      <DiscussionThread
        comments={comments}
        discussion={discussion}
        user={user}
        isAuthenticated={isAuthenticated}
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        handleCommentSubmit={handleCommentSubmit}
        handleCommentVote={handleCommentVote}
        handleReportClick={handleOpenReport}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        handleReplySubmit={handleReplySubmit}
        addCommentMutation={addCommentMutation}
        commentVoteMutation={commentVoteMutation}
        commentTree={commentTree}
      />

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

export default DiscussionDetailContainer;
