import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Loader2,
  MessageSquare,
  Share2,
  Bookmark,
  ThumbsUp,
  Edit,
  AlertTriangle,
  Maximize2,
  Image as ImageIcon,
  Rocket,
} from "lucide-react";
import { toast } from "react-toastify";
import ActionMenu from "../../../../components/ui/ActionMenu";
import DeleteAction from "../../../../components/DeleteAction";
import Avatar from "../../../../components/ui/Avatar";

const DiscussionPostCard = ({
  discussion,
  comments,
  user,
  id,
  navigate,
  isImageLoading,
  setIsImageLoading,
  setLightbox,
  onLike,
  isVoting,
  toggleSaveMutation,
  boostMutation,
  onOpenReport,
}) => {
  const normalizeProfileId = (value) => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return /^\d+$/.test(normalized) ? normalized : null;
  };

  const authorProfileId = normalizeProfileId(
    discussion.author_id ?? discussion.user_id ?? discussion.portal_user_id,
  );
  const authorImage =
    discussion.author_avatar ||
    discussion.author_profile_image ||
    discussion.profile_image ||
    null;

  const isDiscussionOwner =
    String(authorProfileId || "") ===
    String(user?.portal_user_id || user?.user_id || "");

  const isBoosted = discussion.is_boosted && new Date(discussion.boosted_until) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl overflow-hidden shadow-sm"
    >
      <div className="p-2 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          {authorProfileId ? (
            <Link
              to={`/profile/${authorProfileId}`}
              className="flex items-center gap-3 min-w-0 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
            >
              <Avatar
                src={authorImage}
                name={discussion.author || "User"}
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                  {discussion.author || "Unknown User"}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black tracking-widest text-[var(--text-muted)]">
                  <span className="text-purple-500 font-black truncate max-w-[120px] sm:max-w-none">
                    {(discussion.specialization_name || "general")
                      .toLowerCase()
                      .replace(/\s+/g, "")}
                  </span>
                  <span className="opacity-50">•</span>
                  <span>
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={authorImage}
                name={discussion.author || "User"}
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                  {discussion.author || "Unknown User"}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-black tracking-widest text-[var(--text-muted)]">
                  <span className="text-purple-500 font-black truncate max-w-[120px] sm:max-w-none">
                    {(discussion.specialization_name || "general")
                      .toLowerCase()
                      .replace(/\s+/g, "")}
                  </span>
                  <span className="opacity-50">•</span>
                  <span>
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2 min-w-0">
            {isBoosted && isDiscussionOwner && (
              <div className="flex">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  <Rocket className="w-3 h-3 fill-current" />
                  Post Boosted (Visible to you)
                </span>
              </div>
            )}
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">
              {discussion.title}
            </h1>
          </div>
          <ActionMenu
            actions={[
              {
                label: "Share",
                icon: <Share2 className="w-4 h-4" />,
                onClick: () => {
                  navigator.clipboard.writeText(window.location.href);
                },
              },
              ...(isDiscussionOwner && !isBoosted
                ? [
                    {
                      label: "Boost Post (50 Rep)",
                      icon: boostMutation?.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Rocket className="w-4 h-4 text-amber-500" />
                      ),
                      onClick: () => {
                        if ((user?.reputation_points || 0) < 50) {
                          toast.error("You need 50 reputation points to boost");
                          return;
                        }
                        boostMutation.mutate(discussion.discussion_id);
                      },
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {discussion.image_url && (
          <div
            className="relative mb-8 rounded-2xl overflow-hidden border border-[var(--border-main)] group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
            onClick={() =>
              setLightbox({
                isOpen: true,
                image: discussion.image_url,
                title: discussion.title,
              })
            }
          >
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-active)] animate-pulse">
                <ImageIcon className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
            )}
            <img
              src={discussion.image_url}
              alt={discussion.title}
              onLoad={() => setIsImageLoading(false)}
              className={`w-full max-h-[500px] object-cover transition-all duration-500 group-hover:scale-[1.02] ${isImageLoading ? "opacity-0" : "opacity-100"}`}
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-2 rounded-xl text-white">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="prose prose-purple max-w-none text-[var(--text-main)] mb-10 whitespace-pre-wrap">
          {discussion.content}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--border-main)] pt-6">
          <button
            onClick={() => onLike(1)}
            disabled={isVoting}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-full border transition-all active:scale-95 ${
              Number(discussion.user_vote || 0) === 1
                ? "text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-700/50"
                : "text-[var(--text-main)] bg-[var(--bg-card)] border-[var(--border-main)] hover:bg-[var(--bg-active)]"
            } ${isVoting ? "opacity-50 pointer-events-none" : ""}`}
            aria-label="Likes"
          >
            {isVoting ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <ThumbsUp
                className={`w-4 h-4 ${Number(discussion.user_vote || 0) === 1 ? "fill-current text-purple-600" : "text-purple-600"}`}
              />
            )}
            {Number(discussion.like_count || 0)}
          </button>
          <button className="flex items-center gap-2 text-xs font-black text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-main)] px-4 py-2 rounded-full">
            <MessageSquare className="w-4 h-4 text-purple-600 pointer-events-none" />
            {comments?.length || 0} Comments
          </button>
          <button
            onClick={() => toggleSaveMutation.mutate()}
            disabled={toggleSaveMutation.isPending}
            className={`p-2.5 rounded-full transition-colors ${discussion.user_saved ? "text-amber-500 bg-amber-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] border border-[var(--border-main)]"}`}
          >
            {toggleSaveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bookmark
                className={`w-4 h-4 pointer-events-none ${discussion.user_saved ? "fill-amber-500" : ""}`}
              />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscussionPostCard;
