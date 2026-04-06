import { ArrowRight, GraduationCap, Clock, Building } from "lucide-react";
import Badge from "./Badge";

const AcademicProgramCard = ({ item }) => {
  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-900/40 transition-all duration-300 flex flex-col h-full">
      {/* Icon + Title row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-300 flex-shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-[var(--text-main)]">
          {item.name}
        </h3>
      </div>

      {/* Description – limit to 3 lines */}
      <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed line-clamp-3">
        {item.description}
      </p>

      {/* Metadata */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Clock className="w-4 h-4" />
          <span>Duration: {item.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Building className="w-4 h-4" />
          <span>Affiliated to: {item.university}</span>
        </div>
      </div>

      {/* Level badge – keep green for variety, but you can change to purple */}
      <div className="mt-4">
        <Badge variant="green">{item.level}</Badge>
      </div>

      {/* View Details link – now purple */}
      <a
        href={`/academic-guide/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors group"
      >
        View Program Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default AcademicProgramCard;
