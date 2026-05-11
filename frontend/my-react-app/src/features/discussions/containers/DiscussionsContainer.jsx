import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useDiscussions } from "../../../hooks/useDiscussionHooks";
import ImageLightbox from "../../../components/modals/ImageLightbox";
import DiscussionsHeader from "../components/DiscussionsHeader";
import DiscussionsList from "../components/DiscussionsList";
import { useDiscussionFilters } from "../hooks/useDiscussionFilters";
import { useDiscussionActions } from "../hooks/useDiscussionActions";
import { useDiscussionReferenceData } from "../hooks/useDiscussionReferenceData";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";

const DiscussionsContainer = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    image: null,
    title: "",
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { filters, updateFilter } = useDiscussionFilters();
  const { programs } = useDiscussionReferenceData();

  const DISCUSSIONS_PAGE_SIZE = 30;
  const [page, setPage] = useState(filters.page || 1);
  const [allDiscussions, setAllDiscussions] = useState([]);
  const loadMoreRef = useRef(null);

  const { data, isLoading, isFetching, error } = useDiscussions({
    ...filters,
    page,
    limit: DISCUSSIONS_PAGE_SIZE,
  });
  const {
    loadingLike,
    loadingSave,
    handleLike,
    handleDownvote,
    handleSave,
    handleShare,
  } = useDiscussionActions({ user, queryClient });

  const openLightbox = (image, title) => {
    setLightbox({ isOpen: true, image, title });
  };

  const discussions = data?.discussions || [];

  // Reset local paging when filters change (search, tag, specialization, program, sort or page reset)
  useEffect(() => {
    setPage(filters.page || 1);
    setAllDiscussions([]);
  }, [
    filters.search,
    filters.tag,
    filters.specialization,
    filters.program,
    filters.sort,
    filters.page,
  ]);

  // Accumulate paginated discussion results
  useEffect(() => {
    if (data?.discussions) {
      if (page === 1) {
        setAllDiscussions(data.discussions);
      } else {
        setAllDiscussions((prev) => {
          const existing = new Set(prev.map((d) => d.discussion_id));
          const newItems = data.discussions.filter(
            (d) => !existing.has(d.discussion_id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  // Reset when filters change
  const handleFilterUpdate = (key, value) => {
    updateFilter(key, value);
  };

  const hasNextPage = data?.meta?.hasNextPage;

  // Infinite scroll observer
  useEffect(() => {
    if (!hasNextPage || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasNextPage) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [isFetching, hasNextPage, page]);

  return (
    <div className="max-w-[824px] lg:max-w-[980px] xl:max-w-[1120px] mx-auto space-y-4 px-0 sm:px-6 lg:px-8 pb-5 sm:pb-8 lg:pb-10">
      <ImageLightbox
        isOpen={lightbox.isOpen}
        image={lightbox.image}
        title={lightbox.title}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
      />

      <DiscussionsHeader
        user={user}
        filters={filters}
        programs={programs}
        isLoading={isLoading}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onUpdateFilter={handleFilterUpdate}
      />

      <div 
        key={JSON.stringify(filters)}
        className="space-y-4 min-h-[400px] px-0 sm:px-0"
      >
        <DiscussionsList
          isLoading={isLoading && page === 1}
          error={error}
          data={data}
          filters={filters}
          discussions={allDiscussions}
          user={user}
          loadingLike={loadingLike}
          loadingSave={loadingSave}
          onLike={handleLike}
          onDownvote={handleDownvote}
          onSave={handleSave}
          onShare={handleShare}
          onImageClick={openLightbox}
        />

        {!isLoading && allDiscussions.length === 0 && (
          <div className="flex flex-col items-center py-20 bg-[var(--bg-card)] rounded-3xl border-2 border-dashed border-[var(--border-main)]">
            <p className="text-[var(--text-muted)] font-bold mb-6 text-lg">No discussions found for these filters.</p>
            <Button onClick={() => handleFilterUpdate('search', '')} variant="outline">
              Clear Search & Filters
            </Button>
          </div>
        )}

        {hasNextPage && (
          <div
            ref={loadMoreRef}
            className="pt-12 pb-24 flex flex-col items-center gap-4"
          >
            {isFetching ? (
              <LoadingSpinner size="sm" inline />
            ) : (
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                variant="outline"
                size="md"
                className="px-8"
              >
                Load More Discussions
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionsContainer;
