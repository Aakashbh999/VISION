import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itClubsApi } from "../../../services/admin";
import { toast } from "react-toastify";
import AdminTable from "../../../components/admin_ui/AdminTable";
import AdminConfirmModal from "../../../components/ui/AdminConfirmModal";
import { Plus, CheckCircle, XCircle } from "lucide-react";

const ItClubs = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    club_name: "", location: "", institution: "", specialty: "", contact_info: "", 
    website_url: "", facebook_url: "", linkedin_url: "", discord_url: "", 
    github_url: "", description_full: "", logo_url: "", banner_url: "", 
    founded_year: "", is_public: true
  });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["adminItClubs"],
    queryFn: itClubsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: itClubsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminItClubs"] });
      toast.success("IT Club added successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to add item")
  });

  const updateMutation = useMutation({
    mutationFn: (data) => itClubsApi.update(editingItem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminItClubs"] });
      toast.success("IT Club updated successfully");
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || "Failed to update item")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => itClubsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminItClubs"] });
      toast.success("IT Club deleted successfully");
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
        club_name: "", location: "", institution: "", specialty: "", contact_info: "", 
        website_url: "", facebook_url: "", linkedin_url: "", discord_url: "", 
        github_url: "", description_full: "", logo_url: "", banner_url: "", 
        founded_year: "", is_public: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    // Handle empty founded_year to prevent invalid integer error
    if (dataToSubmit.founded_year === "") {
        dataToSubmit.founded_year = null;
    }
    if (editingItem) updateMutation.mutate(dataToSubmit);
    else createMutation.mutate(dataToSubmit);
  };

  const confirmDelete = (item) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete IT Club",
      message: `Are you sure you want to delete ${item.club_name}?`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: () => deleteMutation.mutate(item.id)
    });
  };

  const columns = [
    { header: "Club Name", accessor: "club_name", render: (row) => <span className="font-bold">{row.club_name}</span> },
    { header: "Institution", accessor: "institution" },
    { header: "Specialty", accessor: "specialty" },
    { header: "Location", accessor: "location" },
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
          <h1 className="text-2xl font-bold text-text-main">IT Clubs Directory</h1>
          <p className="text-sm text-text-muted mt-1">Manage tech clubs and organizations.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Club
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
          <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
              <h2 className="text-lg font-bold text-text-main">{editingItem ? "Edit IT Club" : "Add IT Club"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Basic Info */}
              <h3 className="font-bold text-text-main border-b border-border-main pb-2">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Club Name *</label>
                  <input required value={formData.club_name} onChange={(e) => setFormData({...formData, club_name: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. IT Club ASCOL" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Institution</label>
                  <input value={formData.institution || ""} onChange={(e) => setFormData({...formData, institution: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. ASCOL" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Specialty</label>
                  <input value={formData.specialty || ""} onChange={(e) => setFormData({...formData, specialty: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Software Development" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Location</label>
                  <input value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. Kathmandu" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Founded Year</label>
                  <input type="number" value={formData.founded_year || ""} onChange={(e) => setFormData({...formData, founded_year: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" placeholder="e.g. 2010" />
                </div>
              </div>

              {/* Details & Media */}
              <h3 className="font-bold text-text-main border-b border-border-main pb-2 mt-4">Details & Media</h3>
              <div>
                <label className="text-xs font-bold text-text-muted mb-1 block">Full Description</label>
                <textarea rows="3" value={formData.description_full || ""} onChange={(e) => setFormData({...formData, description_full: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Logo URL</label>
                  <input value={formData.logo_url || ""} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Banner URL</label>
                  <input value={formData.banner_url || ""} onChange={(e) => setFormData({...formData, banner_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
              </div>

              {/* Links & Contact */}
              <h3 className="font-bold text-text-main border-b border-border-main pb-2 mt-4">Links & Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Contact Info (Email/Phone)</label>
                  <input value={formData.contact_info || ""} onChange={(e) => setFormData({...formData, contact_info: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Website URL</label>
                  <input value={formData.website_url || ""} onChange={(e) => setFormData({...formData, website_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Facebook URL</label>
                  <input value={formData.facebook_url || ""} onChange={(e) => setFormData({...formData, facebook_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">LinkedIn URL</label>
                  <input value={formData.linkedin_url || ""} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">Discord URL</label>
                  <input value={formData.discord_url || ""} onChange={(e) => setFormData({...formData, discord_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1 block">GitHub URL</label>
                  <input value={formData.github_url || ""} onChange={(e) => setFormData({...formData, github_url: e.target.value})} className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 mt-4">
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

export default ItClubs;
