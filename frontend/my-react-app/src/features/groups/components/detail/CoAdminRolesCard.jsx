import { useState } from "react";
import { Search } from "lucide-react";
import { CO_ADMIN_PERMISSION_OPTIONS } from "../../constants/groupDetailConstants";
import Avatar from "../../../../components/ui/Avatar";

const CoAdminRolesCard = ({
  members,
  user,
  appointCoAdminMut,
  removeCoAdminMut,
  updatePermissionMut,
}) => {
  const [search, setSearch] = useState("");

  const filteredMembers = members?.filter((member) => {
    const isSelf = String(member.user_id) === String(user?.portal_user_id);
    const isExcludedRole = member.role === "owner" || member.role === "admin";
    const matchesSearch = (member.full_name || "").toLowerCase().includes(search.toLowerCase());
    
    return !isSelf && !isExcludedRole && matchesSearch;
  });

  return (
    <div className="bg-[var(--bg-card)] p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
          Moderator Roles
        </h3>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search members to promote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filteredMembers?.map((member) => (
            <div
              key={member.user_id}
              className="p-3 hover:bg-[var(--bg-active)] rounded-lg group border border-[var(--border-main)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={member.profile_image}
                    name={member.full_name}
                    size="sm"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-25">
                      {member.full_name}
                    </span>
                    {member.role === "co_admin" && (
                      <span className="text-[10px] text-purple-600 font-semibold">
                        Moderator
                      </span>
                    )}
                  </div>
                </div>
                {member.role === "member" ? (
                  <button
                    onClick={() => appointCoAdminMut.mutate(member.user_id)}
                    className="text-[10px] font-bold text-[var(--text-muted)] hover:text-purple-600 px-2 py-1 rounded bg-[var(--bg-active)] hover:bg-purple-50 transition-colors"
                  >
                    Promote
                  </button>
                ) : (
                  <button
                    onClick={() => removeCoAdminMut.mutate(member.user_id)}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
              {member.role === "co_admin" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {CO_ADMIN_PERMISSION_OPTIONS.map((permission) => {
                    const isEnabled = Boolean(
                      member.permissions?.[permission.key],
                    );

                    return (
                      <button
                        key={permission.key}
                        type="button"
                        onClick={() =>
                          updatePermissionMut.mutate({
                            memberId: member.user_id,
                            permissions: {
                              [permission.key]: !isEnabled,
                            },
                          })
                        }
                        disabled={updatePermissionMut.isPending}
                        className={`text-[10px] font-bold px-2.5 py-2 rounded-lg border transition-colors ${
                          isEnabled
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-[var(--bg-active)] border-[var(--border-main)] text-[var(--text-muted)]"
                        } disabled:opacity-60`}
                      >
                        {permission.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CoAdminRolesCard;
