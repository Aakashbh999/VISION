import React from "react";
import { Sparkles, ArrowUpRight, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const RecommendationList = ({ recommendations, progressPercent = 0 }) => {
  if (!recommendations?.length) {
    const pct = parseFloat(progressPercent) || 0;
    const message =
      pct >= 75
        ? "You're in a great rhythm. Keep the streak going."
        : pct >= 40
        ? "Steady progress — one more focused session moves you ahead."
        : "Small consistent steps now will accelerate your learning curve.";

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            Overall Progress
          </h3>
        </div>

        {/* Circular progress — same library as old ProgressCard */}
        <div className="flex flex-col items-center gap-2 flex-1 justify-center py-4">
          <div className="w-28 h-28">
            <CircularProgressbar
              value={pct}
              text={`${pct.toFixed(0)}%`}
              styles={buildStyles({
                textSize: "16px",
                pathColor: `rgba(139, 92, 246, ${0.4 + (pct / 100) * 0.6})`,
                textColor: "var(--text-main, #111827)",
                trailColor: "rgba(148,163,184,0.2)",
                pathTransitionDuration: 1.1,
              })}
            />
          </div>

          {/* Progress bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-medium">Roadmap</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
              />
            </div>
          </div>

          {/* Contextual message */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 sm:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
            Top Picks For You
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Curated based on your program and interests
          </p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {recommendations.slice(0, 5).map((rec, index) => (
          <motion.a
            variants={itemVariants}
            key={rec.resource_id || index}
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-active)] border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50 hover:bg-white dark:hover:bg-[var(--bg-card)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)] transition-all duration-300 overflow-hidden"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10 w-full pr-4">
              <div className="w-10 h-10 shrink-0 rounded-[10px] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-500 font-bold text-sm border border-gray-200 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:text-gray-400 group-hover:scale-110 group-hover:text-purple-600 group-hover:border-purple-200 dark:group-hover:text-purple-400 dark:group-hover:border-purple-800/50 transition-all duration-300">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base text-[var(--text-main)] truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {rec.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    Score: {rec.score}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
};

export default RecommendationList;
