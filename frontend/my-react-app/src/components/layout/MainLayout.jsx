import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../../hooks/useSidebar";
import TopNavBar from "./TopNavBar";
import PortalSidebarNew from "../portal/PortalSidebarNew";
import Footer from "./Footer";

const MainLayoutContent = () => {
  const { isCollapsed, isMobile } = useSidebar();
  const location = useLocation();

  // Hide footer on discussion and group pages
  const hideFooter =
    location.pathname.startsWith("/discussions") ||
    location.pathname.startsWith("/groups");

  // Library page manages its own padding/height for the sidebar layout
  const isLibraryRoute = location.pathname.startsWith("/resources");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
      {/* Top Navigation */}
      <TopNavBar />

      {/* Sidebar */}
      <PortalSidebarNew />

      {/* Main Content Area */}
      <main
        className={`
          flex-1 pt-16 layout-transition flex flex-col
          ${isMobile ? "ml-0" : isCollapsed ? "lg:ml-18" : "lg:ml-64"}
        `}
      >
        {/* Library/Resources page manages its own padding */}
        {isLibraryRoute ? (
          <div className="flex-1 min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        ) : (
          <div className="flex-1 min-h-[calc(100vh-4rem)] px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
            <Outlet />
          </div>
        )}

        {/* Footer: no sidebar offset needed here because main already has the margin */}
        {!hideFooter && <Footer withSidebarOffset={false} />}
      </main>
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
