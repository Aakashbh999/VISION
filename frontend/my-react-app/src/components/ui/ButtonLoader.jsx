import { Loader2 } from "lucide-react";

/**
 * Inline loading spinner for buttons and small actions
 * Usage: <ButtonLoader /> or <ButtonLoader size={16} />
 */
const ButtonLoader = ({ size = 16, className = "" }) => {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

/**
 * Action button wrapper that handles loading state
 * Shows loader when loading, children otherwise
 */
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

/**
 * Like button with loading state
 */
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
        className={`hover:bg-gray-200 p-1 rounded transition-all ${
          isLoading ? "opacity-50 cursor-wait" : ""
        } ${isLiked ? "text-orange-600" : "text-gray-500"}`}
      >
        {isLoading ? (
          <ButtonLoader size={24} />
        ) : (
          <svg
            className={`w-6 h-6 ${isLiked ? "fill-orange-600" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        )}
      </button>
      <span className="text-xs font-bold">{count}</span>
    </div>
  );
};

/**
 * Save/Bookmark button with loading state
 */
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
      className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded text-xs font-bold transition-all ${
        isLoading ? "opacity-50 cursor-wait" : ""
      } ${isSaved ? "text-yellow-600" : "text-gray-500"} ${className}`}
    >
      {isLoading ? (
        <ButtonLoader size={16} />
      ) : (
        <svg
          className={`w-4 h-4 ${isSaved ? "fill-yellow-500 text-yellow-500" : ""}`}
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

/**
 * Comment submit button with loading state
 */
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
      className={`px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
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
