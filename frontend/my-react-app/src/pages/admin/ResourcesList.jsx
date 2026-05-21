import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen, Plus, Search, Filter, RefreshCw, Eye, Edit3, Trash2, 
  RotateCcw, SlidersHorizontal, Book, FileText, Code, Link2, 
  CheckCircle2, Clock, AlertOctagon, Archive, GraduationCap,
  Sparkles
} from "lucide-react";
import {
  getAdminResources,
  createAdminResource,
  deleteAdminResource,
  restoreAdminResource,
  bulkDeleteAdminResources,
  bulkRestoreAdminResources,
  programsApi,
  academicDegreesApi
} from "../../services/admin";
import { showToast } from "../../utils/toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import ResourceFormModal from "./ResourceFormModal";
import Button from "../../components/ui/Button";
import useDebounce from "../../hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

const ResourcesList = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Basic search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [programFilter, setProgramFilter] = useState(searchParams.get("program") || "all");
  const [degreeFilter, setDegreeFilter] = useState(searchParams.get("degree") || "all");
  const [semesterFilter, setSemesterFilter] = useState(searchParams.get("semester") || "all");
  const [deletedFilter, setDeletedFilter] = useState(searchParams.get("deleted") || "all");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sort") || "created_at_desc");
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit")) || 10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  // Counts / Metrics state
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    active: 0,
    deleted: 0
  });

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Keep search params in sync with component state
  useEffect(() => {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      sort: sortOrder,
    };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (statusFilter !== "all") params.status = statusFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (programFilter !== "all") params.program = programFilter;
    if (degreeFilter !== "all") params.degree = degreeFilter;
    if (semesterFilter !== "all") params.semester = semesterFilter;
    if (deletedFilter !== "all") params.deleted = deletedFilter;

    setSearchParams(params, { replace: true });
  }, [
    page, limit, debouncedSearchTerm, statusFilter, typeFilter,
    programFilter, degreeFilter, semesterFilter, deletedFilter, sortOrder, setSearchParams
  ]);

  // Reset to page 1 and clear selection whenever any filter changes
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearchTerm, statusFilter, typeFilter, programFilter, degreeFilter, semesterFilter, deletedFilter, sortOrder]);

  // Fetch Programs & Degrees for filter dropdowns
  const { data: programsData = [] } = useQuery({
    queryKey: ["adminFilterPrograms"],
    queryFn: programsApi.getAll,
  });

  const { data: degreesData = [] } = useQuery({
    queryKey: ["adminFilterDegrees"],
    queryFn: academicDegreesApi.getAll,
  });

  const programs = programsData?.data || programsData || [];
  const degrees = degreesData?.data || degreesData || [];

  // Parallel fetch counts for the top metrics cards
  const fetchMetricsCounts = async () => {
    try {
      const [totalRes, pendingRes, activeRes, deletedRes] = await Promise.all([
        getAdminResources({ limit: 1 }),
        getAdminResources({ limit: 1, status: "pending", deleted: "exclude" }),
        getAdminResources({ limit: 1, status: "approved", deleted: "exclude" }),
        getAdminResources({ limit: 1, deleted: "only" })
      ]);
      setMetrics({
        total: totalRes.data?.pagination?.total || totalRes.pagination?.total || totalRes.total || 0,
        pending: pendingRes.data?.pagination?.total || pendingRes.pagination?.total || pendingRes.total || 0,
        active: activeRes.data?.pagination?.total || activeRes.pagination?.total || activeRes.total || 0,
        deleted: deletedRes.data?.pagination?.total || deletedRes.pagination?.total || deletedRes.total || 0
      });
    } catch (err) {
      console.error("Failed to load resource dashboard metrics", err);
    }
  };

  useEffect(() => {
    fetchMetricsCounts();
  }, [page, debouncedSearchTerm, statusFilter, typeFilter, deletedFilter]);

  // Primary Query: Fetch resource records with administrative filters
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [
      "adminResourcesList", page, limit, debouncedSearchTerm,
      statusFilter, typeFilter, programFilter, degreeFilter, semesterFilter, deletedFilter, sortOrder
    ],
    queryFn: () => getAdminResources({
      page,
      limit,
      search: debouncedSearchTerm,
      status: statusFilter,
      resource_type: typeFilter,
      program_id: programFilter,
      degree_id: degreeFilter,
      semester: semesterFilter,
      deleted: deletedFilter,
      sort: sortOrder
    }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdminResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminResourcesList"] });
      showToast.success("Library resource published successfully");
      setIsFormOpen(false);
      fetchMetricsCounts();
    },
    onError: (err) => showToast.error(err.response?.data?.error || "Failed to create resource")
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, hard, reason }) => deleteAdminResource(id, hard, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminResourcesList"] });
      showToast.success(variables.hard ? "Resource permanently purged" : "Resource marked as soft-deleted");
      setConfirmModal({ isOpen: false });
      fetchMetricsCounts();
    },
    onError: (err) => showToast.error(err.response?.data?.error || "Action failed")
  });

  const restoreMutation = useMutation({
    mutationFn: restoreAdminResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminResourcesList"] });
      showToast.success("Soft-deleted resource restored to active status");
      fetchMetricsCounts();
    },
    onError: (err) => showToast.error(err.response?.data?.error || "Failed to restore resource")
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ ids, hard, reason }) => bulkDeleteAdminResources(ids, hard, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminResourcesList"] });
      showToast.success(variables.hard ? "Selected resources permanently purged" : "Selected resources marked as soft-deleted");
      setConfirmModal({ isOpen: false });
      setSelectedIds(new Set());
      fetchMetricsCounts();
    },
    onError: (err) => showToast.error(err.message || "Bulk action failed")
  });

  const bulkRestoreMutation = useMutation({
    mutationFn: bulkRestoreAdminResources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminResourcesList"] });
      showToast.success("Selected resources restored to active status");
      setSelectedIds(new Set());
      fetchMetricsCounts();
    },
    onError: (err) => showToast.error(err.message || "Bulk restore failed")
  });

  const handleOpenCreateModal = () => {
    setIsFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const handleSoftDelete = (resource) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Library Content",
      message: `Are you sure you want to soft-delete "${resource.title}"? It will be hidden from student library pools but kept in database logs.`,
      type: "warning",
      confirmText: "Archive Content",
      showInput: true,
      placeholder: "Specify reason (e.g. Outdated content, duplicate)...",
      onConfirm: (reason) => deleteMutation.mutate({ id: resource.resource_id, hard: false, reason })
    });
  };

  const handleHardDelete = (resource) => {
    setConfirmModal({
      isOpen: true,
      title: "Permanent Database Purge",
      message: `CAUTION: You are about to permanently delete "${resource.title}". This action will purge all student scores, downloads, tag links, and destroy physical media on Cloudinary. It CANNOT be undone.`,
      type: "danger",
      confirmText: "Purge Permanently",
      showInput: true,
      placeholder: "Required: Specify authorization reason...",
      onConfirm: (reason) => deleteMutation.mutate({ id: resource.resource_id, hard: true, reason })
    });
  };

  const handleRestore = (resourceId) => {
    restoreMutation.mutate(resourceId);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = resources.map((r) => r.resource_id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (e, id) => {
    const newSet = new Set(selectedIds);
    if (e.target.checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setProgramFilter("all");
    setDegreeFilter("all");
    setSemesterFilter("all");
    setDeletedFilter("all");
    setSortOrder("created_at_desc");
    setPage(1);
    setSelectedIds(new Set());
  };

  const resources = data?.data || data?.resources || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || data?.totalPages || 1;

  // Render correct resource type icon
  const renderTypeIcon = (type) => {
    const iconClass = "w-4 h-4 shrink-0";
    switch (type) {
      case "notes": return <FileText className={`${iconClass} text-sky-500`} />;
      case "book": return <Book className={`${iconClass} text-indigo-500`} />;
      case "project": return <Code className={`${iconClass} text-emerald-500`} />;
      case "link": return <Link2 className={`${iconClass} text-purple-500`} />;
      default: return <BookOpen className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24 space-y-8 text-left">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl">
              <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            All Library Resources
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Perform administrative CRUD, configure academic taxonomies, and manage physical media assets.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 duration-200"
        >
          <Plus className="w-5 h-5" /> Publish Resource
        </button>
      </div>

      {/* 2. Metrics Ribbon Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Uploaded", count: metrics.total, color: "from-blue-500/5 to-cyan-500/5 text-blue-600 border-blue-500/10", icon: BookOpen, filterVal: "all", filterType: "deleted" },
          { label: "Pending Review", count: metrics.pending, color: "from-amber-500/5 to-orange-500/5 text-amber-600 border-amber-500/10 animate-pulse", icon: Clock, filterVal: "pending", filterType: "status" },
          { label: "Active Library", count: metrics.active, color: "from-green-500/5 to-emerald-500/5 text-green-600 border-green-500/10", icon: CheckCircle2, filterVal: "approved", filterType: "status" },
          { label: "Archived / Deleted", count: metrics.deleted, color: "from-slate-500/5 to-gray-500/5 text-gray-500 border-slate-500/10", icon: Archive, filterVal: "only", filterType: "deleted" }
        ].map((card, idx) => (
          <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            key={idx}
            onClick={() => {
              resetFilters();
              if (card.filterType === "status") {
                setStatusFilter(card.filterVal);
                setDeletedFilter("exclude");
              } else {
                setDeletedFilter(card.filterVal);
              }
            }}
            className={`p-5 rounded-3xl bg-gradient-to-br ${card.color} border flex items-center justify-between shadow-sm relative overflow-hidden text-left w-full`}
          >
            <div className="space-y-1 z-10">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">{card.label}</span>
              <span className="text-3xl font-black text-text-main block">{card.count}</span>
            </div>
            <div className="p-3 bg-bg-card/85 backdrop-blur-sm rounded-2xl shadow-sm z-10 border border-border-main/50">
              <card.icon className="w-6 h-6" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* 3. Filtering and Searching Controls */}
      <div className="bg-bg-card border border-border-main rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search resource titles, descriptions, uploaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-bg-active/50 border border-border-main rounded-2xl text-sm focus:border-blue-500 outline-none transition-colors text-text-main font-semibold shadow-inner"
            />
            {isFetching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center gap-2 ${
                showFilters || statusFilter !== "all" || typeFilter !== "all" || programFilter !== "all" || degreeFilter !== "all" || semesterFilter !== "all" || deletedFilter !== "all"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  : "bg-bg-card border-border-main text-text-muted hover:bg-bg-active"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="px-4 py-3 bg-bg-active hover:bg-bg-main border border-border-main rounded-2xl text-sm font-bold text-text-muted transition-colors"
              title="Reset Search & Filters"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sliding Advanced Filters Grid */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border-main/50 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                {/* 1. Status Filter */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">State status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">All States</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* 2. Resource Type Filter */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Resource Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="book">Reference Book</option>
                    <option value="project">Project Work</option>
                    <option value="link">External Link / Video</option>
                  </select>
                </div>

                {/* 3. Program Filter */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Program</label>
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">All Programs</option>
                    {programs.map(prog => (
                      <option key={prog.program_id} value={prog.program_id}>{prog.name || prog.program_name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Degree Filter */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Academic Degree</label>
                  <select
                    value={degreeFilter}
                    onChange={(e) => setDegreeFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">All Degrees</option>
                    {degrees.map(deg => (
                      <option key={deg.degree_id || deg.id} value={deg.degree_id || deg.id}>{deg.name || deg.degree_code}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Semester Filter */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Semester</label>
                  <select
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Deletion status */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Archived Options</label>
                  <select
                    value={deletedFilter}
                    onChange={(e) => setDeletedFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="all">Show All (Live & Soft-deleted)</option>
                    <option value="exclude">Exclude Soft-deleted</option>
                    <option value="only">Show Only Soft-deleted</option>
                  </select>
                </div>

                {/* 7. Sorting Order */}
                <div>
                  <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">Sort By</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-xs text-text-main font-semibold outline-none focus:border-blue-500"
                  >
                    <option value="created_at_desc">Upload Date (Newest)</option>
                    <option value="created_at_asc">Upload Date (Oldest)</option>
                    <option value="title_asc">Title (A to Z)</option>
                    <option value="title_desc">Title (Z to A)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Table Layout Container */}
      <div className="bg-bg-card border border-border-main rounded-3xl overflow-hidden shadow-sm relative">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-xs text-text-muted font-bold tracking-wider mt-4">PULLING RECORDS...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-border-main/50 m-6 rounded-2xl flex flex-col items-center justify-center bg-bg-active/10">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text-main mb-1">No Library Content Found</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              We couldn't locate any resource matching the current filters or query. Expand criteria or reset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-main/50 text-left">
              <thead className="bg-bg-active/30">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-border-main text-blue-600 focus:ring-blue-500 bg-bg-card"
                      checked={resources.length > 0 && selectedIds.size === resources.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Resource Metadata</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category / Sem</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Uploader Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">State status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/40">
                {resources.map((res) => {
                  const isDeleted = !!res.deleted_at;
                  return (
                    <tr
                      key={res.resource_id}
                      className={`hover:bg-bg-active/20 transition-all ${isDeleted ? "bg-slate-500/5 dark:bg-slate-500/10 text-text-muted opacity-80" : ""} ${selectedIds.has(res.resource_id) ? "bg-blue-500/5 dark:bg-blue-500/10" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-border-main text-blue-600 focus:ring-blue-500 bg-bg-card"
                          checked={selectedIds.has(res.resource_id)}
                          onChange={(e) => handleSelectOne(e, res.resource_id)}
                        />
                      </td>
                      {/* Column 1: Info & Tags */}
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-bg-active/60 rounded-xl border border-border-main/50 mt-0.5 shadow-sm">
                            {renderTypeIcon(res.resource_type)}
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <span className={`font-bold block text-sm text-text-main truncate ${isDeleted ? "line-through text-text-muted font-semibold" : ""}`} title={res.title}>
                              {res.title}
                            </span>
                            {res.description && (
                              <p className="text-xs text-text-muted line-clamp-1 max-w-sm">
                                {res.description}
                              </p>
                            )}
                            {/* Tags Flex List */}
                            {Array.isArray(res.tags) && res.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1.5">
                                {res.tags.map(t => (
                                  <span
                                    key={t.tag_id}
                                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                      t.tag_type === "system"
                                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/10 dark:text-blue-400"
                                        : "bg-purple-500/10 text-purple-600 border border-purple-500/10 dark:text-purple-400"
                                    }`}
                                  >
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Program & Semester */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-text-main flex items-center gap-1.5 uppercase tracking-wide">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                            {res.degree_name || "General"}
                          </span>
                          <span className="text-[10px] text-text-muted mt-1 font-semibold truncate max-w-[150px]">
                            {res.program_name || "No Program Restriction"}
                          </span>
                          <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded w-fit mt-1.5 uppercase">
                            {res.semester ? `Semester ${res.semester}` : "Elective"}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Uploader Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-text-main truncate max-w-[150px]">
                            {res.uploader_name || "System Admin"}
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5 truncate max-w-[150px]">
                            {res.uploader_email || "admin@vision.org"}
                          </span>
                          <span className="text-[9px] text-text-muted mt-1.5 font-bold">
                            {new Date(res.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Verification badges */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isDeleted ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center w-fit gap-1.5 border bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20">
                            <Archive className="w-3.5 h-3.5" />
                            Archived
                          </span>
                        ) : res.status === "approved" ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center w-fit gap-1.5 border bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Live
                          </span>
                        ) : res.status === "pending" ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center w-fit gap-1.5 border bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center w-fit gap-1.5 border bg-red-500/10 text-red-500 border-red-500/20">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Column 5: Action Group */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2.5">
                          {/* 1. View Source Link */}
                          {(res.file_url || res.url) && (
                            <a
                              href={res.file_url || res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all border border-border-main/20 hover:border-green-500/20"
                              title="View Document URL"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}

                          {/* 2. Soft-delete / Restore Toggles */}
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestore(res.resource_id)}
                              className="p-2 text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all border border-border-main/20 hover:border-emerald-500/20"
                              title="Restore Archived Resource"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(res)}
                              className="p-2 text-text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-border-main/20 hover:border-amber-500/20"
                              title="Soft-Delete (Archive)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {/* 4. Permanent Hard delete */}
                          <button
                            onClick={() => handleHardDelete(res)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-border-main/20 hover:border-red-500/20"
                            title="PERMANENT PURGE FROM DATABASE"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-main flex flex-col sm:flex-row justify-between items-center gap-4 bg-bg-active/10">
            {/* Show selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-bold">ITEMS PER PAGE</span>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-2.5 py-1 bg-bg-card border border-border-main rounded-lg text-xs font-bold text-text-main"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Navigation keys */}
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 bg-bg-card border border-border-main hover:bg-bg-active font-bold text-xs text-text-muted rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-bg-card shadow-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-muted font-bold">PAGE</span>
                <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold text-xs shadow">
                  {page}
                </span>
                <span className="text-xs text-text-muted font-bold">OF {totalPages}</span>
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 bg-bg-card border border-border-main hover:bg-bg-active font-bold text-xs text-text-muted rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-bg-card shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Form creation/editing Modal Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <ResourceFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending}
            onSubmit={handleFormSubmit}
          />
        )}
      </AnimatePresence>

      {/* 7. Action confirmation dialog Modal */}
      <AdminConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ isOpen: false })}
        isLoading={deleteMutation.isPending || bulkDeleteMutation.isPending}
      />

      {/* 8. Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-bg-card/95 backdrop-blur-md border border-border-main shadow-2xl rounded-2xl p-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-full font-bold">
                {selectedIds.size}
              </div>
              <span className="text-sm font-bold text-text-main">Items Selected</span>
            </div>
            <div className="h-8 w-px bg-border-main"></div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "Bulk Archive",
                    message: `Are you sure you want to soft-delete ${selectedIds.size} resources?`,
                    type: "warning",
                    confirmText: "Archive Selected",
                    showInput: true,
                    placeholder: "Specify reason...",
                    onConfirm: (reason) => bulkDeleteMutation.mutate({ ids: Array.from(selectedIds), hard: false, reason })
                  });
                }}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                disabled={bulkDeleteMutation.isPending || bulkRestoreMutation.isPending}
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
              <button
                onClick={() => bulkRestoreMutation.mutate(Array.from(selectedIds))}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                disabled={bulkDeleteMutation.isPending || bulkRestoreMutation.isPending}
              >
                <RotateCcw className="w-4 h-4" /> Restore
              </button>
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "Bulk Permanent Purge",
                    message: `CAUTION: You are about to permanently delete ${selectedIds.size} resources. This CANNOT be undone.`,
                    type: "danger",
                    confirmText: "Purge Permanently",
                    showInput: true,
                    placeholder: "Required: Specify authorization reason...",
                    onConfirm: (reason) => bulkDeleteMutation.mutate({ ids: Array.from(selectedIds), hard: true, reason })
                  });
                }}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                disabled={bulkDeleteMutation.isPending || bulkRestoreMutation.isPending}
              >
                <Trash2 className="w-4 h-4" /> Purge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResourcesList;
