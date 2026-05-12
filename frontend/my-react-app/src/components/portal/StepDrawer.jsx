import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ExternalLink, BookOpen, CheckCircle, ShieldCheck, Clock, Lock, Info } from "lucide-react";
import SubmissionModal from "./Roadmaps/SubmissionModal";
import { trackStepResourceVisit } from "../../services/roadmap";
import { toast } from "react-toastify";

const ResourceCard = ({ resource, onVisit }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVisit(resource.resource_id)}
      className={`group block p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl transition-all relative overflow-hidden ${
        resource.is_visited
          ? "border-green-200 dark:border-green-900/30 bg-green-50/10"
          : "hover:border-purple-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-bold transition-colors ${
              resource.is_visited ? "text-green-600 dark:text-green-500" : "text-[var(--text-main)] group-hover:text-purple-600"
            }`}>
              {resource.title}
            </h4>
            {resource.is_visited && (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            )}
            {resource.is_required && !resource.is_visited && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold uppercase">
                Required
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500 gap-0.5">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">
                {parseFloat(resource.avg_score || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full" />
              {resource.resource_type || "External"}
            </span>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          resource.is_visited
            ? "bg-green-100 dark:bg-green-900/40 text-green-600"
            : "bg-[var(--bg-active)] text-[var(--text-muted)] group-hover:bg-purple-100 group-hover:text-purple-600"
        }`}>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
};

const StepDrawer = ({ isOpen, onClose, step, onComplete }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [localVisited, setLocalVisited] = React.useState([]);

  React.useEffect(() => {
    if (step?.resources) {
      setLocalVisited(step.resources.filter(r => r.is_visited).map(r => r.resource_id));
    }
  }, [step]);

  if (!step) return null;

  const totalRequired = step.resources?.length || 0;
  const visitedCount = localVisited.length;
  const allResourcesVisited = visitedCount >= totalRequired;

  const waitPeriod = 24 * 60 * 60 * 1000;
  const firstViewAt = step.first_viewed_at ? new Date(step.first_viewed_at).getTime() : null;
  const timePassed = firstViewAt ? Date.now() - firstViewAt : 0;
  const isTimeLocked = firstViewAt ? timePassed < waitPeriod : true;
  const canMarkComplete = allResourcesVisited && !isTimeLocked;

  const hoursRemaining = firstViewAt
    ? Math.max(0, Math.ceil((waitPeriod - timePassed) / (1000 * 60 * 60)))
    : 24;

  const handleResourceVisit = async (resourceId) => {
    if (localVisited.includes(resourceId)) return;

    try {
      await trackStepResourceVisit(step.step_id, resourceId);
      setLocalVisited(prev => [...prev, resourceId]);
    } catch (error) {
      console.error("Tracking failed:", error);
    }
  };

  const handlePoWSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onComplete(step.step_id, data);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to mark as complete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 lg:ml-64"
          />

          {}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-main)] shadow-2xl z-51 overflow-y-auto"
          >
            {}
            <div className="sticky top-0 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-main)] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-main)] leading-tight break-words">
                  {step.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--bg-active)] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {}
            <div className="p-6 space-y-8">
              {}
              <section>
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-600 rounded-full" />
                  About this step
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed text-sm">
                  {step.description || "No description provided for this step."}
                </p>
                {step.estimated_time && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded uppercase tracking-wider">
                    Estimated: {step.estimated_time}
                  </div>
                )}
              </section>

              {}
              {!step.is_completed && (
                <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                  canMarkComplete
                    ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30"
                    : "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/30"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    canMarkComplete ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {canMarkComplete ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-bold ${canMarkComplete ? "text-green-700" : "text-amber-700"}`}>
                      {canMarkComplete ? "Requirements Met!" : "Completion Locked"}
                    </h4>
                    <ul className="text-[11px] font-medium space-y-1 text-[var(--text-muted)]">
                      <li className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${visitedCount >= totalRequired ? "bg-green-500" : "bg-[var(--text-muted)]"}`} />
                        Resources: {visitedCount} of {totalRequired} opened
                      </li>
                      <li className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${!isTimeLocked ? "bg-green-500" : "bg-[var(--text-muted)]"}`} />
                        {isTimeLocked
                          ? `Unlock in approx. ${hoursRemaining}h (24h learning rule)`
                          : "Learning period completed"}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {}
              <section className="bg-[var(--bg-active)] p-5 rounded-2xl border border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-main)]">
                      Achievement
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
                      {step.is_completed ? "Step Mastered" : "Knowledge Building"}
                    </p>
                  </div>
                  {!step.is_completed && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!canMarkComplete}
                      className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                        canMarkComplete
                          ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300"
                      }`}
                    >
                      {canMarkComplete ? "Submit & Complete" : "Locked"}
                    </button>
                  )}
                  {step.is_completed && (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-purple-600 font-bold text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full" />
                    Learning Materials
                  </h3>
                  <span className="text-[10px] bg-[var(--bg-active)] text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                    {step.resources?.length || 0} resources
                  </span>
                </div>

                <div className="space-y-3">
                  {step.resources && step.resources.length > 0 ? (
                    step.resources.map((resource) => (
                      <ResourceCard
                        key={resource.resource_id}
                        resource={{
                          ...resource,
                          is_visited: localVisited.includes(resource.resource_id)
                        }}
                        onVisit={handleResourceVisit}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-main)] rounded-xl">
                      <p className="text-sm">
                        No resources linked to this step yet.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.div>

          <SubmissionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handlePoWSubmit}
            stepTitle={step.title}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default StepDrawer;
