import { MessageCircle, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

const TrendingDiscussions = ({
  discussions,
  title = "Trending Discussions",
}) => {
  if (!discussions?.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          {title}
        </h3>
        <p className="text-[var(--text-muted)]">No active discussions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {discussions.map((disc) => (
          <Link
            key={disc.discussion_id}
            to={`/discussions/${disc.discussion_id}`}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-[var(--bg-active)] transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-[var(--text-main)] line-clamp-2 leading-snug">
                {disc.title}
              </h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5 focus:outline-none">
                  <ThumbsUp className="w-3.5 h-3.5 fill-[var(--text-muted)]/20" />{" "}
                  {disc.likes || disc.like_count || 0}
                </span>
                <span className="flex items-center gap-1.5 focus:outline-none">
                  <MessageCircle className="w-3.5 h-3.5 fill-[var(--text-muted)]/20" />{" "}
                  {disc.replies || disc.comment_count || 0}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingDiscussions;
