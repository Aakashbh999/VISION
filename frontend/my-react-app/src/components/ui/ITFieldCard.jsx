import { ArrowRight } from "lucide-react";
import Badge from "./Badge";

const ITFieldCard = ({ item }) => {
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
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-[var(--text-main)]">
          {item.name}
        </h3>
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">
        {item.shortDescription}
      </p>

      <div className="mt-4">
        <Badge variant={badgeVariant}>{item.demand} Demand</Badge>
      </div>

      {item.motivation && (
        <p className="text-sm text-[var(--text-muted)] mt-3 italic">
          {item.motivation}
        </p>
      )}

      <a
        href={`/it-fields/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors group"
      >
        View Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default ITFieldCard;
