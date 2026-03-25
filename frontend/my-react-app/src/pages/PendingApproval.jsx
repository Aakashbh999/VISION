import { Clock } from "lucide-react";

const PendingApproval = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-8 shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
          Awaiting Approval
        </h1>
        <p className="text-[var(--text-muted)] mb-6">
          Your email has been verified. Your account is now pending review by an
          administrator. You'll be notified once approved.
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          This usually takes 1-2 business days.
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;