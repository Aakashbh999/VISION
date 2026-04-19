import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMyResources } from "../../../hooks/useMyResources";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import DeleteAction from "../../../components/DeleteAction";
import EmptyState from "../../../components/ui/EmptyState";
import StatusBadge from "../../../components/ui/StatusBadge";

const ResourcesPanel = () => {
  const { data: resources = [], isLoading } = useMyResources();

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-[var(--text-main)]">
          Resource Uploads
        </h2>
        <Link
          to="/resources/my"
          className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          View in Library <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Resources Found"
          description="You haven't uploaded any resources yet."
          actionText="Go to Library"
          actionHref="/resources"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-main)]">
                {["Title", "Type", "Date", "Status", "Actions"].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`pb-4 font-bold text-[var(--text-muted)] uppercase text-xs tracking-wider${
                        i === 4 ? " text-right" : ""
                      }`}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {resources.map((resource) => (
                <tr
                  key={resource.resource_id}
                  className="group hover:bg-[var(--bg-active)] transition-colors"
                >
                  <td className="py-4 pr-4">
                    <p className="font-bold text-[var(--text-main)] mb-1 truncate max-w-xs">
                      {resource.title}
                    </p>
                  </td>
                  <td className="py-4 pr-4 text-[var(--text-muted)] capitalize text-sm">
                    {resource.resource_type}
                  </td>
                  <td className="py-4 pr-4 text-[var(--text-muted)] text-sm">
                    {formatDistanceToNow(new Date(resource.created_at), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="py-4 pr-4">
                    <StatusBadge status={resource.status} />
                  </td>
                  <td className="py-4 text-right">
                    <DeleteAction
                      targetType="resource"
                      targetId={resource.resource_id}
                      itemName={resource.title}
                      buttonClassName="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      label={<span>Delete</span>}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourcesPanel;
