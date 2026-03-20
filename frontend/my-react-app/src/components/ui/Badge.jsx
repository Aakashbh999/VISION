import React from "react";

const Badge = ({
  children,
  color = "purple", // purple, rose, emerald, blue, slate
  size = "md",
  className = "",
}) => {
  const colorMeta = {
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2 py-0.5 text-[10px]",
    lg: "px-3 py-1 text-xs",
  };

  const baseClasses = `
    inline-flex items-center justify-center font-black uppercase tracking-widest border rounded-full
    transition-all duration-200
  `;

  return (
    <span
      className={`${baseClasses} ${colorMeta[color]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
