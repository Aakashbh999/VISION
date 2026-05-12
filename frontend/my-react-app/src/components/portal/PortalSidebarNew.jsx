import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Users2,
  Globe,
  ChevronDown,
  Library,
} from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: BookOpen,
    href: "/roadmaps",
  },
  {
    id: "library",
    label: "Library",
    icon: Library,
    href: "/resources",
  },
  {
    id: "discussions",
    label: "Discussions",
    icon: MessageCircle,
    href: "/discussions",
  },
  {
    id: "groups",
    label: "Groups",
    icon: Users2,
    href: "/groups",
  },
  {
    id: "clubs",
    label: "Clubs",
    icon: Globe,
    href: "/clubs",
  },
];

const NavItem = ({ item, isCollapsed, depth = 0 }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const isActive = hasChildren
    ? item.children.some(
        (child) => location.pathname === child.href?.split("?")[0],
      )
    : location.pathname === item.href?.split("?")[0];

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const linkClasses = `
    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group relative
    ${
      isActive
        ? "text-purple-600 dark:text-purple-400 font-semibold border-l-[3px] border-purple-500"
        : "text-[var(--text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-purple-600 dark:hover:text-purple-400 border-l-[3px] border-transparent"
    }
    ${depth > 0 ? "ml-6 text-sm" : ""}
  `;

  const content = (
    <>
      {Icon && (
        <Icon
          className={`w-5 h-5 shrink-0 pointer-events-none transition-colors ${
            isActive
              ? "text-purple-600"
              : "text-[var(--text-muted)] group-hover:text-purple-500"
          }`}
        />
      )}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </>
      )}
    </>
  );

  const handleMouseEnter = () => {

    if (item.href === "/resources") {
      queryClient.prefetchQuery({
        queryKey: ["resources"],
        queryFn: () => fetch("/api/resources").then((res) => res.json())
      });
    } else if (item.href === "/discussions") {
      queryClient.prefetchQuery({
        queryKey: ["discussions"],
        queryFn: () => fetch("/api/discussions").then((res) => res.json())
      });
    } else if (item.href === "/groups") {
      queryClient.prefetchQuery({
        queryKey: ["studyGroups"],
        queryFn: () => fetch("/api/groups").then((res) => res.json())
      });
    }
  };

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          to={item.href}
          className={linkClasses}
          title={isCollapsed ? item.label : undefined}
          onMouseEnter={handleMouseEnter}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          title={isCollapsed ? item.label : undefined}
          className={`${linkClasses} w-full text-left`}
        >
          {content}
        </button>
      )}

      {}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1 space-y-1">
                {item.children.map((child) => (
                  <NavItem
                    key={child.id}
                    item={child}
                    isCollapsed={isCollapsed}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const PortalSidebarNew = () => {
  const { isCollapsed, isMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed && !isMobile}
          />
        ))}
      </nav>
    </div>
  );

  if (isMobile) return null;

  return (
    <motion.aside
      layout
      initial={false}
      animate={{ width: isCollapsed ? "4.5rem" : "16rem" }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[var(--bg-main)]/95 backdrop-blur-sm border-r border-[var(--border-main)] shadow-sm z-30 transition-colors duration-300"
    >
      {sidebarContent}
    </motion.aside>
  );
};

export default PortalSidebarNew;
