import { CheckCircle2, Trash2 } from "lucide-react";
import { formatNotificationMessage } from "../../utils/notificationRouting";

/**
 * NotificationItem — a single notification row.
 *
 * Props:
 *  notification  – notification object
 *  onMarkRead    – fn(id) to mark as read
 *  onDelete      – fn(id) to delete
 *  onNavigate    – fn(notification) to navigate on click
 */
const NotificationItem = ({ notification: notif, onMarkRead, onDelete, onNavigate }) => (
  <div
    className={`rounded-xl border p-4 flex items-start justify-between gap-4 cursor-pointer transition-all duration-150 hover:shadow-sm ${
      notif.is_read
        ? "bg-[var(--bg-active)] border-[var(--border-main)] hover:bg-[var(--bg-main)]"
        : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100/70 dark:hover:bg-purple-900/30"
    }`}
    role="button"
    tabIndex={0}
    onClick={() => onNavigate(notif)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNavigate(notif);
      }
    }}
  >
    {/* Message + timestamp */}
    <div className="flex-1 min-w-0">
      <p className="text-[var(--text-main)]">
        {formatNotificationMessage(notif)}
      </p>
      <span className="text-xs text-[var(--text-muted)]">
        {new Date(notif.created_at).toLocaleString()}
      </span>
    </div>

    {/* Action buttons */}
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
          <CheckCircle2 className="w-4.5 h-4.5" />
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
        <Trash2 className="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
);

export default NotificationItem;
