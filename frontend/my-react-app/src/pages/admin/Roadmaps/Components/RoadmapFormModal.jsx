import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { createRoadmap, updateRoadmap } from "../../../../services/adminRoadmap";

const RoadmapFormModal = ({ roadmap, onClose }) => {
  const isEditing = !!roadmap;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty_level: "beginner",
    estimated_duration: "",
    is_active: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (roadmap) {
      setFormData({
        title: roadmap.title || "",
        description: roadmap.description || "",
        difficulty_level: roadmap.difficulty_level || "beginner",
        estimated_duration: roadmap.estimated_duration || "",
        is_active: roadmap.is_active ?? true,
      });
    }
  }, [roadmap]);

  const mutFn = isEditing ? (d) => updateRoadmap(roadmap.roadmap_id, d) : createRoadmap;
  
  const mutation = useMutation({
    mutationFn: mutFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps"] });
      toast.success(`Roadmap ${isEditing ? "updated" : "created"} successfully`);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "An error occurred");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return toast.error("Title is required");
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)]">
          <h2 className="text-xl font-black text-[var(--text-main)]">
            {isEditing ? "Edit Roadmap" : "Create New Roadmap"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. Frontend Web Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all min-h-[100px]"
              placeholder="Detailed description of what this roadmap covers..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 outline-none transition-all"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
                Estimated Duration
              </label>
              <input
                type="text"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 outline-none transition-all"
                placeholder="e.g. 6 Months"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
            <div>
              <span className="text-sm font-bold text-[var(--text-main)] block">Active Status</span>
              <span className="text-xs text-[var(--text-muted)]">If inactive, this roadmap remains hidden from students.</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-main)]">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-5 py-2.5 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoadmapFormModal;
