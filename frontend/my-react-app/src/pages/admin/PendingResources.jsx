import React, { useState } from "react";
import { Shield, Search, AlertCircle, FileText } from "lucide-react";
import {
  usePendingResources,
  useApproveResource,
  useRejectResource,
} from "../../hooks/usePendingResources";
import ResourceCard from "../../components/resources/ResourceCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const PendingResources = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePendingResources(page, 12);
  const approveMutation = useApproveResource();
  const rejectMutation = useRejectResource();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>
            Failed to load pending resources. You may not have permission to
            view this.
          </span>
        </div>
      </div>
    );
  }

  const handleApprove = (id) => {
    if (
      window.confirm(
        "Are you sure you want to approve this resource? It will become public and the user will receive 10 reputation points.",
      )
    ) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt(
      "Please provide a reason for rejection (optional):",
    );
    if (reason !== null) {
      // if not cancelled
      rejectMutation.mutate({ id, reason });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Moderator Panel: Pending Resources
        </h1>
        <p className="text-gray-600 mt-2 ml-11">
          Review resources submitted by students before they become public in
          the Library.
        </p>
      </div>

      {data?.resources?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            There are no pending resources to review at the moment.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.resources?.map((resource) => (
              <ResourceCard
                key={resource.resource_id}
                resource={resource}
                isModeratorView={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>

          {data?.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-600 font-medium">
                Page {page} of {data.totalPages}
              </span>
              <button
                disabled={page === data?.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingResources;
