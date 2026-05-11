import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programsApi } from "../../../services/admin";
import { toast } from "react-toastify";
import AdminTable from "../../../components/admin_ui/AdminTable";
import AdminConfirmModal from "../../../components/ui/AdminConfirmModal";
import Button from "../../../components/ui/Button";
import { Plus } from "lucide-react";

const Programs = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ program_name: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["adminPrograms"],
    queryFn: programsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: programsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPrograms"] });
      toast.success("Program added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add item")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => programsApi.update(editingItem.program_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPrograms"] });
      toast.success("Program updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update item")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => programsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPrograms"] });
      toast.success("Program deleted successfully");
      setConfirmModal({ isOpen: false });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete item")
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ program_name: item.program_name });
    } else {
      setEditingItem(null);
      setFormData({ program_name: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const confirmDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Program",
      message: `Are you sure you want to delete ${item.program_name}? Students associated with this program may lose their program reference.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutate(item.program_id)
    });
  };

  const columns = [
    { header: "Program ID", accessor: "program_id", render: (row) => <span className="text-text-muted">#{row.program_id}</span> },
    { header: "Program Name", accessor: "program_name", render: (row) => <span className="font-bold">{row.program_name}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Programs</h1>
          <p className="text-sm text-text-muted mt-1">Manage academic programs available for student registration.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Program
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={data.data || data}
        isLoading={isLoading}
        error={error}
        onEdit={handleOpenModal}
        onDelete={confirmDelete}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
              <h2 className="text-lg font-bold text-text-main">{editingItem ? "Edit Program" : "Add Program"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Program Name *</label>
                <input
                  required
                  value={formData.program_name}
                  onChange={(e) => setFormData({program_name: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm outline-none focus:border-blue-500"
                  placeholder="e.g. BSc.CSIT"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-main">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" variant="shiny" isLoading={createMutation.isPending || updateMutation.isPending} className="rounded-xl">
                  {editingItem ? "Update Program" : "Save Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ isOpen: false })} isLoading={deleteMutation.isPending} />
    </div>
  );
};

export default Programs;
