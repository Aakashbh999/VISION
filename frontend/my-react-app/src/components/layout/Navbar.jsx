import { useState, useRef } from "react";
import { Menu, ChevronDown, Bell, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useClickOutside } from "../../hooks/useClickOutside";
import visionLogo from "../../assets/vision-logo.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ onMobileMenuToggle, variant, user }) => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggedIn = !!authUser;
  const { data: unreadCount = 0 } = useUnreadCount(isLoggedIn);

  const profileRef = useRef(null);
  const resourcesRef = useRef(null);

  useClickOutside(profileRef, () => {
    setProfileMenuOpen(false);
    setShowLogoutConfirm(false);
  });
  useClickOutside(resourcesRef, () => setResourcesDropdownOpen(false));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const homeLink = authUser?.student_status === "approved" ? "/dashboard" : "/";

  const publicLinks = [
    { label: "IT Specializations", href: "/it-fields" },
    { label: "Academic Guide", href: "/academic-guide" },
    { label: "Job Market", href: "/it-jobs" },
    { label: "Community", href: "/it-clubs" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-main)]/90 backdrop-blur-sm border-b border-[var(--border-main)] z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm transition-colors duration-300">
      {/* Left: logo + mobile menu button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-active)] transition-colors duration-300 mr-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-[var(--text-main)]" />
        </button>
        <Link to={homeLink} className="relative">
          <img
            src={visionLogo}
            alt="VISION Logo"
            className="h-[7.8rem] w-auto sm:h-[8rem] md:h-[9rem] transition-all duration-300"
          />
        </Link>
      </div>

      {/* Right side: all items together */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle – always visible */}
        <ThemeToggle />

        {variant === "portal" && user ? (
          // Portal variant: explore dropdown, notification bell, user menu
          <>
            {/* Explore dropdown – hidden on mobile */}
            <div className="relative hidden sm:block" ref={resourcesRef}>
              <button
                onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                className="flex items-center gap-1 text-[var(--text-main)] hover:text-purple-600 transition-colors font-medium"
              >
                Explore <ChevronDown className="w-4 h-4" />
              </button>
              {resourcesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--border-main)] py-2 z-50">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                      onClick={() => setResourcesDropdownOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-[var(--bg-active)] transition-colors"
            >
              <Bell className="w-5 h-5 text-[var(--text-main)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User avatar dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-[var(--bg-active)] transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--border-main)] py-2 z-50">
                  {!showLogoutConfirm ? (
                    <>
                      <div className="px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[var(--text-main)]">
                            {authUser?.full_name || "Student"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {authUser?.reputation_points || 0} Rep Points
                          </span>
                        </div>
                        {authUser?.is_moderator && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[10px] font-bold uppercase">
                            Mod
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 text-sm text-[var(--text-main)] border-b border-[var(--border-main)]">
                        Are you sure you want to logout?
                      </div>
                      <div className="flex items-center justify-between p-2 gap-2">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(false);
                            setProfileMenuOpen(false);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-[var(--border-main)] rounded-lg hover:bg-[var(--bg-active)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowLogoutConfirm(false);
                            setProfileMenuOpen(false);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // Public variant: login and register buttons
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-[var(--text-main)] hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-active)]"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hidden lg:block px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
