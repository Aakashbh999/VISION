import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown, 
  Share2, 
  Bookmark,
  Image as ImageIcon,
  MoreHorizontal,
  Camera,
  Maximize2,
  ZoomIn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ButtonLoader from "../ui/ButtonLoader";

const DiscussionCard = ({ 
  disc, 
  user, 
  handleLike, 
  handleDownvote, 
  handleSave, 
  handleShare, 
  loadingLike, 
  loadingSave, 
  downvotedPosts,
  onImageClick 
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const hasImage = !!disc.image_url;

  return (
    <div
      className="flex bg-bg-card border border-border-main rounded-xl hover:border-purple-500/50 hover:bg-bg-active transition-all overflow-hidden group shadow-sm"
    >
      {/* Voting Rail - stretches with content */}
      <div className="w-12 bg-bg-main/30 flex flex-col items-center py-4 gap-2 border-r border-border-main/50">
        <button
          onClick={(e) => handleLike(e, disc.discussion_id)}
          disabled={loadingLike === disc.discussion_id}
          className={`hover:bg-purple-500/10 p-1.5 rounded-lg transition-all ${
            loadingLike === disc.discussion_id ? "opacity-50 cursor-wait" : ""
          } ${disc.user_liked && !downvotedPosts[disc.discussion_id] ? "text-purple-500 bg-purple-500/10" : "text-text-muted hover:text-purple-500"}`}
        >
          {loadingLike === disc.discussion_id ? (
            <ButtonLoader size={20} />
          ) : (
            <ArrowBigUp
              className={`w-6 h-6 transition-all ${disc.user_liked && !downvotedPosts[disc.discussion_id] ? "fill-purple-500" : ""}`}
            />
          )}
        </button>
        <span
          className={`text-xs font-black ${
            disc.user_vote === 1
              ? "text-purple-500"
              : disc.user_vote === -1
                ? "text-red-500"
                : "text-text-muted"
          }`}
        >
          {Math.max(0, disc.like_count || 0)}
        </span>
        <button
          onClick={(e) =>
            handleDownvote(e, disc.discussion_id, disc.user_liked)
          }
          disabled={loadingLike === disc.discussion_id}
          className={`hover:bg-red-500/10 p-1.5 rounded-lg transition-all ${
            loadingLike === disc.discussion_id ? "opacity-50 cursor-wait" : ""
          } ${downvotedPosts[disc.discussion_id] ? "text-red-500 bg-red-500/10" : "text-text-muted hover:text-red-500"}`}
        >
          <ArrowBigDown
            className={`w-6 h-6 transition-all ${downvotedPosts[disc.discussion_id] ? "fill-red-500" : ""}`}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Meta Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-text-muted">
            <span className="text-purple-500 font-black hover:underline cursor-pointer">
              v/{disc.specialization_name?.replace(/\s+/g, "").toLowerCase() || "general"}
            </span>
            <span className="opacity-50">•</span>
            <span className="text-text-main/80">u/{disc.author}</span>
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
          <button className="text-text-muted hover:text-text-main">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Body */}
        <Link to={`/discussions/${disc.discussion_id}`} className="block group/title">
          <h2 className="text-lg font-black text-text-main leading-tight mb-2 group-hover/title:text-purple-500 transition-colors">
            {disc.title}
          </h2>

          {!hasImage ? (
            /* TEXT-ONLY: 3-line snippet */
            <p className="text-sm text-text-muted line-clamp-3 mb-4 leading-relaxed">
              {disc.content}
            </p>
          ) : (
            /* IMAGE-POST: Fixed-Box Media Container + 1-line caption */
            <div className="space-y-3 mb-4">
              <div 
                className="relative rounded-xl border border-border-main/50 overflow-hidden bg-bg-main group/media cursor-zoom-in h-[250px] sm:h-[420px] flex items-center justify-center shadow-inner"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onImageClick(disc.image_url, disc.title);
                }}
              >
                {/* Skeleton Loader */}
                <AnimatePresence>
                  {isImageLoading && (
                    <motion.div 
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-bg-card flex items-center justify-center"
                    >
                      <div className="w-full h-full bg-gradient-to-r from-bg-card via-bg-active to-bg-card bg-[length:200%_100%] animate-shimmer" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Blurred Background Layer */}
                <img 
                  src={disc.image_url} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                />

                {/* Main Contained Image */}
                <motion.img
                  src={disc.image_url}
                  alt={disc.title}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                  whileHover={{ scale: 1.01 }}
                  className={`relative z-0 max-w-full max-h-full object-contain transition-all duration-500 ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                />

                {/* Zoom Icon Overlay */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-2 rounded-full text-white shadow-xl">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {disc.image_caption && (
                <p className="text-xs font-bold text-text-muted line-clamp-1 italic px-1 border-l-2 border-purple-500/50">
                  {disc.image_caption}
                </p>
              )}
              {disc.content && !disc.image_caption && (
                <p className="text-xs text-text-muted line-clamp-1 italic px-1">
                  {disc.content}
                </p>
              )}
            </div>
          )}
        </Link>

        {/* Action Bar */}
        <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border-main/30">
          <Link
            to={`/discussions/${disc.discussion_id}`}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-bg-active rounded-lg text-[10px] font-black uppercase tracking-wider text-text-muted transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            {disc.comment_count || 0} Comments
          </Link>
          <button
            onClick={(e) => handleShare(e, disc.discussion_id, disc.title)}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-bg-active rounded-lg text-[10px] font-black uppercase tracking-wider text-text-muted transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={(e) => handleSave(e, disc.discussion_id)}
            disabled={loadingSave === disc.discussion_id}
            className={`flex items-center gap-1.5 px-3 py-2 hover:bg-bg-active rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              loadingSave === disc.discussion_id
                ? "opacity-50 cursor-wait"
                : ""
            } ${disc.user_saved ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : "text-text-muted"}`}
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
