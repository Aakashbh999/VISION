import { Link } from "react-router-dom";
import { BookmarkCheck, Filter, Plus } from "lucide-react";
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
    <div className="bg-transparent sm:bg-[var(--bg-card)] border-0 sm:border border-[var(--border-main)] border-x-0 sm:border-x rounded-none sm:rounded-xl p-0 sm:p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <UniversalSearch
            placeholder="Search VISION Discussions..."
            initialValue={filters.search}
            onSearch={(value) => onUpdateFilter("search", value)}
            isLoading={isLoading}
            className="flex-1 [&>input]:bg-white [&>input]:dark:bg-slate-900"
          />
          {user && (
            <Link
              to="/discussions/saved"
              className="sm:hidden shrink-0 flex items-center justify-center w-11 h-11 bg-white dark:bg-slate-900 text-[var(--text-main)] border border-[var(--border-main)] rounded-2xl shadow-sm hover:bg-[var(--bg-active)] transition-all"
              aria-label="Saved Discussions"
            >
              <BookmarkCheck className="w-5 h-5" />
            </Link>
          )}
          <Link
            to="/discussions/new"
            className="sm:hidden shrink-0 flex items-center justify-center w-11 h-11 bg-purple-600 text-white rounded-2xl shadow-md hover:bg-purple-700 transition-all"
            aria-label="Create Post"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>

        <div className="hidden sm:flex gap-2">
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t-0 sm:border-t border-[var(--border-main)] pt-0 sm:pt-3 gap-3 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <button
              onClick={onToggleFilters}
              className="flex items-center justify-center gap-1 text-xs font-bold text-[var(--text-main)] bg-[var(--bg-active)] hover:bg-[var(--bg-active)]/80 px-3 py-2 sm:py-1.5 rounded-lg border border-[var(--border-main)] shrink-0 transition-colors"
              aria-expanded={showFilters}
            >
              <Filter className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Filters</span>
            </button>

            <div className="flex-1 min-w-0 sm:max-w-[280px]">
              <AcademicProgramFilter
                value={filters.program}
                onChange={(event) =>
                  onUpdateFilter("program", event.target.value)
                }
                options={programs}
                placeholder="All Programs"
                className="text-xs py-2 sm:py-1.5 px-3 w-full rounded-lg bg-white dark:bg-slate-900 border-[var(--border-main)] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex bg-white dark:bg-slate-900 sm:bg-[var(--bg-active)] rounded-lg p-0.5 border border-[var(--border-main)] w-full sm:w-auto shrink-0 justify-center">
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
