// src/components/ui/Badge.jsx
const Badge = ({ children, variant = "purple", className = "" }) => {
  const variants = {
    purple:
      "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300",
    blue: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
    green:
      "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300",
    orange:
      "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300",
    gray: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
export default Badge;
