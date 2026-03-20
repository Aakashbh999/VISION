import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

const ActivityFeedWidget = ({ feed }) => {
  if (!feed?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Activity Feed
        </h3>
        <p className="text-gray-600">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" /> Recent Activity
      </h3>
      <div className="space-y-3">
        {feed.map((item) => (
          <div key={item.activity_id} className="p-3 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-800">
              <span className="font-medium text-gray-900">
                {item.actor_name}
              </span>{" "}
              {item.action_type.replace("_", " ")}
            </p>
            <span className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      <Link
        to="/feed"
        className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4"
      >
        View full feed
      </Link>
    </div>
  );
};

export default ActivityFeedWidget;
