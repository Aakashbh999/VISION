import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, ChevronDown } from "lucide-react";

const DEFAULT_REASONS = [
  { id: "spam", label: "Spam or inappropriate content", emoji: "🚫" },
  { id: "inactive", label: "Group is no longer active", emoji: "🚫" },
  { id: "duplicate", label: "Duplicate group", emoji: "🔄" },
  { id: "merge", label: "Merging with another group", emoji: "🔗" },
  { id: "revamp", label: "Starting fresh with new group", emoji: "✨" },
  { id: "other", label: "Other reason", emoji: "📝" },
];

/**
 * DeleteConfirmationModal
 *
 * Reusable deletion confirmation component supporting:
 * - 5 preset deletion reasons + custom input
 * - Multiple entity types (group, post, comment, resource)
 * - Soft-delete for users, hard-delete for admins
 *
 * Props:
 *   - isOpen: bool — modal visibility
 *   - onClose: () => void
 *   - onConfirm: (reason: string) => Promise<void>
 *   - title: string — "Delete Group", "Delete Post", etc.
 *   - description: string — warning text explaining deletion
 *   - isPending: bool — loading state of mutation
 *   - itemName: string (optional) — entity name to display in confirmation
 *   - entityType: string (optional) — 'group' | 'post' | 'comment' | 'resource' for styling
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "This action cannot be undone.",
  isPending = false,
  itemName = "",
  entityType = "group", // group | post | comment | resource
}) {
  const [selectedReason, setSelectedReason] = useState("spam");
  const [customReason, setCustomReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get reason object
  const reasonObj = DEFAULT_REASONS.find((r) => r.id === selectedReason);
  const isCustom = selectedReason === "other";
  const finalReason = isCustom
    ? customReason
    : reasonObj?.label || "No reason provided";

  const handleConfirm = async () => {
    if (isCustom && !customReason.trim()) {
      alert("Please provide a reason for deletion");
      return;
    }
    await onConfirm(finalReason);
    onClose();
  };

  if (!isOpen) return null;

  // Color config by entity type
  const colorConfig = {
    group: {
      bg: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700",
    },
    post: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    comment: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      button: "bg-orange-600 hover:bg-orange-700",
    },
    resource: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      button: "bg-rose-600 hover:bg-rose-700",
    },
  };

  const colors = colorConfig[entityType] || colorConfig.group;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md ${colors.bg} border ${colors.border} rounded-2xl shadow-2xl z-50 p-8`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isPending}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-slate-900">{title}</h2>
                {itemName && (
                  <p className="text-sm text-slate-600 mt-1 font-semibold truncate">
                    "{itemName}"
                  </p>
                )}
              </div>
            </div>

            {/* Warning text */}
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {description}
            </p>

            {/* Reason selector */}
            <div className="mb-6 space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                Why are you deleting this {entityType}?
              </label>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-left text-sm font-semibold text-slate-700 flex items-center justify-between hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{reasonObj?.emoji}</span>
                    {reasonObj?.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-10"
                  >
                    {DEFAULT_REASONS.map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => {
                          setSelectedReason(reason.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl border-b last:border-b-0 border-slate-100 transition-colors"
                      >
                        <span className="text-lg">{reason.emoji}</span>
                        {reason.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Custom reason input — only show if "Other" selected */}
              {isCustom && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder={`Tell us why you're deleting this ${entityType}...`}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                  disabled={isPending}
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending || (isCustom && !customReason.trim())}
                className={`flex-1 px-4 py-3 ${colors.button} text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete{" "}
                    {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                  </>
                )}
              </button>
            </div>

            {/* Info text for soft delete */}
            <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-widest">
              This deletion will be recorded for moderation purposes
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
