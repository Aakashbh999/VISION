import { Calendar, GraduationCap } from "lucide-react";

const AcademicBackgroundCard = ({
  profile,
  programs,
  isOwner,
  isEditMode,
  draftProfile,
  autoSemester,
  setDraftProfile,
  handleDraftChange,
}) => {
  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          Academic Background
        </h3>
        {isOwner &&
          !draftProfile.semester_is_manual &&
          draftProfile.batch_year && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              Auto Semester
            </span>
          )}
      </div>

      {isOwner && isEditMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
              Degree Program
            </label>
            <select
              value={draftProfile.program_id}
              onChange={(event) =>
                handleDraftChange("program_id", event.target.value)
              }
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all appearance-none cursor-pointer text-[var(--text-main)]"
            >
              <option value="">Select program</option>
              {programs?.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
              Batch Year
            </label>
            <input
              value={draftProfile.batch_year}
              onChange={(event) =>
                handleDraftChange(
                  "batch_year",
                  event.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                )
              }
              placeholder="e.g. 2079"
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-main)]"
            />
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              Required for auto-semester calculation
            </p>
          </div>

          <div className="space-y-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
                Current Semester
              </label>
              <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[var(--text-main)] cursor-pointer select-none">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={draftProfile.semester_is_manual}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setDraftProfile((currentDraft) => ({
                        ...currentDraft,
                        semester_is_manual: checked,
                        semester:
                          !checked && currentDraft.batch_year
                            ? String(
                                currentDraft.semester || autoSemester || "",
                              )
                            : currentDraft.semester,
                      }));
                    }}
                  />
                  <div className="w-10 h-5 bg-[var(--bg-active)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-main)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
                Manual Override
              </label>
            </div>

            <select
              value={draftProfile.semester}
              onChange={(event) =>
                handleDraftChange("semester", event.target.value)
              }
              disabled={
                !draftProfile.semester_is_manual && !!draftProfile.batch_year
              }
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none text-[var(--text-main)]"
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>

            {!draftProfile.semester_is_manual && draftProfile.batch_year && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <p className="text-xs text-emerald-700 font-bold">
                  System predicted: Semester {autoSemester || "-"}
                </p>
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-active)] p-6 rounded-sm sm:rounded-2xl border border-[var(--border-main)] sm:col-span-2">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
              Member Since
            </p>
            <p className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
              Degree Program
            </p>
            <p className="text-base font-bold text-[var(--text-main)]">
              {profile.program_name || "Self Taught / Other"}
            </p>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
              Current Semester
            </p>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-[var(--text-main)]">
                {profile.semester
                  ? `Semester ${profile.semester}`
                  : "Not specified"}
              </p>
              {profile.batch_year && !profile.semester_is_manual && (
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                  Auto
                </span>
              )}
            </div>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
              Batch Year
            </p>
            <p className="text-base font-bold text-[var(--text-main)]">
              {profile.batch_year || "N/A"}
            </p>
          </div>
          <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
              Member Since
            </p>
            <p className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicBackgroundCard;
