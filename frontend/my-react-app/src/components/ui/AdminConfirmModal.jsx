import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

/**
 * AdminConfirmModal - A premium confirmation modal for administrative actions
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} title - Modal title
 * @param {string} message - Descriptive text
 * @param {function} onConfirm - Callback when confirmed (optionally receives reason)
 * @param {function} onCancel - Callback when cancelled
 * @param {string} type - 'info', 'warning', 'danger'
 * @param {string} confirmText - Label for confirm button
 * @param {boolean} isLoading - Whether confirm button is in loading state
 * @param {boolean} showInput - Whether to show a "Reason" input field
 */
const AdminConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = "info",
  confirmText = "Confirm",
  isLoading = false,
  showInput = false,
  placeholder = "Enter reason for this action...",
}) => {
  const [reason, setReason] = useState("");

  const icons = {
    info: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    danger: <AlertCircle className="w-6 h-6 text-red-600" />,
  };

  const colors = {
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
    danger: "bg-red-600 hover:bg-red-700 shadow-red-100",
  };

  const handleConfirm = () => {
    if (showInput) {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-bg-card rounded-3xl shadow-2xl border border-border-main overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-4 text-left">
                <div className={`p-3 rounded-2xl ${
                  type === 'info' ? 'bg-blue-50/10' : 
                  type === 'warning' ? 'bg-amber-50/10' : 'bg-red-50/10'
                }`}>
                  {icons[type]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">{title}</h3>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Verification Required</p>
                </div>
                <button 
                  onClick={onCancel}
                  className="ml-auto p-2 text-text-muted hover:text-text-main hover:bg-bg-active rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="text-left mb-6">
                <p className="text-sm text-text-muted leading-relaxed font-medium">
                  {message}
                </p>
              </div>

              {/* Optional Input */}
              {showInput && (
                <div className="mb-6">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-24 p-4 text-sm bg-bg-active border border-border-main rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-bg-card text-text-main transition-all outline-none resize-none font-medium"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 text-sm font-bold text-text-muted bg-bg-active hover:bg-bg-main border border-border-main rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || (showInput && !reason.trim())}
                  className={`flex-1 py-3 px-4 text-sm font-bold text-white rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:shadow-none ${colors[type]}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Processing...
                    </div>
                  ) : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminConfirmModal;
