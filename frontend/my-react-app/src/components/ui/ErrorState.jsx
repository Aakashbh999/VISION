import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  onRetry,
  retryText = "Try Again",
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 mx-auto mb-4"
      >
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </motion.div>

      {}
      <h3 className="text-lg font-black text-red-900 dark:text-red-100 mb-2 uppercase">
        {title}
      </h3>

      {}
      <p className="text-sm text-red-700 dark:text-red-300 max-w-md mx-auto mb-6">
        {description}
      </p>

      {}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-main)]"
          aria-label={retryText}
        >
          <RefreshCw className="w-4 h-4" />
          {retryText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;
