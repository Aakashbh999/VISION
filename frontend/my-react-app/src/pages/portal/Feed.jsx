import { useState, useEffect, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useFeed } from "../../hooks/useFeed";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import FeedTabs from "./components/FeedTabs";
import SocialFeedCard from "./components/SocialFeedCard";
import PrimaryPortalTabs from "../../components/portal/Dashboard/PrimaryPortalTabs";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";

const FEED_PAGE_SIZE = 20;

const Feed = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [allFeedItems, setAllFeedItems] = useState([]);

  const loadMoreRef = useRef(null);

  const {
    data: feedPayload,
    isLoading,
    isFetching,
    error,
  } = useFeed({
    limit: FEED_PAGE_SIZE,
    page,
    search: query,
    tab: activeTab,
  });

  const pagination = useMemo(
    () =>
      feedPayload?.pagination || {
        page: 1,
        totalPages: 1,
        total: 0,
      },
    [feedPayload],
  );

  // Sync feed payload with accumulated list
  useEffect(() => {
    if (feedPayload?.data) {
      if (page === 1) {
        setAllFeedItems(feedPayload.data);
      } else {
        // Prevent duplicates if react-query refetches or logic double-triggers
        setAllFeedItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.activity_id));
          const newItems = feedPayload.data.filter(
            (i) => !existingIds.has(i.activity_id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [feedPayload, page]);

  // Handle Tab/Search Reset
  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
    // State will be reset by the useEffect above when feedPayload for page 1 arrives
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    // Explicitly clear to prevent jumpy UI during load
    setAllFeedItems([]);
  };

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetching &&
          pagination.totalPages > pagination.page
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isFetching, pagination]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-(--bg-main) text-(--text-main)">
      <PrimaryPortalTabs activeTab="feed" />

      {/* Header & Tabs Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight flex items-center gap-3">
              Feed
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1.5 text-sm sm:text-base font-medium">
              Discover what's trending and relevant across your network.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search Feed..."
                className="w-full bg-(--bg-card) border border-(--border-main) rounded-2xl pl-10 pr-4 py-2.5 text-sm text-(--text-main) placeholder:text-(--text-muted) outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "primary" : "outline"}
              size="sm"
              className="px-3 py-2.5"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Feed Content */}
      <div className="space-y-6 min-h-[60vh]">
        {isLoading && page === 1 ? (
          <SurfaceCard className="py-20 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
          </SurfaceCard>
        ) : error ? (
          <ErrorState
            title="Feed sync failed"
            description="We could not load your feed. Please try again."
            onRetry={() => window.location.reload()}
            className="rounded-3xl"
          />
        ) : allFeedItems.length === 0 && !isLoading ? (
          <SurfaceCard className="py-12">
            <EmptyState
              icon={Search}
              title="No Feed Results"
              description={`No activities found in ${activeTab.replace("-", " ")}.`}
            />
          </SurfaceCard>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {allFeedItems.map((item, index) => (
              <SocialFeedCard
                key={`${item.activity_id}-${index}`}
                item={item}
              />
            ))}
          </div>
        )}

        {/* Load More Sentinel / Manual Trigger */}
        {(pagination.totalPages > pagination.page || isFetching) && (
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
                Load More Contents
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
