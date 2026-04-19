import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminCampuses, 
  createAdminCampus, 
  updateAdminCampus, 
  deleteAdminCampus 
} from "../../services/admin";
import { toast } from "react-toastify";
import { 
  Plus, Edit, Trash2, MapPin, School, Mail, CheckCircle, XCircle 
} from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";

const Campuses = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [formData, setFormData] = useState({
    campus_name: "",
    affiliated_university: "",
    location: "",
    contact_email: "",
    is_active: true
  });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCampuses"],
    queryFn: getAdminCampuses,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampuses"] });
      toast.success("Campus added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add campus")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateAdminCampus(editingCampus.campus_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampuses"] });
      toast.success("Campus updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update campus")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampuses"] });
      toast.success("Campus deleted successfully");
      setConfirmModal({ isOpen: false });
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to delete campus")
  });

  const handleOpenModal = (campus = null) => {
    if (campus) {
      setEditingCampus(campus);
      setFormData({
        campus_name: campus.campus_name,
        affiliated_university: campus.affiliated_university || "",
        location: campus.location || "",
        contact_email: campus.contact_email || "",
        is_active: campus.is_active
      });
    } else {
      setEditingCampus(null);
      setFormData({
        campus_name: "",
        affiliated_university: "",
        location: "",
        contact_email: "",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCampus) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const confirmDelete = (campus) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Campus",
      message: `Are you sure you want to delete ${campus.campus_name}? Students already assigned to this campus will retain their history but may need to be re-assigned.`,
      type: "danger",
      confirmText: "Delete Campus",
      onConfirm: () => deleteMutation.mutate(campus.campus_id)
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-8">Failed to load campuses</div>;

  const campuses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Campus Management</h1>
          <p className="text-sm text-text-muted mt-1">Manage active structural campuses for the platform.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Campus
        </button>
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-border-main text-left">
          <thead className="bg-bg-active/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Campus Info</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">University</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {campuses.map(campus => (
              <tr key={campus.campus_id} className="hover:bg-bg-active/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main">{campus.campus_name}</span>
                    <span className="text-xs text-text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {campus.location}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-main flex items-center gap-2">
                    <School className="w-4 h-4 text-text-muted" />
                    {campus.affiliated_university}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-muted">
                  {campus.contact_email ? (
                    <a href={`mailto:${campus.contact_email}`} className="text-purple-600 hover:underline">{campus.contact_email}</a>
                  ) : "-"}
                </td>
                <td className="px-6 py-4">
                  {campus.is_active ? (
                    <span className="px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-text-muted/10 text-text-muted border border-text-muted/20 rounded-full text-xs font-bold flex items-center w-fit gap-1.5 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(campus)}
                      className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                      title="Edit Campus"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(campus)}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete Campus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {campuses.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-text-muted">
                  No campuses registered. Added campuses will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
              <h2 className="text-lg font-bold text-text-main">
                {editingCampus ? "Edit Campus" : "Add Campus"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Campus Name *</label>
                <input
                  type="text"
                  required
                  value={formData.campus_name}
                  onChange={(e) => setFormData({...formData, campus_name: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-purple-500 text-sm"
                  placeholder="e.g. Amrit Science Campus (ASCOL)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">University Config</label>
                  <input
                    type="text"
                    value={formData.affiliated_university}
                    onChange={(e) => setFormData({...formData, affiliated_university: e.target.value})}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-purple-500 text-sm"
                    placeholder="e.g. TU"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-purple-500 text-sm"
                    placeholder="admin@ascol.edu.np"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-purple-500 text-sm"
                  placeholder="e.g. Lainchaur, Kathmandu"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-text-main font-medium cursor-pointer">
                  Campus is active & accepting registrations
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-bg-active rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  {editingCampus ? "Update Campus" : "Save Campus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ isOpen: false })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Campuses;
