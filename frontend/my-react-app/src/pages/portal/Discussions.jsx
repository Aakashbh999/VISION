import { useState, useEffect } from "react";
import {
  useDiscussions,
  useDiscussionTags,
} from "../../hooks/useDiscussionHooks";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike, toggleSave } from "../../services/discussion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import UniversalSearch from "../../components/ui/UniversalSearch";
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
import DiscussionCard from "../../components/portal/DiscussionCard";
import ImageLightbox from "../../components/modals/ImageLightbox";

const Discussions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [loadingLike, setLoadingLike] = useState(null);
  const [loadingSave, setLoadingSave] = useState(null);
  const [downvotedPosts, setDownvotedPosts] = useState({});
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

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    image: null,
    title: "",
  });

  const [degrees, setDegrees] = useState([]);
  const { data, isLoading, error } = useDiscussions(filters);

  // Update URL params efficiently
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "latest" && value !== 1) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Like mutation with loading state tracking
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onMutate: (discId) => {
      setLoadingLike(discId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
    onSettled: () => {
      setLoadingLike(null);
    },
  });

  // Save mutation with loading state tracking
  const saveMutation = useMutation({
    mutationFn: toggleSave,
    onMutate: (discId) => {
      setLoadingSave(discId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
    },
    onSettled: () => {
      setLoadingSave(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to save discussion");
    },
  });

  const handleLike = (e, discId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please login to vote on discussions");
      return;
    }
    // Clear downvote state when upvoting
    setDownvotedPosts((prev) => ({ ...prev, [discId]: false }));
    likeMutation.mutate(discId);
  };

  const handleDownvote = (e, discId, isCurrentlyLiked) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please login to vote on discussions");
      return;
    }

    const isCurrentlyDownvoted = downvotedPosts[discId];

    if (isCurrentlyDownvoted) {
      // Already downvoted, clicking again goes back to neutral
      setDownvotedPosts((prev) => ({ ...prev, [discId]: false }));
    } else {
      // Not downvoted yet
      if (isCurrentlyLiked) {
        // Remove the like first (call backend), then show downvote
        likeMutation.mutate(discId);
      }
      // Set local downvote state
      setDownvotedPosts((prev) => ({ ...prev, [discId]: true }));
    }
  };

  const handleSave = (e, discId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please login to save discussions");
      return;
    }
    saveMutation.mutate(discId);
  };

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const degreesRes = await api.get("/discussions/degrees");
        setDegrees(degreesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
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

  const handleShare = async (e, discId, discTitle) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/discussions/${discId}`;
    const shareData = {
      title: discTitle || "VISION Discussion",
      text: "Check out this discussion on VISION Portal",
      url,
    };

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
          } catch {
            toast.error("Failed to share");
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to copy link");
      }
    }
  };

  const discussions = data?.discussions || [];

  const openLightbox = (image, title) => {
    setLightbox({ isOpen: true, image, title });
  };

  return (
    <div className="max-w-[824px] mx-auto space-y-4">
      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightbox.isOpen}
        image={lightbox.image}
        title={lightbox.title}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
      />
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <UniversalSearch
            placeholder="Search VISION Discussions..."
            initialValue={filters.search}
            onSearch={(val) => updateFilter("search", val)}
            isLoading={isLoading}
            className="flex-1"
          />
          <div className="flex gap-2">
            {user && (
              <Link
                to="/discussions/saved"
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-50 transition-colors text-center flex items-center gap-1"
              >
                <BookmarkCheck className="w-4 h-4" /> Saved
              </Link>
            )}
            <Link
              to="/discussions/new"
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
              value={filters.degree}
              onChange={(e) => updateFilter("degree", e.target.value)}
              className="text-xs font-bold text-gray-500 bg-transparent cursor-pointer border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Degrees</option>
              {degrees.map((deg) => (
                <option key={deg.id} value={deg.id}>
                  {deg.name}
                </option>
              ))}
            </select>
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
      <div className="space-y-4 min-h-[400px]">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
            <LoadingSpinner />
            <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 p-12 rounded-xl text-center font-bold text-rose-600">
             Failed to load discussions. Please try again.
          </div>
        ) : data?.noResults ? (
           <div className="bg-white border border-gray-200 rounded-xl p-10 space-y-8 shadow-sm">
              <div className="max-w-xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-blue-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase">No matches for "{filters.search}"</h3>
                    <p className="text-sm font-bold text-slate-500">Try these trending discussions from your program:</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {data.recommendations?.discussions?.map(rec => (
                      <Link 
                          key={rec.id}
                          to={`/discussions/${rec.id}`}
                          className="group flex items-start gap-4 p-5 bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-lg rounded-xl transition-all"
                      >
                          <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                              <MessageSquare className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{rec.title}</div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                  {rec.tags?.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
                                  <span>•</span>
                                  <span>{rec.upvotes} UPVOTES</span>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
           </div>
        ) : (
          <>
            {discussions.map((disc) => (
              <DiscussionCard
                key={disc.discussion_id}
                disc={disc}
                user={user}
                handleLike={handleLike}
                handleDownvote={handleDownvote}
                handleSave={handleSave}
                handleShare={handleShare}
                loadingLike={loadingLike}
                loadingSave={loadingSave}
                downvotedPosts={downvotedPosts}
                onImageClick={openLightbox}
              />
            ))}

            {discussions.length === 0 && (
              <div className="bg-white border border-dashed border-gray-200 rounded-xl p-20 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Search className="w-8 h-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    No discussions found
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Discussions;
