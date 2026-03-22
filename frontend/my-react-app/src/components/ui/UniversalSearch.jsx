import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Universal Search Component
 * A premium, debounced search input for the VISION platform.
 * 
 * @param {string} placeholder - Input placeholder text
 * @param {string} initialValue - Initial search value
 * @param {function} onSearch - Callback when search is debounced
 * @param {boolean} isLoading - Shows a loading spinner
 * @param {string} className - Additional CSS classes
 * @param {number} delay - Debounce delay in ms (default 400)
 */
const UniversalSearch = ({
  placeholder = "Search...",
  initialValue = "",
  onSearch,
  isLoading = false,
  className = "",
  delay = 400,
}) => {
  const [value, setValue] = useState(initialValue);

  // Sync with initialValue if it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-500 text-slate-400">
        <Search className="w-4 h-4" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl 
                   focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 
                   focus:bg-white transition-all text-sm font-medium text-slate-700
                   placeholder:text-slate-400"
        autoComplete="off"
      />

      {/* Action Area (Loading Spinner or Clear Button) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </motion.div>
          ) : value ? (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Subtle Glow Effect on focus */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-focus-within:opacity-10 blur-md -z-10 transition-opacity pointer-events-none" />
    </div>
  );
};

export default UniversalSearch;
