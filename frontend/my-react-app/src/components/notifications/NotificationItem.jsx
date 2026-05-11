import { CheckCircle2, Trash2 } from "lucide-react";
import { formatNotificationMessage } from "../../utils/notificationRouting";

const NotificationItem = ({
  notification: notif,
  onMarkRead,
  onDelete,
  onNavigate,
  onAccept,
  onReject,
  isProcessing = false,
}) => (
  <div
    className={`rounded-xl border p-4 flex flex-col gap-3 cursor-pointer transition-colors duration-150 hover:shadow-sm ${
      notif.is_read
        ? "bg-[var(--bg-active)] border-[var(--border-main)] hover:bg-[var(--bg-main)]"
        : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100/70 dark:hover:bg-purple-900/30"
    }`}
    role="button"
    tabIndex={0}
    onClick={() => onNavigate(notif)}
  >
    <div className="flex items-start justify-between gap-4">
      {}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text-main)] text-sm sm:text-base">
          {formatNotificationMessage(notif)}
        </p>
        <span className="text-xs text-[var(--text-muted)]">
          {new Date(notif.created_at).toLocaleString()}
        </span>
      </div>

      {}
      <div className="flex items-center gap-1.5">
        {!notif.is_read && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(notif.notification_id);
            }}
            className="text-purple-600 hover:text-purple-700 p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40"
            title="Mark as read"
          >
            <CheckCircle2 className="w-4.5 h-4.5 pointer-events-none" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notif.notification_id);
          }}
          className="text-[var(--text-muted)] hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
          title="Delete notification"
        >
          <Trash2 className="w-4.5 h-4.5 pointer-events-none" />
        </button>
      </div>
    </div>

    {notif.type === "group_invite" && (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAccept?.(notif.related_id);
          }}
          disabled={isProcessing}
          className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 shadow-sm"
        >
          Accept Invitation
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onReject?.(notif.related_id);
          }}
          disabled={isProcessing}
          className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-active)] disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate(notif);
          }}
          className="ml-auto text-xs font-bold text-purple-600 hover:underline"
        >
          View Profile
        </button>
      </div>
    )}
  </div>
);

export default NotificationItem;
