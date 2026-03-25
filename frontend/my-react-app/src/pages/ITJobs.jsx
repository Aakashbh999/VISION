import { useState } from "react";
import { useJobMarket } from "../hooks/useJobMarket";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import Badge from "../components/ui/Badge";
import SkillTags from "../components/ui/SkillTags";

const demandColor = (demand) => {
  switch (demand) {
    case "High":
      return "purple";
    case "Medium":
      return "orange";
    default:
      return "gray";
  }
};

const ITJobs = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useJobMarket(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500">
        Failed to load job market data. Please try again.
      </div>
    );

  const jobs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
        IT Jobs & Market
      </h1>
      <p className="text-[var(--text-muted)]">
        Discover job roles, salary insights, and demand in Nepal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-[var(--text-main)]">
                {job.role_name}
              </h2>
              <Badge variant={demandColor(job.market_demand)}>
                {job.market_demand} Demand
              </Badge>
            </div>

            <p className="text-[var(--text-muted)] mt-2">
              {job.job_summary || job.description}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium text-[var(--text-main)]">Salary Range:</span>{" "}
                <span className="text-[var(--text-muted)]">{job.salary_range}</span>
              </p>
              <SkillTags skillsString={job.key_skills} />
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

export default ITJobs;