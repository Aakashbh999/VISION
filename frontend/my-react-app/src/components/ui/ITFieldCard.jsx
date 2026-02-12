import { ArrowRight } from "lucide-react";
import Badge from "./Badge";

const ITFieldCard = ({ item }) => {
  const IconComponent = item.icon;

  const badgeVariant =
    {
      High: "blue",
      Medium: "orange",
      Low: "gray",
    }[item.demand] || "gray";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
      </div>

      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
        {item.shortDescription}
      </p>

      <div className="mt-4">
        <Badge variant={badgeVariant}>{item.demand} Demand</Badge>
      </div>

      <p className="text-sm text-gray-500 mt-3 italic">{item.motivation}</p>

      <a
        href={`/it-fields/${item.slug}`}
        className="mt-5 inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors group"
      >
        View Details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};

export default ITFieldCard;
