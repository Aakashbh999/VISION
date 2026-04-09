import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (user.email_status !== "verified") {
      navigate("/verify-email", { replace: true });
      return;
    }

    if (user.student_status === "approved") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    refetchUser();

    const intervalId = window.setInterval(() => {
      refetchUser();
    }, 15000);

    const handleFocus = () => {
      refetchUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchUser]);

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
