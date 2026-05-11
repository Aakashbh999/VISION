import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, ArrowUp, ArrowDown, Plus, ExternalLink, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteRoadmapStep, reorderRoadmapStep, removeResourceFromStep } from "../../../../services/adminRoadmap";
import StepFormModal from "./StepFormModal";
import StepResourceLinkerModal from "./StepResourceLinkerModal";

const RoadmapStepCard = ({ step, roadmapId, isFirst, isLast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const queryClient = useQueryClient();

  const deleteMut = useMutation({
    mutationFn: deleteRoadmapStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
      toast.success("Step deleted");
    }
  });

  const reorderMut = useMutation({
    mutationFn: ({ direction }) => reorderRoadmapStep(step.step_id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
    }
  });

  const removeResourceMut = useMutation({
    mutationFn: (resourceId) => removeResourceFromStep(step.step_id, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoadmaps", String(roadmapId)] });
      toast.success("Resource removed from step");
    }
  });

  const handleDelete = () => {
    if (window.confirm("Delete this step? This will also remove its resource links.")) {
      deleteMut.mutate(step.step_id);
    }
  };

  const handleRemoveResource = (resourceId) => {
    if (window.confirm("Remove this resource from the step?")) {
      removeResourceMut.mutate(resourceId);
    }
  };

  const existingResourceIds = step.resources?.map(r => r.resource_id) || [];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-sm overflow-hidden group">
      {}
      <div className="flex items-start p-5 gap-4">
        {}
        <div className="flex flex-col gap-1 items-center justify-center pt-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => reorderMut.mutate({ direction: "up" })}
            disabled={isFirst || reorderMut.isPending}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-gray-400">{step.step_order}</span>
          <button
            onClick={() => reorderMut.mutate({ direction: "down" })}
            disabled={isLast || reorderMut.isPending}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-30 transition-colors"
             title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-main)] truncate">{step.title}</h3>
              {step.estimated_time && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  Time: {step.estimated_time}
                </span>
              )}
            </div>

            {}
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                title="Edit Step"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMut.isPending}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Step"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {step.description && (
            <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
              {step.description}
            </p>
          )}

          {}
          <div className="mt-6 border-t border-[var(--border-main)] pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">Linked Resources ({step.resources?.length || 0})</h4>
              <button
                onClick={() => setIsLinking(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[var(--bg-main)] hover:bg-[var(--bg-active)] border border-[var(--border-main)] rounded-lg transition-colors text-[var(--text-main)]"
              >
                <Plus className="w-3 h-3" /> Add Resource
              </button>
            </div>

            {step.resources && step.resources.length > 0 ? (
              <ul className="space-y-2">
                {step.resources.map(res => (
                  <li key={res.resource_id} className="flex items-center justify-between p-3 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-main)]">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[var(--text-main)] truncate max-w-[250px] sm:max-w-[400px]">
                          {res.title}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] uppercase">{res.resource_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="View Resource">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleRemoveResource(res.resource_id)}
                        disabled={removeResourceMut.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Unlink"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">No resources attached yet.</p>
            )}
          </div>

        </div>
      </div>

      {isEditing && (
        <StepFormModal
          step={step}
          roadmapId={roadmapId}
          onClose={() => setIsEditing(false)}
        />
      )}

      {isLinking && (
        <StepResourceLinkerModal
          stepId={step.step_id}
          roadmapId={roadmapId}
          existingResourceIds={existingResourceIds}
          onClose={() => setIsLinking(false)}
        />
      )}
    </div>
  );
};

export default RoadmapStepCard;
