import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../services/auth";
import { Mail, Lock, LogIn } from "lucide-react";
import Button from "../components/ui/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await apiLogin(email, password);
      const currentUser = await login(token);

      if (currentUser?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (currentUser?.email_status !== "verified") {
        navigate("/verify-email", { replace: true });
      } else if (currentUser?.student_status !== "approved") {
        navigate("/pending-approval", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
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
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">
              Secure access
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--text-main)]">Log In</h2>
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
            onSubmit={handleSubmit}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-main)] bg-[var(--bg-main)] py-3 pl-10 pr-4 text-[var(--text-main)] outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  placeholder="••••••••"
                />
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
              <LogIn className="h-5 w-5" />Log In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
            >Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
