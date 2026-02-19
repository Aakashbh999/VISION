import { ArrowRight, Users, MapPin, Calendar } from "lucide-react";
import Badge from "./Badge";

const ClubCard = ({ item }) => {
  // item = { id, name, region, college, established, description, ... }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200 transition-all duration-300 flex flex-col h-full">
      {/* Icon + Title row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.college}</p>
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
          <span>{item.region}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Est. {item.established}</span>
        </div>
      </div>

      {/* Region badge */}
      <div className="mt-4">
        <Badge variant="purple">{item.region}</Badge>
      </div>

      {/* View Details link */}
      <a
        href={`/it-clubs/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors group"
      >
        View Club Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default ClubCard;
