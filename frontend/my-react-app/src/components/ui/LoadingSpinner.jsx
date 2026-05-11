import React from "react";
import { cn } from "../../utils/cn";

const LoadingSpinner = ({ size = "md", className = "", inline = false }) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const containerClasses = inline
    ? "inline-flex items-center justify-center"
    : "flex flex-col justify-center items-center py-12 gap-4";

  return (
    <div className={cn(containerClasses, className)}>
      <div className={cn("relative transition-all duration-300", sizeClasses[size] || size)}>
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-2xl animate-[pulse_4s_ease-in-out_infinite]"
        >
          <defs>
            <linearGradient
              id="eyeGradientSpinner"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
            <filter id="glassBlurSpinner">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#eyeGradientSpinner)"
            fillOpacity="0.1"
            className="animate-pulse"
          />

          {}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#eyeGradientSpinner)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="180 60"
            className="animate-[spin_3s_linear_infinite]"
            style={{ transformOrigin: "center" }}
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
            filter="url(#glassBlurSpinner)"
          />

          {}
          <circle cx="50" cy="50" r="14" fill="url(#eyeGradientSpinner)">
            <animate
              attributeName="r"
              values="12;16;12"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {}
          <circle cx="44" cy="44" r="4" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
};

export default LoadingSpinner;
