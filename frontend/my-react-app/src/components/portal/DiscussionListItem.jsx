import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ThumbsUp, Clock, Edit } from "lucide-react";
import Badge from "../ui/Badge";

/**
 * DiscussionListItem — shared card for My Posts and Saved Discussions.
 *
 * Props:
 *  discussion   – the discussion object
 *  linkWrapper  – if true renders the card as a <Link>; if false renders as
 *                 a clickable <div> (navigating via onClick)
 *  to           – destination href when linkWrapper=true
 *  meta         – optional extra meta nodes (e.g. "Saved on <date>")
 *  actions      – slot: action buttons rendered below the stat row (e.g. unsave btn)
 */
const DiscussionListItem = ({
  discussion: disc,
  linkWrapper = false,
  to,
  meta,
  actions,
}) => {
  const navigate = useNavigate();

  const cardClassName =
    "relative block bg-[var(--bg-card)] rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x p-5 hover:shadow-md transition-shadow";

  const content = (
    <div className="flex items-start justify-between">
      {/* Left: title + preview + tags */}
      <div className="flex-1">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--text-main)] mb-1">
          {disc.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-2 line-clamp-2">
          {disc.content}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{new Date(disc.created_at).toLocaleDateString()}</span>

          {disc.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag.tag_id} variant="purple">
              {tag.name}
            </Badge>
          ))}

          {disc.can_edit && (
            <Badge variant="green" className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Editable
            </Badge>
          )}

          {meta}
        </div>
      </div>

      {/* Right: like/comment counts + action buttons */}
      <div
        className="flex flex-col items-end gap-2 ml-4"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4 pointer-events-none" /> {disc.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4 pointer-events-none" /> {disc.comment_count || 0}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {disc.can_edit && (
            <Link
              to={`/discussions/${disc.discussion_id}/edit`}
              className="p-1.5 text-[var(--text-muted)] hover:text-purple-600 rounded bg-[var(--bg-active)] hover:bg-purple-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="w-4 h-4 pointer-events-none" />
            </Link>
          )}

          {actions}
        </div>
      </div>
    </div>
  );

  if (linkWrapper && to) {
    return (
      <Link to={to} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`${cardClassName} cursor-pointer`}
      onClick={() => navigate(`/discussions/${disc.discussion_id}`)}
    >
      {content}
    </div>
  );
};

export default DiscussionListItem;
