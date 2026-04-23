import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Users2,
  Globe,
  FolderOpen,
  ChevronDown,
  Library,
  X,
  Search,
} from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";
import SearchModal from "../ui/SearchModal";

// Navigation items with nested sub-menus support
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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  // Check if current item or any child is active
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
        ? "bg-[var(--sidebar-active-bg)] text-purple-600 dark:text-purple-400 font-medium border-l-[3px] border-purple-500"
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

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          to={item.href}
          className={linkClasses}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          title={isCollapsed ? item.label : undefined}
          className={`${linkClasses} w-full text-left`}
        >
          {content}
        </button>
      )}

      {/* Children (sub-menu) */}
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
  const { isCollapsed, isMobileOpen, closeMobile, isMobile } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-main)]">
          <span className="text-base sm:text-lg font-semibold text-[var(--text-main)]">
            Menu
          </span>
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-active)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
      )}

      {/* Mobile Search Bar - Opens global SearchModal */}
      {isMobile && (
        <div className="px-4 py-4 border-b border-[var(--border-main)]">
          <button
            onClick={() => {
              closeMobile();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-2 pl-9 pr-3 py-2 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:border-purple-300 transition-colors relative group"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500 transition-colors pointer-events-none" />
            Quick search...
            <kbd className="ml-auto text-[10px] font-medium px-1.5 py-0.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
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

  // Mobile: Drawer with backdrop
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobile}
                className="fixed inset-0 sidebar-backdrop z-40 lg:hidden"
              />

              {/* Drawer */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-main)] border-r border-[var(--border-main)] shadow-xl z-50 lg:hidden"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </>
    );
  }

  // Desktop: Fixed sidebar with collapse
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
