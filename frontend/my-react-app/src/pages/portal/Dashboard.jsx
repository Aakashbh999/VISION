import { useDashboard } from "../../hooks/useDashboard";
import { useNotifications } from "../../hooks/useNotifications";
import { useFeed } from "../../hooks/useFeed";
import Skeleton from "../../components/ui/Skeleton";
import ProgressCard from "../../components/portal/Dashboard/ProgressCard";
import NextStepCard from "../../components/portal/Dashboard/NextStepCard";
import QuickActionsCard from "../../components/portal/Dashboard/QuickActionsCard";
import XpMilestoneCard from "../../components/portal/Dashboard/XpMilestoneCard";
import RecommendationList from "../../components/portal/Dashboard/RecommendationList";
import TrendingDiscussions from "../../components/portal/Dashboard/TrendingDiscussions";
import ActiveClubs from "../../components/portal/Dashboard/ActiveClubs";
import NotificationsWidget from "../../components/portal/Dashboard/NotificationsWidget";
import ActivityFeedWidget from "../../components/portal/Dashboard/ActivityFeedWidget";

// Skeleton placeholder for a card-shaped widget
const CardSkeleton = ({ className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 p-6 space-y-3 ${className}`}>
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Your Learning Dashboard
      </h1>

      {/* Top row: progress, next step, quick actions + VXP milestone */}
      {dashLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : dashError ? (
        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
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

      {/* Recommendations */}
      {dashLoading ? (
        <CardSkeleton className="h-36" />
      ) : (
        !dashError && <RecommendationList recommendations={dashboard?.recommendations} />
      )}

      {/* Two-column row: trending discussions & active clubs */}
      {dashLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton className="h-48" />
          <CardSkeleton className="h-48" />
        </div>
      ) : (
        !dashError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendingDiscussions discussions={dashboard?.trending_discussions} />
            <div className="space-y-6">
              <ActiveClubs clubs={dashboard?.active_clubs} />
              {dashboard?.degree_feed?.length > 0 && (
                <TrendingDiscussions discussions={dashboard.degree_feed} title="Recommended for You" />
              )}
            </div>
          </div>
        )
      )}

      {/* Two-column row: notifications & activity feed — independent loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {notifLoading ? <CardSkeleton className="h-40" /> : <NotificationsWidget notifications={notifications} />}
        {feedLoading ? <CardSkeleton className="h-40" /> : <ActivityFeedWidget feed={feed} />}
      </div>
    </div>
  );
};

export default Dashboard;
