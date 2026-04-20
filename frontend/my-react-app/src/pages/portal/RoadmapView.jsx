import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ChevronLeft,
  Layout,
  Database,
  Cpu,
  Globe,
  Shield,
  Code2,
  Palette,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Clock,
} from "lucide-react";
import { useRoadmapPath } from "../../hooks/useRoadmapPath";
import { useCompleteStep } from "../../hooks/useCompleteStep";
import { useRoadmapStatus } from "../../hooks/useRoadmapStatus";
import StepDrawer from "../../components/portal/StepDrawer";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

/**
 * Icon Mapper
 * Dynamically picks an icon based on step title
 */
const getStepIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("frontend") || t.includes("html") || t.includes("css"))
    return Layout;
  if (
    t.includes("backend") ||
    t.includes("server") ||
    t.includes("database") ||
    t.includes("sql")
  )
    return Database;
  if (
    t.includes("logic") ||
    t.includes("algorithm") ||
    t.includes("javascript") ||
    t.includes("js")
  )
    return Cpu;
  if (t.includes("network") || t.includes("api") || t.includes("web"))
    return Globe;
  if (t.includes("security") || t.includes("auth")) return Shield;
  if (t.includes("design") || t.includes("ui") || t.includes("ux"))
    return Palette;
  if (t.includes("test") || t.includes("deploy")) return Zap;
  return Code2;
};

/* ─── Helpers ─────────────────────────────────────────────────── */
const get4DayCooldown = (leftAt) => {
  if (!leftAt) return null;
  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
  const msLeft = FOUR_DAYS_MS - (Date.now() - new Date(leftAt).getTime());
  if (msLeft <= 0) return null;
  const days  = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

/* ─── Leave Confirmation Modal ─────────────────────────────────── */
const LeaveModal = ({ roadmapTitle, onConfirm, onCancel, isLeaving }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
          {isLeaving ? <><LoadingSpinner size={14} inline /> Leaving... </> : <><LogOut className="w-4 h-4" /> Leave Roadmap</>}
        </button>
      </div>
    </div>
  </div>
);

/**
 * StationNode Component
 * 64px circular node positioned on the track
 */
const StationNode = ({ step, isActive, isLocked, onClick }) => {
  const Icon = getStepIcon(step.title);

  return (
    <div className={`relative flex flex-col items-center group ${isLocked ? "pointer-events-none" : ""}`}>
      {/* Node Circle */}
      <motion.button
        whileHover={isLocked ? {} : { scale: 1.1 }}
        whileTap={isLocked ? {} : { scale: 0.95 }}
        onClick={() => !isLocked && onClick(step)}
        disabled={isLocked}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center z-10 
          transition-all duration-500 relative
          ${
            step.is_completed
              ? "bg-purple-700 shadow-lg shadow-purple-500/20 shadow-xl border-none"
              : isActive
                ? "bg-white border-2 border-purple-700 shadow-lg"
                : "bg-white border border-[var(--border-main)] shadow-sm"
          }
          ${isLocked ? "bg-slate-50 opacity-60 grayscale-[0.5]" : ""}
          ${step.is_verified ? "ring-4 ring-purple-400/50 ring-offset-4 ring-offset-[var(--bg-main)]" : ""}
        `}
      >
        {step.is_verified && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg z-20 animate-bounce">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        )}
        <AnimatePresence mode="wait">
          {step.is_completed ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                isActive ? "text-purple-700" : "text-[var(--text-muted)]"
              }
            >
              <Icon className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked Overlay */}
        {(isLocked) && (
          <div className="absolute inset-0 bg-slate-900/5 rounded-full flex items-center justify-center">
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </motion.button>

      {/* Label/Tooltip */}
      {!isLocked && (
        <div className="absolute top-20 text-center w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-[var(--bg-card)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border-main)]">
            {step.title}
          </div>
        </div>
      )}

      {/* Static Label below */}
      <div className="mt-4 text-center max-w-[120px]">
        <p
          className={`text-[11px] font-black uppercase tracking-tighter leading-tight ${
            step.is_completed || isActive
              ? "text-[var(--text-main)]"
              : "text-[var(--text-muted)]"
          } ${isLocked ? "opacity-40" : ""}`}
        >
          {step.title}
        </p>
      </div>
    </div>
  );
};

/**
 * RoadmapView (Modern Linear Path)
 */
const RoadmapView = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useRoadmapPath(id);
  const { 
    status, 
    leaveRoadmap, 
    isLeaving, 
    lockRoadmap, 
    isLocking 
  } = useRoadmapStatus(id);
  
  const completeStepMutation = useCompleteStep(id);

  const [selectedStep, setSelectedStep] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const steps = useMemo(() => data?.steps || [], [data]);
  const completedCount = steps.filter((s) => s.is_completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  const isActiveRoadmap = status?.status === "active";
  const isCompleted      = status?.status === "completed";
  const cooldown         = get4DayCooldown(status?.left_at);
  const isInCooldown     = status?.status === "left" && !!cooldown;

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setIsDrawerOpen(true);
  };

  const handleComplete = async (stepId, data) => {
    try {
      await completeStepMutation.mutateAsync({ stepId, data });

      const stepIndex = steps.findIndex((s) => s.step_id === stepId);
      if (stepIndex !== -1) {
        const rect = (
          document.querySelectorAll(".group")[stepIndex] || null
        )?.getBoundingClientRect?.();
        if (rect) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
            colors: ["#7c3aed", "#a78bfa", "#ffffff"],
            disableForReducedMotion: true,
          });
        }
      }
    } catch (error) {
      console.error("Completion failed:", error);
    }
  };

  if (error)
    return (
      <div className="p-10 sm:p-20 text-center text-[var(--text-muted)]">
        Failed to load roadmap.
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pb-24 transition-colors duration-300">
      {showLeaveModal && (
        <LeaveModal
          roadmapTitle={data?.roadmap?.title}
          onConfirm={() => {
            leaveRoadmap();
            setShowLeaveModal(false);
          }}
          onCancel={() => setShowLeaveModal(false)}
          isLeaving={isLeaving}
        />
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto pt-10 sm:pt-12 mb-12 sm:mb-16 px-4">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-700 mb-8 hover:translate-x-[-4px] transition-transform"
        >
          <ChevronLeft className="w-3 h-3" /> Back to Roadmaps
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl sm:text-6xl font-black text-[var(--text-main)] tracking-tighter leading-[0.9]">
              {isLoading ? "..." : data?.roadmap?.title}
            </h1>
            <p className="text-[var(--text-muted)] font-medium text-base sm:text-lg leading-relaxed max-w-xl">
              {isLoading
                ? "Fetching roadmap data..."
                : data?.roadmap?.description}
            </p>
          </div>
          {!isLoading && (
            <div className="flex flex-col items-stretch sm:items-end gap-5 min-w-[280px]">
              
              {/* ACTION AREA (LOCK/LEAVE) */}
              <div className="w-full sm:w-auto">
                {/* LOCK BUTTON */}
                {!isActiveRoadmap && !isCompleted && !isInCooldown && (
                  <Button
                    variant="primary"
                    onClick={() => lockRoadmap()}
                    isLoading={isLocking}
                    className="w-full bg-purple-700 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-purple-500/20"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Lock & Start Path
                  </Button>
                )}

                {/* LEAVE BUTTON */}
                {isActiveRoadmap && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLeaveModal(true)}
                    isLoading={isLeaving}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-black h-14 px-6 rounded-2xl"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Path
                  </Button>
                )}
              </div>
              
              {/* PROGRESS CARD */}
              <div className="w-full bg-[var(--bg-card)] p-4 rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">
                    Total Progress
                  </span>
                  <span className="text-sm font-black text-purple-700 font-['JetBrains_Mono']">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-[var(--bg-active)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-purple-700"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linear Track Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {isInCooldown && (
          <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Re-entry Cooldown Active</p>
                <p className="text-xs text-amber-700 font-medium">You left this roadmap. It will unlock for re-entry in <span className="font-bold">{cooldown}</span>.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-[2.5rem] border border-[var(--border-main)] border-x-0 sm:border-x shadow-2xl shadow-purple-900/5 p-5 sm:p-16 lg:p-24 overflow-x-auto overflow-y-visible scrollbar-hide">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700" />
            </div>
          ) : (
            <div
              className={`relative flex ${
                isMobile
                  ? "flex-col min-h-[600px] justify-start items-center pt-8 sm:pt-10 px-3 sm:px-4"
                  : "flex-row min-w-max justify-center items-center py-14 sm:py-20 px-6 sm:px-10"
              }`}
            >
              {/* The Track (Pipe) */}
              <div
                className={`
                    absolute bg-white border border-[var(--border-main)] rounded-full overflow-hidden
                    ${
                      isMobile
                        ? "w-3 h-[calc(100%-100px)] top-[60px] mid-x"
                        : "left-10 right-10 h-3 top-1/2 -translate-y-[40px] md:-translate-y-[22px]"
                    }
                `}
                style={
                  isMobile ? { left: "50%", transform: "translateX(-50%)" } : {}
                }
              >
                {/* Progress Fill */}
                <motion.div
                  initial={isMobile ? { height: 0 } : { width: 0 }}
                  animate={
                    isMobile
                      ? { height: `${progress}%` }
                      : { width: `${progress}%` }
                  }
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  className={`bg-purple-700 ${isMobile ? "w-full origin-top" : "h-full origin-left"}`}
                />
              </div>

              {/* Station Nodes */}
              <div
                className={`relative flex ${
                  isMobile ? "flex-col gap-24" : "flex-row gap-16 sm:gap-32"
                }`}
              >
                {steps.map((step, i) => (
                  <StationNode
                    key={step.step_id}
                    step={step}
                    index={i}
                    totalSteps={steps.length}
                    isActive={i === completedCount && isActiveRoadmap}
                    isLocked={i > completedCount || !isActiveRoadmap}
                    onClick={handleStepClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      <StepDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        step={selectedStep}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default RoadmapView;
