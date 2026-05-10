import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../../hooks/useSidebar";
import TopNavBar from "./TopNavBar";
import PortalSidebarNew from "../portal/PortalSidebarNew";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

const MainLayoutContent = () => {
  const { isCollapsed, isMobile } = useSidebar();
  const location = useLocation();

  // Hide footer on discussion and group pages
  const hideFooter =
    location.pathname.startsWith("/discussions") ||
    location.pathname.startsWith("/groups");

  // Library page manages its own padding/height for the sidebar layout
  const isLibraryRoute = location.pathname.startsWith("/resources");

  // Check if it's the specific group detail page (e.g. /groups/123)
  const isGroupDetailRoute = /^\/groups\/[^/]+$/.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
      {/* Top Navigation */}
      <TopNavBar />

      {/* Sidebar */}
      <PortalSidebarNew />

      {/* Main Content Area */}
      <main
        className={`
          flex-1 pt-16 layout-transition flex flex-col min-h-0
          ${isMobile ? "ml-0" : isCollapsed ? "lg:ml-18" : "lg:ml-64"}
        `}
      >
        {isGroupDetailRoute ? (
          <div className="flex-1 flex flex-col h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
            <Outlet />
          </div>
        ) : isLibraryRoute ? (
          <div className="flex-1 min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 lg:pb-8">
            <Outlet />
          </div>
        )}

        {/* Footer: no sidebar offset needed here because main already has the margin */}
        {!hideFooter && <Footer withSidebarOffset={false} />}
      </main>

      {/* Mobile bottom navigation — rendered outside <main> so it sits fixed at viewport bottom */}
      <MobileBottomNav />
    </div>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider>
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
