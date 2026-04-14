import { Link } from "react-router-dom";
import {
  Bookmark,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import SurfaceCard from "../../../components/ui/SurfaceCard";

/**
 * Props:
 * - disc: discussion row data
 * - handleLike/handleSave/handleShare: action callbacks
 * - loadingLike/loadingSave: per-discussion loading ids
 * - onImageClick: callback for lightbox open
 */
const DiscussionCard = ({
  disc,
  handleLike,
  handleSave,
  handleShare,
  loadingLike,
  loadingSave,
}) => {
  const normalizeProfileId = (value) => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return /^\d+$/.test(normalized) ? normalized : null;
  };
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState(Number(disc.user_vote || 0));
  const [optimisticSaved, setOptimisticSaved] = useState(Boolean(disc.user_saved));
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(
    Number(disc.comment_count || 0),
  );

  const menuButtonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setOptimisticVote(Number(disc.user_vote || 0));
    setOptimisticSaved(Boolean(disc.user_saved));
    setOptimisticCommentCount(Number(disc.comment_count || 0));
  }, [disc.user_vote, disc.user_saved, disc.comment_count]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = menuRef.current?.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const normalizedTags = useMemo(() => {
    if (Array.isArray(disc.tags)) {
      return disc.tags
        .map((tag) => {
          if (!tag) return null;
          if (typeof tag === "string") return tag.trim();
          if (typeof tag === "object") {
            return String(tag.name || tag.slug || "").trim();
          }
          return String(tag).trim();
        })
        .filter(Boolean);
    }
    if (typeof disc.tags === "string") {
      return disc.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    if (disc.tag_name) return [disc.tag_name];
    if (disc.specialization_name) return [disc.specialization_name];
    return [];
  }, [disc.tags, disc.tag_name, disc.specialization_name]);

  const visibleTags = normalizedTags.slice(0, 2);
  const remainingTagsCount = Math.max(0, normalizedTags.length - visibleTags.length);
  const authorProfileId = normalizeProfileId(
    disc.author_id ?? disc.user_id ?? disc.portal_user_id,
  );
  const authorImage =
    disc.author_avatar || disc.author_profile_image || disc.profile_image || null;

  const fullBody = disc.content || "";
  const shouldShowReadMore = fullBody.length > 200;
  const bodyPreviewClass = expanded ? "" : "line-clamp-3 sm:line-clamp-4";

  const baseLikeCount = Number(disc.like_count || 0);
  const baseVote = Number(disc.user_vote || 0);
  const likeCount = Math.max(
    0,
    baseLikeCount + (baseVote === 1 ? -1 : 0) + (optimisticVote === 1 ? 1 : 0),
  );
  const isLiked = optimisticVote === 1;
  const isSaved = optimisticSaved;

  const handleLikeClick = async (event) => {
    const previousVote = optimisticVote;
    const nextVote = previousVote === 1 ? 0 : 1;
    setOptimisticVote(nextVote);
    try {
      await handleLike(event, disc.discussion_id, previousVote);
    } catch {
      setOptimisticVote(previousVote);
    }
  };

  const handleSaveClick = async (event) => {
    const previousSaved = optimisticSaved;
    setOptimisticSaved(!previousSaved);
    try {
      await handleSave(event, disc.discussion_id, previousSaved);
    } catch {
      setOptimisticSaved(previousSaved);
    }
  };

  return (
    <SurfaceCard className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        {authorProfileId ? (
          <Link
            to={`/profile/${authorProfileId}`}
            className="flex items-start gap-3 min-w-0 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
          >
            <Avatar
              src={authorImage}
              name={disc.author || "User"}
              size="sm"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {disc.author || "Unknown User"}
                </span>
                {disc.specialization_name ? (
                  <Badge color="purple" size="xs">
                    {disc.specialization_name}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(disc.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-start gap-3 min-w-0">
            <Avatar
              src={authorImage}
              name={disc.author || "User"}
              size="sm"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {disc.author || "Unknown User"}
                </span>
                {disc.specialization_name ? (
                  <Badge color="purple" size="xs">
                    {disc.specialization_name}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(disc.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open post options"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95 transition"
          >
            <MoreHorizontal className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>

          {menuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-2"
            >
              <Link
                to={`/discussions/${disc.discussion_id}`}
                role="menuitem"
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 block"
                onClick={() => setMenuOpen(false)}
              >
                View post
              </Link>
              <button
                type="button"
                role="menuitem"
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${window.location.origin}/discussions/${disc.discussion_id}`,
                  );
                  setMenuOpen(false);
                }}
              >
                Copy link
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <Link to={`/discussions/${disc.discussion_id}`} className="block">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 sm:line-clamp-3">
            {disc.title}
          </h2>
          <p
            className={`mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${bodyPreviewClass}`}
          >
            {fullBody}
          </p>
        </Link>

        {shouldShowReadMore ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 text-sm font-medium text-purple-600 hover:text-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        {disc.image_url ? (
          <Link
            to={`/discussions/${disc.discussion_id}`}
            className="mt-3 block rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700"
          >
            <img
              src={disc.image_url}
              alt={disc.title || "Discussion media"}
              className="w-full max-h-72 object-cover"
              loading="lazy"
            />
          </Link>
        ) : null}

        {visibleTags.length ? (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {visibleTags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} color="gray" size="xs">
                #{tag}
              </Badge>
            ))}
            {remainingTagsCount > 0 ? (
              <Badge color="gray" size="xs">
                +{remainingTagsCount}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Like post"
          disabled={loadingLike === disc.discussion_id}
          onClick={handleLikeClick}
          className={`min-h-11 px-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95 ${
            isLiked
              ? "text-purple-700 bg-purple-100 dark:bg-purple-900/40"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          } ${loadingLike === disc.discussion_id ? "opacity-50 pointer-events-none" : ""}`}
        >
          {loadingLike === disc.discussion_id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          )}
           {likeCount > 0 ? `${likeCount}` : ""}
        </button>

        <Link
          to={`/discussions/${disc.discussion_id}`}
          className="min-h-11 px-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          <MessageSquare className="w-4 h-4 opacity-70" />
          {optimisticCommentCount}
        </Link>

        <button
          type="button"
          aria-label="Save post"
          disabled={loadingSave === disc.discussion_id}
          onClick={handleSaveClick}
          className={`min-h-11 px-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95 ${
            isSaved
              ? "text-amber-700 bg-amber-100 dark:bg-amber-900/30"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          } ${loadingSave === disc.discussion_id ? "opacity-50 pointer-events-none" : ""}`}
        >
          {loadingSave === disc.discussion_id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          )}
          Save
        </button>

        <button
          type="button"
          aria-label="Share post"
          onClick={(event) => handleShare(event, disc.discussion_id, disc.title)}
          className="min-h-11 px-3 rounded-xl inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95"
        >
          <Share2 className="w-4 h-4 opacity-70" />
          Share
        </button>
      </div>

    </SurfaceCard>
  );
};

export default DiscussionCard;
