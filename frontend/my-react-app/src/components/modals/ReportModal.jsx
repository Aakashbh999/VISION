import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import ButtonLoader from "../ui/ButtonLoader";

const REASONS = [
  "Spam",
  "Inappropriate Content",
  "Harassment",
  "Misinformation",
];

const ReportModal = ({
  isOpen,
  onClose,
  onReport,
  targetType,
  isSubmitting,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) return;

    try {
      await onReport(selectedReason);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedReason("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);

    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-main)]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[var(--text-main)] uppercase tracking-tighter flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> Report{" "}
              {targetType}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-10 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-[var(--text-main)] font-black uppercase text-sm tracking-widest">
                  Report Received
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-bold">
                  Thank you for keeping our community safe.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Select a reason
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReason(reason)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                        selectedReason === reason
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm"
                          : "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--bg-active)]"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-[var(--border-main)] text-[var(--text-muted)] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-active)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 bg-[var(--text-main)] text-[var(--bg-main)] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <ButtonLoader size={16} /> : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
