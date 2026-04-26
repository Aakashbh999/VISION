import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobMarketApi } from "../../../services/admin";
import { toast } from "react-toastify";
import AdminTable from "../../../components/admin_ui/AdminTable";
import AdminConfirmModal from "../../../components/ui/AdminConfirmModal";
import { Plus, CheckCircle, XCircle } from "lucide-react";

const ItJobs = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    role_name: "", salary_range: "", market_demand: "", 
    key_skills: "", job_summary: "", description: "", is_public: true
  });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["adminJobMarket"],
    queryFn: jobMarketApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: jobMarketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJobMarket"] });
      toast.success("Job Insight added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add item")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => jobMarketApi.update(editingItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJobMarket"] });
      toast.success("Job Insight updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update item")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobMarketApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminJobMarket"] });
      toast.success("Job Insight deleted successfully");
      setConfirmModal({ isOpen: false });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete item")
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        role_name: "", salary_range: "", market_demand: "", 
        key_skills: "", job_summary: "", description: "", is_public: true
      });
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
      title: "Delete Job Insight",
      message: `Are you sure you want to delete ${item.role_name}?`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutate(item.id)
    });
  };

  const columns = [
    { header: "Role Name", accessor: "role_name", render: (row) => <span className="font-bold">{row.role_name}</span> },
    { header: "Salary Range", accessor: "salary_range" },
    { header: "Demand", accessor: "market_demand" },
    { header: "Status", accessor: "is_public", render: (row) => (
        row.is_public ? 
        <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Public</span> : 
        <span className="text-gray-400 flex items-center gap-1"><XCircle className="w-4 h-4"/> Hidden</span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Job Market Insights</h1>
          <p className="text-sm text-text-muted mt-1">Manage IT job roles, salary expectations, and market demands.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Job Insight
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
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
              <h2 className="text-lg font-bold text-text-main">{editingItem ? "Edit Job Insight" : "Add Job Insight"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Role Name *</label>
                  <input required value={formData.role_name} onChange={(e) => setFormData({...formData, role_name: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Frontend Developer" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Salary Range</label>
                  <input value={formData.salary_range || ""} onChange={(e) => setFormData({...formData, salary_range: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. 40k - 80k NPR" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Market Demand</label>
                  <input value={formData.market_demand || ""} onChange={(e) => setFormData({...formData, market_demand: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Very High" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Key Skills</label>
                  <input value={formData.key_skills || ""} onChange={(e) => setFormData({...formData, key_skills: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. React, JavaScript, CSS" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Job Summary</label>
                <textarea rows="2" value={formData.job_summary || ""} onChange={(e) => setFormData({...formData, job_summary: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Full Description</label>
                <textarea rows="3" value={formData.description || ""} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isPublic" checked={formData.is_public} onChange={(e) => setFormData({...formData, is_public: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                <label htmlFor="isPublic" className="text-sm text-text-main font-medium cursor-pointer">Visible to public</label>
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

export default ItJobs;
