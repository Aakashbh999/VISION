import React, { useState, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { useUserStats } from "../../hooks/useUserStats";
import { Shield, TrendingUp, Zap } from "lucide-react";

/**
 * AnimatedCounter component for the XP number
 */
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const from = previousValueRef.current;
    if (from === value) {
      setCount(value);
      return;
    }

    const controls = animate(from, value, {
      duration: 1.5,
      onUpdate: (latest) => {
        const next = Math.floor(latest);
        previousValueRef.current = next;
        setCount(next);
      },
      onComplete: () => {
        previousValueRef.current = value;
      },
    });

    return () => controls.stop();
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

/**
 * XpWidget - HUD for VisionXP Gamification
 */
const XpWidget = () => {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading || !stats) {
    return (
      <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-full border border-gray-200" />
    );
  }

  const { total_xp, current_level } = stats;

  // Calculate progress to next level
  // Level Formula: Level = floor(sqrt(total_xp / 100)) + 1
  // To reach next level (L+1): total_xp = ((L+1 - 1)^2) * 100 = (L^2) * 100
  // Current Level thresholds:
  const currentLevelXP = Math.pow(current_level - 1, 2) * 100;
  const nextLevelXP = Math.pow(current_level, 2) * 100;
  const xpInCurrentLevel = total_xp - currentLevelXP;
  const totalXPForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(
    (xpInCurrentLevel / totalXPForNextLevel) * 100,
    100,
  );

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      {/* Level Badge (Hexagon-like) */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 bg-[#7c3aed] rotate-45 rounded-lg shadow-lg shadow-purple-500/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-[8px] font-black uppercase leading-none opacity-60">
            LVL
          </span>
          <span className="text-sm font-black text-amber-300 drop-shadow-sm">
            {current_level}
          </span>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-amber-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full" />
      </div>

      {/* XP Info & Progress */}
      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#7c3aed]">
            <Zap className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              <AnimatedCounter value={total_xp} /> VXP
            </span>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
            Next: {nextLevelXP}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full relative"
          >
            <div className="absolute top-0 right-0 w-8 h-full bg-white/20 skew-x-12 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default XpWidget;
