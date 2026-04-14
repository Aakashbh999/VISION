import { motion } from "framer-motion";
import { useUserStats } from "../../../hooks/useUserStats";
import {
  Zap,
  Shield,
  Star,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Skeleton from "../../ui/Skeleton";

// VXP Milestone definitions — with dark mode colors
const MILESTONES = [
  {
    xp: 50,
    label: "First Post",
    icon: Star,
    light: "text-amber-500 bg-amber-50 border-amber-200",
    dark: "dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-700",
  },
  {
    xp: 200,
    label: "Contributor",
    icon: Sparkles,
    light: "text-indigo-500 bg-indigo-50 border-indigo-200",
    dark: "dark:text-indigo-400 dark:bg-indigo-950/50 dark:border-indigo-700",
  },
  {
    xp: 500,
    label: "Circle Creator",
    icon: Shield,
    light: "text-purple-600 bg-purple-50 border-purple-200",
    dark: "dark:text-purple-400 dark:bg-purple-950/50 dark:border-purple-700",
  },
  {
    xp: 1000,
    label: "Knowledge Master",
    icon: Zap,
    light: "text-rose-500 bg-rose-50 border-rose-200",
    dark: "dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-700",
  },
];

const XpMilestoneCard = ({ compact = false }) => {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <div
        className={`bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x ${compact ? "p-5" : "p-6"} space-y-4`}
      >
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="rectangular" className="h-2 rounded-full w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              className="h-14 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { total_xp = 0 } = stats;

  // Progress to next milestone
  const nextMilestone = MILESTONES.find((m) => m.xp > total_xp);
  const prevMilestoneXp = (() => {
    const prev = [...MILESTONES].reverse().find((m) => m.xp <= total_xp);
    return prev ? prev.xp : 0;
  })();
  const progressPercent = nextMilestone
    ? Math.min(
        ((total_xp - prevMilestoneXp) / (nextMilestone.xp - prevMilestoneXp)) *
          100,
        100,
      )
    : 100;

  return (
    <div
      className={`bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x ${compact ? "p-5" : "p-6"}`}
    >
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-5">
        VXP Milestones
      </h3>

      {nextMilestone && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
            <span className="font-medium">
              Next:{" "}
              <span className="text-[var(--text-main)]">{nextMilestone.label}</span>
            </span>
            <span className="font-black text-purple-600 dark:text-purple-400">
              {nextMilestone.xp - total_xp} VXP to go
            </span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MILESTONES.map((m, idx) => {
          const achieved = total_xp >= m.xp;
          const MIcon = m.icon;
          return (
            <motion.div
              key={m.xp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className={`flex items-center gap-3 p-4 rounded-sm sm:rounded-2xl border transition-all ${
                achieved
                  ? `${m.light} ${m.dark} shadow-sm`
                  : "bg-[var(--bg-active)] border-[var(--border-main)] opacity-60"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  achieved
                    ? `bg-opacity-50 ${m.light.split(" ")[1]} ${m.dark.split(" ")[1]}`
                    : "bg-[var(--border-main)]"
                }`}
              >
                {achieved ? (
                  <MIcon
                    className={`w-5 h-5 ${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}`}
                  />
                ) : (
                  <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-black truncate ${
                    achieved
                      ? `${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}`
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {m.label}
                </p>
                <p
                  className={`text-xs font-bold leading-tight ${
                    achieved
                      ? `${m.light.split(" ")[0]} ${m.dark.split(" ")[0]}`
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {achieved ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
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
  );
};

export default XpMilestoneCard;
