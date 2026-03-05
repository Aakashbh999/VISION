import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDiscussion } from "../../hooks/useDiscussion";
import { useAddComment } from "../../hooks/useAddReply";
import { useToggleLike } from "../../hooks/useToggleLike";
import { useToggleSave } from "../../hooks/useToggleSave";
import {
  useDeleteDiscussion,
  useDeleteComment,
} from "../../hooks/useDiscussionMutations";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Trash2,
  Edit,
  ChevronLeft,
  MoreHorizontal,
  Send,
} from "lucide-react";

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useDiscussion(id);

  const addCommentMutation = useAddComment(id);
  const toggleLikeMutation = useToggleLike(id);
  const toggleSaveMutation = useToggleSave(id);
  const deleteDiscussionMutation = useDeleteDiscussion();
  const deleteCommentMutation = useDeleteComment(id);

  const [commentContent, setCommentContent] = useState("");

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500 text-center">Discussion not found</div>
    );

  const { discussion, comments } = data;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addCommentMutation.mutate(commentContent, {
      onSuccess: () => setCommentContent(""),
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <Link
        to="/portal/discussions"
        className="inline-flex items-center text-xs font-bold text-gray-500 mb-4 hover:underline"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Discussions
      </Link>

      <div className="flex bg-white border border-gray-200 rounded-md overflow-hidden">
        {/* Voting Rail */}
        <div className="w-12 bg-gray-50/50 flex flex-col items-center py-4 gap-1">
          <button
            onClick={() => toggleLikeMutation.mutate()}
            disabled={toggleLikeMutation.isPending}
            className={`hover:bg-gray-200 p-1 rounded transition-all ${toggleLikeMutation.isPending ? "opacity-50 cursor-wait" : ""} ${discussion.user_liked ? "text-orange-600" : "text-gray-500"}`}
          >
            {toggleLikeMutation.isPending ? (
              <ButtonLoader size={28} />
            ) : (
              <ArrowBigUp
                className={`w-7 h-7 ${discussion.user_liked ? "fill-orange-600" : ""}`}
              />
            )}
          </button>
          <span className="text-sm font-bold">
            {discussion.like_count || 0}
          </span>
          <button className="hover:bg-gray-200 p-1 rounded text-gray-500">
            <ArrowBigDown className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="font-bold text-gray-900 uppercase tracking-tight">
              v/{discussion.specialization_name}
            </span>
            <span>• Posted by u/{discussion.author}</span>
            <span>• {new Date(discussion.created_at).toLocaleString()}</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
            {discussion.title}
          </h1>
          <p className="text-gray-800 text-md leading-relaxed whitespace-pre-wrap mb-6">
            {discussion.content}
          </p>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded">
              <MessageSquare className="w-4 h-4" /> {comments?.length || 0}{" "}
              Comments
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => toggleSaveMutation.mutate()}
              disabled={toggleSaveMutation.isPending}
              className={`flex items-center gap-1.5 text-xs font-bold hover:bg-gray-100 px-2 py-1.5 rounded transition-all ${toggleSaveMutation.isPending ? "opacity-50 cursor-wait" : ""} ${discussion.user_saved ? "text-yellow-600" : "text-gray-500"}`}
            >
              {toggleSaveMutation.isPending ? (
                <ButtonLoader size={16} />
              ) : (
                <Bookmark
                  className={`w-4 h-4 ${discussion.user_saved ? "fill-yellow-500 text-yellow-500" : ""}`}
                />
              )}
              {discussion.user_saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mt-6 bg-white border border-gray-200 rounded-md p-6">
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full p-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[120px]"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!commentContent.trim() || addCommentMutation.isPending}
              className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-full text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {addCommentMutation.isPending ? (
                <>
                  <ButtonLoader size={14} className="text-white" />
                  Posting...
                </>
              ) : (
                "Comment"
              )}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {comments?.map((comment) => (
            <div
              key={comment.comment_id}
              className="relative pl-4 border-l-2 border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-600 uppercase">
                  {comment.full_name.charAt(0)}
                </div>
                <span className="text-xs font-bold">{comment.full_name}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 ml-8 mb-2 leading-normal">
                {comment.content}
              </p>
              <div className="ml-8 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button className="text-gray-400 hover:text-orange-600">
                    <ArrowBigUp className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] font-bold text-gray-500">0</span>
                  <button className="text-gray-400 hover:text-blue-600">
                    <ArrowBigDown className="w-5 h-5" />
                  </button>
                </div>
                <button className="text-[10px] font-bold text-gray-500 hover:underline">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;
