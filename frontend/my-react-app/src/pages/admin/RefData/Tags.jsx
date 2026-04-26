import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "../../../services/admin";
import { toast } from "react-toastify";
import AdminTable from "../../../components/admin_ui/AdminTable";
import AdminConfirmModal from "../../../components/ui/AdminConfirmModal";
import { Plus } from "lucide-react";

const Tags = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["adminTags"],
    queryFn: tagsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      toast.success("Tag added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add tag")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tagsApi.update(editingItem.tag_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      toast.success("Tag updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update tag")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      toast.success("Tag deleted successfully");
      setConfirmModal({ isOpen: false });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete tag")
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name });
    } else {
      setEditingItem(null);
      setFormData({ name: "" });
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
      title: "Delete Tag",
      message: `Are you sure you want to delete the tag "${item.name}"? It will be removed from all associated content.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutate(item.tag_id)
    });
  };

  const columns = [
    { header: "ID", accessor: "tag_id", render: (row) => <span className="text-text-muted">#{row.tag_id}</span> },
    { header: "Tag Name", accessor: "name", render: (row) => <span className="font-bold px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">{row.name}</span> },
    { header: "Slug", accessor: "slug", render: (row) => <span className="text-text-muted text-xs font-mono">{row.slug}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">System Tags</h1>
          <p className="text-sm text-text-muted mt-1">Manage global tags used for categorizing content and discussions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Tag
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
              <h2 className="text-lg font-bold text-text-main">{editingItem ? "Edit Tag" : "Add Tag"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Tag Name *</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({name: e.target.value})} 
                  className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm outline-none focus:border-blue-500" 
                  placeholder="e.g. React" 
                />
                <p className="text-xs text-text-muted mt-2">Duplicate tags (case-insensitive) are not allowed.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-main">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-bg-active rounded-xl">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl">
                  {editingItem ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ isOpen: false })} isLoading={deleteMutation.isPending} />
    </div>
  );
};

export default Tags;
