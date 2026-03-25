import { ExternalLink } from "lucide-react";

const RecommendationList = ({ recommendations }) => {
  if (!recommendations?.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Recommended for You
        </h3>
        <p className="text-[var(--text-muted)]">No recommendations yet – keep learning!</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
        Recommended for You
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <a
            key={rec.resource_id}
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between p-3 rounded-xl hover:bg-[var(--bg-active)] transition-colors group"
          >
            <div>
              <h4 className="font-medium text-[var(--text-main)]">{rec.title}</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">Score: {rec.score}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-600" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;