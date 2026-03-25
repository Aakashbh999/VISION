// src/components/ui/Badge.jsx
const Badge = ({ children, variant = "purple", className = "" }) => {
  const variants = {
    purple: "bg-purple-100 text-purple-800",
    blue: "bg-blue-100 text-blue-800",    // keep if needed, but consider using purple
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    gray: "bg-gray-100 text-gray-800",
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