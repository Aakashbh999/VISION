import { Link } from "react-router-dom";
import { BookmarkCheck, Filter } from "lucide-react";
import UniversalSearch from "../../../components/ui/UniversalSearch";
import ForYouBadge from "./ForYouBadge";

/**
 * Props:
 * - user: authenticated user object (or null)
 * - filters: current discussions filters
 * - degrees: degree options list
 * - isLoading: discussions loading state
 * - showFilters: filter panel toggle flag
 * - onToggleFilters: callback to toggle filters row
 * - onUpdateFilter: callback to update a specific filter
 */
const DiscussionsHeader = ({
  user,
  filters,
  degrees,
  isLoading,
  showFilters,
  onToggleFilters,
  onUpdateFilter,
}) => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-md p-3 sm:p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <UniversalSearch
          placeholder="Search VISION Discussions..."
          initialValue={filters.search}
          onSearch={(value) => onUpdateFilter("search", value)}
          isLoading={isLoading}
          className="flex-1"
        />
        <div className="flex gap-2">
          {user && (
            <Link
              to="/discussions/saved"
              className="px-4 py-2 border border-[var(--border-main)] text-[var(--text-main)] text-sm font-bold rounded-full hover:bg-[var(--bg-active)] transition-colors text-center flex items-center gap-1"
            >
              <BookmarkCheck className="w-4 h-4" /> Saved
            </Link>
          )}
          <Link
            to="/discussions/new"
            className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-full hover:bg-purple-700 transition-colors text-center"
          >
            Create Post
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-[var(--border-main)] pt-3 gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-active)] px-2 py-1 rounded"
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <select
            value={filters.degree}
            onChange={(event) => onUpdateFilter("degree", event.target.value)}
            className="text-xs font-bold text-[var(--text-muted)] bg-transparent cursor-pointer border border-[var(--border-main)] rounded px-2 py-1 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Degrees</option>
            {degrees.map((degree) => (
              <option key={degree.id} value={degree.id}>
                {degree.name}
              </option>
            ))}
          </select>
          <div className="flex bg-[var(--bg-active)] rounded-lg p-0.5 border border-[var(--border-main)] sm:ml-auto">
            {["latest", "popular", "recommended"].map((s) => (
              <button
                key={s}
                onClick={() => onUpdateFilter("sort", s)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  (!filters.sort && s === "latest") || filters.sort === s
                    ? "bg-[var(--bg-card)] text-purple-600 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {s === "latest" ? (
                  "New"
                ) : s === "popular" ? (
                  "Top"
                ) : (
                  <ForYouBadge className="scale-75 -mx-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionsHeader;
