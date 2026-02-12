import { ArrowRight, Briefcase, MapPin, DollarSign } from "lucide-react";
import Badge from "./Badge";

const JobCard = ({ item }) => {
  // item = { id, title, company, location, demand, salaryRange, description, ... }
  const badgeVariant =
    {
      High: "blue",
      Medium: "orange",
      Low: "gray",
    }[item.demand] || "gray";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 flex flex-col h-full">
      {/* Icon + Title row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500">{item.company}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
        {item.description}
      </p>

      {/* Metadata */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{item.salaryRange}</span>
        </div>
      </div>

      {/* Demand badge */}
      <div className="mt-4">
        <Badge variant={badgeVariant}>{item.demand} Demand</Badge>
      </div>

      {/* View Details link */}
      <a
        href={`/it-jobs/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-orange-600 text-sm font-medium hover:text-orange-800 transition-colors group"
      >
        View Job Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default JobCard;
