import { useNotifications } from "../../hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationRead,
  deleteNotification,
  clearNotifications,
} from "../../services/notifications";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { CalendarClock, Trash2 } from "lucide-react";
import { resolveNotificationPath } from "../../utils/notificationRouting";
import { useNavigate } from "react-router-dom";
import NotificationItem from "../../components/notifications/NotificationItem";
import { acceptInvitation, rejectInvitation } from "../../services/group";
import { showToast } from "../../utils/toast";

const Notifications = () => {
  const navigate = useNavigate();
  const { data: notificationsPayload, isLoading, error } = useNotifications({
    limit: 100,
    sinceDays: 7,
  });
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
  };

  const markReadMutation = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deleteNotification, onSuccess: invalidate });
  const clearAllMutation = useMutation({ mutationFn: clearNotifications, onSuccess: invalidate });

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (data) => {
      showToast.success(data.message || "Invitation accepted");
      invalidate();
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to accept invitation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: (data) => {
      showToast.success(data.message || "Invitation declined");
      invalidate();
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to decline invitation");
    },
  });

  const handleNotificationNavigate = async (notification) => {
    const destination = resolveNotificationPath(notification);
    if (!notification.is_read) {
      try {
        await markReadMutation.mutateAsync(notification.notification_id);
      } catch {  }
    }
    if (destination) navigate(destination);
  };

  const notifications = notificationsPayload?.data || [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const groups = { today: [], yesterday: [], earlier: [] };
  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    if (d >= todayStart) groups.today.push(n);
    else if (d >= yesterdayStart) groups.yesterday.push(n);
    else groups.earlier.push(n);
  });

  const sections = [
    { key: "today", title: "Today", items: groups.today },
    { key: "yesterday", title: "Yesterday", items: groups.yesterday },
    { key: "earlier", title: "Earlier (last 7 days)", items: groups.earlier },
  ].filter((s) => s.items.length > 0);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load notifications</div>;

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
            Notification History
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Your last 7 days of activity.
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => clearAllMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {}
      {sections.length === 0 ? (
        <p className="text-[var(--text-muted)]">No notifications yet.</p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.key}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <CalendarClock className="w-4 h-4" />
                {section.title}
              </h2>
              <div className="space-y-2.5">
                {section.items.map((notif) => (
                  <NotificationItem
                    key={notif.notification_id}
                    notification={notif}
                    onMarkRead={(id) => markReadMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onNavigate={handleNotificationNavigate}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onReject={(id) => rejectMutation.mutate(id)}
                    isProcessing={acceptMutation.isPending || rejectMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
