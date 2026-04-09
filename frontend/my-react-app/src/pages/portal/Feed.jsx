import { useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import { useFeed } from "../../hooks/useFeed";
import Pagination from "../../components/ui/Pagination";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const FEED_PAGE_SIZE = 12;

const formatAction = (actionType = "activity") =>
  actionType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getActionTone = (actionType = "") => {
  if (actionType.includes("boost")) {
    return "text-amber-600 bg-amber-500/10 border-amber-500/20";
  }
  if (actionType.includes("join") || actionType.includes("follow")) {
    return "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
  }
  if (actionType.includes("create") || actionType.includes("post")) {
    return "text-sky-600 bg-sky-500/10 border-sky-500/20";
  }
  return "text-purple-600 bg-purple-500/10 border-purple-500/20";
};

const Feed = () => {
  const [query, setQuery] = useState("");
  const [actionType, setActionType] = useState("all");
  const [page, setPage] = useState(1);

  const {
    data: feedPayload,
    isLoading,
    error,
  } = useFeed({
    limit: FEED_PAGE_SIZE,
    page,
    search: query,
    actionType,
  });

  const feed = useMemo(() => feedPayload?.data || [], [feedPayload]);
  const pagination = feedPayload?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  const actionTypes = useMemo(() => {
    if (feedPayload?.meta?.actionTypes?.length) {
      return feedPayload.meta.actionTypes;
    }
    const values = Array.from(
      new Set((feed || []).map((item) => item.action_type).filter(Boolean)),
    );
    return values;
  }, [feed, feedPayload]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handleTypeChange = (event) => {
    setActionType(event.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      <div className="bg-(--bg-card) rounded-sm sm:rounded-3xl border border-(--border-main) border-x-0 sm:border-x p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-(--text-main) tracking-tight leading-tight flex items-center gap-3">
              <Activity className="w-7 h-7 text-purple-600" /> Activity Feed
            </h1>
            <p className="text-(--text-muted) mt-2 text-sm sm:text-base">
              Recent actions from across your portal network.
            </p>
          </div>

          <div className="text-xs font-bold uppercase tracking-widest text-(--text-muted)">
            {pagination.total} entries
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-3 mt-6">
          <div className="relative">
            <Search className="w-4 h-4 text-(--text-muted) absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by actor or activity type..."
              className="w-full bg-(--bg-active) border border-(--border-main) rounded-xl pl-10 pr-4 py-3 text-sm text-(--text-main) placeholder:text-(--text-muted) outline-none focus:border-purple-400"
            />
          </div>

          <select
            value={actionType}
            onChange={handleTypeChange}
            className="w-full bg-(--bg-active) border border-(--border-main) rounded-xl px-4 py-3 text-sm text-(--text-main) outline-none focus:border-purple-400"
          >
            <option value="all">All Actions</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {formatAction(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-(--bg-card) rounded-sm sm:rounded-3xl border border-(--border-main) border-x-0 sm:border-x p-4 sm:p-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="py-14 text-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold">
            Failed to load activity feed.
          </div>
        ) : feed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-(--text-main) font-black text-lg">
              No activity matched your filter
            </p>
            <p className="text-(--text-muted) mt-2 text-sm">
              Try another action type or clear your search query.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((item) => (
              <div
                key={item.activity_id}
                className="rounded-2xl border border-(--border-main) bg-(--bg-active) p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-(--text-main) text-sm sm:text-base">
                      <span className="font-black">
                        {item.actor_name || "User"}
                      </span>{" "}
                      {formatAction(
                        item.action_type || "activity",
                      ).toLowerCase()}
                    </p>
                    {item.entity_title && (
                      <p className="text-xs text-(--text-muted) mt-1 truncate">
                        {item.entity_title}
                      </p>
                    )}
                    <div className="text-xs text-(--text-muted) mt-1">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${getActionTone(
                      item.action_type,
                    )}`}
                  >
                    {formatAction(item.action_type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
