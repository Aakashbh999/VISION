import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield, Search, AlertCircle, FileText, CheckCircle2, Clock, Inbox, Loader2 } from "lucide-react";
import {
  usePendingResources,
  useApproveResource,
  useRejectResource,
} from "../../hooks/usePendingResources";
import ResourceCard from "../../components/resources/ResourceCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { showToast } from "../../utils/toast";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import useDebounce from "../../hooks/useDebounce";

const PendingResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    const params = { page: page.toString() };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    setSearchParams(params, { replace: true });
  }, [page, debouncedSearchTerm, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, isFetching, error } = usePendingResources(page, 12, debouncedSearchTerm);
  const approveMutation = useApproveResource();
  const rejectMutation = useRejectResource();

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 border border-red-100 shadow-sm">
          <AlertCircle className="w-6 h-6" />
          <div className="flex flex-col">
            <span className="font-bold">Access Restricted</span>
            <span className="text-sm opacity-90">Failed to load pending resources. Ensure you have administrative or moderator privileges.</span>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Approve Resource",
      message: "Are you sure you want to approve this resource for the public library? It will become visible to all students immediately.",
      type: "info",
      confirmText: "Publish Resource",
      onConfirm: () => {
        approveMutation.mutate(id, {
          onSuccess: () => {
            showToast.success("Resource approved and published");
            setModalConfig({ isOpen: false });
          },
          onError: () => showToast.error("Failed to approve resource")
        });
      }
    });
  };

  const handleReject = (id) => {
    setModalConfig({
      isOpen: true,
      title: "Reject Resource",
      message: "Provide a reason for rejecting this resource. The uploader will be notified to help them improve future submissions.",
      type: "warning",
      confirmText: "Confirm Rejection",
      showInput: true,
      placeholder: "e.g., Low quality, duplicate content, incorrect category...",
      onConfirm: (reason) => {
        rejectMutation.mutate({ id, reason }, {
          onSuccess: () => {
            showToast.success("Resource rejected");
            setModalConfig({ isOpen: false });
          },
          onError: () => showToast.error("Failed to reject resource")
        });
      }
    });
  };

  const resources = data?.resources || [];

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-50/10 rounded-xl">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            Review Pipeline
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Curate and verify community-submitted learning materials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search across all pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-purple-500 outline-none transition-colors shadow-sm"
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted bg-bg-card border border-border-main px-4 py-2 rounded-xl shadow-sm">
            <Clock className="w-4 h-4 text-purple-500" />
            {data?.pagination?.total || 0} ITEMS IN PIPELINE
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-bg-card rounded-3xl border border-dashed border-border-main p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-text-main mb-3">
            {searchTerm ? "No Matches Found" : "Pipeline Clear"}
          </h3>
          <p className="text-text-muted max-w-md mx-auto font-medium">
            {searchTerm ? `No pending resources matching "${searchTerm}" were found.` : "No pending resources require your attention. All submitted content is processed."}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div key={resource.resource_id} className="group relative">
                <ResourceCard
                  resource={resource}
                  isModeratorView={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            ))}
          </div>

          {data?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                className="px-6 py-2.5 bg-bg-card border border-border-main rounded-xl font-bold text-text-muted hover:bg-bg-active disabled:opacity-30 disabled:hover:bg-bg-card transition-all shadow-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-muted">PAGE</span>
                <span className="w-10 h-10 flex items-center justify-center bg-text-main text-bg-main rounded-xl font-bold">
                  {page}
                </span>
                <span className="text-sm font-bold text-text-muted">OF {data.totalPages}</span>
              </div>

              <button
                disabled={page === data?.totalPages}
                onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
                className="px-6 py-2.5 bg-bg-card border border-border-main rounded-xl font-bold text-text-muted hover:bg-bg-active disabled:opacity-30 disabled:hover:bg-bg-card transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      <AdminConfirmModal
        {...modalConfig}
        onCancel={() => setModalConfig({ isOpen: false })}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
};

export default PendingResources;
