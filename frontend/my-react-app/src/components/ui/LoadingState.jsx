import { motion } from "framer-motion";
import SkeletonCard from "./SkeletonCard";
import SkeletonList from "./SkeletonList";

/**
 * Improved Loading State Component
 * Replaces generic spinner with skeleton screens that match the content layout
 *
 * Props:
 * - variant: "card" | "list" | "discussion" | "group" | "spinner" (default: "card")
 * - count: Number of skeleton items to show
 * - text: Optional loading message text
 */
const LoadingState = ({ variant = "card", count = 3, text = null }) => {
  // Spinner variant (original behavior)
  if (variant === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 rounded-full"
          aria-busy="true"
          aria-label="Loading"
        />
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Skeleton variants
  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  return (
    <motion.div
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
      aria-busy="true"
      aria-label="Loading content"
    >
      {variant === "card" && <SkeletonCard count={count} />}
      {(variant === "list" || variant === "discussion") && (
        <SkeletonList count={count} variant="discussion" />
      )}
      {variant === "group" && <SkeletonList count={count} variant="group" />}
    </motion.div>
  );
};

export default LoadingState;
