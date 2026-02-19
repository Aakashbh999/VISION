import { useState } from "react";
import { useDiscussions } from "../../hooks/useDiscussions";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { MessageCircle, ThumbsUp, Filter, X } from "lucide-react";
import Badge from "../../components/ui/Badge";

const Discussions = () => {
  const [filters, setFilters] = useState({
    program: "",
    tag: "",
    answered: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: discussions, isLoading, error } = useDiscussions(filters);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load discussions</div>;

  // Hardcoded filter options (can be fetched from API later)
  const programs = ["CSIT", "BIT", "BCA"];
  const tags = ["Web", "AI", "DB", "Security", "Mobile", "Other"];

  const clearFilters = () => {
    setFilters({ program: "", tag: "", answered: "" });
  };

  const hasActiveFilters = filters.program || filters.tag || filters.answered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Discussions
          </h1>
          <p className="text-gray-600 mt-1">
            Ask questions, share knowledge, and learn together.
          </p>
        </div>
        <Link
          to="/portal/discussions/new"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 text-center"
        >
          + New Discussion
        </Link>
      </div>

      {/* Filter toggle (mobile) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <Filter className="w-4 h-4" />{" "}
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Clear filters
          </button>
        )}
      </div>

      {/* Filters panel */}
      <div
        className={`${showFilters ? "block" : "hidden lg:block"} bg-white rounded-xl border border-gray-200 p-4`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.program}
            onChange={(e) =>
              setFilters({ ...filters, program: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filters.answered}
            onChange={(e) =>
              setFilters({ ...filters, answered: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="true">Answered</option>
            <option value="false">Unanswered</option>
          </select>
        </div>
      </div>

      {/* Discussions list */}
      <div className="space-y-4">
        {discussions?.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No discussions yet. Be the first to start one!
          </p>
        ) : (
          discussions?.map((disc) => (
            <Link
              key={disc.discussion_id}
              to={`/portal/discussions/${disc.discussion_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {disc.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {disc.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>by {disc.author}</span>
                    <span>
                      {new Date(disc.created_at).toLocaleDateString()}
                    </span>
                    {disc.program && (
                      <Badge variant="blue">{disc.program}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" /> {disc.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />{" "}
                    {disc.reply_count || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Discussions;
