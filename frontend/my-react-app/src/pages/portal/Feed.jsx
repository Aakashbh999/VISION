import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useFeed } from "../../hooks/useFeed";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import FeedTabs from "./components/FeedTabs";
import SocialFeedCard from "./components/SocialFeedCard";
import PrimaryPortalTabs from "../../components/portal/Dashboard/PrimaryPortalTabs";

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

  const pagination = feedPayload?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
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
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search Feed..."
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-all ${showFilters ? "bg-indigo-600 border-indigo-600 text-white" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-500"}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Feed Content */}
      <div className="space-y-6 min-h-[60vh]">
        {isLoading && page === 1 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 animate-pulse">
              Curating your feed...
            </p>
          </div>
        ) : error ? (
          <div className="py-14 text-center rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold">
            Failed to sync with the Feed. Please try again.
          </div>
        ) : allFeedItems.length === 0 && !isLoading ? (
          <div className="py-24 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 border-dashed rounded-3xl">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500 dark:text-slate-300" />
            </div>
            <p className="text-gray-900 dark:text-white font-black text-xl">
              Orbit looks empty here
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm max-w-xs mx-auto">
              We couldn't find any activities in the{" "}
              <b>{activeTab.replace("-", " ")}</b> section that match your
              orbit.
            </p>
          </div>
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
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                  Loading more...
                </span>
              </div>
            ) : (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-8 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-black text-indigo-600 dark:text-sky-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
              >
                Load More Contents
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
