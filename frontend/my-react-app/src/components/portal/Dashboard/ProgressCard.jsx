import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ProgressCard = ({ percent }) => {
  const percentage = parseFloat(percent) || 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
        Overall Progress
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({
              textSize: "16px",
              pathColor: `rgba(37, 99, 235, ${percentage / 100})`,
              textColor: "#1f2937",
              trailColor: "#e5e7eb",
            })}
          />
        </div>
        <p className="text-gray-600 text-sm">
          Keep going! You're making great progress.
        </p>
      </div>
    </div>
  );
};

export default ProgressCard;
