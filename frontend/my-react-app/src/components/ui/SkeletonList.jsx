import Skeleton from "./Skeleton";

const SkeletonList = ({ count = 5, variant = "discussion" }) => {
  if (variant === "discussion") {
    return (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)]"
          >
            <Skeleton variant="circular" width="36px" height="36px" />
            <div className="flex-1 space-y-2 w-full">
              <Skeleton width="50%" height="12px" />
              <Skeleton height="10px" />
              <Skeleton width="80%" height="10px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "group") {
    return (
      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)]"
          >
            <Skeleton variant="circular" width="48px" height="48px" />
            <div className="flex-1 space-y-2 w-full">
              <Skeleton width="60%" height="13px" />
              <Skeleton width="75%" height="11px" />
            </div>
            <Skeleton width="80px" height="32px" className="rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton
          key={idx}
          height="12px"
          width={idx % 3 === 0 ? "80%" : "100%"}
        />
      ))}
    </div>
  );
};

export default SkeletonList;
