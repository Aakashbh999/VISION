import { Link } from "react-router-dom";
import {
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  Bookmark,
  MoreHorizontal,
  Camera,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import ButtonLoader from "../../../components/ui/ButtonLoader";

/**
 * Props:
 * - disc: discussion row data
 * - handleLike/handleDownvote/handleSave/handleShare: action callbacks
 * - loadingLike/loadingSave: per-discussion loading ids
 * - downvotedPosts: local downvote UI map
 * - onImageClick: callback for lightbox open
 */
const DiscussionCard = ({
  disc,
  handleLike,
  handleDownvote,
  handleSave,
  handleShare,
  loadingLike,
  loadingSave,
  onImageClick,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const hasImage = !!disc.image_url;

  return (
    <div className="w-full flex bg-[var(--bg-card)] border-0 border-b sm:border-b-0 sm:border border-[var(--border-main)] rounded-none sm:rounded-xl hover:border-purple-500/50 hover:bg-[var(--bg-active)] transition-all overflow-hidden group sm:shadow-sm">
      <div className="w-10 sm:w-12 bg-[var(--bg-main)]/30 flex flex-col items-center py-3 sm:py-4 gap-2 border-r-0 sm:border-r border-[var(--border-main)]/50">
        <button
          onClick={(event) => handleLike(event, disc.discussion_id)}
          disabled={loadingLike === disc.discussion_id}
          className={`hover:bg-purple-500/10 p-1.5 rounded-lg transition-all ${
            loadingLike === disc.discussion_id ? "opacity-50 cursor-wait" : ""
          } ${disc.user_vote === 1 ? "text-purple-500 bg-purple-500/10" : "text-[var(--text-muted)] hover:text-purple-500"}`}
        >
          {loadingLike === disc.discussion_id ? (
            <ButtonLoader size={20} />
          ) : (
            <ArrowBigUp
              className={`w-6 h-6 transition-all ${disc.user_vote === 1 ? "fill-purple-500" : ""}`}
            />
          )}
        </button>
        <span
          className={`text-sm font-black px-2 py-0.5 rounded-md shadow-sm border ${
            disc.user_vote === 1
              ? "text-purple-600 bg-purple-500/10 border-purple-500/20"
              : disc.user_vote === -1
                ? "text-red-600 bg-red-500/10 border-red-500/20"
                : "text-[var(--text-main)] bg-[var(--bg-active)] border-[var(--border-main)]/50"
          }`}
          title="Net Likes"
        >
          {Math.max(0, disc.like_count || 0)}
        </span>
        <button
          onClick={(event) =>
            handleDownvote(event, disc.discussion_id, disc.user_vote)
          }
          disabled={loadingLike === disc.discussion_id}
          className={`hover:bg-red-500/10 p-1.5 rounded-lg transition-all ${
            loadingLike === disc.discussion_id ? "opacity-50 cursor-wait" : ""
          } ${disc.user_vote === -1 ? "text-red-500 bg-red-500/10" : "text-[var(--text-muted)] hover:text-red-500"}`}
        >
          {loadingLike === disc.discussion_id ? (
            <ButtonLoader size={20} />
          ) : (
            <ArrowBigDown
              className={`w-6 h-6 transition-all ${disc.user_vote === -1 ? "fill-red-500" : ""}`}
            />
          )}
        </button>
      </div>

      <div className="flex-1 px-2 py-3 sm:px-4 sm:py-4 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black tracking-widest text-[var(--text-muted)]">
            <span className="text-purple-500 font-black cursor-pointer truncate max-w-[120px] sm:max-w-none">
              {(disc.specialization_name || "general")
                .toLowerCase()
                .replace(/\s+/g, "")}
            </span>
            <span className="opacity-50">•</span>
            <span className="text-[var(--text-main)]/80 truncate max-w-[100px] sm:max-w-none">
              {disc.author?.toLowerCase().replace(/\s+/g, "")}
            </span>
            <span className="opacity-50">•</span>
            <span>{new Date(disc.created_at).toLocaleDateString()}</span>
            {hasImage && (
              <>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                  <Camera className="w-3 h-3" /> Media
                </span>
              </>
            )}
          </div>
          <button className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <Link
          to={`/discussions/${disc.discussion_id}`}
          className="block group/title"
        >
          <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] leading-tight mb-2">
            {disc.title}
          </h2>

          {!hasImage ? (
            <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4 leading-relaxed">
              {disc.content}
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              <div
                className="relative rounded-xl border border-[var(--border-main)]/50 overflow-hidden bg-[var(--bg-main)] group/media cursor-zoom-in h-[250px] sm:h-[420px] flex items-center justify-center shadow-inner"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onImageClick(disc.image_url, disc.title);
                }}
              >
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 bg-[var(--bg-card)] flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-active)] to-[var(--bg-card)] bg-[length:200%_100%] animate-shimmer" />
                  </div>
                )}

                <img
                  src={disc.image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                />

                <img
                  src={disc.image_url}
                  alt={disc.title}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                  className={`relative z-0 max-w-full max-h-full object-contain transition-all duration-500 ${isImageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                />

                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-2 rounded-full text-white shadow-xl">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {disc.image_caption && (
                <p className="text-xs font-bold text-[var(--text-muted)] line-clamp-1 italic px-1 border-l-2 border-purple-500/50">
                  {disc.image_caption}
                </p>
              )}
              {disc.content && !disc.image_caption && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-1 italic px-1">
                  {disc.content}
                </p>
              )}
            </div>
          )}
        </Link>

        <div className="flex flex-wrap items-center gap-1 mt-auto pt-2 border-t-0 sm:border-t border-[var(--border-main)]/30">
          <Link
            to={`/discussions/${disc.discussion_id}`}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 hover:bg-[var(--bg-active)] rounded-lg text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            {disc.comment_count || 0} Comments
          </Link>
          <button
            onClick={(event) =>
              handleShare(event, disc.discussion_id, disc.title)
            }
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-[var(--bg-active)] rounded-lg text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={(event) => handleSave(event, disc.discussion_id)}
            disabled={loadingSave === disc.discussion_id}
            className={`flex items-center gap-1.5 px-3 py-2 hover:bg-[var(--bg-active)] rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              loadingSave === disc.discussion_id ? "opacity-50 cursor-wait" : ""
            } ${disc.user_saved ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-[var(--text-muted)]"}`}
          >
            {loadingSave === disc.discussion_id ? (
              <ButtonLoader size={16} />
            ) : (
              <Bookmark
                className={`w-4 h-4 ${disc.user_saved ? "fill-amber-500 text-amber-500" : ""}`}
              />
            )}
            {disc.user_saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
