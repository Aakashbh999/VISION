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
        queryClient.invalidateQueries(["myResources"]);
      } catch (err) {
        toast.error("Failed to delete resource");
      }
    }
  };

  const filteredResources = resources.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <Link
        to="/resources"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium border border-gray-100 bg-white px-4 py-2 rounded-xl shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Resource Library
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">My Uploads</h1>
          <p className="text-gray-500 font-medium">
            Manage the resources you've shared with the community.
          </p>
        </div>
        
        <Link 
          to="/manage" 
          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold shadow-sm"
        >
          Manage All Content <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Filter className="w-5 h-5 text-blue-500" />
          Filter by Status:
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium bg-gray-50"
        >
          <option value="all">All Uploads</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Review</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            No resources uploaded yet
          </h3>
          <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
            Share your knowledge with the community by uploading study
            materials, links, or project work.
          </p>
          <Link
            to="/resources"
            className="inline-flex px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Go to Library to Share
          </Link>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {statusFilter} resources
          </h3>
          <p className="text-gray-500 font-medium">
            Try selecting a different status filter.
          </p>
          <button 
            onClick={() => setStatusFilter("all")}
            className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
          >
            View All Uploads
          </button>
        </div>
      ) : (
      <div className="resource-scroll-container custom-scrollbar">
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
      </div>
      )}
    </div>
  );
};

export default MyResources;
