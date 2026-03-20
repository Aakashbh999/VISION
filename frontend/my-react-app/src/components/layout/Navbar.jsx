import { useState, useRef } from "react";
import { Menu, ChevronDown, Bell, User, LogOut, X, Check } from "lucide-react";
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // new state
  const isLoggedIn = !!authUser;
  const { data: unreadCount = 0 } = useUnreadCount(isLoggedIn);

  const profileRef = useRef(null);
  const resourcesRef = useRef(null);

  useClickOutside(profileRef, () => {
    setProfileMenuOpen(false);
    setShowLogoutConfirm(false); // reset confirmation when closing
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Left: logo + mobile menu button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 mr-2"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <Link to={homeLink} className="relative">
          <img src={visionLogo} alt="VISION Logo" className="h-40 w-auto" />
        </Link>
      </div>

      {/* Right side: all portal items together */}
      <div className="flex items-center gap-4">
        {variant === "portal" && user ? (
          <>
            {/* Explore dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Explore <ChevronDown className="w-4 h-4" />
              </button>
              {resourcesDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setResourcesDropdownOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User avatar dropdown with logout confirmation */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {!showLogoutConfirm ? (
                    // Normal dropdown items
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {authUser?.full_name || "Student"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {authUser?.reputation_points || 0} Rep Points
                          </span>
                        </div>
                        {authUser?.is_moderator && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-bold uppercase">
                            Mod
                          </span>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    // Logout confirmation view
                    <>
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                        Are you sure you want to logout?
                      </div>
                      <div className="flex items-center justify-between p-2 gap-2">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(false);
                            setProfileMenuOpen(false);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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
          // Public auth buttons
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 hover:scale-105 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
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
