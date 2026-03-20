import { useState, useCallback } from "react";
import { useMyPosts } from "../../hooks/useDiscussionHooks";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DeleteAction from "../../components/DeleteAction";
import {
  MessageCircle,
  ThumbsUp,
  ChevronLeft,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import Badge from "../../components/ui/Badge";

const MyPosts = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyPosts(page, 20);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load your posts</div>;

  const discussions = data?.discussions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/discussions"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
      </div>

      {/* Posts list */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              You haven't posted any discussions yet.
            </p>
            <Link
              to="/discussions/new"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Create your first discussion!
            </Link>
          </div>
        ) : (
          discussions.map((disc) => (
            <Link
              key={disc.discussion_id}
              to={`/discussions/${disc.discussion_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {disc.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {disc.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>
                      {new Date(disc.created_at).toLocaleDateString()}
                    </span>
                    {disc.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag.tag_id} variant="blue">
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
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> {disc.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />{" "}
                      {disc.comment_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {disc.can_edit && (
                      <Link
                        to={`/discussions/${disc.discussion_id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    <DeleteAction
                      targetType="discussion"
                      targetId={disc.discussion_id}
                      itemName={disc.title}
                      buttonClassName="p-1.5 text-gray-500 hover:text-red-600 rounded"
                      iconClassName="w-4 h-4"
                    />
                  </div>
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
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
