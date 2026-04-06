import { Clock, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PendingAccessMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-amber-100 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
          Approval Pending
        </h2>

        <p className="text-sm text-[var(--text-muted)] mb-6">
          Your account is awaiting admin approval. Once approved, you'll have
          full access to all VISION features including discussions, resources,
          roadmaps, and more.
        </p>

        <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
            <Shield className="w-4 h-4" />
            <span>This feature requires an approved account</span>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PendingAccessMessage;
