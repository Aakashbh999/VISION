import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminRoadmaps, deleteRoadmap } from "../../../services/adminRoadmap";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import RoadmapFormModal from "./Components/RoadmapFormModal";

const RoadmapManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: roadmaps = [], isLoading } = useQuery({
    queryKey: ["adminRoadmaps"],
    queryFn: getAdminRoadmaps,
  });

  const deleteMut = useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps"] });
      toast.success("Roadmap deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to delete roadmap");
    }
  });

  const handleCreate = () => {
    setEditingRoadmap(null);
    setIsModalOpen(true);
  };

  const handleEdit = (roadmap) => {
    setEditingRoadmap(roadmap);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this roadmap? This action cannot be undone.")) {
      deleteMut.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
            Roadmap Management
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Create, edit, and manage career and academic roadmaps.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Roadmap
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-main)] bg-[var(--bg-active)]/50">
                <th className="p-4 font-bold text-[var(--text-muted)] text-sm tracking-wider uppercase">Title</th>
                <th className="p-4 font-bold text-[var(--text-muted)] text-sm tracking-wider uppercase">Difficulty</th>
                <th className="p-4 font-bold text-[var(--text-muted)] text-sm tracking-wider uppercase text-center">Status</th>
                <th className="p-4 font-bold text-[var(--text-muted)] text-sm tracking-wider uppercase text-center">Steps</th>
                <th className="p-4 font-bold text-[var(--text-muted)] text-sm tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {roadmaps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No roadmaps found. Create your first one!
                  </td>
                </tr>
              ) : (
                roadmaps.map((r) => (
                  <tr key={r.roadmap_id} className="hover:bg-[var(--bg-active)]/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[var(--text-main)]">{r.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.slug}</p>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)] capitalize">
                      {r.difficulty_level || "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        r.is_active 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                          : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                      }`}>
                        {r.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {r.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-[var(--text-main)]">
                      {r.step_count}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/roadmaps/${r.roadmap_id}/builder`}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400 rounded-lg text-sm font-bold transition-colors"
                        >
                          Builder
                        </Link>
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-purple-600 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          title="Edit Roadmap Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.roadmap_id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          disabled={deleteMut.isPending}
                          title="Delete Roadmap"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RoadmapFormModal
          roadmap={editingRoadmap}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoadmapManagement;
