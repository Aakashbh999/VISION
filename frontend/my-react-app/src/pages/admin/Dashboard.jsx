import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
    <div
      className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center text-${color}-600`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load stats</div>;

  const stats = data || {};

  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Approved Students"
          value={stats.approved || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected || 0}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Suspended"
          value={stats.suspended || 0}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Open Reports"
          value={stats.reports_open || 0}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* You can add more widgets like recent reports, pending students list here */}
    </div>
  );
};

export default Dashboard;
