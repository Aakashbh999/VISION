import { Star } from "lucide-react";

const ProfileStatsSidebar = ({ profile, isOwner }) => {
  const current_level = profile?.current_level || 1;
  const total_xp = profile?.total_xp || 0;

  // Level Formula Calculation
  const currentLevelXP = Math.pow(current_level - 1, 2) * 100;
  const nextLevelXP = Math.pow(current_level, 2) * 100;
  const xpInCurrentLevel = Math.max(0, total_xp - currentLevelXP);
  const totalXPForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(
    (xpInCurrentLevel / totalXPForNextLevel) * 100,
    100
  );

  return (
    <div className="space-y-12">
      {/* VISIONXP Card */}
      <div className="bg-[var(--bg-card)] bg-opacity-80 backdrop-blur-2xl rounded-3xl shadow-sm border border-[var(--border-main)] relative overflow-hidden group transition-all hover:shadow-md">
        
        {/* Subtle Purple Glass Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10 pointer-events-none"></div>

        {/* Neon Glow Effects (Subtle and blend in both modes) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 dark:bg-purple-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-400/20 dark:group-hover:bg-purple-400/30 transition-all duration-700 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-indigo-400/20 dark:group-hover:bg-indigo-400/30 transition-all duration-700 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] flex items-center gap-3 text-[var(--text-main)]">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 backdrop-blur-sm flex items-center justify-center border border-purple-500/20 dark:border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
              </div>
              VisionXP
            </h3>
            {isOwner && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20 dark:border-lime-400/40 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(132,204,22,0.1)]">
                Active
              </span>
            )}
          </div>

          <div className="text-center mb-10">
            <div className="relative inline-block">
              <p className="text-5xl sm:text-7xl font-black tracking-tighter mb-1 text-[var(--text-main)] drop-shadow-sm">
                {total_xp}
              </p>
              <div className="absolute -right-5 -top-1">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] mt-2">
              Total Experience Points
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-active)]/50 backdrop-blur-md rounded-2xl p-5 text-center border border-[var(--border-main)] hover:bg-[var(--bg-active)] transition-all shadow-sm">
              <p className="text-3xl font-black text-[var(--text-main)]">
                {current_level}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-2">
                Member Level
              </p>
            </div>
            <div className="bg-[var(--bg-active)]/50 backdrop-blur-md rounded-2xl p-5 text-center border border-[var(--border-main)] hover:bg-[var(--bg-active)] transition-all shadow-sm">
              <p className="text-3xl font-black text-[var(--text-main)]">
                {profile?.reputation_points || 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-2">
                Reputation
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Level Progress
              </span>
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-active)] rounded-full overflow-hidden border border-[var(--border-main)] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatsSidebar;
