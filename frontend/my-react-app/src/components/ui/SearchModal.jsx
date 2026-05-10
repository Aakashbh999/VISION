import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Map,
  FileText,
  Users,
  Building2,
  User,
  MessageSquare,
  Lock,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Command,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { getUniversalResults, SEARCH_CATEGORIES } from "../../services/search";

const categoryIcons = {
  [SEARCH_CATEGORIES.ROADMAPS]: Map,
  [SEARCH_CATEGORIES.RESOURCES]: FileText,
  [SEARCH_CATEGORIES.GROUPS]: Users,
  [SEARCH_CATEGORIES.CLUBS]: Building2,
  [SEARCH_CATEGORIES.DISCUSSIONS]: MessageSquare,
  [SEARCH_CATEGORIES.USERS]: User,
};

const categoryOrder = [
  SEARCH_CATEGORIES.ROADMAPS,
  SEARCH_CATEGORIES.RESOURCES,
  SEARCH_CATEGORIES.GROUPS,
  SEARCH_CATEGORIES.CLUBS,
  SEARCH_CATEGORIES.DISCUSSIONS,
  SEARCH_CATEGORIES.USERS,
];

const getUserInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedAvatarIds, setFailedAvatarIds] = useState(() => new Set());
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  const groupedResults = useMemo(() => {
    const grouped = {};
    categoryOrder.forEach((category) => {
      const categoryResults = results.filter((r) => r.category === category);
      if (categoryResults.length > 0) {
        grouped[category] = categoryResults;
      }
    });
    return grouped;
  }, [results]);

  const flatResults = useMemo(() => {
    return categoryOrder.reduce((acc, category) => {
      if (groupedResults[category]) {
        return [...acc, ...groupedResults[category]];
      }
      return acc;
    }, []);
  }, [groupedResults]);

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        setIsLoading(true);
        try {
          const response = await getUniversalResults(query);
          setResults(response.results || []);
          setIsRecommendation(response.isRecommendation || false);
          setSelectedIndex(0);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
          setIsRecommendation(false);
        } finally {
          setIsLoading(false);
        }
      },
      query.trim() ? 200 : 50,
    );
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setIsRecommendation(false);
      setSelectedIndex(0);
      setFailedAvatarIds(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    if (resultsRef.current && flatResults.length > 0) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex, flatResults.length]);

  const handleSelect = useCallback(
    (result) => {
      if (result?.path) {
        navigate(result.path);
        onClose();
      }
    },
    [navigate, onClose],
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [flatResults, selectedIndex, handleSelect, onClose],
  );

  if (!isOpen) return null;

  let cumulativeIndex = 0;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl bg-[var(--bg-main)] rounded-xl shadow-2xl border border-[var(--border-main)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-main)]">
            <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search roadmaps, resources, groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 bg-transparent border-none outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded hover:bg-[var(--bg-active)] transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-active)] rounded border border-[var(--border-main)]">
              ESC
            </kbd>
          </div>

          <div
            ref={resultsRef}
            className="max-h-[50vh] overflow-y-auto overscroll-contain"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600" />
              </div>
            ) : query && flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                <Search className="w-10 h-10 mb-3 text-[var(--border-main)]" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Try searching for something else
                </p>
              </div>
            ) : flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                <Command className="w-10 h-10 mb-3 text-[var(--border-main)]" />
                <p className="text-sm">Start typing to search</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Search across roadmaps, resources, groups, clubs, discussions,
                  and users
                </p>
              </div>
            ) : (
              <div className="py-2">
                {isRecommendation && !query.trim() && (
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-[var(--border-main)] mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-500">
                      Recommended for you
                    </span>
                  </div>
                )}

                {categoryOrder.map((category) => {
                  const categoryResults = groupedResults[category];
                  if (!categoryResults || categoryResults.length === 0)
                    return null;

                  const CategoryIcon = categoryIcons[category] || FileText;
                  const startIndex = cumulativeIndex;

                  return (
                    <div key={category} className="mb-2">
                      <div className="px-4 py-2 flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {category}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]/60">
                          ({categoryResults.length})
                        </span>
                      </div>

                      {categoryResults.map((result, idx) => {
                        const flatIndex = startIndex + idx;
                        const isSelected = selectedIndex === flatIndex;
                        const userAvatarSrc =
                          result.profilePicture || result.profile_picture || "";
                        const showUserAvatar =
                          result.category === SEARCH_CATEGORIES.USERS &&
                          !!userAvatarSrc &&
                          !failedAvatarIds.has(result.id);

                        if (idx === categoryResults.length - 1) {
                          cumulativeIndex = flatIndex + 1;
                        }

                        return (
                          <button
                            type="button"
                            key={result.id}
                            data-index={flatIndex}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={`w-full px-4 py-2.5 flex items-start gap-3 text-left cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[var(--bg-active)] border-l-2 border-purple-500"
                                : "border-l-2 border-transparent hover:bg-[var(--bg-active)]"
                            }`}
                          >
                            {result.category === SEARCH_CATEGORIES.USERS ? (
                              <div className="mt-0.5 shrink-0">
                                {showUserAvatar ? (
                                  <img
                                    src={userAvatarSrc}
                                    alt={result.title}
                                    className="w-8 h-8 rounded-full object-cover border border-[var(--border-main)]"
                                    onError={() => {
                                      setFailedAvatarIds((prev) => {
                                        const next = new Set(prev);
                                        next.add(result.id);
                                        return next;
                                      });
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px] font-semibold border border-purple-200">
                                    {getUserInitials(result.title)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                className={`mt-0.5 p-1.5 rounded-lg ${
                                  isSelected
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-[var(--bg-active)] text-[var(--text-muted)]"
                                }`}
                              >
                                <CategoryIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    isSelected
                                      ? "text-purple-600"
                                      : "text-[var(--text-main)]"
                                  }`}
                                >
                                  {result.title}
                                </p>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {result.category ===
                                    SEARCH_CATEGORIES.GROUPS &&
                                    result.privacy_type === "private" && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 bg-rose-100 rounded">
                                        <Lock className="w-2.5 h-2.5" />
                                        Private
                                      </span>
                                    )}
                                  {result.isTrending && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 bg-orange-100 rounded">
                                      <TrendingUp className="w-3 h-3" />
                                      Trending
                                    </span>
                                  )}
                                  {result.avgScore > 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 bg-amber-100 rounded">
                                      <Star className="w-3 h-3" />
                                      {Number(result.avgScore).toFixed(1)}
                                    </span>
                                  )}
                                  {result.reason && !result.isTrending && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium text-purple-600 bg-purple-100 rounded">
                                      {result.reason}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {result.category ===
                                SEARCH_CATEGORIES.DISCUSSIONS &&
                              result.author ? (
                                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                  by {result.author}
                                </p>
                              ) : result.category === SEARCH_CATEGORIES.USERS &&
                                result.role ? (
                                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                  {result.role === "admin"
                                    ? "Admin"
                                    : result.description}
                                </p>
                              ) : result.description ? (
                                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                  {result.description}
                                </p>
                              ) : null}
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.tags.slice(0, 3).map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] bg-[var(--bg-active)] rounded"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-purple-500">
                                <CornerDownLeft className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export const useSearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    const handleOpenSearch = () => {
      setIsOpen(true);
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("vision:open-universal-search", handleOpenSearch);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(
        "vision:open-universal-search",
        handleOpenSearch,
      );
    };
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export default SearchModal;
