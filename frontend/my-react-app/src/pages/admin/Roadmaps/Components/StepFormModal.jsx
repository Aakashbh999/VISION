import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { addRoadmapStep, updateRoadmapStep } from "../../../../services/adminRoadmap";

const StepFormModal = ({ step, roadmapId, onClose }) => {
  const isEditing = !!step;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_time: "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (step) {
      setFormData({
        title: step.title || "",
        description: step.description || "",
        estimated_time: step.estimated_time || "",
      });
    }
  }, [step]);

  const mutFn = isEditing 
    ? (d) => updateRoadmapStep(step.step_id, d) 
    : (d) => addRoadmapStep(roadmapId, d);
  
  const mutation = useMutation({
    mutationFn: mutFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
      toast.success(`Step ${isEditing ? "updated" : "created"} successfully`);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-main)]">
          <h2 className="text-xl font-black text-[var(--text-main)]">
            {isEditing ? "Edit Step" : "Add Step"}
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
              Step Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. Learn HTML Fundamentals"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
              Instruction / Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all min-h-[100px]"
              placeholder="Explain what the student should learn..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-1.5">
              Estimated Time
            </label>
            <input
              type="text"
              value={formData.estimated_time}
              onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-main)] rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g. 2 Weeks"
            />
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
              {mutation.isPending ? "Saving..." : "Save Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepFormModal;
