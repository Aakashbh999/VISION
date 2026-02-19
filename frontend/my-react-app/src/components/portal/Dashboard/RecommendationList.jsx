import { ExternalLink } from "lucide-react";

const RecommendationList = ({ recommendations }) => {
  if (!recommendations?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Recommended for You
        </h3>
        <p className="text-gray-600">No recommendations yet – keep learning!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Recommended for You
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <a
            key={rec.resource_id}
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div>
              <h4 className="font-medium text-gray-900">{rec.title}</h4>
              <p className="text-xs text-gray-500 mt-1">Score: {rec.score}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;
