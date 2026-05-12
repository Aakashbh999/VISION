import { motion } from "framer-motion";
import SkeletonCard from "./SkeletonCard";
import SkeletonList from "./SkeletonList";
import LoadingSpinner from "./LoadingSpinner";

const LoadingState = ({ variant = "card", count = 3 }) => {

  if (variant === "spinner") {
    return <LoadingSpinner />;
  }

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
