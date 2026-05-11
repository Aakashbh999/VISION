import React from "react";

const Avatar = ({
  src,
  name,
  size = "md",
  status = null,
  className = "",
  variant = "circular",
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-[8px]",
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-lg",
  };

  const statusColors = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-rose-500",
    offline: "bg-[var(--text-muted)]/40",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const containerClasses = `
    relative inline-flex items-center justify-center shrink-0
    ${variant === "circular" ? "rounded-full" : "rounded-xl"}
    ${sizeClasses[size]}
    bg-[var(--sidebar-hover-bg)] border border-[var(--border-main)] overflow-hidden
    ${className}
  `;

  const getOptimizedSrc = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("/upload/w_") || url.includes("/upload/c_")) return url;

    return url.replace("/upload/", "/upload/w_150,h_150,c_fill,q_auto,f_auto/");
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div className={containerClasses}>
      {optimizedSrc ? (
        <img
          src={optimizedSrc}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="font-black text-(--text-muted) tracking-tighter">
          {initials}
        </span>
      )}

      {status && (
        <span
          className={`
          absolute bottom-0 right-0 z-10
          block w-[25%] h-[25%] rounded-full
          border-2 border-(--bg-main)
          ${statusColors[status]}
        `}
        />
      )}
    </div>
  );
};

export default Avatar;
