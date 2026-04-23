import { Link } from "react-router-dom";
import {
  Users,
  ArrowUpRight,
  Circle,
  Settings,
  Minimize2,
  Maximize2,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import { SECTIONS } from "../../constants/groupDetailConstants";
import { getSectionIcon } from "./sectionIconMap";
import GroupCapacityCard from "./GroupCapacityCard";
import JoinRequestsCard from "./JoinRequestsCard";
import CoAdminRolesCard from "./CoAdminRolesCard";

const GroupDetailSidebar = ({
  id,
  user,
  group,
  members,
  joinRequests,
  isOwner,
  isAdmin,
  canManageUsers,
  showAdminPanel,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
  handleSectionChange,
  appointCoAdminMut,
  removeCoAdminMut,
  updatePermissionMut,
  approveRequestMut,
  declineRequestMut,
  expandCapacityMut,
}) => {
  const onlineMembers = (members || []).filter((member) => member.is_online);
  const totalMembers = Number(group?.members ?? members?.length ?? 0);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-(--bg-card) border-l border-(--border-main) border-y md:border-y-0 transform transition-all duration-300 ease-in-out lg:static lg:transform-none lg:flex flex-col flex ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-16" : "lg:w-80"}`}
      >
        {showAdminPanel && isAdmin ? (
          <div className="flex-1 flex flex-col h-full bg-(--bg-main)/50">
            <header className="px-4 py-5 border-b border-(--border-main) bg-(--bg-card) flex items-center justify-between gap-3">
              {!isSidebarCollapsed && (
                <h2 className="font-black text-(--text-main) tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" /> Server
                  Administration
                </h2>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:inline-flex p-2 rounded-lg hover:bg-(--bg-active) transition-colors text-(--text-muted) ml-auto"
                aria-label={
                  isSidebarCollapsed ? "Maximize panel" : "Minimize panel"
                }
                title={isSidebarCollapsed ? "Maximize panel" : "Minimize panel"}
              >
                {isSidebarCollapsed ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
            </header>
            <div
              className={`overflow-y-auto ${isSidebarCollapsed ? "p-3" : "p-6 space-y-8"}`}
            >
              {isSidebarCollapsed ? (
                <div className="hidden lg:flex flex-col items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-black">
                    {group.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) [writing-mode:vertical-rl] rotate-180">
                    Admin Panel
                  </span>
                </div>
              ) : (
                <>
                  <GroupCapacityCard
                    group={group}
                    isOwner={isOwner}
                    expandCapacityMut={expandCapacityMut}
                  />

                  {canManageUsers && (
                    <JoinRequestsCard
                      joinRequests={joinRequests}
                      approveRequestMut={approveRequestMut}
                      declineRequestMut={declineRequestMut}
                    />
                  )}

                  {isOwner && (
                    <CoAdminRolesCard
                      members={members}
                      user={user}
                      appointCoAdminMut={appointCoAdminMut}
                      removeCoAdminMut={removeCoAdminMut}
                      updatePermissionMut={updatePermissionMut}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <header className="h-20 px-4 lg:px-8 flex items-center justify-between border-b border-(--border-main) bg-(--bg-card) shadow-sm z-10 gap-3">
              {!isSidebarCollapsed && (
                <span className="text-xs font-black text-(--text-main) uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /> Members
                </span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {!isSidebarCollapsed && (
                  <Badge variant="soft" color="slate">
                    {totalMembers}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:inline-flex p-2 rounded-lg hover:bg-(--bg-active) transition-colors text-(--text-muted)"
                  aria-label={
                    isSidebarCollapsed ? "Maximize panel" : "Minimize panel"
                  }
                  title={
                    isSidebarCollapsed ? "Maximize panel" : "Minimize panel"
                  }
                >
                  {isSidebarCollapsed ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </header>

            {isSidebarCollapsed ? (
              <div className="hidden lg:flex flex-1 items-center justify-center p-3">
                <div className="flex flex-col items-center gap-3">
                  <Link
                    to={`/groups/${id}/profile`}
                    className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
                    title={group.name}
                  >
                    {group.group_image ? (
                      <img
                        src={group.group_image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-black text-sm">
                        {group.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>
                  <span className="text-[10px] font-black uppercase tracking-widest text-(--text-muted) [writing-mode:vertical-rl] rotate-180">
                    Groups
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to={`/groups/${id}/profile`}
                  className="flex items-center gap-3 mx-4 mt-4 mb-2 p-3 rounded-sm sm:rounded-2xl border border-(--border-main) hover:border-purple-200 hover:bg-purple-50/50 transition-colors group/glink"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover/glink:ring-2 group-hover/glink:ring-purple-400 transition-colors">
                    {group.group_image ? (
                      <img
                        src={group.group_image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-black text-sm">
                        {group.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-(--text-main) truncate group-hover/glink:text-purple-700 transition-colors">
                      {group.name}
                    </span>
                    <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-widest">
                      View Group Profile
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-(--text-muted) ml-auto group-hover/glink:text-purple-500 transition-colors shrink-0" />
                </Link>

                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest px-2">
                      Sectors
                    </label>
                    <div className="grid gap-2">
                      {SECTIONS.map((section) => {
                        const Icon = getSectionIcon(section.icon);
                        const isActive = activeSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => handleSectionChange(section.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isActive
                                ? "bg-slate-900 border-slate-900"
                                : "bg-(--bg-card) border hover:bg-(--bg-active)"
                            } border-(--border-main)`}
                          >
                            <div
                              className={`p-2 rounded-lg ${isActive ? "bg-white/10" : section.bg}`}
                            >
                              <Icon
                                className={`w-4 h-4 ${isActive ? "text-white" : section.color}`}
                              />
                            </div>
                            <span
                              className={`text-[11px] font-black uppercase tracking-wider ${
                                isActive ? "text-white" : "text-(--text-main)"
                              }`}
                            >
                              {section.label}
                            </span>
                            {isActive && (
                              <Circle className="w-2 h-2 fill-white ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest px-2">
                      Online Members
                    </label>
                    <div className="grid gap-1">
                      {onlineMembers.length > 0 ? (
                        onlineMembers.map((member) => (
                          <Link
                            to={`/profile/${member.user_id}`}
                            key={member.user_id}
                            className="flex items-center gap-3 p-2 hover:bg-(--bg-active) rounded-xl transition-colors border border-transparent hover:border-(--border-main)"
                          >
                            <Avatar
                              src={member.profile_image}
                              name={member.full_name}
                              size="md"
                              variant="circular"
                              status={member.is_online ? "online" : null}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold text-(--text-main) truncate">
                                {String(member.user_id) ===
                                String(user?.portal_user_id)
                                  ? "You"
                                  : member.full_name}
                              </span>
                              {member.role !== "member" && (
                                <span
                                  className={`text-[10px] uppercase font-black tracking-widest ${
                                    member.role === "owner"
                                      ? "text-purple-600"
                                      : "text-blue-500"
                                  }`}
                                >
                                  {member.role === "owner"
                                    ? "Admin"
                                    : "Moderator"}
                                </span>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-(--text-muted) font-medium px-2 py-3">
                          No members are active right now.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GroupDetailSidebar;
