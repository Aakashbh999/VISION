import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bell, BookOpen, MessageSquare, Users } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import ProgressCard from "../../components/portal/Dashboard/ProgressCard";
import XpMilestoneCard from "../../components/portal/Dashboard/XpMilestoneCard";
import PrimaryPortalTabs from "../../components/portal/Dashboard/PrimaryPortalTabs";

// Skeleton placeholder with theme-aware styling
const CardSkeleton = ({ className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 space-y-3 ${className}`}
  >
    <Skeleton variant="text" className="w-1/3 h-4" />
    <Skeleton variant="rectangular" className="h-20 rounded-xl" />
    <Skeleton variant="text" className="w-2/3 h-3" />
  </div>
);

const quickActions = [
  {
    label: "Browse Roadmaps",
    helper: "Continue your path",
    href: "/roadmaps",
    icon: BookOpen,
  },
  {
    label: "Join Discussions",
    helper: "Ask and share ideas",
    href: "/discussions",
    icon: MessageSquare,
  },
  {
    label: "Explore Clubs",
    helper: "Find your community",
    href: "/clubs",
    icon: Users,
  },
];

const Dashboard = () => {
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();
  const { data: notificationsPayload, isLoading: notifLoading } =
    useNotifications(5);
  const notifications = notificationsPayload?.data || [];
  const progressPercent = Number.parseFloat(dashboard?.progress_percent || 0);
  const progressMessage =
    progressPercent >= 75
      ? "You are in a great rhythm. Keep the streak going."
      : progressPercent >= 40
        ? "Steady progress. One more focused session will move you ahead."
        : "Small consistent steps now will accelerate your learning curve.";

  const dashboardStats = [
    {
      label: "Notifications",
      value: notifications.length,
    },
    {
      label: "Current progress",
      value: progressPercent,
      suffix: "%",
    },
  ];

  const nextStep = dashboard?.next_step || null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <PrimaryPortalTabs activeTab="dashboard" />

      {!dashLoading && !dashError && (
        <div className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40">
          <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-end">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                Learning overview
              </p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                Your Learning Dashboard
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300">
                {progressMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-4 text-center backdrop-blur"
                >
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                    {stat.suffix || ""}
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {dashLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
            <CardSkeleton className="min-h-[250px]" />
            <div className="space-y-6">
              <CardSkeleton className="min-h-[160px]" />
              <CardSkeleton className="min-h-[160px]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <CardSkeleton className="min-h-[170px]" />
        </div>
      ) : dashError ? (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-3xl text-sm font-medium">
          Failed to load dashboard data. Refresh.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-[1px] bg-gradient-to-br from-indigo-400/60 via-sky-400/50 to-purple-500/55 shadow-xl shadow-indigo-200/35 dark:shadow-indigo-900/20"
            >
              <div className="rounded-3xl h-full border border-transparent bg-white dark:bg-slate-900 p-6 sm:p-7">
                <p className="text-xs uppercase tracking-[0.28em] font-bold text-slate-500 dark:text-slate-300 mb-3">
                  Next Step
                </p>

                {nextStep ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {nextStep.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                      Continue from your roadmap and keep momentum on your
                      current learning track.
                    </p>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                        <span>Overall progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(progressPercent, 100)}%`,
                          }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500"
                        />
                      </div>
                    </div>

                    <Link
                      to={`/roadmaps/step/${nextStep.step_id}`}
                      className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 text-sm font-semibold hover:shadow-lg hover:shadow-slate-300/40 dark:hover:shadow-slate-100/20 transition-all active:scale-[0.98]"
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-6">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      You are all caught up.
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Explore a new roadmap section or revisit discussions to
                      help others.
                    </p>
                    <Link
                      to="/roadmaps"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-slate-100 hover:shadow-md transition-all"
                    >
                      Browse Roadmaps
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="space-y-6">
              <ProgressCard percent={dashboard.progress_percent} />
              <XpMilestoneCard compact />
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Link
                    to={action.href}
                    className="group block rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:scale-[1.015] hover:shadow-lg hover:shadow-indigo-200/30 dark:hover:shadow-indigo-900/20 transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-sky-500/20 text-indigo-600 dark:text-sky-300 mb-3">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                      {action.helper}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Notifications Preview
              </h3>
              <Link
                to="/notifications"
                className="text-sm font-semibold text-indigo-600 dark:text-sky-300 hover:underline"
              >
                View all
              </Link>
            </div>

            {notifLoading ? (
              <CardSkeleton className="min-h-[120px]" />
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No new notifications. You are up to date.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="rounded-xl border border-gray-200 dark:border-slate-700 p-3.5 bg-gray-50 dark:bg-slate-800/50"
                  >
                    <p className="text-sm text-gray-900 dark:text-white">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
