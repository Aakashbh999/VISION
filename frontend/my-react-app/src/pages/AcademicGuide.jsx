import { useState } from "react";
import { useAcademicDegrees } from "../hooks/useAcademicDegrees";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import Badge from "../components/ui/Badge";

const AcademicGuide = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAcademicDegrees(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500">Failed to load academic programs</div>
    );

  const degrees = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Academic Guide
      </h1>
      <p className="text-gray-600">
        Compare IT programs and choose the right academic path.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {degrees.map((degree) => (
          <div
            key={degree.id}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">
                {degree.degree_code}
              </h2>
              <Badge variant="blue">{degree.university}</Badge>
            </div>
            <p className="text-gray-500 text-sm mt-1">{degree.full_name}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Duration:</span> {degree.duration}
              </p>
              <p>
                <span className="font-medium">Eligibility:</span>{" "}
                {degree.eligibility}
              </p>
              <p>
                <span className="font-medium">Focus:</span> {degree.focus_area}
              </p>
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

export default AcademicGuide;
