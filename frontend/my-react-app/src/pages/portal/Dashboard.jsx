import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useFeed } from "../../hooks/useFeed";
import Skeleton from "../../components/ui/Skeleton";
import ProgressCard from "../../components/portal/Dashboard/ProgressCard";
import NextStepCard from "../../components/portal/Dashboard/NextStepCard";
import QuickActionsCard from "../../components/portal/Dashboard/QuickActionsCard";
import XpMilestoneCard from "../../components/portal/Dashboard/XpMilestoneCard";
import NotificationsWidget from "../../components/portal/Dashboard/NotificationsWidget";
import ActivityFeedWidget from "../../components/portal/Dashboard/ActivityFeedWidget";

// Skeleton placeholder with theme-aware styling
const CardSkeleton = ({ className = "" }) => (
  <div
    className={`bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-4 sm:p-6 space-y-3 ${className}`}
  >
    <Skeleton variant="text" className="w-1/3 h-4" />
    <Skeleton variant="rectangular" className="h-20 rounded-xl" />
    <Skeleton variant="text" className="w-2/3 h-3" />
  </div>
);

const Dashboard = () => {
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();
  const { data: notifications, isLoading: notifLoading } = useNotifications(5);
  const { data: feed, isLoading: feedLoading } = useFeed(5);

  const dashboardStats = [
    {
      label: "Notifications",
      value: notifications?.length ?? 0,
    },
    {
      label: "Current progress",
      value: Number.parseFloat(dashboard?.progress_percent || 0),
      suffix: "%",
    },
  ];

  return (
    <div className="px-0 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {!dashLoading && !dashError && (
        <div className="rounded-sm sm:rounded-[2rem] border border-[var(--border-main)] border-x-0 sm:border-x bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-active)] p-4 sm:p-8 shadow-lg shadow-purple-500/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">
                Portal overview
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-main)]">
                Your Learning Dashboard
              </h1>
              <p className="max-w-xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                A quick snapshot of what needs attention and where to go next.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:min-w-[15rem]">
              {dashboardStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-sm sm:rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-4 text-center"
                >
                  <div className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
                    {stat.value}
                    {stat.suffix || ""}
                  </div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top row: progress, next step, quick actions + VXP milestone */}
      {dashLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : dashError ? (
        <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 border-x-0 sm:border-x text-red-600 dark:text-red-300 rounded-sm sm:rounded-2xl text-sm font-medium">
          Failed to load dashboard data. Please refresh.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ProgressCard percent={dashboard.progress_percent} />
          <NextStepCard step={dashboard.next_step} />
          <QuickActionsCard />
          <XpMilestoneCard />
        </div>
      )}

      {/* Two-column row: notifications & activity feed — independent loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notifLoading ? (
          <CardSkeleton className="h-40" />
        ) : (
          <NotificationsWidget notifications={notifications} />
        )}
        {feedLoading ? (
          <CardSkeleton className="h-40" />
        ) : (
          <ActivityFeedWidget feed={feed} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
