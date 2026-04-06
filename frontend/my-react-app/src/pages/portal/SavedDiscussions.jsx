import { useState } from "react";
import { useSavedDiscussions } from "../../hooks/useDiscussionHooks";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import { MessageCircle, ThumbsUp, ChevronLeft, Bookmark } from "lucide-react";

const SavedDiscussions = () => {
  const [page, setPage] = useState(1);
  const [loadingUnsave, setLoadingUnsave] = useState(null);
  const { data, isLoading, error, refetch } = useSavedDiscussions(page, 20);

  const handleUnsave = async (discussionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingUnsave(discussionId);
    try {
      const { toggleSave } = await import("../../services/discussion");
      await toggleSave(discussionId);
      refetch();
    } catch (error) {
      console.error("Failed to unsave:", error);
    } finally {
      setLoadingUnsave(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500">Failed to load saved discussions</div>
    );

  const discussions = data?.discussions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6 px-0 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/discussions"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-purple-600"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
          <Bookmark className="w-6 h-6 inline mr-2" />
          Saved Discussions
        </h1>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x">
            <Bookmark className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
            <p className="text-[var(--text-muted)]">
              No saved discussions yet.
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Save discussions to read them later!
            </p>
            <Link
              to="/discussions"
              className="mt-4 inline-block text-purple-600 hover:text-purple-800"
            >
              Browse discussions
            </Link>
          </div>
        ) : (
          discussions.map((disc) => (
            <Link
              key={disc.discussion_id}
              to={`/discussions/${disc.discussion_id}`}
              className="block bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-[var(--text-main)] mb-1">
                    {disc.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mb-2 line-clamp-2">
                    {disc.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>by {disc.author}</span>
                    <span>•</span>
                    <span>
                      {new Date(disc.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="text-yellow-600">
                      Saved {new Date(disc.saved_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> {disc.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />{" "}
                      {disc.comment_count || 0}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleUnsave(disc.discussion_id, e)}
                    disabled={loadingUnsave === disc.discussion_id}
                    className={`p-1.5 text-yellow-500 hover:text-gray-500 rounded transition-all ${
                      loadingUnsave === disc.discussion_id
                        ? "opacity-50 cursor-wait"
                        : ""
                    }`}
                    title="Remove from saved"
                  >
                    {loadingUnsave === disc.discussion_id ? (
                      <ButtonLoader size={20} />
                    ) : (
                      <Bookmark className="w-5 h-5 fill-yellow-500" />
                    )}
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="px-4 py-2 border border-[var(--border-main)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-active)] transition-colors text-[var(--text-main)]"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-[var(--text-muted)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 border border-[var(--border-main)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-active)] transition-colors text-[var(--text-main)]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedDiscussions;
