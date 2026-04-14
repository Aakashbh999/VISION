const PALETTE = {
  purple: {
    solid: "bg-purple-600 text-white",
    soft: "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
    outline:
      "border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300",
  },
  blue: {
    solid: "bg-blue-600 text-white",
    soft: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
    outline:
      "border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
  },
  green: {
    solid: "bg-green-600 text-white",
    soft: "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300",
    outline:
      "border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300",
  },
  orange: {
    solid: "bg-orange-600 text-white",
    soft: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300",
    outline:
      "border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300",
  },
  rose: {
    solid: "bg-rose-600 text-white",
    soft: "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300",
    outline:
      "border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300",
  },
  emerald: {
    solid: "bg-emerald-600 text-white",
    soft: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
    outline:
      "border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300",
  },
  gray: {
    solid: "bg-slate-700 text-white",
    soft: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200",
    outline:
      "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
  },
};

const sizes = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

const Badge = ({
  children,
  variant = "purple",
  color,
  tone = "soft",
  size = "sm",
  className = "",
}) => {
  const resolvedColor = color || variant || "purple";
  const palette = PALETTE[resolvedColor] || PALETTE.purple;
  const toneClass = palette[tone] || palette.soft;
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
};
export default Badge;
