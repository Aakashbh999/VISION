import { cn } from "../../../utils/cn";

export default function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 min-w-[160px]">
      <div
        className={cn(
          "w-12 h-12 flex items-center justify-center rounded-xl",
          color || "bg-indigo-100 text-indigo-600",
        )}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-slate-300 font-semibold mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
