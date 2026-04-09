import { Link } from "react-router-dom";
import CommentItem from "./CommentItem";
import ButtonLoader from "../../../../components/ui/ButtonLoader";

const DiscussionThread = ({
  comments,
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
    <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
      {isAuthenticated ? (
        <form onSubmit={handleCommentSubmit} className="mb-10">
          <textarea
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder="Join the discussion..."
            className="w-full p-4 border-2 border-[var(--border-main)] rounded-2xl outline-none focus:border-purple-200 min-h-[120px] bg-[var(--bg-card)] text-[var(--text-main)]"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={addCommentMutation.isPending}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
