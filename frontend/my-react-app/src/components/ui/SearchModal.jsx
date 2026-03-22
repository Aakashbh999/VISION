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
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Command,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { getUniversalResults, SEARCH_CATEGORIES } from "../../services/search";

// Icon mapping for categories
const categoryIcons = {
  [SEARCH_CATEGORIES.ROADMAPS]: Map,
  [SEARCH_CATEGORIES.RESOURCES]: FileText,
  [SEARCH_CATEGORIES.GROUPS]: Users,
};

// Category order for consistent display
const categoryOrder = [
  SEARCH_CATEGORIES.ROADMAPS,
  SEARCH_CATEGORIES.RESOURCES,
  SEARCH_CATEGORIES.GROUPS,
];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Group results by category
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

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return categoryOrder.reduce((acc, category) => {
      if (groupedResults[category]) {
        return [...acc, ...groupedResults[category]];
      }
      return acc;
    }, []);
  }, [groupedResults]);

  // Search handler with debounce - also fetches recommendations on empty query
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

  // Auto-focus input when modal opens, fetch initial recommendations
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setIsRecommendation(false);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
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

  // Handle navigation to selected result
  const handleSelect = useCallback(
    (result) => {
      if (result?.path) {
        navigate(result.path);
        onClose();
      }
    },
    [navigate, onClose],
  );

  // Keyboard navigation
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

  // Render nothing if not open
  if (!isOpen) return null;

  // Track cumulative index for flat navigation
  let cumulativeIndex = 0;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl bg-bg-main rounded-xl shadow-2xl border border-border-main overflow-hidden transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-main">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search roadmaps, resources, groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-base text-text-main placeholder-text-muted/50 bg-transparent border-none outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-muted bg-sidebar-hover-bg rounded border border-border-main">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div
            ref={resultsRef}
            className="max-h-[50vh] overflow-y-auto overscroll-contain"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600" />
              </div>
            ) : query && flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Search className="w-10 h-10 mb-3 text-border-main" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-text-muted mt-1">
                  Try searching for something else
                </p>
              </div>
            ) : flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Command className="w-10 h-10 mb-3 text-border-main" />
                <p className="text-sm">Start typing to search</p>
                <p className="text-xs text-text-muted mt-1">
                  Search across roadmaps, resources, and groups
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Recommendations header */}
                {isRecommendation && !query.trim() && (
                  <div className="px-4 py-2 flex items-center gap-2 border-b border-border-main mb-2">
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
                      {/* Category Header */}
                      <div className="px-4 py-2 flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          {category}
                        </span>
                        <span className="text-xs text-text-muted/60">
                          ({categoryResults.length})
                        </span>
                      </div>

                      {/* Category Results */}
                      {categoryResults.map((result, idx) => {
                        const flatIndex = startIndex + idx;
                        const isSelected = selectedIndex === flatIndex;

                        // Update cumulative index for next category
                        if (idx === categoryResults.length - 1) {
                          cumulativeIndex = flatIndex + 1;
                        }

                        return (
                          <button
                            key={result.id}
                            data-index={flatIndex}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            className={`w-full px-4 py-2.5 flex items-start gap-3 text-left transition-colors ${
                              isSelected
                                ? "bg-bg-active border-l-2 border-purple-500"
                                : "border-l-2 border-transparent hover:bg-bg-active"
                            }`}
                          >
                            <div
                              className={`mt-0.5 p-1.5 rounded-lg ${
                                isSelected
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    isSelected
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-text-main"
                                  }`}
                                >
                                  {result.title}
                                </p>
                                {/* Badges */}
                                <div className="flex items-center gap-1.5 shrink-0">
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
                              {result.description && (
                                <p className="text-xs text-text-muted truncate mt-0.5">
                                  {result.description}
                                </p>
                              )}
                              {/* Tags for resources */}
                              {result.tags && result.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {result.tags.slice(0, 3).map((tag, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 text-[10px] text-text-muted bg-sidebar-hover-bg rounded"
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

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-bg-main border-t border-border-main text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-bg-card border border-border-main rounded text-[10px] font-medium">
                  <ArrowUp className="w-3 h-3" />
                </kbd>
                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-bg-card border border-border-main rounded text-[10px] font-medium">
                  <ArrowDown className="w-3 h-3" />
                </kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center px-1.5 h-5 bg-bg-card border border-border-main rounded text-[10px] font-medium">
                  Enter
                </kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center px-1.5 h-5 bg-bg-card border border-border-main rounded text-[10px] font-medium">
                  Esc
                </kbd>
                <span>to close</span>
              </span>
            </div>
            <span className="text-text-muted/60">
              Powered by{" "}
              <span className="font-medium text-purple-600">VISION</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
};

// Hook for global keyboard shortcut
export const useSearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export default SearchModal;
