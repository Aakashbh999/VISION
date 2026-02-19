import { useNotifications } from "../../hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "../../services/notifications";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { CheckCircle } from "lucide-react";

const Notifications = () => {
  const { data: notifications, isLoading, error } = useNotifications(50); // fetch up to 50
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["unreadCount"]);
    },
  });

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load notifications</div>;

  const unread = notifications?.filter((n) => !n.is_read) || [];
  const read = notifications?.filter((n) => n.is_read) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      {notifications?.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <>
          {/* Unread section */}
          {unread.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Unread ({unread.length})
              </h2>
              <div className="space-y-3">
                {unread.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-gray-800">{notif.message}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMarkRead(notif.notification_id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read section */}
          {read.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Read
              </h2>
              <div className="space-y-2">
                {read.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="bg-gray-50 rounded-xl p-4 text-gray-600"
                  >
                    <p>{notif.message}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
