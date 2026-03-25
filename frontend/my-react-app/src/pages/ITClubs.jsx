import { useItClubs } from "../hooks/useClubHooks"; // adjust import path if needed
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import { MapPin, Users } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";

const ITClubs = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useItClubs(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load IT clubs</div>;

  const clubs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
        IT Clubs & Communities
      </h1>
      <p className="text-[var(--text-muted)]">
        Connect with local IT communities across Nepal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => {
          let contact = {};
          try {
            contact =
              typeof club.contact_info === "string"
                ? JSON.parse(club.contact_info)
                : club.contact_info || {};
          } catch {
            contact = {};
          }

          return (
            <div
              key={club.id}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 shadow-sm hover:shadow-md transition space-y-3"
            >
              <h2 className="text-lg font-semibold text-[var(--text-main)]">
                {club.club_name}
              </h2>
              {club.institution && (
                <p className="text-sm text-[var(--text-muted)]">
                  {club.institution}
                </p>
              )}

              <div className="space-y-2 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>{club.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>{club.members || "N/A"} members</span>
                </div>
              </div>

              {club.specialty && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {club.specialty.split(",").map((spec, i) => (
                    <Badge key={i} variant="purple">
                      {spec.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {club.description && (
                <p className="text-sm text-[var(--text-muted)] mt-3">
                  {club.description}
                </p>
              )}

              {Object.keys(contact).length > 0 && (
                <div className="mt-3 space-y-1 text-sm">
                  {contact.email && (
                    <p>
                      <span className="font-medium text-[var(--text-main)]">
                        Email:
                      </span>{" "}
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </p>
                  )}
                  {contact.website && (
                    <p>
                      <span className="font-medium text-[var(--text-main)]">
                        Website:
                      </span>{" "}
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        {contact.website}
                      </a>
                    </p>
                  )}
                  {contact.facebook && (
                    <p>
                      <span className="font-medium text-[var(--text-main)]">
                        Facebook:
                      </span>{" "}
                      <a
                        href={contact.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        {contact.facebook}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
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