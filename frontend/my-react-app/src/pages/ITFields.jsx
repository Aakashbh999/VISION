import { useState } from "react";
import { useItFields } from "../hooks/useItFields";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ITFields = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useItFields(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load IT fields</div>;

  const fields = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        IT Career Fields
      </h1>
      <p className="text-gray-600">
        Explore various IT fields and find the right path for your career.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {field.field_name}
            </h2>
            <p className="text-gray-600 mb-4">{field.short_description}</p>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  field.demand === "High"
                    ? "bg-green-100 text-green-700"
                    : field.demand === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {field.demand} Demand
              </span>
              <Link
                to={`/it-fields/${field.slug}`}
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {pagination?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ITFields;
