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
} from "lucide-react";
import { useRoadmapPath } from "../../hooks/useRoadmapPath";
import { useCompleteStep } from "../../hooks/useCompleteStep";
import StepDrawer from "../../components/portal/StepDrawer";

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

/**
 * StationNode Component
 * 64px circular node positioned on the track
 */
const StationNode = ({ step, isActive, onClick }) => {
  const Icon = getStepIcon(step.title);

  return (
    <div className="relative flex flex-col items-center group">
      {/* Node Circle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(step)}
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
        `}
      >
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
        {!step.is_completed && !isActive && (
          <div className="absolute inset-0 bg-white/40 rounded-full flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
        )}
      </motion.button>

      {/* Label/Tooltip */}
      <div className="absolute top-20 text-center w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-[var(--bg-card)] text-[var(--text-main)] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border-main)]">
          {step.title}
        </div>
      </div>

      {/* Static Label below */}
      <div className="mt-4 text-center max-w-[120px]">
        <p
          className={`text-[11px] font-black uppercase tracking-tighter leading-tight ${
            step.is_completed || isActive
              ? "text-[var(--text-main)]"
              : "text-[var(--text-muted)]"
          }`}
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
  const completeStepMutation = useCompleteStep(id);

  const [selectedStep, setSelectedStep] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const steps = useMemo(() => data?.steps || [], [data]);
  const completedCount = steps.filter((s) => s.is_completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setIsDrawerOpen(true);
  };

  const handleComplete = async (stepId) => {
    try {
      await completeStepMutation.mutateAsync(stepId);

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
      {/* Header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-10 sm:pt-12 mb-12 sm:mb-16">
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-700 mb-8 hover:translate-x-[-4px] transition-transform"
        >
          <ChevronLeft className="w-3 h-3" /> Back to Dashboard
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
            <div className="flex items-center gap-4 sm:gap-6 bg-[var(--bg-card)] p-4 rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm min-w-[240px]">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">
                    Total Progress
                  </span>
                  <span className="text-sm font-black text-purple-700">
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
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
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
                    isActive={i === completedCount}
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
