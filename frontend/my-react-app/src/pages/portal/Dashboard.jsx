import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useFeed } from "../../hooks/useFeed";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ProgressCard from "../../components/portal/Dashboard/ProgressCard";
import NextStepCard from "../../components/portal/Dashboard/NextStepCard";
import QuickActionsCard from "../../components/portal/Dashboard/QuickActionsCard";
import RecommendationList from "../../components/portal/Dashboard/RecommendationList";
import TrendingDiscussions from "../../components/portal/Dashboard/TrendingDiscussions";
import ActiveClubs from "../../components/portal/Dashboard/ActiveClubs";
import NotificationsWidget from "../../components/portal/Dashboard/NotificationsWidget";
import ActivityFeedWidget from "../../components/portal/Dashboard/ActivityFeedWidget";

const Dashboard = () => {
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useDashboard();
  const { data: notifications, isLoading: notifLoading } = useNotifications(5);
  const { data: feed, isLoading: feedLoading } = useFeed(5);

  if (dashLoading || notifLoading || feedLoading) return <LoadingSpinner />;
  if (dashError)
    return <div className="p-8 text-red-500">Failed to load dashboard</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Your Learning Dashboard
      </h1>

      {/* Top row: progress, next step, quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressCard percent={dashboard.progress_percent} />
        <NextStepCard step={dashboard.next_step} />
        <QuickActionsCard />
      </div>

      {/* Recommendations */}
      <RecommendationList recommendations={dashboard.recommendations} />

      {/* Two-column row: trending discussions & active clubs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingDiscussions discussions={dashboard.trending_discussions} />
        <div className="space-y-6">
          <ActiveClubs clubs={dashboard.active_clubs} />
          {dashboard.degree_feed && dashboard.degree_feed.length > 0 && (
             <TrendingDiscussions discussions={dashboard.degree_feed} title="Recommended for You" />
          )}
        </div>
      </div>

      {/* Two-column row: notifications & activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationsWidget notifications={notifications} />
        <ActivityFeedWidget feed={feed} />
      </div>
    </div>
  );
};

export default Dashboard;
