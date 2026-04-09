import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, UserPlus, Settings, Menu, Compass } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Badge from "../../../../components/ui/Badge";
import { SECTIONS } from "../../constants/groupDetailConstants";
import { getSectionIcon } from "./sectionIconMap";

const GroupDetailHeader = ({
  id,
  group,
  activeSection,
  isMember,
  isAdmin,
  showAdminPanel,
  setShowAdminPanel,
  setIsSidebarOpen,
  handleJoinAction,
  isJoining,
}) => {
  const navigate = useNavigate();
  const currentSectionIconKey = SECTIONS.find(
    (section) => section.id === activeSection,
  )?.icon;
  const CurrentIcon = getSectionIcon(currentSectionIconKey) || Compass;

  const activeSectionLabel =
    SECTIONS.find((section) => section.id === activeSection)?.label ||
    "General";

  const activeSectionColor =
    SECTIONS.find((section) => section.id === activeSection)
      ?.color.replace("text-", "")
      .split("-")[0] || "purple";

  return (
    <>
      <div className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-(--border-main)/50 sticky top-0 z-20 backdrop-blur-xl bg-(--bg-main)/80">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2.5"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Link
              to={`/groups/${id}/profile`}
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg hover:ring-2 hover:ring-purple-500 hover:ring-offset-1 transition-all"
            >
              {group.group_image ? (
                <img
                  src={group.group_image}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <CurrentIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </Link>
            <div className="flex flex-col min-w-0">
              <h1 className="font-black text-(--text-main) text-sm sm:text-base md:text-lg leading-tight flex items-center gap-2 sm:gap-3 truncate">
                <span className="truncate">{group.name}</span>
                <Badge
                  color={activeSectionColor}
                  className="hidden md:inline-flex shrink-0"
                >
                  {activeSectionLabel}
                </Badge>
              </h1>
              <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest truncate">
                {group.members} Members • Capacity: {group.capacity}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-(--border-main) pl-4">
          {!isMember ? (
            group.has_pending_request ? (
              <Button variant="outline" disabled size="sm">
                Request Pending
              </Button>
            ) : (
              <Button
                variant="shiny"
                size="sm"
                onClick={handleJoinAction}
                isLoading={isJoining}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {group.privacy_type === "request"
                  ? "Request to Join"
                  : "Join Sector"}
              </Button>
            )
          ) : (
            <>
              {isAdmin && (
                <Button
                  variant={showAdminPanel ? "shiny" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowAdminPanel(!showAdminPanel);
                    setIsSidebarOpen(true);
                  }}
                  className="p-2.5 gap-1.5 md:gap-2 flex"
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-[10px] md:text-xs font-bold hidden sm:inline">
                    Admin Panel
                  </span>
                </Button>
              )}

              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupDetailHeader;
