import { useState } from 'react';
import { useJobMarket } from '../hooks/useJobMarket';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import Badge from '../components/ui/Badge';
import SkillTags from '../components/ui/SkillTags'; // new component

const ITJobs = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useJobMarket(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-red-500">Failed to load job market data</div>;

  const jobs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IT Jobs & Market</h1>
      <p className="text-gray-600">Discover job roles, salary insights, and demand in Nepal.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{job.role_name}</h2>
              <Badge variant={
                job.market_demand === 'High' ? 'green' :
                job.market_demand === 'Medium' ? 'orange' : 'gray'
              }>
                {job.market_demand} Demand
              </Badge>
            </div>
            <p className="text-gray-600 mt-2">{job.job_summary || job.description}</p>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-medium">Salary Range:</span> {job.salary_range}</p>
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