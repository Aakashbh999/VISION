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

  const joinLabelShort = group.privacy_type === "request" ? "Request" : "Join";
  const joinLabelFull =
    group.privacy_type === "request" ? "Request to Join" : "Join Sector";

  return (
    <>
      <div
        className="
        px-3 sm:px-4 md:px-8 py-1 md:py-0 md:h-20
        flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4
        border-b border-(--border-main)/50
        absolute left-0 top-0 w-full z-30
        shrink-0
        backdrop-blur-xl bg-(--bg-main)/80
      "
      >
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="p-2.5 shrink-0"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
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
              <h1 className="font-black text-(--text-main) text-sm sm:text-base md:text-lg leading-tight flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="truncate">{group.name}</span>
                <Badge
                  color={activeSectionColor}
                  className="hidden md:inline-flex shrink-0"
                >
                  {activeSectionLabel}
                </Badge>
              </h1>
              <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest truncate">
                {group.members} Members • Cap. {group.capacity}
              </span>
            </div>
          </div>

          {isMember && (
            <div className="flex items-center gap-2 shrink-0 md:border-l md:border-(--border-main) md:pl-4">
              {isAdmin && (
                <Button
                  variant={showAdminPanel ? "shiny" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setShowAdminPanel(!showAdminPanel);
                    setIsSidebarOpen(true);
                  }}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  aria-label="Open admin panel"
                  title="Admin panel"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}

              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 lg:hidden flex items-center justify-center"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open group menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {!isMember && (
          <div
            className="
            flex items-center justify-stretch gap-2 md:gap-3
            w-full max-md:pt-2 max-md:border-t max-md:border-(--border-main)/40
            md:w-auto md:justify-end md:border-l md:border-t-0 md:border-(--border-main) md:pl-4 md:shrink-0
          "
          >
            {group.has_pending_request ? (
              <Button
                variant="outline"
                disabled
                size="sm"
                className="w-full md:w-auto justify-center"
              >
                <span className="sm:hidden">Pending</span>
                <span className="hidden sm:inline">Request Pending</span>
              </Button>
            ) : (
              <Button
                variant="shiny"
                size="sm"
                onClick={handleJoinAction}
                isLoading={isJoining}
                className="gap-2 w-full md:w-auto justify-center shrink-0"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className="sm:hidden">{joinLabelShort}</span>
                <span className="hidden sm:inline">{joinLabelFull}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GroupDetailHeader;
