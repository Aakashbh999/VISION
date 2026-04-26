import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRegistrationWhitelist,
  addRegistrationWhitelist,
  updateRegistrationWhitelist,
  deleteRegistrationWhitelist,
} from "../../services/admin";
import { usePrograms } from "../../hooks/usePrograms";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  AlertCircle,
  Plus,
  Search,
  Trash2,
  Edit2,
  ShieldAlert,
  Calendar,
  GraduationCap,
  History,
  X,
  Check,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import Button from "../../components/ui/Button";
import AdminTable from "../../components/admin_ui/AdminTable";

import { motion, AnimatePresence } from "framer-motion";

const RegistrationWhitelist = () => {
  const [page, setPage] = useState(1);
  const [batchYear, setBatchYear] = useState("");
  const [program, setProgram] = useState("");
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const queryClient = useQueryClient();
  const { data: programsData } = usePrograms();
  const programs = programsData || [];

  const { data, isLoading, error } = useQuery({
    queryKey: ["registration-whitelist", page, batchYear, program],
    queryFn: () => getRegistrationWhitelist({ 
      page, 
      limit: 10, 
      batch_year: batchYear || undefined, 
      program: program || undefined 
    }),
  });

  const addMutation = useMutation({
    mutationFn: addRegistrationWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-whitelist"] });
      showToast.success("New student added to whitelist");
      setIsFormModalOpen(false);
      setEditingRecord(null);
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to add student");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ regNo, data }) => updateRegistrationWhitelist(regNo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-whitelist"] });
      showToast.success("Whitelist record updated");
      setIsFormModalOpen(false);
      setEditingRecord(null);
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to update record");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegistrationWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-whitelist"] });
      showToast.success("Removed from whitelist");
      setModalConfig({ isOpen: false });
    },
  });

  const handleOpenForm = (record = null) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleDelete = (regNo) => {
    setModalConfig({
      isOpen: true,
      title: "Remove from Whitelist",
      message: `Are you sure you want to remove registration ${regNo} from the automatic approval whitelist? Future registrations with this number will require manual approval.`,
      type: "danger",
      confirmText: "Remove Record",
      onConfirm: () => deleteMutation.mutate(regNo),
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load whitelist data
      </div>
    );

  const records = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const columns = [
    {
      header: "Student Info",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-main">{row.student_name}</span>
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">DOB: {row.date_of_birth}</span>
        </div>
      )
    },
    {
      header: "Registration No.",
      render: (row) => (
        <code className="px-2 py-1 bg-purple-500/5 border border-purple-500/10 rounded text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
          {row.registration_number}
        </code>
      )
    },
    {
      header: "Academic Context",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded border border-blue-500/10 uppercase">
            {row.program}
          </span>
          <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
            Batch {row.batch_year}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight">
            Registration Whitelist
          </h1>
          <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wider">
            Automated Approval Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <ShieldAlert className="w-4 h-4" /> Trusted Directory
          </div>
          <Button
            variant="shiny"
            size="sm"
            onClick={() => handleOpenForm()}
            className="rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Records
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-bg-card p-4 rounded-2xl border border-border-main shadow-sm">
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Batch Year</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="number"
              value={batchYear}
              onChange={(e) => {
                setBatchYear(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 2024"
              className="w-full pl-9 pr-4 py-2 bg-bg-active border border-border-main rounded-xl focus:border-purple-500 outline-none text-sm transition-all text-left"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Program</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              value={program}
              onChange={(e) => {
                setProgram(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-bg-active border border-border-main rounded-xl focus:border-purple-500 outline-none text-sm transition-all appearance-none text-left"
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p.program_id} value={p.program_name}>
                  {p.program_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2 flex items-end">
          <button 
            onClick={() => {
              setBatchYear("");
              setProgram("");
              setPage(1);
            }}
            className="text-[10px] font-black uppercase text-text-muted hover:text-purple-600 px-1 mb-2 transition-colors flex items-center gap-1"
          >
            <History className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        onEdit={handleOpenForm}
        onDelete={(row) => handleDelete(row.registration_number)}
        searchPlaceholder="Search this page..."
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${
                page === p
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-bg-card border border-border-main text-text-muted hover:bg-bg-active"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-bg-active/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-bg-card border border-border-main rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-text-main">
                  {editingRecord ? "Edit Record" : "Add to Whitelist"}
                </h2>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 hover:bg-bg-active rounded-xl text-text-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const payload = Object.fromEntries(formData.entries());
                  if (editingRecord) {
                    updateMutation.mutate({ regNo: editingRecord.registration_number, data: payload });
                  } else {
                    addMutation.mutate(payload);
                  }
                }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Registration Number</label>
                  <input
                    name="registration_number"
                    defaultValue={editingRecord?.registration_number || ""}
                    required
                    inputMode="numeric"
                    onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9-]/g, ""); }}
                    placeholder="e.g. 5-2-37-123-2020"
                    className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-2xl focus:border-purple-500 outline-none text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Student Full Name</label>
                  <input
                    name="student_name"
                    defaultValue={editingRecord?.student_name || ""}
                    required
                    placeholder="As per academic documents"
                    className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-2xl focus:border-purple-500 outline-none text-sm font-bold transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Date of Birth (B.S.)</label>
                    <input
                      name="date_of_birth"
                      type="text"
                      inputMode="numeric"
                      defaultValue={editingRecord?.date_of_birth || ""}
                      required
                      placeholder="YYYY-MM-DD"
                      className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-2xl focus:border-purple-500 outline-none text-sm font-bold transition-all"
                      onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9-]/g, ""); }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Batch (B.S.)</label>
                    <input
                      name="batch_year"
                      type="text"
                      inputMode="numeric"
                      defaultValue={editingRecord?.batch_year || ""}
                      required
                      placeholder="e.g. 2058"
                      className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-2xl focus:border-purple-500 outline-none text-sm font-bold transition-all"
                      onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Program</label>
                  <select
                    name="program"
                    defaultValue={editingRecord?.program || ""}
                    required
                    className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-2xl focus:border-purple-500 outline-none text-sm font-bold transition-all appearance-none"
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p.program_id} value={p.program_name}>
                        {p.program_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 rounded-2xl"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="shiny"
                    className="flex-1 rounded-2xl"
                    isLoading={addMutation.isPending || updateMutation.isPending}
                  >
                    {editingRecord ? "Save Changes" : "Confirm Record"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        {...modalConfig}
        onCancel={() => setModalConfig({ isOpen: false })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default RegistrationWhitelist;
