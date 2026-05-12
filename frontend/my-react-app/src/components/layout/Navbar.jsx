import { useState, useRef } from "react";
import { Menu, ChevronDown, Bell, User, LogOut } from "lucide-react";
import Avatar from "../ui/Avatar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useMarkAllRead } from "../../hooks/useMarkAllRead";
import { useClickOutside } from "../../hooks/useClickOutside";
import Logo from "../ui/Logo/Logo";
import ThemeToggle from "./ThemeToggle";
import NotificationsPopup from "../notifications/NotificationsPopup";

const Navbar = ({ onMobileMenuToggle, variant, user }) => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const isLoggedIn = !!authUser;
  const { data: unreadCount = 0 } = useUnreadCount(isLoggedIn);
  const markAllReadMut = useMarkAllRead();

  const profileRef = useRef(null);
  const resourcesRef = useRef(null);
  const notificationsButtonRef = useRef(null);

  useClickOutside(profileRef, () => {
    setProfileMenuOpen(false);
    setShowLogoutConfirm(false);
  });
  useClickOutside(resourcesRef, () => setResourcesDropdownOpen(false));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoutWithConfirm = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");
    if (shouldLogout) {
      handleLogout();
    }
  };

  const homeLink = authUser?.student_status === "approved" ? "/dashboard" : "/";
  const accountStatusLabel =
    authUser?.role === "admin"
      ? null
      : authUser?.email_status !== "verified"
        ? "Email not verified"
        : authUser?.student_status !== "approved"
          ? "Approval pending"
          : null;
  const accountStatusRoute =
    authUser?.role === "admin"
      ? null
      : authUser?.email_status !== "verified"
        ? "/verify-email"
        : authUser?.student_status !== "approved"
          ? "/pending-approval"
          : null;

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-(--bg-main)/90 backdrop-blur-sm border-b border-(--border-main) z-50 flex items-center justify-between px-4 shadow-sm transition-colors duration-300">
      {}
      <div className="flex items-center gap-2">
  <button
    onClick={onMobileMenuToggle}
    className={`${variant === "admin" ? "flex" : "lg:hidden"} p-2 rounded-lg text-white shadow-lg shadow-purple-900/20 transition-all duration-300 mr-2`}
    style={{ backgroundColor: '#0f0a1f' }}
    aria-label="Toggle menu"
  >
    <Menu className="w-5 h-5 pointer-events-none" />
  </button>
  <Link to={homeLink} className="relative">
    <Logo className="h-10 hover:opacity-80 transition-opacity" />
  </Link>
</div>

      {}
      <div className="flex items-center gap-4">
        {}
        <ThemeToggle />

        {authUser ? (
          <>
            {}
            {variant !== "admin" && (
              <div className="relative hidden sm:block" ref={resourcesRef}>
                <button
                  onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                  className="flex items-center gap-1 text-(--text-main) hover:text-purple-600 transition-colors font-medium"
                >
                  Explore <ChevronDown className="w-4 h-4 pointer-events-none" />
                </button>
                {resourcesDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-(--bg-card) rounded-xl shadow-lg border border-(--border-main) py-2 z-50">
                    {publicLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block px-4 py-2 text-sm text-(--text-main) hover:bg-(--bg-active)"
                        onClick={() => setResourcesDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {}
            <div className="relative">
              <button
                ref={notificationsButtonRef}
                type="button"
                onClick={handleNotificationsToggle}
                className="relative p-2 rounded-full hover:bg-(--bg-active) transition-colors"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-5 h-5 text-(--text-main) pointer-events-none" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPopup
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                toggleRef={notificationsButtonRef}
              />
            </div>

            {}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-(--bg-active) transition-colors"
                aria-label="User menu"
              >
                <Avatar
                  src={authUser?.profile_image}
                  name={authUser?.full_name || "Student"}
                  size="sm"
                  className="shadow"
                />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-(--bg-card) rounded-xl shadow-lg border border-(--border-main) py-2 z-50">
                  {!showLogoutConfirm ? (
                    <>
                      <div className="px-4 py-3 border-b border-(--border-main) flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-(--text-main)">
                            {authUser?.full_name || "Student"}
                          </span>
                          <span className="text-xs text-(--text-muted)">
                            {authUser?.reputation_points || 0} Rep Points
                          </span>
                        </div>
                        {authUser?.is_moderator && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[10px] font-bold uppercase">
                            Mod
                          </span>
                        )}
                      </div>
                      {authUser?.role !== "admin" && (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-(--text-main) hover:bg-(--bg-active)"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Profile
                        </Link>
                      )}
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="block w-full text-left px-4 py-2 text-sm text-(--text-main) hover:bg-(--bg-active)"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 text-sm text-(--text-main) border-b border-(--border-main)">
                        Are you sure you want to logout?
                      </div>
                      <div className="flex items-center justify-between p-2 gap-2">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(false);
                            setProfileMenuOpen(false);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-(--border-main) rounded-lg hover:bg-(--bg-active) transition-colors"
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

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {accountStatusLabel && (
                  <Link
                    to={accountStatusRoute || "/"}
                    className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    {accountStatusLabel}
                  </Link>
                )}
                <button
                  onClick={handleLogoutWithConfirm}
                  className="px-4 py-2 rounded-lg border border-(--border-main) text-(--text-main) hover:bg-(--bg-active) transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-(--text-main) hover:text-purple-600 font-medium transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-(--bg-active)"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden lg:block px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
