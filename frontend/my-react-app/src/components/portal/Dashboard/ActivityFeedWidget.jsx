import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

const ViewFullFeedButton = () => (
  <Link
    to="/feed"
    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-active) border border-(--border-main) text-(--text-main) text-sm font-bold hover:border-purple-400 hover:bg-(--bg-card) transition-all"
  >
    View full feed
  </Link>
);

const ActivityFeedWidget = ({ feed }) => {
  if (!feed?.length) {
    return (
      <div className="bg-(--bg-card) rounded-sm sm:rounded-2xl border border-(--border-main) border-x-0 sm:border-x p-6">
        <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Activity Feed
        </h3>
        <p className="text-(--text-muted)">No recent activity.</p>
        <div className="mt-4">
          <ViewFullFeedButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--bg-card) rounded-sm sm:rounded-2xl border border-(--border-main) border-x-0 sm:border-x p-6">
      <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> Recent Activity
      </h3>
      <div className="space-y-3">
        {feed.slice(0, 5).map((item) => (
          <div
            key={item.activity_id}
            className="p-3 rounded-xl bg-(--bg-active)"
          >
            <p className="text-sm text-(--text-main)">
              <span className="font-medium text-(--text-main)">
                {item.actor_name}
              </span>{" "}
              {item.action_type.replace("_", " ")}
            </p>
            <span className="text-xs text-(--text-muted)">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <ViewFullFeedButton />
      </div>
    </div>
  );
};

export default ActivityFeedWidget;
