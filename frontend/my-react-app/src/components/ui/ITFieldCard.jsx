import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Badge from "./Badge";

const ITFieldCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = item.icon;

  const badgeVariant =
    {
      High: "purple",
      Medium: "orange",
      Low: "gray",
    }[item.demand] || "gray";

  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-[var(--text-main)]">
          {item.name}
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed text-justify">
          {item.shortDescription}
        </p>

        {isExpanded && item.descriptionFull && (
          <p className="text-sm text-[var(--text-main)] leading-relaxed text-justify animate-fade-in">
            {item.descriptionFull}
          </p>
        )}

        {item.descriptionFull && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {item.techStack && (
          <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100/50 dark:border-purple-800/30">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
              Common Tech Stack
            </p>
            <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
              {item.techStack}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Badge variant={badgeVariant}>{item.demand} Demand</Badge>
      </div>

      {item.motivation && (
        <p className="text-sm text-[var(--text-muted)] mt-3 italic">
          {item.motivation}
        </p>
      )}
    </div>
  );
};

export default ITFieldCard;
