import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, X, Award } from "lucide-react";

// Hooks & Context
import { useResources } from "../../hooks/useResources";
import { usePrograms } from "../../hooks/usePrograms";
import { FilterProvider, useFilters } from "../../context/LibraryFilterContext";

// Components
import ResourceCard from "../../components/resources/ResourceCard";
import ResourceUploadModal from "../../components/resources/ResourceUploadModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
import LibraryLayout from "../../components/resources/LibraryLayout";

const ResourcesContent = () => {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Data Fetching
  const { data: resourcesData, isLoading, error } = useResources(filters);
  const { data: programsData } = usePrograms();

  const programs = programsData?.data || programsData || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    updateFilter(name, value);
    if (name !== "page") updateFilter("page", 1);
  };

  return (
    <LibraryLayout>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {filters.view === "my" ? "My Uploads" : "Resource Library"}
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            {filters.semester
              ? `Browsing materials for Semester ${filters.semester}`
              : "Access notes, books, and projects from across the university."}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-bold active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Share Resource
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold uppercase text-xs tracking-widest">
            <Filter className="w-4 h-4 text-blue-500" />
            Quick Filters
          </div>

          {(filters.search ||
            filters.program_id ||
            filters.resource_type) && (
            <button
              onClick={resetFilters}
              className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalSearch
            placeholder="Search by topic..."
            initialValue={filters.search}
            onSearch={(val) => updateFilter("search", val)}
            isLoading={isLoading}
          />

          <select
            name="resource_type"
            value={filters.resource_type}
            onChange={handleFilterChange}
            className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl text-sm font-bold outline-none transition-all"
          >
            <option value="">All Formats</option>
            <option value="notes">Lecture Notes</option>
            <option value="book">Textbooks</option>
            <option value="project">Student Projects</option>
            <option value="link">External Links</option>
            <option value="pdf">PDF Documents</option>
            <option value="image">Images</option>
          </select>

          <select
            name="program_id"
            value={filters.program_id}
            onChange={handleFilterChange}
            className="w-full px-4 py-3 bg-slate-50 border border-transparent focus:border-blue-200 focus:bg-white rounded-xl text-sm font-bold outline-none transition-all"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id || p.program_id} value={p.id || p.program_id}>
                {p.program_name || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Results */}
      {isLoading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100">
          Failed to load resources. Please check your connection.
        </div>
      ) : !resourcesData?.data?.length || resourcesData?.noResults ? (
        <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
          {resourcesData?.noResults ? (
            <div className="max-w-3xl mx-auto px-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">
                No matches for "{filters.search}"
              </h3>
              <p className="text-slate-500 font-bold mb-10">
                Try these recommended resources instead:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {resourcesData.recommendations?.resources?.map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/portal/resources?id=${rec.id}`}
                    className="group p-4 bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl rounded-2xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                        <Award className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate group-hover:text-blue-600">
                          {rec.title}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          Sem {rec.semester} • {rec.avg_score} ★
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase">
                No results found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {resourcesData.data.map((resource) => (
            <ResourceCard key={resource.resource_id} resource={resource} />
          ))}
        </div>
      )}

      <ResourceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </LibraryLayout>
  );
};

const Resources = () => (
  <FilterProvider>
    <ResourcesContent />
  </FilterProvider>
);

export default Resources;
