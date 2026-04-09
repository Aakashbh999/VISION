import { Award, Star } from "lucide-react";

const ProfileStatsSidebar = ({ profile, isOwner }) => {
  return (
    <div className="space-y-12">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950 rounded-3xl shadow-2xl p-1.5 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-500/30 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[1.4rem] p-8 relative z-10 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 text-purple-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 backdrop-blur-sm flex items-center justify-center border border-purple-500/30">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </div>
              VisionXP
            </h3>
            {isOwner && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          <div className="text-center mb-10">
            <div className="relative inline-block">
              <p className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-1 bg-gradient-to-b from-white to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                {profile.total_xp || 0}
              </p>
              <div className="absolute -right-6 -top-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              </div>
            </div>
            <p className="text-xs text-purple-300/60 font-black uppercase tracking-[0.2em] mt-2">
              Total Experience Points
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/5 hover:bg-white/10 transition-all">
              <p className="text-2xl sm:text-3xl font-black text-white">
                {profile.current_level || 1}
              </p>
              <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black mt-2">
                Member Level
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/5 hover:bg-white/10 transition-all">
              <div className="flex justify-center mb-2">
                <Award className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {profile.reputation_points || 0}
              </p>
              <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black mt-2">
                Reputation
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                Level Progress
              </span>
              <span className="text-[10px] font-black text-white">75%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[75%]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[var(--bg-card)] to-amber-50/40 dark:to-amber-900/10 rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-8 transition-all hover:shadow-md">
        <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          Achievements & Badges
        </h3>
        {profile.badges && profile.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.badges.map((badge, index) => (
              <div
                key={index}
                className="group flex flex-col items-center bg-[var(--bg-active)] border border-[var(--border-main)] rounded-sm sm:rounded-2xl p-4 text-center transition-all hover:bg-[var(--bg-card)] hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-200"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-xs font-black text-[var(--text-main)] leading-tight uppercase tracking-wider">
                  {badge.badge_name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/50 dark:bg-black/20 rounded-sm sm:rounded-[2rem] border-2 border-dashed border-amber-200/50 dark:border-amber-900/50">
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-main)]">
              <Award className="w-8 h-8 text-amber-400/60" />
            </div>
            <p className="text-sm font-bold text-[var(--text-muted)] px-4">
              Start earning badges to showcase your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileStatsSidebar;
