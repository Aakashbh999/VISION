import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Reusable Empty State Component
 * Shows when no data is available with contextual message and optional CTA
 *
 * Props:
 * - icon: Lucide icon component (required)
 * - title: Main heading (required)
 * - description: Subtext explaining the empty state
 * - actionText: CTA button text (optional)
 * - actionHref: Link destination for CTA (optional)
 * - actionOnClick: Callback for CTA button (optional)
 * - className: Additional container classes
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  actionOnClick,
  className = "",
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.1, duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center py-16 px-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon with animation */}
      <motion.div
        variants={iconVariants}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-6"
      >
        <Icon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
      </motion.div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] text-center mb-2 uppercase">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[var(--text-muted)] text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action CTA */}
      {actionText &&
        (actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-main)]"
            aria-label={actionText}
          >
            {actionText}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <button
            onClick={actionOnClick}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-main)]"
            aria-label={actionText}
          >
            {actionText}
            <span aria-hidden="true">→</span>
          </button>
        ))}
    </motion.div>
  );
};

export default EmptyState;
