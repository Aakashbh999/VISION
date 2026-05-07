import { motion } from "framer-motion";
import SkeletonCard from "./SkeletonCard";
import SkeletonList from "./SkeletonList";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Improved Loading State Component
 * Replaces generic spinner with skeleton screens that match the content layout
 *
 * Props:
 * - variant: "card" | "list" | "discussion" | "group" | "spinner" (default: "card")
 * - count: Number of skeleton items to show
 * - text: Optional loading message text
 */
const LoadingState = ({ variant = "card", count = 3 }) => {
  // Spinner variant (original behavior)
  if (variant === "spinner") {
    return <LoadingSpinner />;
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
