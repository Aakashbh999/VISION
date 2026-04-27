import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Search,
  Command,
} from "lucide-react";
import SearchModal, { useSearchModal } from "../ui/SearchModal";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../hooks/useSidebar";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useMarkAllRead } from "../../hooks/useMarkAllRead";
import { useClickOutside } from "../../hooks/useClickOutside";
import XpWidget from "../portal/XpWidget";
import Logo from "../ui/Logo/Logo";
import ThemeToggle from "./ThemeToggle";
import NotificationsPopup from "../notifications/NotificationsPopup";

// Breadcrumb mapping
const routeLabels = {
  portal: "Portal",
  dashboard: "Dashboard",
  roadmaps: "Roadmaps",
  discussions: "Discussions",
  groups: "Groups",
  clubs: "Clubs",
  resources: "Library",
  profile: "Profile",
  notifications: "Notifications",
  my: "My Resources",
  new: "Create New",
  saved: "Saved",
  "my-posts": "My Posts",
};

const Breadcrumb = ({ dark }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { label, path, isLast };
  });

  return (
    <nav className="flex items-center text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && (
            <ChevronRight
              className={`w-4 h-4 mx-2 ${dark ? "text-slate-500" : "text-[var(--text-muted)]"}`}
            />
          )}
          {crumb.isLast ? (
            <span
              className={`${dark ? "text-white" : "text-[var(--text-main)]"} font-medium`}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className={`${dark ? "text-slate-400 hover:text-purple-300" : "text-[var(--text-muted)] hover:text-purple-600"} transition-colors`}
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

const TopNavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchModal = useSearchModal();

  const isLoggedIn = !!user;
  const { data: unreadCount = 0 } = useUnreadCount(isLoggedIn);
  const markAllReadMut = useMarkAllRead();

  const profileRef = useRef(null);
  const exploreRef = useRef(null);
  const notificationsButtonRef = useRef(null);

  useClickOutside(profileRef, () => {
    setProfileMenuOpen(false);
    setShowLogoutConfirm(false);
  });
  useClickOutside(exploreRef, () => setExploreDropdownOpen(false));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const publicLinks = [
    { label: "IT Specializations", href: "/it-fields" },
    { label: "Academic Guide", href: "/academic-guide" },
    { label: "Job Market", href: "/it-jobs" },
    { label: "Community", href: "/it-clubs" },
  ];

  const handleNotificationsToggle = () => {
    setNotificationsOpen((open) => {
      const nextOpen = !open;
      if (nextOpen && unreadCount > 0 && !markAllReadMut.isPending) {
        markAllReadMut.mutate();
      }
      return nextOpen;
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-main)]/95 backdrop-blur-md border-b border-[var(--border-main)] z-40 flex items-center justify-between px-4 transition-all duration-300">
      {/* Left section: Menu toggle + Logo + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-[#0f0a1f] text-white shadow-lg shadow-purple-900/20 hover:bg-purple-900 transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo – height manually controlled by you */}
        <Link to="/dashboard" className="shrink-0">
          <Logo className="h-10 hover:opacity-80 transition-opacity" />
        </Link>

        {/* Breadcrumb (hidden on mobile) */}
        <div className="hidden md:block border-l border-[var(--border-main)] pl-4 ml-2">
          <Breadcrumb />
        </div>
      </div>

      {/* Right section: Search, XP, Explore, Notifications, Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Universal Search Button */}
        <button
          onClick={searchModal.open}
          className="flex items-center gap-2 px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-purple-600/10 dark:hover:bg-purple-500/20 rounded-lg border border-[var(--border-main)] transition-colors"
          aria-label="Search (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Search</span>
          <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-active)] rounded border border-[var(--border-main)]">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* Explore Dropdown */}
        <div className="relative hidden lg:block" ref={exploreRef}>
          <button
            onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
            className="flex items-center gap-1 px-3 py-2 text-[var(--text-main)] hover:text-purple-600 hover:bg-purple-600/5 rounded-lg transition-colors font-medium text-sm"
          >
            Explore
            <ChevronDown className="w-4 h-4" />
          </button>
          {exploreDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-1 w-48 bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-main)] py-1 z-50"
            >
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)] hover:text-purple-600"
                  onClick={() => setExploreDropdownOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationsButtonRef}
            type="button"
            onClick={handleNotificationsToggle}
            className="relative p-2 rounded-lg hover:bg-purple-600/10 dark:hover:bg-purple-500/20 transition-colors"
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-5 h-5 text-[var(--text-main)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPopup
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            toggleRef={notificationsButtonRef}
          />
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-purple-600/10 dark:hover:bg-purple-500/20 transition-colors"
            aria-label="User menu"
          >
            <Avatar
              src={user?.profile_image}
              name={user?.full_name || "Student"}
              size="sm"
              className="shadow-sm border-purple-200"
            />
          </button>

          {profileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-60 bg-[var(--bg-card)] rounded-lg shadow-lg border border-[var(--border-main)] py-1 z-50"
            >
              {!showLogoutConfirm ? (
                <>
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-[var(--border-main)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          {user?.full_name || "Student"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {user?.email}
                        </p>
                      </div>
                      {user?.is_moderator && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[10px] font-bold uppercase">
                          Mod
                        </span>
                      )}
                    </div>
                    <div className="mt-4">
                      <XpWidget />
                    </div>
                  </div>

                  {/* Menu items */}
                  {user?.role !== "admin" && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-[var(--text-muted)]" />
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                  >
                    <LogOut className="w-4 h-4 text-[var(--text-muted)]" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  {/* Logout confirmation */}
                  <div className="px-4 py-3 text-sm text-[var(--text-main)] border-b border-[var(--border-main)]">
                    Are you sure you want to sign out?
                  </div>
                  <div className="flex items-center gap-2 p-2">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchModal.isOpen} onClose={searchModal.close} />
    </header>
  );
};

export default TopNavBar;
