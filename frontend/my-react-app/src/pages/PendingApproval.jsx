import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle, AlertCircle } from "lucide-react";
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

  const isRejected = user?.student_status === "rejected";

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <div className="bg-(--bg-card) rounded-3xl border border-(--border-main) p-8 shadow-xl">
        {isRejected ? (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-(--text-main) mb-3">
              Registration Rejected
            </h1>
            <p className="text-(--text-muted) mb-8">
              Unfortunately, your student registration was not approved at this time.
            </p>
            
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-left mb-8">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Rejection Reason</span>
              </div>
              <p className="text-sm text-(--text-main) font-medium leading-relaxed">
                {user?.rejection_reason || "No specific reason provided. Please contact support or try re-registering with correct details."}
              </p>
            </div>

            <button 
              onClick={() => navigate("/register")}
              className="w-full py-3 bg-(--text-main) text-(--bg-main) rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Update Registration
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-(--text-main) mb-3">
              Awaiting Approval
            </h1>
            <p className="text-(--text-muted) mb-6">
              Your email is verified! Your account is now pending review by our 
              academic administrators. You'll be notified via email once approved.
            </p>
            <div className="p-4 bg-bg-active/50 rounded-2xl border border-border-main">
              <p className="text-sm font-medium text-text-muted">
                Status: <span className="text-orange-500 font-bold ml-1">Pending Review</span>
              </p>
              <p className="text-[10px] text-text-muted/60 mt-1 uppercase tracking-tighter">
                Usually processed within 24-48 hours
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;
