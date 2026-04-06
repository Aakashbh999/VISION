import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

const ActivityFeedWidget = ({ feed }) => {
  if (!feed?.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Activity Feed
        </h3>
        <p className="text-[var(--text-muted)]">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> Recent Activity
      </h3>
      <div className="space-y-3">
        {feed.slice(0, 5).map((item) => (
          <div
            key={item.activity_id}
            className="p-3 rounded-xl bg-[var(--bg-active)]"
          >
            <p className="text-sm text-[var(--text-main)]">
              <span className="font-medium text-[var(--text-main)]">
                {item.actor_name}
              </span>{" "}
              {item.action_type.replace("_", " ")}
            </p>
            <span className="text-xs text-[var(--text-muted)]">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      <Link
        to="/feed"
        className="block text-center text-sm text-purple-600 hover:text-purple-800 mt-4"
      >
        View full feed
      </Link>
    </div>
  );
};

export default ActivityFeedWidget;
