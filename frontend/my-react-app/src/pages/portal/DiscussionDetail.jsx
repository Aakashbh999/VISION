import { useParams } from "react-router-dom";
import { useDiscussion } from "../../hooks/useDiscussion";
import { useAddReply } from "../../hooks/useAddReply";
import { useToggleLike } from "../../hooks/useToggleLike";
import { useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ThumbsUp, Send, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";

const DiscussionDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useDiscussion(id);
  const addReplyMutation = useAddReply(id);
  const toggleLikeMutation = useToggleLike(id);
  const [replyContent, setReplyContent] = useState("");

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load discussion</div>;

  const { discussion, replies } = data;

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addReplyMutation.mutate(replyContent, {
      onSuccess: () => setReplyContent(""),
    });
  };

  const handleLike = () => {
    toggleLikeMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/portal/discussions"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Discussions
      </Link>

      {/* Discussion post */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {discussion.title}
          </h1>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              discussion.user_liked
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ThumbsUp
              className={`w-4 h-4 ${discussion.user_liked ? "fill-blue-700" : ""}`}
            />
            {discussion.likes}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <span>{discussion.author}</span>
          <span>•</span>
          <span>{new Date(discussion.created_at).toLocaleString()}</span>
          {discussion.program && (
            <Badge variant="blue">{discussion.program}</Badge>
          )}
        </div>
        <p className="mt-4 text-gray-700 whitespace-pre-wrap">
          {discussion.content}
        </p>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Replies ({replies?.length || 0})
        </h2>

        {replies?.length === 0 ? (
          <p className="text-gray-500">
            No replies yet. Be the first to reply!
          </p>
        ) : (
          replies?.map((reply) => (
            <div
              key={reply.reply_id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-800">
                  {reply.full_name}
                </span>
                <span>•</span>
                <span>{new Date(reply.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-700">{reply.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Reply form */}
      <form
        onSubmit={handleReplySubmit}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write your reply..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={addReplyMutation.isLoading || !replyContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {addReplyMutation.isLoading ? (
              "Posting..."
            ) : (
              <>
                <Send className="w-4 h-4" /> Post Reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscussionDetail;
