import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Save, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { resetPasswordSchema } from "../validation/registerSchema";
import { resetPassword as apiResetPassword } from "../services/auth";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
    },
  });

  // Since the token comes from URL, we need to manually update the form if it wasn't there at first render
  useEffect(() => {
    if (token) {
      register("token").onChange({ target: { value: token, name: "token" } });
    }
  }, [token, register]);

  const onSubmit = async ({ newPassword }) => {
    if (!token) return;
    setError("");
    setLoading(true);

    try {
      await apiResetPassword(token, newPassword);
      setSuccess(true);
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative isolate px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-md">
          <div className="w-full rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-12 shadow-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-main)]">Password Reset!</h2>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Your password has been successfully updated. Redirecting you to the login page...
            </p>
            <Link to="/login" className="mt-8 block text-sm font-bold text-purple-600 hover:text-purple-700">
              Go to Login now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-md">
        <div className="w-full rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 shadow-xl shadow-black/5 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">
              Reset Password
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Please enter your new password below.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            aria-busy={loading}
          >
            {/* Hidden field for token as it's required by the schema */}
            <input type="hidden" {...register("token")} />

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-main)]">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  {...register("newPassword")}
                  className={`w-full rounded-xl border ${errors.newPassword ? 'border-red-500' : 'border-[var(--border-main)]'} bg-[var(--bg-main)] py-3 pl-10 pr-12 text-[var(--text-main)] outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-purple-500 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="shiny"
              size="lg"
              className="w-full justify-center"
              isLoading={loading}
              disabled={loading || !token}
            >
              <Save className="h-5 w-5" />
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
