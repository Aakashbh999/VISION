import { useState } from "react";
import { useAcademicDegrees } from "../hooks/useAcademicDegrees";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import Badge from "../components/ui/Badge";
import SkillTags from "../components/ui/SkillTags";

const EligibilityDisplay = ({ eligibility }) => {
  if (!eligibility) return null;

  if (typeof eligibility === "string") {
    return <p>{eligibility}</p>;
  }

  if (typeof eligibility === "object") {
    return (
      <div className="space-y-1 text-sm">
        {eligibility.level && (
          <p>
            <span className="font-medium">Level:</span> {eligibility.level}
          </p>
        )}
        {eligibility.stream && (
          <p>
            <span className="font-medium">Stream:</span> {eligibility.stream}
          </p>
        )}
        {eligibility.subjects?.length > 0 && (
          <p>
            <span className="font-medium">Subjects:</span>{" "}
            {eligibility.subjects.join(", ")}
          </p>
        )}
        {eligibility.minAggregate && (
          <p>
            <span className="font-medium">Minimum Aggregate:</span>{" "}
            {eligibility.minAggregate}%
          </p>
        )}
        {eligibility.aLevelEquivalent && (
          <p>
            <span className="font-medium">A-Level:</span>{" "}
            {String(eligibility.aLevelEquivalent)}
          </p>
        )}
      </div>
    );
  }

  return <p>{String(eligibility)}</p>;
};

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
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
        Academic Guide
      </h1>
      <p className="text-[var(--text-muted)]">
        Compare IT programs and choose the right academic path.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {degrees.map((degree) => (
          <div
            key={degree.id}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-[var(--text-main)]">
                {degree.degree_code}
              </h2>
              <Badge variant="purple">{degree.university}</Badge>
            </div>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {degree.full_name}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium text-[var(--text-main)]">
                  Duration:
                </span>{" "}
                <span className="text-[var(--text-muted)]">
                  {degree.duration}
                </span>
              </p>
              <div>
                <span className="font-medium text-[var(--text-main)]">
                  Eligibility:
                </span>
                <EligibilityDisplay eligibility={degree.eligibility} />
              </div>
              <div>
                <span className="font-medium text-[var(--text-main)]">
                  Focus:
                </span>
                <SkillTags
                  skills={degree.focus_area}
                  maxVisible={4}
                  className="mt-1"
                  badgeVariant="green"
                  badgeTone="soft"
                />
              </div>
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
