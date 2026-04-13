import Skeleton from "./Skeleton";

/**
 * Skeleton Card Loader
 * Mimics the layout of a discussion/group card while loading
 */
const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-5 sm:p-6 space-y-4"
          aria-hidden="true"
        >
          {/* Header section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton variant="circular" width="40px" height="40px" />
              <div className="flex-1 space-y-2">
                <Skeleton width="40%" height="12px" />
                <Skeleton width="60%" height="10px" />
              </div>
            </div>
            <Skeleton width="24px" height="24px" variant="circular" />
          </div>

          {/* Title/Content */}
          <div className="space-y-2">
            <Skeleton height="14px" />
            <Skeleton height="14px" width="85%" />
          </div>

          {/* Footer */}
          <div className="flex gap-4 items-center">
            <Skeleton width="60px" height="10px" />
            <Skeleton width="60px" height="10px" />
            <div className="ml-auto">
              <Skeleton width="40px" height="10px" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
