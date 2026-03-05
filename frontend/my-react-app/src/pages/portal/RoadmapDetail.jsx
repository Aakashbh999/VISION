import { useParams } from "react-router-dom";
import { useRoadmap } from "../../hooks/useRoadmap";
import { useCompleteStep } from "../../hooks/useCompleteStep";
import { useStepResources } from "../../hooks/useStepResources";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { CheckCircle, Circle, ExternalLink, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const RoadmapDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useRoadmap(id);
  const completeStepMutation = useCompleteStep(id);
  const [selectedStep, setSelectedStep] = useState(null);
  const { data: resources, isLoading: resourcesLoading } = useStepResources(
    id,
    selectedStep?.step_id,
  );

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load roadmap</div>;

  const { roadmap, steps } = data;

  const handleComplete = (stepId) => {
    completeStepMutation.mutate(stepId);
    // Optimistically mark as completed in UI? The hook will refetch.
  };

  return (
    <div className="space-y-8">
      {/* Back button and title */}
      <div>
        <Link
          to="/portal/roadmaps"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Roadmaps
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {roadmap.title}
        </h1>
        <p className="text-gray-600 mt-2">{roadmap.description}</p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {roadmap.difficulty_level || "Beginner"}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {roadmap.estimated_duration}
          </span>
        </div>
      </div>

      {/* Steps and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Steps
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y">
            {steps?.map((step) => (
              <button
                key={step.step_id}
                onClick={() => setSelectedStep(step)}
                className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedStep?.step_id === step.step_id ? "bg-blue-50" : ""
                }`}
              >
                {step.is_completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step.is_completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.estimated_time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step details and resources */}
        <div className="lg:col-span-2">
          {selectedStep ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedStep.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedStep.description}
                  </p>
                </div>
                {!selectedStep.is_completed && (
                  <button
                    onClick={() => handleComplete(selectedStep.step_id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>

              {/* Resources */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-3">
                  Learning Resources
                </h3>
                {resourcesLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    {resources?.map((resource) => (
                      <a
                        key={resource.resource_id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {resource.title}
                            </span>
                            {resource.is_required && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                Required
                              </span>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {resource.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                resource.difficulty_level === "advanced"
                                  ? "bg-red-50 text-red-600"
                                  : resource.difficulty_level === "intermediate"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-green-50 text-green-600"
                              }`}
                            >
                              {resource.difficulty_level || "Beginner"}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                              {resource.resource_type}
                            </span>
                            {parseFloat(resource.avg_score) > 0 && (
                              <span className="text-xs text-gray-500">
                                Score:{" "}
                                {parseFloat(resource.avg_score).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                    {(!resources || resources.length === 0) && (
                      <p className="text-sm text-gray-500">No resources yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
              Select a step to view details and resources.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
