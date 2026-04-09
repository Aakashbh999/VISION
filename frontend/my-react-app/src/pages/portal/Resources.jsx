import React, { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  Award, 
  SlidersHorizontal, 
  ChevronLeft 
} from "lucide-react";
// Forcing a fresh build by refactoring imports.

// Hooks & Context
import { useResources } from "../../hooks/useResources";
import { usePrograms } from "../../hooks/usePrograms";
import { FilterProvider, useFilters } from "../../context/LibraryFilterContext";

// Components
import ResourceCard from "../../components/resources/ResourceCard";
import ResourceUploadModal from "../../components/resources/ResourceUploadModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";

const ResourcesContent = () => {
  const navigate = useNavigate();
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

  const handleViewChange = (view) => {
    updateFilter("view", view);
    updateFilter("page", 1);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-8 lg:px-10 py-3 sm:py-4 md:py-8 lg:py-10 pb-16 sm:pb-20">
      {/* Back navigation */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-purple-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight leading-tight">
            {filters.view === "my" ? "My Uploads" : "Resource Library"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            {filters.semester
              ? `Browsing materials for Semester ${filters.semester}`
              : "Access notes, books, and projects from across the university."}
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 font-bold active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Share Resource
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-6 rounded-sm sm:rounded-2xl shadow-sm border border-[var(--border-main)] border-x-0 sm:border-x mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Library View
            </div>
            <div className="bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleViewChange("all")}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-transparent transition-colors duration-200 ${
                  filters.view === "all"
                    ? "bg-[var(--bg-card)] text-purple-600 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                All Resources
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("my")}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-transparent transition-colors duration-200 ${
                  filters.view === "my"
                    ? "bg-[var(--bg-card)] text-purple-600 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                My Resources
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Sort By
            </div>
            <div className="bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  updateFilter("sort", "latest");
                  updateFilter("page", 1);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-transparent transition-colors duration-200 ${
                  !filters.sort || filters.sort === "latest"
                    ? "bg-[var(--bg-card)] text-purple-600 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Latest
              </button>
              <button
                type="button"
                onClick={() => {
                  updateFilter("sort", "recommended");
                  updateFilter("page", 1);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-transparent transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                  filters.sort === "recommended"
                    ? "bg-[var(--bg-card)] text-purple-600 shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                <Award
                  className={`w-4 h-4 ${filters.sort === "recommended" ? "text-purple-600" : ""}`}
                />
                For You
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold uppercase text-xs tracking-widest">
            <Filter className="w-4 h-4 text-purple-600" />
            Quick Filters
          </div>

          {(filters.search ||
            filters.program_id ||
            filters.resource_type ||
            filters.semester) && (
            <button
              onClick={resetFilters}
              className="text-xs font-black text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="w-full px-4 py-3 bg-[var(--bg-active)] border border-transparent focus:border-purple-200 focus:bg-[var(--bg-card)] rounded-xl text-sm font-bold outline-none transition-all text-[var(--text-main)]"
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
            className="w-full px-4 py-3 bg-[var(--bg-active)] border border-transparent focus:border-purple-200 focus:bg-[var(--bg-card)] rounded-xl text-sm font-bold outline-none transition-all text-[var(--text-main)]"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p.id || p.program_id} value={p.id || p.program_id}>
                {p.program_name || p.name}
              </option>
            ))}
          </select>

          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="w-full px-4 py-3 bg-[var(--bg-active)] border border-transparent focus:border-purple-200 focus:bg-[var(--bg-card)] rounded-xl text-sm font-bold outline-none transition-all text-[var(--text-main)]"
          >
            <option value="">All Semesters</option>
            {Array.from({ length: 8 }, (_, index) => index + 1).map(
              (semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* Content Results */}
      {isLoading ? (
        <div className="py-16 sm:py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 text-red-600 rounded-sm sm:rounded-2xl font-bold border border-red-100 border-x-0 sm:border-x">
          Failed to load resources. Check your connection.
        </div>
      ) : !resourcesData?.data?.length || resourcesData?.noResults ? (
        <div className="text-center py-14 sm:py-20 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-main)] border-x-0 sm:border-x rounded-sm sm:rounded-3xl">
          {resourcesData?.noResults ? (
            <div className="max-w-3xl mx-auto px-3 sm:px-6">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[var(--text-main)] uppercase mb-2 leading-tight">
                No matches for "{filters.search}"
              </h3>
              <p className="text-[var(--text-muted)] font-bold mb-8 sm:mb-10">
                Try these recommended resources instead:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {resourcesData.recommendations?.resources?.map((rec) => (
                  <Link
                    key={rec.id}
                    to={`/resources?id=${rec.id}`}
                    className="group p-4 bg-[var(--bg-active)] border border-transparent hover:border-purple-200 hover:bg-[var(--bg-card)] hover:shadow-xl rounded-2xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--bg-card)] rounded-xl shadow-sm group-hover:bg-purple-50 transition-colors">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--text-main)] truncate group-hover:text-purple-600">
                          {rec.title}
                        </p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                          Sem {rec.semester} • {rec.avg_score} ★
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 sm:py-10">
              <div className="w-16 h-16 bg-[var(--bg-active)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] uppercase">
                No results found
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {resourcesData.data.map((resource) => (
            <ResourceCard key={resource.resource_id} resource={resource} />
          ))}
        </div>
      )}

      <ResourceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

const Resources = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize filters from URL search params on mount to avoid double-fetching
  const initialFilters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      resource_type: searchParams.get("resource_type") || "",
      program_id: searchParams.get("program_id") || "",
      semester: searchParams.get("semester") || "",
      degree_id: searchParams.get("degree_id") || "",
      view: searchParams.get("view") || "all",
      page: parseInt(searchParams.get("page"), 10) || 1,
      limit: 12,
    };
  }, [searchParams]);

  return (
    <FilterProvider initialFilters={initialFilters}>
      <ResourcesContent />
    </FilterProvider>
  );
};

export default Resources;
