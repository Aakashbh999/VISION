import React from "react";
import { Sparkles, ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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

const RecommendationList = ({ recommendations }) => {
  if (!recommendations?.length) {
    return (
      <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-active)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-full flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-800">
            <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
            Keep Learning
          </h3>
          <p className="text-[var(--text-muted)] text-sm max-w-[250px]">
            We're gathering data to build your personalized recommendations. Check back soon!
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
