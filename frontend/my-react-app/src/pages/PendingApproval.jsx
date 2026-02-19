import { Clock } from "lucide-react";

const PendingApproval = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Awaiting Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Your email has been verified. Your account is now pending review by an
          administrator. You'll be notified once approved.
        </p>
        <p className="text-sm text-gray-500">
          This usually takes 1-2 business days.
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
