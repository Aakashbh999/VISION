import { MessageCircle, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

const TrendingDiscussions = ({ discussions }) => {
  if (!discussions?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Trending Discussions
        </h3>
        <p className="text-gray-600">No active discussions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Trending Discussions
      </h3>
      <div className="space-y-4">
        {discussions.map((disc) => (
          <Link
            key={disc.discussion_id}
            to={`/portal/discussions/${disc.discussion_id}`}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{disc.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {disc.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {disc.replies || 0}
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
