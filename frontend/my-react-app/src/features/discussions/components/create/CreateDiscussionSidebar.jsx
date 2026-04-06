import { Plus } from "lucide-react";

const ShieldCheck = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CreateDiscussionSidebar = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-purple-800 px-6 py-4">
          <h3 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-300" /> Posting to
            VISION
          </h3>
        </div>
        <div className="p-6 space-y-4 bg-[var(--bg-active)]/50">
          {[
            {
              title: "Collaborative Spirit",
              desc: "Be respectful to your fellow CS/IT students.",
            },
            {
              title: "Check Duplicates",
              desc: "Look for similar questions before asking again.",
            },
            {
              title: "Quality Context",
              desc: "Use clear titles and detailed descriptions.",
            },
            {
              title: "Visual Advantage",
              desc: "Images make your technical questions clearer.",
            },
          ].map((rule, index) => (
            <div key={rule.title} className="flex gap-3">
              <span className="text-[10px] font-black text-purple-500 w-4">
                {index + 1}.
              </span>
              <div className="space-y-0.5">
                <p className="text-[11px] sm:text-xs font-black text-[var(--text-main)] leading-none">
                  {rule.title}
                </p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 border-dashed">
        <div className="flex gap-3 items-center mb-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            <Plus className="w-5 h-5" />
          </div>
          <p className="text-xs font-black text-purple-900 uppercase tracking-tight">
            Earn XP
          </p>
        </div>
        <p className="text-[10px] font-bold text-purple-600 leading-relaxed italic">
          "Quality contributions grant +5 VXP. Reach Level 5 to unlock global
          group creation."
        </p>
      </div>
    </div>
  );
};

export default CreateDiscussionSidebar;
