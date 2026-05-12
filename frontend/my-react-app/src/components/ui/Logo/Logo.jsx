import React from "react";
import { cn } from "../../../utils/cn";

const Logo = ({ className, textClassName, variant = "full" }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {}
      <div className="w-10 h-10 flex-shrink-0 relative group">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
        >
          <defs>
            <linearGradient
              id="eyeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <filter id="glassBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#eyeGradient)"
            fillOpacity="0.1"
            className="animate-pulse"
          />

          {}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#eyeGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="180 60"
          />

          {}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="white"
            fillOpacity="0.1"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="1"
            filter="url(#glassBlur)"
          />

          {}
          <circle cx="50" cy="50" r="14" fill="url(#eyeGradient)">
            <animate
              attributeName="r"
              values="14;16;14"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {}
          <circle cx="44" cy="44" r="4" fill="white" fillOpacity="0.6" />
        </svg>
      </div>

      {}
      {variant !== "glyph" && (
        <span
          className={cn(
            "text-2xl font-black tracking-tighter text-[var(--text-main)]",
            "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
            "dark:from-purple-400 dark:to-indigo-400 font-['Outfit']",
            textClassName,
          )}
        >
          VISION
        </span>
      )}
    </div>
  );
};

export default Logo;
