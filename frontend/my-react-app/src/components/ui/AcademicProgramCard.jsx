import { ArrowRight, GraduationCap, Clock, Building } from "lucide-react";
import Badge from "./Badge";

const AcademicProgramCard = ({ item }) => {
  // item = { id, name, level, duration, university, description, ... }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300 flex flex-col h-full">
      {/* Icon + Title row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
        {item.description}
      </p>

      {/* Metadata */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Duration: {item.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="w-4 h-4" />
          <span>Affiliated to: {item.university}</span>
        </div>
      </div>

      {/* Level badge */}
      <div className="mt-4">
        <Badge variant="green">{item.level}</Badge>
      </div>

      {/* View Details link */}
      <a
        href={`/academic-guide/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-green-600 text-sm font-medium hover:text-green-800 transition-colors group"
      >
        View Program Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default AcademicProgramCard;
