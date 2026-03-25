import { ArrowRight, Briefcase, MapPin, DollarSign } from "lucide-react";
import Badge from "./Badge";

const JobCard = ({ item }) => {
  const badgeVariant =
    {
      High: "purple",
      Medium: "orange",
      Low: "gray",
    }[item.demand] || "gray";

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-[var(--text-main)]">{item.title}</h3>
          <p className="text-sm text-[var(--text-muted)]">{item.company}</p>
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed line-clamp-3">
        {item.description}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <MapPin className="w-4 h-4" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <DollarSign className="w-4 h-4" />
          <span>{item.salaryRange}</span>
        </div>
      </div>

      <div className="mt-4">
        <Badge variant={badgeVariant}>{item.demand} Demand</Badge>
      </div>

      <a
        href={`/it-jobs/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors group"
      >
        View Job Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default JobCard;