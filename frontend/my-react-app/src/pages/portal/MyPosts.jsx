import { useState } from "react";
import { useMyPosts } from "../../hooks/useDiscussionHooks";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DeleteAction from "../../components/DeleteAction";
import {
  MessageCircle,
  ThumbsUp,
  ChevronLeft,
  Edit,
  Clock,
} from "lucide-react";
import Badge from "../../components/ui/Badge";

const MyPosts = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyPosts(page, 20);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load your posts</div>;

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
          My Posts
        </h1>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-card)] rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x">
            <p className="text-[var(--text-muted)]">
              You haven't posted any discussions yet.
            </p>
            <Link
              to="/discussions/new"
              className="mt-4 inline-block text-purple-600 hover:text-purple-800"
            >
              Create your first discussion!
            </Link>
          </div>
        ) : (
          discussions.map((disc) => (
            <div
              key={disc.discussion_id}
              className="relative block bg-[var(--bg-card)] rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/discussions/${disc.discussion_id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-[var(--text-main)] mb-1">
                    {disc.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mb-2 line-clamp-2">
                    {disc.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>
                      {new Date(disc.created_at).toLocaleDateString()}
                    </span>
                    {disc.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag.tag_id} variant="purple">
                        {tag.name}
                      </Badge>
                    ))}
                    {disc.can_edit && (
                      <Badge
                        variant="green"
                        className="flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" /> Editable
                      </Badge>
                    )}
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

                  {/* ACTION BUTTONS WRAPPER */}
                  <div
                    className="flex items-center gap-2 mt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {disc.can_edit && (
                      <Link
                        to={`/discussions/${disc.discussion_id}/edit`}
                        className="p-1.5 text-[var(--text-muted)] hover:text-purple-600 rounded bg-[var(--bg-active)] hover:bg-purple-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    <DeleteAction
                      targetType="discussion"
                      targetId={disc.discussion_id}
                      itemName={disc.title}
                      buttonClassName="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded bg-[var(--bg-active)] hover:bg-red-50 transition-colors"
                      iconClassName="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
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

export default MyPosts;
