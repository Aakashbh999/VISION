import { useState } from "react";
import { useItFields } from "../hooks/useItFields";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Pagination from "../components/ui/Pagination";
import ITFieldCard from "../components/ui/ITFieldCard";
import {
  Code2,
  Shield,
  Brain,
  Cloud,
  Database,
  Smartphone,
  BarChart3,
  GitBranch,
  Globe,
  Lock,
  Zap,
  Terminal,
  Server,
  Wifi,
} from "lucide-react";

// Helper to pick an icon based on the field name
const getIconForField = (fieldName) => {
  const name = fieldName.toLowerCase();
  if (name.includes("web")) return Code2;
  if (name.includes("security") || name.includes("cyber")) return Shield;
  if (name.includes("ai") || name.includes("machine")) return Brain;
  if (name.includes("cloud")) return Cloud;
  if (name.includes("data")) return Database;
  if (name.includes("mobile")) return Smartphone;
  if (name.includes("devops")) return GitBranch;
  if (name.includes("analytics")) return BarChart3;
  return Code2; // fallback
};

const ITFields = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useItFields(page, 9);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load IT fields</div>;

  const fields = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-8 px-0 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
        Career Fields
      </h1>
      <p className="text-[var(--text-muted)]">
        Explore various IT fields and find the right path for your career.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <ITFieldCard
            key={field.id}
            item={{
              name: field.field_name,
              shortDescription: field.short_description,
              demand: field.demand,
              slug: field.slug,
              icon: getIconForField(field.field_name),
              motivation: field.motivation, // if available
            }}
          />
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
