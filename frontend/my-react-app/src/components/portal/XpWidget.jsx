import { useState, useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { useUserStats } from "../../hooks/useUserStats";
import { Zap } from "lucide-react";

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const from = previousValueRef.current;
    if (from === value) {
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

const XpWidget = () => {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading || !stats) {
    return (
      <div className="w-48 h-10 bg-[var(--bg-active)] animate-pulse rounded-full border border-[var(--border-main)]" />
    );
  }

  const { total_xp, current_level } = stats;

  const currentLevelXP = Math.pow(current_level - 1, 2) * 100;
  const nextLevelXP = Math.pow(current_level, 2) * 100;
  const xpInCurrentLevel = total_xp - currentLevelXP;
  const totalXPForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(
    (xpInCurrentLevel / totalXPForNextLevel) * 100,
    100,
  );

  return (
    <div className="flex items-center gap-4 bg-[var(--bg-card)] px-4 py-2 rounded-sm sm:rounded-2xl border border-[var(--border-main)] shadow-sm hover:shadow-md transition-shadow group">
      {}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 bg-purple-600 rotate-45 rounded-lg shadow-lg shadow-purple-500/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-[8px] font-black uppercase leading-none opacity-60">
            LVL
          </span>
          <span className="text-sm font-black text-amber-300 drop-shadow-sm">
            {current_level}
          </span>
        </div>

        {}
        <div className="absolute inset-0 bg-amber-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full" />
      </div>

      {}
      <div className="flex flex-col gap-1.5 min-w-[120px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-purple-600">
            <Zap className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              <AnimatedCounter value={total_xp} /> VXP
            </span>
          </div>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
            Next: {nextLevelXP}
          </span>
        </div>

        {}
        <div className="relative h-1.5 w-full bg-[var(--bg-active)] rounded-full overflow-hidden border border-[var(--border-main)]">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full relative transition-all duration-700 ease-out"
          >
            <div className="absolute top-0 right-0 w-8 h-full bg-[var(--bg-main)]/20 skew-x-12 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default XpWidget;
