import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ExternalLink, BookOpen, CheckCircle } from "lucide-react";

/**
 * ResourceCard Component
 */
const ResourceCard = ({ resource }) => {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl hover:border-purple-300 hover:shadow-md transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-[var(--text-main)] group-hover:text-purple-600 transition-colors">
              {resource.title}
            </h4>
            {resource.is_required && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold uppercase">
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
        <div className="w-8 h-8 rounded-full bg-[var(--bg-active)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
};

/**
 * StepDrawer Component
 * A slide-over drawer for roadmap step details and resources
 */
const StepDrawer = ({ isOpen, onClose, step, onComplete }) => {
  if (!step) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 lg:ml-64"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-main)] shadow-2xl z-51 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-main)] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-main)] leading-tight">
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

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Description */}
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

              {/* Status Section */}
              <section className="bg-[var(--bg-active)] p-4 rounded-xl border border-[var(--border-main)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-main)]">
                      Step Status
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {step.is_completed ? "Completed" : "In Progress"}
                    </p>
                  </div>
                  {!step.is_completed && (
                    <button
                      onClick={() => onComplete(step.step_id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                    >
                      Mark as Complete
                    </button>
                  )}
                  {step.is_completed && (
                    <div className="flex items-center gap-1 text-purple-600 font-bold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Done
                    </div>
                  )}
                </div>
              </section>

              {/* Resources */}
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
                        resource={resource}
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
        </>
      )}
    </AnimatePresence>
  );
};

export default StepDrawer;