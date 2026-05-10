import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Settings, Menu, Compass } from "lucide-react";
import Button from "../../../../components/ui/Button";
import { SECTIONS } from "../../constants/groupDetailConstants";
import { getSectionIcon } from "./sectionIconMap";

const GroupDetailHeader = ({
  id,
  group,
  activeSection,
  handleSectionChange,
  isMember,
  isAdmin,
  showAdminPanel,
  setShowAdminPanel,
  setIsSidebarOpen,
  isSidebarOpen,
  handleJoinAction,
  isJoining,
}) => {
  const navigate = useNavigate();
  const currentSectionIconKey = SECTIONS.find(
    (section) => section.id === activeSection,
  )?.icon;
  const CurrentIcon = getSectionIcon(currentSectionIconKey) || Compass;

  const joinLabelFull =
    group.privacy_type === "request" ? "Request to Join" : "Join Sector";
  const hasBanner = Boolean(group?.banner_image);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-slate-800 dark:bg-slate-950 shadow-md">
      {hasBanner ? (
        <>
          <img
            src={group.banner_image}
            alt={`${group.name} banner`}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-slate-800 dark:bg-slate-950 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_40%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%)]" />
      )}

      {/* Unified Responsive Layout */}
      <div className="relative flex flex-col gap-3 sm:gap-5 p-3 sm:p-5 lg:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center sm:items-start justify-between gap-3 w-full md:w-auto">
            {/* Avatar and Title */}
            <div className="flex min-w-0 items-center sm:items-start gap-3 sm:gap-5">
              <Link
                to={`/groups/${id}/profile`}
                className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl sm:rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-md sm:shadow-xl ring-1 ring-white/40"
              >
                {group.group_image ? (
                  <img
                    src={group.group_image}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CurrentIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                )}
              </Link>

              <div className="min-w-0 flex-1 backdrop-blur-[2px]">
                <div className="hidden sm:flex items-center gap-2 mb-1.5">
                  <span className="rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide border border-purple-400/40 bg-purple-900/60 text-white shadow-sm">
                    {group.privacy_type === "private"
                      ? "Private"
                      : group.privacy_type === "request"
                        ? "Request Access"
                        : "Open Access"}
                  </span>
                </div>
                <h1 className="truncate text-lg sm:text-2xl lg:text-[2.15rem] font-bold sm:font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {group.name}
                </h1>
                <p className="hidden sm:block mt-1 sm:mt-2 max-w-3xl text-sm sm:text-base text-slate-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                  {group.description ||
                    "A focused group workspace for announcements, discussion, Q&A, and shared resources."}
                </p>
              </div>
            </div>

            {/* Mobile Actions - only on small screens */}
            <div className="flex sm:hidden shrink-0 items-center gap-1.5">
              {isMember ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isSidebarOpen && showAdminPanel) {
                          setIsSidebarOpen(false);
                        } else {
                          setShowAdminPanel(true);
                          setIsSidebarOpen(true);
                        }
                      }}
                      className="h-8 w-8 p-0 rounded-lg bg-purple-600 text-white shadow-sm hover:bg-purple-600 hover:text-white"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => {
                      if (isSidebarOpen && !showAdminPanel) {
                        setIsSidebarOpen(false);
                      } else {
                        setShowAdminPanel(false);
                        setIsSidebarOpen(true);
                      }
                    }}
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </>
              ) : group.has_pending_request ? (
                <Button
                  variant="outline"
                  disabled
                  size="sm"
                  className="h-8 px-2 text-[10px] rounded-lg"
                >
                  Pending
                </Button>
              ) : (
                <Button
                  variant="shiny"
                  size="sm"
                  onClick={handleJoinAction}
                  isLoading={isJoining}
                  className="h-8 px-2 text-[10px] gap-1 rounded-lg shadow-sm"
                >
                  <UserPlus className="w-3 h-3" />
                  Join
                </Button>
              )}
            </div>
          </div>

          {/* Tablet/Desktop Right side buttons */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end shrink-0">
            {isMember ? (
              <>
                {isAdmin && (
                  <Button
                    variant={showAdminPanel ? "shiny" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        if (isSidebarOpen && showAdminPanel) {
                          setIsSidebarOpen(false);
                        } else {
                          setShowAdminPanel(true);
                          setIsSidebarOpen(true);
                        }
                      } else {
                        setShowAdminPanel(!showAdminPanel);
                      }
                    }}
                    className="rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-600 hover:shadow-md hover:text-white transition-all duration-200"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => {
                    if (isSidebarOpen && !showAdminPanel) {
                      setIsSidebarOpen(false);
                    } else {
                      setShowAdminPanel(false);
                      setIsSidebarOpen(true);
                    }
                  }}
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Members
                </Button>
              </>
            ) : group.has_pending_request ? (
              <Button
                variant="outline"
                disabled
                size="sm"
                className="rounded-xl"
              >
                Request Pending
              </Button>
            ) : (
              <Button
                variant="shiny"
                size="sm"
                onClick={handleJoinAction}
                isLoading={isJoining}
                className="gap-2 rounded-xl shadow-md"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                {joinLabelFull}
              </Button>
            )}
          </div>
        </div>

        {/* Section navigation */}
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-2 sm:gap-3 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {SECTIONS.map((section) => {
            const SectionIcon = getSectionIcon(section.icon);
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionChange?.(section.id)}
                className={`inline-flex items-center shrink-0 gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all ${
                  isActive
                    ? "border-purple-600 bg-purple-600 text-white shadow-lg"
                    : "bg-black/30 border-white/20 text-slate-200 hover:bg-black/40 hover:text-white"
                }`}
              >
                <SectionIcon
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    isActive ? "text-white" : section.color
                  }`}
                />
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap drop-shadow-sm">
                  {section.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GroupDetailHeader;
