import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      // Error handled by parent/toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> Report{" "}
              {targetType}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-gray-900 font-black uppercase text-sm tracking-widest">
                    Report Received
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-bold">
                    Thank you for keeping our community safe.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
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
                            ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
                            : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
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
                    className="flex-1 px-6 py-3 border-2 border-gray-100 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedReason || isSubmitting}
                    className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <ButtonLoader size={16} />
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
