import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, ChevronDown } from "lucide-react";

const REASONS_CONFIG = {
  group: [
    { id: "inactive", label: "Group is no longer active" },
    { id: "duplicate", label: "Duplicate of another group" },
    { id: "rules", label: "Violated community guidelines" },
    { id: "private", label: "Moving to a private platform" },
  ],
  post: [
    { id: "mistake", label: "Posted in the wrong category" },
    { id: "outdated", label: "Information is no longer relevant" },
    { id: "resolved", label: "Question/Issue has been resolved" },
    { id: "spam", label: "Spam or low quality content" },
  ],
  comment: [
    { id: "typo", label: "Contains errors or typos" },
    { id: "irrelevant", label: "Not contributing to discussion" },
    { id: "changed_mind", label: "Changed my mind/opinion" },
    { id: "offensive", label: "Inappropriate tone or language" },
  ],
  resource: [
    { id: "broken", label: "Link or file is broken/unavailable" },
    { id: "copyright", label: "Copyright or permission issue" },
    { id: "better_version", label: "Replaced by a better resource" },
    { id: "incorrect", label: "Content contains inaccuracies" },
  ],
};

const OTHER_REASON = { id: "other", label: "Other reason" };

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "This action cannot be undone.",
  isPending = false,
  itemName = "",
  entityType = "post",
}) {
  const availableReasons = useMemo(() => {
    const base = REASONS_CONFIG[entityType] || REASONS_CONFIG.post;
    return [...base, OTHER_REASON];
  }, [entityType]);

  const [selectedReasonId, setSelectedReasonId] = useState(availableReasons[0].id);
  const [customReason, setCustomReason] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedReasonId(availableReasons[0].id);
      setCustomReason("");
      setIsDropdownOpen(false);
    }
  }, [isOpen, availableReasons]);

  useEffect(() => {
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const selectedObj = availableReasons.find((r) => r.id === selectedReasonId);
  const isCustom = selectedReasonId === "other";

  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const finalReasonText = isCustom ? customReason : selectedObj?.label;

    if (isCustom && (!customReason.trim() || customReason.length < 10)) {
      return;
    }

    await onConfirm(finalReasonText);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Surface – increased width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-main)]"
        >
          <div className="p-7">
            {/* Header Section */}
            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[var(--text-main)] leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-medium truncate">
                  {itemName ? itemName : description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[var(--bg-active)] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Dropdown Logic – wider container */}
            <div className="space-y-4 mb-10 flex flex-col items-center">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider self-start">
                Reason for removal
              </label>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[var(--bg-main)] border border-[var(--border-main)] hover:border-purple-300 rounded-xl transition-all text-base"
                >
                  <span className="font-semibold text-[var(--text-main)] text-base">
                    {selectedObj?.label}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-xl z-20 py-1 max-h-60 overflow-y-auto"
                    >
                      {availableReasons.map((reason) => (
                        <button
                          key={reason.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedReasonId(reason.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-5 py-3 text-left text-base font-medium transition-colors border-l-2 ${
                            selectedReasonId === reason.id
                              ? "bg-purple-50 border-purple-500 text-purple-700"
                              : "bg-transparent border-transparent text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                          }`}
                        >
                          {reason.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Custom Reason Box */}
              <AnimatePresence>
                {isCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden w-full"
                  >
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please specify your reason..."
                      className="w-full p-4 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl text-base font-medium focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none transition-all mt-2 resize-none text-[var(--text-main)]"
                      rows={3}
                      maxLength={450}
                    />
                    <div className="flex justify-end mt-1 px-1">
                      <span
                        className={`text-[11px] font-bold uppercase ${customReason.length > 400 ? "text-red-500" : "text-[var(--text-muted)]"}`}
                      >
                        {customReason.length} / 450
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions – removed shadow/glow from delete button */}
            <div className="flex gap-6 justify-center items-center mt-8">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-3 text-[var(--text-muted)] font-bold text-sm uppercase tracking-widest hover:bg-[var(--bg-active)] rounded-xl transition-colors disabled:opacity-50 max-w-[140px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  isPending || (isCustom && customReason.trim().length < 10)
                }
                className="flex-[1.5] py-3 bg-red-600 hover:bg-red-700 disabled:bg-[var(--bg-active)] disabled:text-[var(--text-muted)] text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 max-w-[180px]"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Item
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}