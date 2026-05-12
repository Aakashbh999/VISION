import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProgressCard = ({ percent }) => {
  const percentage = parseFloat(percent) || 0;
  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Overall Progress
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({
              textSize: "16px",
              pathColor: `rgba(147, 51, 234, ${percentage / 100})`,
              textColor: "var(--text-main)",
              trailColor: "var(--border-main)",
            })}
          />
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Keep going! You're making great progress.
        </p>
      </div>
    </div>
  );
};

export default ProgressCard;
