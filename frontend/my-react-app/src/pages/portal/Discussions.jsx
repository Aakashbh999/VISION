import { useState, useEffect, useCallback } from "react";
import { useDiscussions } from "../../hooks/useDiscussions";
import { useDiscussionTags } from "../../hooks/useDiscussionFilters";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, toggleSave } from "../../services/discussion";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  Search,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import api from "../../services/api";

const Discussions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    specialization: searchParams.get("specialization") || "",
    degree: searchParams.get("degree") || "",
    tag: searchParams.get("tag") || "",
    sort: searchParams.get("sort") || "latest",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page")) || 1,
  });

  const [specializations, setSpecializations] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const { data: tags } = useDiscussionTags();
  const { data, isLoading, error } = useDiscussions(filters);

  // Debounce search input - only update filters after 500ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: toggleSave,
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
  });

  const handleLike = (e, discId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please login to like discussions");
    likeMutation.mutate(discId);
  };

  const handleSave = (e, discId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please login to save discussions");
    saveMutation.mutate(discId);
  };

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [specsRes, degreesRes] = await Promise.all([
          api.get("/discussions/specializations"),
          api.get("/discussions/degrees"),
        ]);
        setSpecializations(specsRes.data || []);
        setDegrees(degreesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "latest" && value !== 1) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleShare = (e, discId) => {
    e.preventDefault();
    const url = `${window.location.origin}/portal/discussions/${discId}`;
    navigator.clipboard.writeText(url);
    // Add toast notification here if available
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500 text-center">
        Failed to load discussions
      </div>
    );

  const discussions = data?.discussions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search VISION Discussions"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            {user && (
              <Link
                to="/portal/discussions/saved"
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-50 transition-colors text-center flex items-center gap-1"
              >
                <BookmarkCheck className="w-4 h-4" /> Saved
              </Link>
            )}
            <Link
              to="/portal/discussions/new"
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-colors text-center"
            >
              Create Post
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:bg-gray-100 px-2 py-1 rounded"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="text-xs font-bold text-gray-500 bg-transparent cursor-pointer focus:outline-none"
            >
              <option value="latest">New</option>
              <option value="popular">Top</option>
              <option value="trending">Hot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-3">
        {discussions.map((disc) => (
          <div
            key={disc.discussion_id}
            className="flex bg-white border border-gray-200 rounded-md hover:border-gray-400 transition-colors overflow-hidden group"
          >
            {/* Voting Rail */}
            <div className="w-10 bg-gray-50 flex flex-col items-center py-2 gap-1">
              <button
                onClick={(e) => handleLike(e, disc.discussion_id)}
                className={`hover:bg-gray-200 p-1 rounded ${disc.user_liked ? "text-orange-600" : "text-gray-500"}`}
              >
                <ArrowBigUp
                  className={`w-6 h-6 ${disc.user_liked ? "fill-orange-600" : ""}`}
                />
              </button>
              <span className="text-xs font-bold">{disc.like_count || 0}</span>
              <button className="hover:bg-gray-200 p-1 rounded text-gray-500">
                <ArrowBigDown className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                <span className="font-bold text-gray-900 hover:underline">
                  v/
                  {disc.specialization_name
                    ?.replace(/\s+/g, "")
                    .toLowerCase() || "general"}
                </span>
                <span>• Posted by u/{disc.author}</span>
                <span>• {new Date(disc.created_at).toLocaleDateString()}</span>
              </div>

              <Link
                to={`/portal/discussions/${disc.discussion_id}`}
                className="block"
              >
                <h2 className="text-lg font-medium text-gray-900 leading-tight mb-2 group-hover:text-blue-600">
                  {disc.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 leading-normal">
                  {disc.content}
                </p>
              </Link>

              {/* Action Bar */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/portal/discussions/${disc.discussion_id}`}
                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded text-xs font-bold text-gray-500"
                >
                  <MessageSquare className="w-4 h-4" />
                  {disc.comment_count || 0} Comments
                </Link>
                <button
                  onClick={(e) => handleShare(e, disc.discussion_id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded text-xs font-bold text-gray-500"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  onClick={(e) => handleSave(e, disc.discussion_id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded text-xs font-bold ${disc.user_saved ? "text-yellow-600" : "text-gray-500"}`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${disc.user_saved ? "fill-yellow-500 text-yellow-500" : ""}`}
                  />
                  {disc.user_saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discussions;
