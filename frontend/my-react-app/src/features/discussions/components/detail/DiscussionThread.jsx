import { Link } from "react-router-dom";
import CommentItem from "./CommentItem";
import ButtonLoader from "../../../../components/ui/ButtonLoader";

const DiscussionThread = ({
  discussion,
  user,
  isAuthenticated,
  commentContent,
  setCommentContent,
  handleCommentSubmit,
  handleCommentVote,
  handleReportClick,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReplySubmit,
  addCommentMutation,
  commentVoteMutation,
  commentTree,
}) => {
  return (
    <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
      {isAuthenticated ? (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder="Join the discussion..."
            className="w-full p-3 border border-[var(--border-main)] rounded-xl outline-none focus:border-purple-200 min-h-[96px] bg-[var(--bg-card)] text-[var(--text-main)] text-sm"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={addCommentMutation.isPending}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addCommentMutation.isPending ? (
                <>
                  <ButtonLoader size={14} />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-5 bg-purple-50 rounded-xl text-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black text-xs uppercase"
          >
            Login to Comment
          </Link>
        </div>
      )}

      <div className="space-y-5">
        {commentTree.map((comment) => (
          <CommentItem
            key={comment.comment_id}
            comment={comment}
            discussion={discussion}
            user={user}
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
    </div>
  );
};

export default DiscussionThread;
