import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ArrowUpRight,
  Circle,
  Settings,
  Minimize2,
  Maximize2,
  UserPlus,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import { SECTIONS } from "../../constants/groupDetailConstants";
import { getSectionIcon } from "./sectionIconMap";
import GroupCapacityCard from "./GroupCapacityCard";
import JoinRequestsCard from "./JoinRequestsCard";
import CoAdminRolesCard from "./CoAdminRolesCard";
import AddMemberModal from "./AddMemberModal";

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
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
  handleSectionChange,
  showSectionNavigation = true,
  appointCoAdminMut,
  removeCoAdminMut,
  updatePermissionMut,
  approveRequestMut,
  declineRequestMut,
  expandCapacityMut,
}) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const onlineMembers = (members || []).filter((member) => member.is_online);
  const totalMembers = Number(group?.members ?? members?.length ?? 0);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden rounded-3xl"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`absolute lg:static inset-y-0 right-0 z-30 w-full sm:w-80 bg-(--bg-card) border-l border-(--border-main) transform transition-all duration-300 ease-in-out overflow-y-auto lg:transform-none lg:flex lg:h-full lg:overflow-y-auto flex-col flex rounded-3xl lg:rounded-none ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:w-80`}
      >
        {showAdminPanel && isAdmin ? (
          <div className="flex-1 flex flex-col h-full bg-(--bg-main)/50">
            <header className="px-4 py-5 border-b border-(--border-main) bg-(--bg-card) flex items-center justify-between gap-3">
              <h2 className="font-black text-(--text-main) tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" /> Server
                Administration
              </h2>
            </header>
            <div className="overflow-y-auto p-6 space-y-8">
              <GroupCapacityCard
                group={group}
                isOwner={isOwner}
                expandCapacityMut={expandCapacityMut}
              />

              {canManageUsers && (
                <>
                  <JoinRequestsCard
                    joinRequests={joinRequests}
                    approveRequestMut={approveRequestMut}
                    declineRequestMut={declineRequestMut}
                  />

                  <div className="bg-(--bg-card) border border-(--border-main) rounded-3xl p-5 shadow-sm">
                    <h3 className="text-xs font-black text-(--text-main) uppercase tracking-widest mb-4">
                      Direct Access
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 rounded-2xl py-4 font-bold border-dashed"
                      onClick={() => setShowAddMemberModal(true)}
                    >
                      <UserPlus className="w-5 h-5 text-purple-600" />
                      Add Member
                    </Button>
                  </div>
                </>
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
            </div>
          </div>
        ) : (
          <>
            <header className="h-20 px-4 lg:px-8 flex items-center justify-between border-b border-(--border-main) bg-(--bg-card) shadow-sm z-10 gap-3">
              <span className="text-xs font-black text-(--text-main) uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" /> Members
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="soft" color="slate">
                  {totalMembers}
                </Badge>
              </div>
            </header>

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
              {showSectionNavigation && (
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
              )}

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
                        className="flex items-center gap-3 p-2 hover:bg-(--bg-active) rounded-xl transition-colors border border-transparent hover:border-(--border-main) group"
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
                              {member.role === "owner" ? "Admin" : "Moderator"}
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
      </div>

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        groupId={id}
        members={members}
        onMemberAdded={() => {
          // Parent state should ideally refresh via react-query
        }}
      />
    </>
  );
};

export default GroupDetailSidebar;
