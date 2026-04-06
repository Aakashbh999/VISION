import { Link } from "react-router-dom";
import { MessageSquare, Search } from "lucide-react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DiscussionCard from "./DiscussionCard";

/**
 * Props:
 * - isLoading, error, data: query status payload
 * - filters: current filter values
 * - discussions: normalized discussions array
 * - user: authenticated user object
 * - loadingLike/loadingSave/downvotedPosts: mutation ui states
 * - onLike/onDownvote/onSave/onShare: interaction callbacks
 * - onImageClick: open lightbox callback
 */
const DiscussionsList = ({
  isLoading,
  error,
  data,
  filters,
  discussions,
  user,
  loadingLike,
  loadingSave,
  downvotedPosts,
  onLike,
  onDownvote,
  onSave,
  onShare,
  onImageClick,
}) => {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl shadow-sm">
        <LoadingSpinner />
        <p className="mt-4 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
          Loading conversations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-12 rounded-xl text-center font-bold text-rose-600">
        Failed to load discussions. Please try again.
      </div>
    );
  }

  if (data?.noResults) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] uppercase">
              No matches for "{filters.search}"
            </h3>
            <p className="text-sm font-bold text-[var(--text-muted)]">
              Try these trending discussions from your program:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.recommendations?.discussions?.map((recommendation) => (
            <Link
              key={recommendation.id}
              to={`/discussions/${recommendation.id}`}
              className="group flex items-start gap-4 p-5 bg-[var(--bg-active)] border border-transparent hover:border-purple-200 hover:bg-[var(--bg-card)] hover:shadow-lg rounded-xl transition-all"
            >
              <div className="p-3 bg-[var(--bg-card)] rounded-lg shadow-sm group-hover:bg-purple-50 transition-colors">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[var(--text-main)] group-hover:text-purple-600 transition-colors truncate">
                  {recommendation.title}
                </div>
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 flex items-center gap-2">
                  {recommendation.tags?.slice(0, 2).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                  <span>•</span>
                  <span>{recommendation.upvotes} UPVOTES</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {discussions.map((discussion) => (
        <DiscussionCard
          key={discussion.discussion_id}
          disc={discussion}
          user={user}
          handleLike={onLike}
          handleDownvote={onDownvote}
          handleSave={onSave}
          handleShare={onShare}
          loadingLike={loadingLike}
          loadingSave={loadingSave}
          downvotedPosts={downvotedPosts}
          onImageClick={onImageClick}
        />
      ))}

      {discussions.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-main)] border-x-0 sm:border-x rounded-xl p-10 sm:p-20 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[var(--bg-active)] rounded-full flex items-center justify-center text-[var(--text-muted)]">
              <Search className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase">
              No discussions found
            </h3>
            <p className="text-xs font-bold text-[var(--text-muted)]">
              Try adjusting your filters or search terms
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionsList;
