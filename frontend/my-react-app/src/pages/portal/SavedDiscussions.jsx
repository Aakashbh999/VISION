import { useState } from "react";
import { useSavedDiscussions } from "../../hooks/useDiscussionHooks";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import { ChevronLeft, Bookmark } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSave } from "../../services/discussion";
import { toast } from "react-toastify";
import SimplePagination from "../../components/ui/SimplePagination";
import DiscussionListItem from "../../components/portal/DiscussionListItem";

const SavedDiscussions = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSavedDiscussions(page, 20);
  const queryClient = useQueryClient();

  const unsaveMutation = useMutation({
    mutationFn: (discussionId) => toggleSave(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-discussions"] });
      toast.success("Removed from saved");
    },
    onError: () => toast.error("Failed to remove from saved"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500">Failed to load saved discussions</div>
    );

  const discussions = data?.discussions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
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
            <p className="text-[var(--text-muted)]">No saved discussions yet.</p>
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
            <DiscussionListItem
              key={disc.discussion_id}
              discussion={disc}
              linkWrapper={true}
              to={`/discussions/${disc.discussion_id}`}
              meta={
                <span className="text-yellow-600">
                  Saved {new Date(disc.saved_at).toLocaleDateString()}
                </span>
              }
              actions={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unsaveMutation.mutate(disc.discussion_id);
                  }}
                  disabled={unsaveMutation.isPending}
                  className="p-1.5 text-yellow-500 hover:text-gray-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove from saved"
                >
                  {unsaveMutation.isPending ? (
                    <ButtonLoader size={20} />
                  ) : (
                    <Bookmark className="w-5 h-5 fill-yellow-500 pointer-events-none" />
                  )}
                </button>
              }
            />
          ))
        )}
      </div>

      <SimplePagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default SavedDiscussions;
