import { useParams, Link } from "react-router-dom";
import { useRoadmap } from "../../hooks/useRoadmap";
import { useCompleteStep } from "../../hooks/useCompleteStep";
import { useStepResources } from "../../hooks/useStepResources";
import { useRoadmapStatus } from "../../hooks/useRoadmapStatus";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ButtonLoader from "../../components/ui/ButtonLoader";
import {
  CheckCircle, Circle, ExternalLink, ChevronLeft,
  LogOut, Lock, Clock, AlertTriangle, Timer, Map
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const fmtTime = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const get4DayCooldown = (leftAt) => {
  if (!leftAt) return null;
  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
  const msLeft = FOUR_DAYS_MS - (Date.now() - new Date(leftAt).getTime());
  if (msLeft <= 0) return null;
  const days  = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const LeaveModal = ({ roadmapTitle, onConfirm, onCancel, isLeaving }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">
            Leave this roadmap?
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
            You are about to leave <span className="font-bold text-[var(--text-main)]">"{roadmapTitle}"</span>.
          </p>
        </div>
      </div>

      <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
          ⚠ Warning — Read before leaving
        </p>
        <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1 list-disc list-inside font-medium">
          <li>You <span className="font-black">cannot re-enter</span> this roadmap for <span className="font-black">4 days</span>.</li>
          <li>Your progress will be saved, but you'll be locked out.</li>
          <li>Other roadmaps will become available again after leaving.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLeaving}
          className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border-main)] text-sm font-black text-[var(--text-main)] hover:bg-[var(--bg-active)] transition-all disabled:opacity-50"
        >
          Stay & Continue
        </button>
        <button
          onClick={onConfirm}
          disabled={isLeaving}
          className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 text-white text-sm font-black hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLeaving ? <><ButtonLoader size={14} /> Leaving...</> : <><LogOut className="w-4 h-4" /> Leave Roadmap</>}
        </button>
      </div>
    </div>
  </div>
);

const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-4 space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
        <Timer className="w-3.5 h-3.5" /> Session Time
      </p>
      <p className="text-2xl font-black font-mono tracking-tight text-[var(--text-main)]">
        {fmtTime(seconds)}
      </p>
      <p className="text-[10px] text-[var(--text-muted)] font-medium">
        Time spent in this session
      </p>
    </div>
  );
};

const RoadmapDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useRoadmap(id);
  const {
    status: enrolment,
    leaveRoadmap: doLeave,
    isLeaving,
    lockRoadmap: doLock,
    isLocking
  } = useRoadmapStatus(id);

  const completeStepMutation = useCompleteStep(id);
  const [selectedStep, setSelectedStep] = useState(null);
  const { data: resources, isLoading: resourcesLoading } = useStepResources(id, selectedStep?.step_id);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const isActive    = enrolment?.status === "active";
  const isCompleted = enrolment?.status === "completed";
  const isLeft      = enrolment?.status === "left";
  const cooldown    = get4DayCooldown(enrolment?.left_at);
  const isInCooldown = isLeft && !!cooldown;

  const handleLeaveConfirm = () => {
    doLeave();
    setShowLeaveModal(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-rose-500 font-bold">Failed to load roadmap.</div>;

  const { roadmap, steps, progress_percent } = data;

  const firstIncompleteIndex = steps.findIndex(s => !s.is_completed);

  const isStepLocked = (index) => {
    if (isCompleted) return false;
    if (index === 0) return false;
    if (firstIncompleteIndex === -1) return false;
    return index > firstIncompleteIndex;
  };

  const handleComplete = (stepId) => {
    completeStepMutation.mutate(stepId, {
      onSuccess: () => {
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {showLeaveModal && (
        <LeaveModal
          roadmapTitle={roadmap.title}
          onConfirm={handleLeaveConfirm}
          onCancel={() => setShowLeaveModal(false)}
          isLeaving={isLeaving}
        />
      )}

      {}
      <div className="flex flex-col gap-4">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-purple-600 font-bold transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Roadmaps
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] uppercase tracking-tight">
              {roadmap.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
             {}
             {!isActive && !isCompleted && !isInCooldown && (
               <button
                 onClick={() => doLock()}
                 disabled={isLocking}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
               >
                 {isLocking ? <ButtonLoader size={14} /> : <Lock className="w-4 h-4" />}
                 Lock & Start Roadmap
               </button>
             )}

             {}
             {isActive && (
               <button
                 onClick={() => setShowLeaveModal(true)}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-2xl border-2 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-black hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
               >
                 <LogOut className="w-4 h-4" />
                 Leave Roadmap
               </button>
             )}
          </div>
        </div>

        {}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            <span>Overall Path Progress</span>
            <span className="text-purple-600 font-black">{progress_percent || 0}% Complete</span>
          </div>
          <div className="h-4 bg-[var(--bg-active)] rounded-full overflow-hidden border border-[var(--border-main)] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${progress_percent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {}
      {isInCooldown && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Re-entry Locked
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              You left this roadmap. You can rejoin in <span className="font-black">{cooldown}</span>.
            </p>
          </div>
        </div>
      )}
      {isCompleted && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
            Roadmap Completed 🎉 — You've mastered this path!
          </p>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
            Learning Path
          </h2>
          <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x divide-y divide-[var(--border-main)]">
            {steps?.map((step, index) => {
              const locked = isStepLocked(index);
              return (
                <button
                  key={step.step_id}
                  disabled={locked}
                  onClick={() => setSelectedStep(step)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    selectedStep?.step_id === step.step_id
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : "hover:bg-[var(--bg-active)]"
                  } ${locked ? "opacity-50 cursor-not-allowed grayscale-[0.8]" : ""}`}
                >
                  <div className="flex-shrink-0">
                    {step.is_completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 " />
                    ) : locked ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${
                      step.is_completed
                        ? "text-[var(--text-muted)] line-through"
                        : "text-[var(--text-main)]"
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">
                      {locked ? "Locked Step" : step.estimated_time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {}
          {isActive && (
            <div className="space-y-4">
              <SessionTimer />
              <div className="bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 rounded-2xl p-4 space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Focus Mode On
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium leading-relaxed">
                  You are commited to this roadmap. Other paths will be locked in the explorer until you leave or complete this one.
                </p>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="lg:col-span-2">
          {selectedStep ? (
            <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)] uppercase tracking-tight">
                    {selectedStep.title}
                  </h2>
                  <p className="text-[var(--text-muted)] mt-1 font-medium leading-relaxed">
                    {selectedStep.description}
                  </p>
                </div>
                {!selectedStep.is_completed && isActive && (
                  <button
                    onClick={() => handleComplete(selectedStep.step_id)}
                    disabled={completeStepMutation.isPending}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                  >
                    {completeStepMutation.isPending ? (
                      <><ButtonLoader size={14} /> Submitting...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Mark Complete</>
                    )}
                  </button>
                )}
              </div>

              {}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
                    Learning Content
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    {resources?.length || 0} Materials Found
                  </span>
                </div>

                {resourcesLoading ? (
                  <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : (
                  <div className="space-y-3">
                    {resources?.map((resource) => (
                      <a
                        key={resource.resource_id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-active)]/50 border border-[var(--border-main)] hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-purple-600 transition-colors">
                              {resource.title}
                            </span>
                            {resource.is_required && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-black uppercase tracking-tighter">
                                Core
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                              resource.difficulty_level === "advanced"
                                ? "bg-rose-50 text-rose-600"
                                : resource.difficulty_level === "intermediate"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {resource.difficulty_level || "Beginner"}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                              {resource.resource_type}
                            </span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                           <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                    {(!resources || resources.length === 0) && (
                      <div className="py-12 border-2 border-dashed border-[var(--border-main)] rounded-2xl text-center">
                         <p className="text-sm text-[var(--text-muted)] font-bold">Curating materials for this step...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] h-full flex flex-col items-center justify-center rounded-sm sm:rounded-xl border border-[var(--border-main)] border-x-0 sm:border-x p-12 text-center text-[var(--text-muted)]">
              <div className="w-20 h-20 rounded-3xl bg-[var(--bg-active)] flex items-center justify-center mb-6">
                 <Map className="w-10 h-10 text-purple-400 opacity-50" />
              </div>
              <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight mb-2">Select Your Objective</h3>
              <p className="font-bold text-sm max-w-xs">Pick the next unlocked step on the left to view documentation and learning paths.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
