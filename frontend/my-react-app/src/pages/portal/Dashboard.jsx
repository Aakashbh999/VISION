import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useUserStats } from "../../hooks/useUserStats";
import { Link } from "react-router-dom";

import {
  Bell,
  BookOpen,
  MessageSquare,
  Users,
  Flame,
  TrendingUp,
  Zap,
} from "lucide-react";

import Skeleton from "../../components/ui/Skeleton";
import SurfaceCard, {
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import PrimaryPortalTabs from "../../components/portal/Dashboard/PrimaryPortalTabs";
import VXPActivityGraph from "../../components/portal/Dashboard/VXPActivityGraph";
import RecommendationList from "../../components/portal/Dashboard/RecommendationList";
import StatCard from "../../components/portal/Dashboard/StatCard";
import XpMilestoneCard from "../../components/portal/Dashboard/XpMilestoneCard";

const CardSkeleton = ({ className = "" }) => (
  <SurfaceCard className={`space-y-3 ${className}`} radius="lg" padding="md">
    <Skeleton variant="text" className="w-1/3 h-4" />
    <Skeleton variant="rectangular" className="h-16 rounded-xl" />
    <Skeleton variant="text" className="w-2/3 h-3" />
  </SurfaceCard>
);

// ─── Quick Actions ───────────────────────────────────────────
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

// ─── Main Dashboard ──────────────────────────────────────────
const Dashboard = () => {
  const { data: dashboard, isLoading: dashLoading, error } = useDashboard();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: notifPayload, isLoading: notifLoading } = useNotifications(5);

  const notifications = notifPayload?.data || [];

  const statCards = [
    {
      label: "Total VXP",
      value: statsLoading ? null : (stats?.total_xp ?? 0).toLocaleString(),
      icon: Zap,
      color:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
      sub: "Experience Points",
    },
    {
      label: "Level",
      value: statsLoading ? null : `Lvl ${stats?.current_level ?? 1}`,
      icon: TrendingUp,
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
      sub: "Current rank",
    },
    {
      label: "Day Streak",
      value: statsLoading ? null : `${stats?.current_streak ?? 0}d`,
      icon: Flame,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",
      sub: "Keep it going!",
    },
    {
      label: "Discussions",
      value: dashLoading ? null : (dashboard?.discussion_count ?? 0),
      icon: MessageSquare,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      sub: "Posts created",
    },
  ];

  return (
    <div className="space-y-6 bg-[var(--bg-main)] text-[var(--text-main)]">
      <PrimaryPortalTabs activeTab="dashboard" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) =>
          stat.value === null ? (
            <CardSkeleton key={i} />
          ) : (
            <StatCard key={i} {...stat} />
          ),
        )}
      </div>

      {/* Graph + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VXPActivityGraph
            activityData={dashboard?.vxp_activity || []}
            isLoading={dashLoading}
          />
        </div>

        <div>
          {dashLoading ? (
            <CardSkeleton className="h-full min-h-52" />
          ) : (
            <RecommendationList
              recommendations={dashboard?.recommendations}
              progressPercent={dashboard?.progress_percent}
            />
          )}
        </div>
      </div>

      {/* Row 3: Left stack (Milestones + Quick Actions) + Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SurfaceCard>
            <CardHeader className="mb-3">
              <CardTitle className="text-(--text-muted)">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-(--border-main) bg-(--bg-active) hover:border-purple-300 hover:bg-(--bg-card) transition"
                >
                  <action.icon className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-bold text-(--text-main)">
                      {action.label}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {action.helper}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </SurfaceCard>

          <div className="hidden md:block max">
            <SurfaceCard>
              <CardHeader className="mb-3">
                <CardTitle className="flex items-center gap-2 text-(--text-muted)">
                  <Bell className="w-4 h-4 text-violet-500" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {notifLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 rounded-xl" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="All Caught Up"
                    description="No new notifications right now."
                    className="py-8"
                  />
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.notification_id}
                      className="p-3 rounded-2xl border border-(--border-main) bg-(--bg-active)"
                    >
                      <p className="text-xs font-medium line-clamp-2 text-(--text-main)">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-(--text-muted) mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </CardBody>
            </SurfaceCard>
          </div>
        </div>
        <XpMilestoneCard />
      </div>

      {error && (
        <ErrorState
          title="Dashboard sync failed"
          description="We could not load dashboard data. Please retry."
          onRetry={() => window.location.reload()}
          className="rounded-3xl"
        />
      )}
    </div>
  );
};

export default Dashboard;
