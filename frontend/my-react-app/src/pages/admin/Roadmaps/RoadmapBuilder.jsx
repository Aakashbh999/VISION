import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Plus, Map } from "lucide-react";
import { getAdminRoadmapById } from "../../../services/adminRoadmap";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import RoadmapStepCard from "./Components/RoadmapStepCard";
import StepFormModal from "./Components/StepFormModal";

const RoadmapBuilder = () => {
  const { id } = useParams();
  const [isAddingStep, setIsAddingStep] = useState(false);

  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ["adminRoadmaps", String(id)],
    queryFn: () => getAdminRoadmapById(id),
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !roadmap) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">Error loading roadmap</h2>
        <Link to="/admin/roadmaps" className="mt-4 text-blue-500 underline">Back to Roadmaps</Link>
      </div>
    );
  }

  const steps = roadmap.steps || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {}
      <div>
        <Link
          to="/admin/roadmaps"
          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--text-muted)] hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] flex items-center gap-2">
              <Map className="w-7 h-7 text-purple-600" />
              {roadmap.title} Builder
            </h1>
            <p className="text-[var(--text-muted)] mt-1 ml-9">
              {steps.length} {steps.length === 1 ? 'Step' : 'Steps'} • Difficulty: <span className="capitalize">{roadmap.difficulty_level}</span>
            </p>
          </div>
          <button
            onClick={() => setIsAddingStep(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--bg-active)] rounded-xl font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Step
          </button>
        </div>
      </div>

      {}
      <div className="space-y-4">
        {steps.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-main)] rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">No Steps Yet</h3>
            <p className="text-[var(--text-muted)] mb-6 max-w-sm mx-auto mt-2">
              Begin building this roadmap by creating the first learning step.
            </p>
            <button
              onClick={() => setIsAddingStep(true)}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
              Add First Step
            </button>
          </div>
        ) : (
          <div className="space-y-4 relative">
            {}
            <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-[var(--border-main)] -z-10 hidden sm:block" />

            {steps.map((step, index) => (
              <RoadmapStepCard
                key={step.step_id}
                step={step}
                roadmapId={id}
                isFirst={index === 0}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {}
      {steps.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setIsAddingStep(true)}
            className="flex items-center gap-2 px-5 py-3 text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 rounded-full font-bold transition-all border border-purple-100 dark:border-purple-800/50 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Next Step
          </button>
        </div>
      )}

      {isAddingStep && (
        <StepFormModal
          roadmapId={id}
          onClose={() => setIsAddingStep(false)}
        />
      )}
    </div>
  );
};

export default RoadmapBuilder;
