import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search } from "lucide-react";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DiscussionCard from "./DiscussionCard";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";

/**
 * Props:
 * - isLoading, error, data: query status payload
 * - filters: current filter values
 * - discussions: normalized discussions array
 * - user: authenticated user object
 * - loadingLike/loadingSave: mutation ui states
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
  onLike,
  onDownvote,
  onSave,
  onShare,
  onImageClick,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close all menus on scroll or outside clicks
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // If the click is not on a menu button, close all menus
      if (!e.target.closest('[data-menu-button="true"]')) {
        setOpenMenuId(null);
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);
  if (isLoading) {
    return (
      <SurfaceCard className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
          Loading conversations...
        </p>
      </SurfaceCard>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Discussions unavailable"
        description="Failed to load discussions. Try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (data?.noResults) {
    return (
      <SurfaceCard className="p-6 sm:p-10 space-y-8">
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
            <SurfaceCard
              key={recommendation.id}
              as={Link}
              to={`/discussions/${recommendation.id}`}
              variant="interactive"
              className="group flex items-start gap-4 p-5 bg-(--bg-active) rounded-2xl"
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
            </SurfaceCard>
          ))}
        </div>
      </SurfaceCard>
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
          onImageClick={onImageClick}
          isMenuOpen={openMenuId === discussion.discussion_id}
          onToggleMenu={() => 
            setOpenMenuId(prev => prev === discussion.discussion_id ? null : discussion.discussion_id)
          }
        />
      ))}

      {discussions.length === 0 && (
        <SurfaceCard className="border-dashed p-10 sm:p-20">
          <EmptyState
            icon={Search}
            title="No Discussions Found"
            description="Try adjusting your filters or search terms."
          />
        </SurfaceCard>
      )}
    </>
  );
};

export default DiscussionsList;
