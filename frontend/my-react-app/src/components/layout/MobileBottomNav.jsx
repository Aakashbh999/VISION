import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  MessageCircle,
  Users2,
  Library,
  Globe,
} from "lucide-react";

const navItems = [
  { id: "roadmaps",    label: "Roadmaps", icon: BookOpen,       href: "/roadmaps" },
  { id: "library",    label: "Library",  icon: Library,         href: "/resources" },
  { id: "discussions",label: "Discuss",  icon: MessageCircle,   href: "/discussions" },
  { id: "groups",     label: "Groups",   icon: Users2,           href: "/groups" },
  { id: "clubs",      label: "Clubs",    icon: Globe,            href: "/clubs" },
];

// Routes where the bottom nav should be hidden — group chat has its own fixed bottom input
const HIDDEN_PATTERNS = [/^\/groups\/[^/]+$/];

const MobileBottomNav = () => {
  const location = useLocation();

  if (HIDDEN_PATTERNS.some((p) => p.test(location.pathname))) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-main)] shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                to={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator pill at top */}
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-purple-500"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                )}

                {/* 44px minimum touch target */}
                <span
                  className={`w-11 h-9 flex items-center justify-center rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-purple-500/10"
                      : "group-active:bg-[var(--bg-active)]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-150 ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                </span>

                <span
                  className={`text-[9px] font-bold tracking-wide leading-none transition-colors duration-150 ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS home-indicator safe-area */}
        <div style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </nav>
  );
};

export default MobileBottomNav;
