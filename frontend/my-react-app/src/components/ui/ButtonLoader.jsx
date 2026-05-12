import { Loader2 } from "lucide-react";

const ButtonLoader = ({ size = 16, className = "" }) => {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export const ActionButton = ({
  onClick,
  isLoading = false,
  disabled = false,
  className = "",
  loadingClassName = "",
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${className} ${isLoading ? "opacity-70 cursor-wait" : ""}`}
    >
      {isLoading ? <ButtonLoader className={loadingClassName} /> : children}
    </button>
  );
};

export const LikeButton = ({
  isLiked,
  isLoading,
  onClick,
  count,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`hover:bg-[var(--bg-active)] p-1 rounded transition-all ${
          isLoading ? "opacity-50 cursor-wait" : ""
        } ${isLiked ? "text-purple-600" : "text-[var(--text-muted)]"}`}
      >
        {isLoading ? (
          <ButtonLoader size={24} />
        ) : (
          <svg
            className={`w-6 h-6 ${isLiked ? "fill-purple-600" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        )}
      </button>
      <span className="text-xs font-bold text-[var(--text-muted)]">{count}</span>
    </div>
  );
};

export const SaveButton = ({
  isSaved,
  isLoading,
  onClick,
  showLabel = true,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-[var(--bg-active)] rounded text-xs font-bold transition-all ${
        isLoading ? "opacity-50 cursor-wait" : ""
      } ${isSaved ? "text-purple-600" : "text-[var(--text-muted)]"} ${className}`}
    >
      {isLoading ? (
        <ButtonLoader size={16} />
      ) : (
        <svg
          className={`w-4 h-4 ${isSaved ? "fill-purple-500 text-purple-500" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {showLabel && (isSaved ? "Saved" : "Save")}
    </button>
  );
};

export const CommentButton = ({
  isLoading,
  onClick,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <ButtonLoader size={14} className="text-white" />
          Posting...
        </>
      ) : (
        "Comment"
      )}
    </button>
  );
};

export default ButtonLoader;