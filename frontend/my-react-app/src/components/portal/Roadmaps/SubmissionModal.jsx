import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Link as LinkIcon, Send, Sparkles } from "lucide-react";

const SubmissionModal = ({ isOpen, onClose, onSubmit, stepTitle, isSubmitting }) => {
  const [insight, setInsight] = useState("");
  const [link, setLink] = useState("");

  const calculateEntropy = (str) => {
    if (!str) return 0;
    const uniqueChars = new Set(str.toLowerCase().replace(/\s/g, "")).size;
    const totalChars = str.replace(/\s/g, "").length;
    if (totalChars === 0) return 0;
    // Basic variety score: Unique chars / Total chars (weighted)
    return (uniqueChars / Math.sqrt(totalChars)) * 10;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ submission_text: insight, submission_link: link });
  };

  const wordCount = insight.trim().length;
  const entropyScore = calculateEntropy(insight);
  const isQualifying = wordCount >= 100 && entropyScore > 5;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-purple-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header / Banner */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Award className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight leading-tight">Proof of Work</h3>
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-widest">{stepTitle}</p>
                </div>
              </div>

              {/* Reward Badge */}
              <div className="mt-6 flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-200">Standard Reward</p>
                  <p className="font-['JetBrains_Mono'] text-lg font-black text-yellow-400">
                    {isQualifying ? "20 VXP" : "10 VXP"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-purple-200">
                    {isQualifying ? "Insight Verified ✓" : "Writing quality low"}
                  </p>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      className={`h-full ${isQualifying ? 'bg-green-400' : 'bg-yellow-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (wordCount / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">
                  What did you learn? (Key Insight)
                </label>
                <textarea
                  required
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="Summarize your main takeaway in a few sentences..."
                  className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                />
                <div className="flex justify-between items-center px-1">
                  <p className={`text-[10px] font-bold ${isQualifying ? 'text-green-500' : 'text-gray-400'}`}>
                    {wordCount} / 100 characters {isQualifying && '✓ Quality Verified'}
                  </p>
                  {!isQualifying && wordCount > 0 && (
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      {wordCount < 100 ? "Need more detail" : "Avoid repetitive text"}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 ml-1">
                  Project / Reference Link (Optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || insight.trim().length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      SUBMIT PROOF
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">
                  Make it count — one chance to verify!
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SubmissionModal;
