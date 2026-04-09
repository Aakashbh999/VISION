import React from "react";
import { Zap } from "lucide-react";
import { cn } from "../../../utils/cn";

const ForYouBadge = ({ className }) => {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white",
        "px-2.5 py-1 rounded-full uppercase",
        "bg-purple-600 border border-purple-500",
        className,
      )}
    >
      <Zap size={10} className="fill-white" />
      For You
    </span>
  );
};

export default ForYouBadge;
