import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../services/auth";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import { loginSchema } from "../validation/registerSchema";
import { getUserLandingPath } from "../utils/authRedirect";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, control } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginEmail = useWatch({ control, name: "email" })?.trim() || "";

  const onSubmit = async ({ email, password }) => {
    setError("");
    setLoading(true);

    try {
      const tokenData = await apiLogin(email, password);
      const currentUser = await login(tokenData);
      const nextPath = getUserLandingPath(currentUser) || "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-md">
        <div className="w-full rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-6 shadow-xl shadow-black/5 sm:p-8">
          <div className="mb-6">
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--text-main)]">
              Log In
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Use your registered email to continue.
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
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-main)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] py-3 pl-10 pr-4 text-[var(--text-main)] outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-main)]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] py-3 pl-10 pr-12 text-[var(--text-main)] outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
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
              <div className="mt-2 flex justify-end">
                <Link
                  to={
                    loginEmail
                      ? `/forgot-password?email=${encodeURIComponent(loginEmail)}`
                      : "/forgot-password"
                  }
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="shiny"
              size="lg"
              className="w-full justify-center"
              isLoading={loading}
              disabled={loading}
            >
              <LogIn className="h-5 w-5" />
              Log In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
