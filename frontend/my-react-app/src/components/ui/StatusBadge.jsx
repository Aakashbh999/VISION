
const STATUS_STYLES = {
  approved:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800",
  rejected:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800",
};

const StatusBadge = ({ status, className = "" }) => {
  const style =
    STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${style} ${className}`}
    >
      {status || "pending"}
    </span>
  );
};

export default StatusBadge;
