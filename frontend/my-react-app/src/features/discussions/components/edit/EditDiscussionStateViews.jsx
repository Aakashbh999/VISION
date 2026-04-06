import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";

export const EditDiscussionLoading = () => {
  return <LoadingSpinner />;
};

export const EditDiscussionError = () => {
  return <div className="p-8 text-red-500">Failed to load discussion</div>;
};

export const EditDiscussionExpired = ({ discussionId }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-main)] mb-2">
          Edit Window Expired
        </h2>
        <p className="text-[var(--text-muted)] mb-4">
          Discussions can only be edited within 24 hours of posting.
        </p>
        <Link
          to={`/discussions/${discussionId}`}
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Discussion
        </Link>
      </div>
    </div>
  );
};
