import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useUserStats } from "../../hooks/useUserStats";
import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  MessageSquare,
  Users,
  Zap,
  Flame,
  TrendingUp,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import PrimaryPortalTabs from "../../components/portal/Dashboard/PrimaryPortalTabs";
import VXPActivityGraph from "../../components/portal/Dashboard/VXPActivityGraph";
import RecommendationList from "../../components/portal/Dashboard/RecommendationList";
import ActivityFeedWidget from "../../components/portal/Dashboard/ActivityFeedWidget";
import XpMilestoneCard from "../../components/portal/Dashboard/XpMilestoneCard";

// ─── Skeleton card ──────────────────────────────────────────────────────────
const CardSkeleton = ({ className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-3 ${className}`}
  >
    <Skeleton variant="text" className="w-1/3 h-4" />
    <Skeleton variant="rectangular" className="h-16 rounded-xl" />
    <Skeleton variant="text" className="w-2/3 h-3" />
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color, sub }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
    <div
      className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 ${color}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
    </div>
    <div className="min-w-0">
      <div className="text-xl font-black text-gray-900 dark:text-white truncate">
        {value ?? "—"}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 truncate">
        {label}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ─── Quick actions ────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();

  const { data: statsRaw, isLoading: statsLoading } = useUserStats();

  const { data: notificationsPayload, isLoading: notifLoading } =
    useNotifications(5);

  const notifications = notificationsPayload?.data || [];
  const progressPercent = Number.parseFloat(dashboard?.progress_percent || 0);

  // ── Stat card values ────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total VXP",
      value: statsLoading
        ? null
        : (statsRaw?.total_xp ?? 0).toLocaleString(),
      icon: Zap,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
      sub: "Experience Points",
    },
    {
      label: "Level",
      value: statsLoading ? null : `Lvl ${statsRaw?.current_level ?? 1}`,
      icon: TrendingUp,
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
      sub: "Current rank",
    },
    {
      label: "Day Streak",
      value: statsLoading
        ? null
        : `${statsRaw?.current_streak ?? 0}d`,
      icon: Flame,
      color:
        (statsRaw?.current_streak ?? 0) >= 7
          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      sub:
        (statsRaw?.current_streak ?? 0) >= 7
          ? "🔥 Streak bonus active!"
          : "7 days = +10 XP bonus",
    },
    {
      label: "Discussions",
      value: dashLoading ? null : (dashboard?.discussion_count ?? 0),
      icon: MessageSquare,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
      sub: "Posts created",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <PrimaryPortalTabs activeTab="dashboard" />

      {/* ── Row 1 — Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) =>
          stat.value === null ? (
            <CardSkeleton key={idx} />
          ) : (
            <StatCard key={idx} {...stat} />
          ),
        )}
      </div>

      {/* ── Row 2 — VXP Graph + Recommendations ────────────────────────────── */}
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

      {/* ── Row 3 — Activity Feed · XP Milestones · Notifications ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Activity feed from degree discussions */}
        <div>
          {dashLoading ? (
            <CardSkeleton className="min-h-64" />
          ) : (
            <ActivityFeedWidget
              feed={
                dashboard?.degree_feed?.map((d, i) => ({
                  activity_id: d.discussion_id ?? i,
                  action_type: "discussion_created",
                  actor_name: d.author_name,
                  entity_title: d.title,
                  reference_id: d.discussion_id,
                  created_at: d.created_at,
                  metadata: {},
                })) || []
              }
            />
          )}
        </div>

        {/* XP Milestone Card */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <XpMilestoneCard compact />
        </div>

        {/* Notifications Preview */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-500" />
              Notifications
            </h3>
            <Link
              to="/notifications"
              className="text-xs font-semibold text-violet-600 dark:text-sky-300 hover:underline shrink-0"
            >
              View all
            </Link>
          </div>

          {notifLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" className="h-12 rounded-xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
              You're all caught up 🎉
            </p>
          ) : (
            <div className="space-y-2 flex-1">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.notification_id}
                  className="rounded-xl border border-gray-100 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-800/50"
                >
                  <p className="text-xs font-medium text-gray-800 dark:text-white line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4 — Quick Actions ─────────────────────────────────────────── */}
      {!dashLoading && !dashError && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 hover:scale-[1.01] hover:shadow-md hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all"
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shrink-0">
                  <action.icon className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">
                    {action.label}
                  </span>
                  <span className="block text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                    {action.helper}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dashError && (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-sm font-medium">
          Failed to load dashboard data. Please refresh.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
