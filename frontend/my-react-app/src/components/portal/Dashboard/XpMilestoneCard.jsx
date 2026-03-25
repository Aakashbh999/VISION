import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStats } from "../../../hooks/useUserStats";
import { Zap, Shield, Star, Sparkles, CheckCircle2, Lock, X } from "lucide-react";
import Skeleton from "../../ui/Skeleton";

// VXP Milestone definitions — with dark mode colors
const MILESTONES = [
  { 
    xp: 50, label: "First Post", icon: Star, 
    light: "text-amber-500 bg-amber-50 border-amber-200",
    dark: "dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-700"
  },
  { 
    xp: 200, label: "Contributor", icon: Sparkles, 
    light: "text-indigo-500 bg-indigo-50 border-indigo-200",
    dark: "dark:text-indigo-400 dark:bg-indigo-950/50 dark:border-indigo-700"
  },
  { 
    xp: 500, label: "Circle Creator", icon: Shield, 
    light: "text-purple-600 bg-purple-50 border-purple-200",
    dark: "dark:text-purple-400 dark:bg-purple-950/50 dark:border-purple-700"
  },
  { 
    xp: 1000, label: "Knowledge Master", icon: Zap, 
    light: "text-rose-500 bg-rose-50 border-rose-200",
    dark: "dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-700"
  },
];

const XpMilestoneCard = () => {
  const { data: stats, isLoading } = useUserStats();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 space-y-4">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="rectangular" className="h-2 rounded-full w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { total_xp = 0, current_level = 1 } = stats;

  // Progress to next milestone
  const nextMilestone = MILESTONES.find((m) => m.xp > total_xp);
  const prevMilestoneXp = (() => {
    const prev = [...MILESTONES].reverse().find((m) => m.xp <= total_xp);
    return prev ? prev.xp : 0;
  })();
  const progressPercent = nextMilestone
    ? Math.min(((total_xp - prevMilestoneXp) / (nextMilestone.xp - prevMilestoneXp)) * 100, 100)
    : 100;

  return (
    <>
      {/* Summary Card for Dashboard Grid */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 hover:shadow-lg transition-all text-left flex flex-col justify-between group h-full cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              VXP Journey
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[var(--text-main)]">{total_xp.toLocaleString()}</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">VXP</span>
            </div>
          </div>
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-purple-600 rotate-45 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
              <span className="text-[8px] font-black uppercase leading-none opacity-60">LVL</span>
              <span className="text-sm font-black text-amber-300">{current_level}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--border-main)] flex items-center justify-between w-full">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {nextMilestone ? `Next: ${nextMilestone.label}` : "Max Level Reached"}
          </span>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors">
            View Details &rarr;
          </span>
        </div>
      </button>

      {/* Full Size Modal Popup */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-main)]"
            >
              {/* Modal Header */}
              <div className="p-6 pb-0 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--text-main)]">
                  Your VXP Milestones
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 pt-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Current Score
                    </h3>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-4xl font-black text-[var(--text-main)]">{total_xp.toLocaleString()}</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">VXP</span>
                    </div>
                  </div>
                  <div className="relative mr-2">
                    <div className="w-16 h-16 bg-purple-600 rotate-45 rounded-2xl shadow-lg shadow-purple-500/30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                      <span className="text-[10px] font-black uppercase leading-none opacity-60">LVL</span>
                      <span className="text-xl font-black text-amber-300">{current_level}</span>
                    </div>
                  </div>
                </div>

                {/* Progress to next milestone */}
                {nextMilestone && (
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
                      <span className="font-medium">Next: <span className="text-[var(--text-main)]">{nextMilestone.label}</span></span>
                      <span className="font-black text-purple-600 dark:text-purple-400">{nextMilestone.xp - total_xp} VXP to go</span>
                    </div>
                    <div className="relative h-3 bg-[var(--bg-active)] rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Milestones grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MILESTONES.map((m, idx) => {
                    const achieved = total_xp >= m.xp;
                    const MIcon = m.icon;
                    // Combine light and dark classes
                    const bgClass = achieved ? `${m.light} ${m.dark}` : "bg-[var(--bg-active)] border-[var(--border-main)]";
                    const iconColorClass = achieved ? m.light.split(" ")[0] : "text-[var(--text-muted)]";
                    const textColorClass = achieved ? m.light.split(" ")[0] : "text-[var(--text-muted)]";
                    return (
                      <motion.div
                        key={m.xp}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          achieved ? `${m.light} ${m.dark} shadow-sm` : "bg-[var(--bg-active)] border-[var(--border-main)] opacity-60"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          achieved ? `bg-opacity-50 ${m.light.split(" ")[1]} ${m.dark.split(" ")[1]}` : "bg-[var(--border-main)]"
                        }`}>
                          {achieved ? (
                            <MIcon className={`w-5 h-5 ${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}`} />
                          ) : (
                            <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-black truncate ${achieved ? `${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}` : "text-[var(--text-muted)]"}`}>
                            {m.label}
                          </p>
                          <p className={`text-xs font-bold leading-tight ${achieved ? `${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}` : "text-[var(--text-muted)]"}`}>
                            {achieved ? (
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Unlocked</span>
                            ) : (
                              `${m.xp} VXP`
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default XpMilestoneCard;