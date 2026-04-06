import { Link } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Skeleton from "../../../../components/ui/Skeleton";

export const GroupDetailLoadingView = () => {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[var(--bg-main)]/50 p-6 space-y-8 animate-pulse">
      <div className="flex items-center gap-6">
        <Skeleton
          variant="rectangular"
          width={48}
          height={48}
          className="rounded-2xl"
        />
        <div className="space-y-2">
          <Skeleton width={200} height={24} />
          <Skeleton width={100} height={12} />
        </div>
      </div>
    </div>
  );
};

export const GroupDetailErrorView = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-black uppercase tracking-widest gap-4">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
        <ShieldCheck className="w-10 h-10 text-rose-500" />
      </div>
      Node Connection Failed
      <Button variant="secondary" onClick={() => window.location.reload()}>
        Re-initialize
      </Button>
    </div>
  );
};

export const GroupDetailPrivateView = () => {
  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--bg-main)]">
      <div className="max-w-md w-full p-8 bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] shadow-xl text-center">
        <div className="w-20 h-20 bg-[var(--bg-active)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
          Private Directory
        </h2>
        <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
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
