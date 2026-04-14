import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserLandingPath } from "../utils/authRedirect";
import { useUserStatusPolling } from "../hooks/useUserStatusPolling";

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();

  useEffect(() => {
    if (!user) return;
    const nextPath = getUserLandingPath(user);
    if (nextPath && nextPath !== "/pending-approval") {
      navigate(nextPath, { replace: true });
    }
  }, [user, navigate]);

  useUserStatusPolling(refetchUser, true);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-(--bg-card) rounded-2xl border border-(--border-main) p-8 shadow-sm">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-(--text-main) mb-2">
          Awaiting Approval
        </h1>
        <p className="text-(--text-muted) mb-6">
          Your email is verified. Your account is now pending review by an
          administrator. You'll be notified once approved.
        </p>
        <p className="text-sm text-(--text-muted)">
          This usually takes 1-2 business days.
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
