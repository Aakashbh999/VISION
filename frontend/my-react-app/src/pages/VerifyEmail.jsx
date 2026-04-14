import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getUserLandingPath } from "../utils/authRedirect";
import { useUserStatusPolling } from "../hooks/useUserStatusPolling";

const VerifyEmail = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const nextPath = getUserLandingPath(user);
    if (nextPath && nextPath !== "/verify-email") {
      navigate(nextPath, { replace: true });
    }
  }, [user, navigate]);

  useUserStatusPolling(refetchUser, true);

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/resend-verification");
      setMessage(response.data.message || "Verification email sent!");
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to resend verification email",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-8 shadow-sm">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
          Verify Your Email
        </h1>
        <p className="text-[var(--text-muted)] mb-2">
          We've sent a verification link to:
        </p>
        <p className="font-medium text-[var(--text-main)] mb-4">
          {user?.email || "your email address"}
        </p>
        <p className="text-[var(--text-muted)] mb-6">
          Check your inbox and click the link to verify your account.
          You'll have full access to VISION once verified.
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Resend Verification Email
            </>
          )}
        </button>

        <p className="text-sm text-[var(--text-muted)] mt-4">
          Didn't receive the email? Check your spam folder.
        </p>

        <button
          onClick={() => navigate("/login", { replace: true })}
          className="mt-4 text-sm text-[var(--text-muted)] hover:text-purple-600 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
