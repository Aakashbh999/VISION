import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Send, RefreshCw, CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { forgotPasswordSchema } from "../validation/registerSchema";
import { forgotPassword as apiForgotPassword } from "../services/auth";

const ForgotPassword = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiForgotPassword(email);
      setSuccess(response.message || "A reset link has been sent to your email.");
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
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
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-purple-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
          </Link>

          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">
              Forgot Password?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Enter your email address and we'll send you a link to reset your password.
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

          {success && (
            <div className="mb-6 text-center animate-fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Check your inbox</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                {success}
              </p>
              
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  variant="outline"
                  size="sm"
                  isLoading={loading}
                  disabled={loading || cooldown > 0}
                  className="w-full justify-center"
                >
                  <RefreshCw className="h-4 w-4" />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Reset Link"}
                </Button>
                
                <button
                  onClick={() => {
                    setSuccess("");
                    setError("");
                  }}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Try another email address
                </button>
              </div>
            </div>
          )}

          {!success && (
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
                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-[var(--border-main)]'} bg-[var(--bg-main)] py-3 pl-10 pr-4 text-[var(--text-main)] outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="shiny"
                size="lg"
                className="w-full justify-center"
                isLoading={loading}
              >
                <Send className="h-5 w-5" />
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Wait, I remember it now!{" "}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
