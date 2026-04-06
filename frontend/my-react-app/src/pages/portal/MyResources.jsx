import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Search, ExternalLink, Filter } from "lucide-react";
import { useMyResources } from "../../hooks/useMyResources";
import ResourceCard from "../../components/resources/ResourceCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { softDeleteResource } from "../../services/resource";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

const MyResources = () => {
  const { data: resources = [], isLoading, error } = useMyResources();
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 text-red-600 rounded-xl">
        Failed to load your resources. Please try again.
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await softDeleteResource(id, "User deleted their own resource");
        toast.success("Resource deleted successfully");
        queryClient.invalidateQueries(["my-resources"]);
      } catch {
        toast.error("Failed to delete resource");
      }
    }
  };

  const filteredResources = resources.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10 px-0 sm:px-6 lg:px-8">
      <Link
        to="/resources"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-purple-600 mb-6 transition-colors font-medium border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 rounded-xl shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Resource Library
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-2 tracking-tight">
            My Uploads
          </h1>
          <p className="text-[var(--text-muted)] font-medium">
            Manage the resources you've shared with the community.
          </p>
        </div>

        <Link
          to="/manage"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-active)] hover:border-[var(--border-main)] transition-all font-bold shadow-sm"
        >
          Manage All Content <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-[var(--bg-card)] p-4 rounded-sm sm:rounded-2xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-[var(--text-main)]">
          <Filter className="w-5 h-5 text-purple-600" />
          Filter by Status:
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[var(--border-main)] rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-medium bg-[var(--bg-active)] text-[var(--text-main)]"
        >
          <option value="all">All Uploads</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Review</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {resources.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x p-10 sm:p-16 text-center">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-3">
            No resources uploaded yet
          </h3>
          <p className="text-[var(--text-muted)] font-medium mb-8 max-w-md mx-auto">
            Share your knowledge with the community by uploading study
            materials, links, or project work.
          </p>
          <Link
            to="/resources"
            className="inline-flex px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
          >
            Go to Library to Share
          </Link>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-14 sm:py-20 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-main)] border-x-0 sm:border-x rounded-sm sm:rounded-3xl">
          <div className="w-16 h-16 bg-[var(--bg-active)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
            No {statusFilter} resources
          </h3>
          <p className="text-[var(--text-muted)] font-medium">
            Try selecting a different status filter.
          </p>
          <button
            onClick={() => setStatusFilter("all")}
            className="mt-6 px-6 py-2 bg-[var(--bg-active)] hover:bg-[var(--border-main)] text-[var(--text-main)] rounded-xl font-bold transition-colors"
          >
            View All Uploads
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.resource_id}
              resource={resource}
              showStatus={true}
              onDelete={() => handleDelete(resource.resource_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResources;
