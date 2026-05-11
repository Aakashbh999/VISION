import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useMyPosts } from "../../../hooks/useDiscussionHooks";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DiscussionListItem from "../../../components/portal/DiscussionListItem";
import DeleteAction from "../../../components/DeleteAction";
import SimplePagination from "../../../components/ui/SimplePagination";
import EmptyState from "../../../components/ui/EmptyState";

const DiscussionsPanel = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyPosts(page, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 text-center font-bold">
        Failed to load your discussions. Please try again.
      </div>
    );
  }

  const discussions = data?.discussions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={MessageSquare}
              title="No Discussions Found"
              description="You haven't posted any discussions yet."
              actionText="Create Discussion"
              actionHref="/discussions/new"
            />
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

      {pagination.totalPages > 1 && (
        <div className="pt-4">
          <SimplePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default DiscussionsPanel;
