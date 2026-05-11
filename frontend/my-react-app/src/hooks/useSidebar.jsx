import { useState, useEffect, createContext, useContext } from "react";

const SidebarContext = createContext(null);

export const SIDEBAR_WIDTH = {
  expanded: "16rem",
  collapsed: "4.5rem",
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {

      const timer = setTimeout(() => setIsMobileOpen(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  const toggle = () => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  const value = {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    isMobile,
    toggle,
    openMobile,
    closeMobile,
    sidebarWidth: isCollapsed
      ? SIDEBAR_WIDTH.collapsed
      : SIDEBAR_WIDTH.expanded,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export default useSidebar;
