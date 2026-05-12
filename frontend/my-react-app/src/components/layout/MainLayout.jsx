import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../../hooks/useSidebar";
import TopNavBar from "./TopNavBar";
import PortalSidebarNew from "../portal/PortalSidebarNew";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";

const MainLayoutContent = () => {
  const { isCollapsed, isMobile } = useSidebar();
  const location = useLocation();

  const hideFooter =
    location.pathname.startsWith("/discussions") ||
    location.pathname.startsWith("/groups");

  const isLibraryRoute = location.pathname.startsWith("/resources");

  const isGroupDetailRoute = /^\/groups\/[^/]+$/.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
      {}
      <TopNavBar />

      {}
      <PortalSidebarNew />

      {}
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

        {}
        {!hideFooter && <Footer withSidebarOffset={false} />}
      </main>

      {}
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
