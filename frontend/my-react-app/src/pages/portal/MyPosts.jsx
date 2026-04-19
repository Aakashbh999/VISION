import { useState } from "react";
import { useMyPosts } from "../../hooks/useDiscussionHooks";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import DeleteAction from "../../components/DeleteAction";
import { ChevronLeft } from "lucide-react";
import SimplePagination from "../../components/ui/SimplePagination";
import DiscussionListItem from "../../components/portal/DiscussionListItem";

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
            <DiscussionListItem
              key={disc.discussion_id}
              discussion={disc}
              actions={
                <DeleteAction
                  targetType="discussion"
                  targetId={disc.discussion_id}
                  itemName={disc.title}
                  buttonClassName="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded bg-[var(--bg-card)] hover:bg-red-50 transition-colors"
                  label={<span>Delete</span>}
                />
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

export default MyPosts;
