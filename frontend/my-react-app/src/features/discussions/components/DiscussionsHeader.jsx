import { Link } from "react-router-dom";
import { BookmarkCheck, Filter } from "lucide-react";
import UniversalSearch from "../../../components/ui/UniversalSearch";
import ForYouBadge from "./ForYouBadge";
import { AcademicProgramFilter } from "../../../components/lib";

/**
 * Props:
 * - user: authenticated user object (or null)
 * - filters: current discussions filters
 * - programs: program options list
 * - isLoading: discussions loading state
 * - showFilters: filter panel toggle flag
 * - onToggleFilters: callback to toggle filters row
 * - onUpdateFilter: callback to update a specific filter
 */
const DiscussionsHeader = ({
  user,
  filters,
  programs,
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-[var(--border-main)] pt-3 gap-3 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <button
              onClick={onToggleFilters}
              className="flex items-center justify-center gap-1 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-active)] hover:bg-[var(--bg-active)]/80 px-3 py-2 sm:py-1.5 rounded-lg border border-[var(--border-main)] shrink-0 transition-colors"
              aria-expanded={showFilters}
            >
              <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
            </button>
            
            <div className="flex-1 min-w-0 sm:max-w-[280px]">
              <AcademicProgramFilter 
                value={filters.program}
                onChange={(event) => onUpdateFilter("program", event.target.value)}
                options={programs}
                placeholder="All Programs"
                className="text-xs py-2 sm:py-1.5 px-3 w-full rounded-lg bg-[var(--bg-card)] border-[var(--border-main)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex bg-[var(--bg-active)] rounded-lg p-0.5 border border-[var(--border-main)] w-full sm:w-auto shrink-0 justify-center">
            {["latest", "popular", "recommended"].map((s) => (
              <button
                key={s}
                onClick={() => onUpdateFilter("sort", s)}
                className={`px-4 sm:px-3 py-2 sm:py-1.5 text-xs font-bold rounded-md transition-colors flex-1 sm:flex-none flex items-center justify-center ${
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
