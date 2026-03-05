import { useState } from "react";
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const VerifyEmail = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-600 mb-2">We've sent a verification link to:</p>
        <p className="font-medium text-gray-900 mb-4">
          {user?.email || "your email address"}
        </p>
        <p className="text-gray-600 mb-6">
          Please check your inbox and click the link to verify your account.
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
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <p className="text-sm text-gray-500 mt-4">
          Didn't receive the email? Check your spam folder.
        </p>

        <button
          onClick={logout}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out and use a different account
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
