import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminRoadmaps, deleteRoadmap } from "../../../services/adminRoadmap";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import RoadmapFormModal from "./Components/RoadmapFormModal";
import AdminTable from "../../../components/admin_ui/AdminTable";

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

  const columns = [
    {
      header: "Title",
      render: (row) => (
        <div>
          <p className="font-bold text-[var(--text-main)]">{row.title}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{row.slug}</p>
        </div>
      )
    },
    {
      header: "Difficulty",
      render: (row) => (
        <span className="capitalize">{row.difficulty_level || "N/A"}</span>
      )
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
          row.is_active
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
            : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
        }`}>
          {row.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {row.is_active ? "Active" : "Hidden"}
        </span>
      )
    },
    {
      header: "Steps",
      accessor: "step_count"
    },
    {
      header: "Builder",
      render: (row) => (
        <Link
          to={`/admin/roadmaps/${row.roadmap_id}/builder`}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400 rounded-lg text-sm font-bold transition-colors"
        >
          Open Builder
        </Link>
      )
    }
  ];

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

      <AdminTable
        columns={columns}
        data={roadmaps}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(r) => handleDelete(r.roadmap_id)}
        searchPlaceholder="Search roadmaps..."
      />

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
