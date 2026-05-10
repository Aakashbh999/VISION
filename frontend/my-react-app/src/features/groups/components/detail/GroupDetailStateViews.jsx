import { Link } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Skeleton from "../../../../components/ui/Skeleton";

export const GroupDetailLoadingView = () => {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_32%),linear-gradient(180deg,var(--bg-main),var(--bg-main))] p-6 animate-pulse">
      <div className="w-full max-w-6xl space-y-5 rounded-4xl border border-(--border-main) bg-(--bg-card) p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <Skeleton
            variant="rectangular"
            width={64}
            height={64}
            className="rounded-3xl"
          />
          <div className="flex-1 space-y-3">
            <Skeleton width={240} height={30} />
            <Skeleton width={160} height={14} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
          <Skeleton
            variant="rectangular"
            height={180}
            className="rounded-3xl"
          />
          <Skeleton
            variant="rectangular"
            height={420}
            className="rounded-4xl"
          />
          <Skeleton
            variant="rectangular"
            height={420}
            className="rounded-4xl"
          />
        </div>
      </div>
    </div>
  );
};

export const GroupDetailErrorView = () => {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-(--bg-main) p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-main) bg-(--bg-card) p-8 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-100 bg-rose-50">
          <ShieldCheck className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="mt-5 text-lg font-black uppercase tracking-widest text-(--text-main)">
          Node Connection Failed
        </h2>
        <p className="mt-3 text-sm leading-6 text-(--text-muted)">
          The group workspace could not be loaded. Try reloading the page.
        </p>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="mt-6 w-full"
        >
          Re-initialize
        </Button>
      </div>
    </div>
  );
};

export const GroupDetailPrivateView = () => {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.08),transparent_30%),linear-gradient(180deg,var(--bg-main),var(--bg-main))] p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-main) bg-(--bg-card) p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-(--bg-active) rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-(--text-muted)" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-(--text-main) mb-2">
          Private Directory
        </h2>
        <p className="text-(--text-muted) text-sm mb-6 leading-relaxed">
          This sector is restricted. You need a verified invite link from the
          Admin to access these files.
        </p>
        <Link to="/groups">
          <Button variant="outline" className="w-full">
            Return to Public Sector
          </Button>
        </Link>
      </div>
    </div>
  );
};
export const GroupDetailNonMemberView = ({
  group,
  handleJoinAction,
  isJoining,
}) => {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.08),transparent_30%),linear-gradient(180deg,var(--bg-main),var(--bg-main))] p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-main) bg-(--bg-card) p-8 text-center shadow-xl">
        <div className="w-24 h-24 bg-(--bg-active) rounded-3xl flex items-center justify-center mx-auto mb-6 overflow-hidden border-2 border-(--border-main)">
          {group.group_image ? (
            <img
              src={group.group_image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-black text-(--text-muted)">
              {group.name?.charAt(0)}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-(--text-main) mb-2 uppercase tracking-tight">
          {group.name}
        </h2>
        <p className="text-(--text-muted) text-sm mb-8 leading-relaxed font-medium">
          You are not currently a member of this circle. Join now to access the
          feed, chat, and resources.
        </p>

        <div className="space-y-3">
          <Button
            variant="shiny"
            className="w-full font-black py-4 rounded-2xl"
            onClick={handleJoinAction}
            isLoading={isJoining}
          >
            {group.privacy_type === "request"
              ? "Request to Join"
              : "Initialize Connection"}
          </Button>

          <Link
            to={`/groups/${group.group_id || group.id}/profile`}
            className="block w-full"
          >
            <Button
              variant="outline"
              className="w-full py-4 rounded-2xl font-bold"
            >
              View Group Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
