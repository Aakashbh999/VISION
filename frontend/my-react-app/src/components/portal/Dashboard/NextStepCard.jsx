import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const NextStepCard = ({ step }) => {
  if (!step) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Next Step
        </h3>
        <p className="text-[var(--text-muted)]">
          No pending steps – you're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Next Step
      </h3>
      <h4 className="text-lg font-semibold text-[var(--text-main)] mb-1">{step.title}</h4>
      <Link
        to={`/roadmaps/step/${step.step_id}`}
        className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-800 mt-3 group"
      >
        Continue Learning
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default NextStepCard;