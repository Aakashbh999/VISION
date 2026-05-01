/**
 * SegmentedControl — pill-style tab/toggle switcher.
 *
 * Props:
 *  options  – array of { value, label, icon? } objects
 *  value    – currently selected value
 *  onChange – called with the new value when a tab is clicked
 *  size     – 'sm' | 'md' (default 'md')
 *  className – extra classes for the outer wrapper
 */
const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = "md",
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
  };

  return (
    <div
      className={`flex bg-[var(--bg-active)] rounded-2xl p-1 ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 ${sizeStyles[size]} rounded-xl font-bold transition-all whitespace-nowrap ${
              isActive
                ? "bg-[var(--bg-card)] text-purple-500 shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
