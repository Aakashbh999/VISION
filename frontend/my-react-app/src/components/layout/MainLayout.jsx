import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
    location.pathname.startsWith("/groups") ||
    location.pathname.startsWith("/resources");

  // Library page manages its own padding/height for the sidebar layout
  const isLibraryRoute = location.pathname.startsWith("/resources");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
      {/* Top Navigation */}
      <TopNavBar />

      {/* Sidebar */}
      <PortalSidebarNew />

      {/* Main Content Area */}
      <motion.main
        layout
        className={`
          flex-1 pt-16 layout-transition
          ${isMobile ? "ml-0" : isCollapsed ? "lg:ml-18" : "lg:ml-64"}
        `}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Library/Resources page manages its own padding & height */}
        {isLibraryRoute ? (
          <div className="h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        ) : (
          <div className="min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        )}

        {/* Footer */}
        {!hideFooter && <Footer withSidebarOffset={!isCollapsed && !isMobile} />}
      </motion.main>
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