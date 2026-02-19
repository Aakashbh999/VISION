import { Bell, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../../../services/notifications";

const NotificationsWidget = ({ notifications }) => {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  if (!notifications?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </h3>
        <p className="text-gray-600">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4" /> Latest Notifications
      </h3>
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.notification_id}
            className={`p-3 rounded-xl flex items-start justify-between gap-2 ${
              notif.is_read ? "bg-gray-50" : "bg-blue-50"
            }`}
          >
            <div className="flex-1">
              <p className="text-sm text-gray-800">{notif.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(notif.created_at).toLocaleDateString()}
              </span>
            </div>
            {!notif.is_read && (
              <button
                onClick={() => markReadMutation.mutate(notif.notification_id)}
                className="text-blue-600 hover:text-blue-800"
                title="Mark as read"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <Link
        to="/portal/notifications"
        className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-4"
      >
        View all notifications
      </Link>
    </div>
  );
};

export default NotificationsWidget;
