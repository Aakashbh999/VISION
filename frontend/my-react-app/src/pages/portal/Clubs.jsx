import { useState } from "react";
import { useClubs } from "../../hooks/useClubs";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Search, MapPin, Tag, Users } from "lucide-react";

const Clubs = () => {
  const [filters, setFilters] = useState({
    search: "",
    specialty: "",
    institution: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: clubs, isLoading, error } = useClubs(filters);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load clubs</div>;

  const specialties = [
    "Web",
    "AI",
    "Cyber",
    "Cloud",
    "Data",
    "Robotics",
    "Open Source",
    "General",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        IT Clubs & Communities
      </h1>
      <p className="text-gray-600">Discover and join IT clubs across Nepal.</p>

      {/* Filter toggle (mobile) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
      >
        <Search className="w-4 h-4" />{" "}
        {showFilters ? "Hide filters" : "Show filters"}
      </button>

      {/* Filters */}
      <div
        className={`${showFilters ? "block" : "hidden lg:block"} bg-white rounded-xl border border-gray-200 p-4`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search clubs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={filters.specialty}
            onChange={(e) =>
              setFilters({ ...filters, specialty: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Institution (e.g., Pulchowk)"
            value={filters.institution}
            onChange={(e) =>
              setFilters({ ...filters, institution: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Clubs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs?.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">
            No clubs match your criteria.
          </p>
        ) : (
          clubs?.map((club) => (
            <Link
              key={club.club_id}
              to={`/portal/clubs/${club.club_id}`}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {club.club_name}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {club.location}{" "}
                    {club.institution ? `- ${club.institution}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>{club.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{club.members} members</span>
                </div>
              </div>
              {club.is_public ? (
                <span className="inline-block mt-3 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Public
                </span>
              ) : (
                <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  Apply to join
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Clubs;
