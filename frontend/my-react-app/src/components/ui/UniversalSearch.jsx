import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

const UniversalSearch = ({
  placeholder = "Search...",
  initialValue = "",
  onSearch,
  isLoading = false,
  className = "",
  delay = 400,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-500 text-[var(--text-muted)]">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-12 py-3 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl
                   focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500
                   focus:bg-[var(--bg-card)] transition-all text-sm font-medium text-[var(--text-main)]
                   placeholder:text-[var(--text-muted)]`}
        autoComplete="off"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {isLoading ? (
          <div>
            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
          </div>
        ) : value ? (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-10 blur-md -z-10 transition-opacity pointer-events-none" />
    </div>
  );
};

export default UniversalSearch;
