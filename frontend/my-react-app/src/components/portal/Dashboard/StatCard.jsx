import { cn } from "../../../utils/cn";

export default function StatCard({ icon: Icon, value, label, color, sub }) {
  return (
    <div className="flex items-center gap-4 bg-(--bg-card) border border-(--border-main) rounded-3xl shadow-sm p-5 min-w-[160px]">
      <div
        className={cn(
          "w-11 h-11 flex items-center justify-center rounded-xl",
          color || "bg-indigo-100 text-indigo-600",
        )}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-black text-(--text-main) truncate">
          {value}
        </div>
        <div className="text-xs text-(--text-muted) font-semibold mt-1 truncate">
          {label}
        </div>
        {sub ? (
          <div className="text-[10px] text-(--text-muted) mt-0.5 truncate">
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}
