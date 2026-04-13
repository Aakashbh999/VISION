import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }

    // Update error state
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error tracking service (e.g., Sentry)
    if (window._errorTracker) {
      window._errorTracker.captureException(error, { contexts: { errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-main)]"
        >
          <div className="max-w-md w-full space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
              >
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </motion.div>
            </div>

            {/* Error Message */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-black text-[var(--text-main)] uppercase">
                Something went wrong
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                We encountered an unexpected error. Please try refreshing the
                page.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <summary className="cursor-pointer font-bold text-red-700 dark:text-red-400 text-sm">
                  Error Details
                </summary>
                <pre className="mt-2 text-[10px] overflow-auto max-h-40 text-red-600 dark:text-red-300 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </motion.details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-6 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-active)] border border-[var(--border-main)] text-[var(--text-main)] font-black rounded-xl transition-colors"
              >
                Go Home
              </motion.button>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
