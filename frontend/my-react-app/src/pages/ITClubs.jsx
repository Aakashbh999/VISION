import { useItClubs } from "../hooks/useItClubs";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import { MapPin, Users } from "lucide-react";
import { useState } from "react";

const ITClubs = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useItClubs(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load IT clubs</div>;

  const clubs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        IT Clubs & Communities
      </h1>
      <p className="text-gray-600">
        Connect with local IT communities across Nepal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {club.club_name}
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{club.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{club.members || "N/A"} members</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">{club.description}</p>
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

export default ITClubs;
