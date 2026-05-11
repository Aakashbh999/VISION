import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { SidebarProvider, useSidebar } from "./hooks/useSidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import MainLayout from "./components/layout/MainLayout";
import AdminSidebar from "./components/admin_ui/AdminSidebar";
import MobileMenu from "./components/layout/MobileMenu";
import Footer from "./components/layout/Footer";
import ITFields from "./pages/ITFields";
import AcademicGuide from "./pages/AcademicGuide";
import ITJobs from "./pages/ITJobs";

import ItFieldsAdmin from "./pages/admin/RefData/ItFields";
import AcademicDegreesAdmin from "./pages/admin/RefData/AcademicDegrees";
import ItJobsAdmin from "./pages/admin/RefData/ItJobs";
import ItClubsAdmin from "./pages/admin/RefData/ItClubs";
import ProgramsAdmin from "./pages/admin/RefData/Programs";
import TagsAdmin from "./pages/admin/RefData/Tags";

import ITClubs from "./pages/ITClubs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PendingApproval from "./pages/PendingApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAuth from "./components/RequireAuth";
import AdminRoute from "./components/AdminRoute";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import CareerPaths from "./pages/CareerPaths";
import PendingAccessMessage from "./components/portal/PendingAccessMessage";
import ModeratorRoute from "./components/ModeratorRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPending = lazy(() => import("./pages/admin/PendingStudents"));
const AdminStudents = lazy(() => import("./pages/admin/StudentsList"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminPendingResources = lazy(() => import("./pages/admin/PendingResources"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminRoadmapManagement = lazy(() => import("./pages/admin/Roadmaps/RoadmapManagement"));
const AdminRoadmapBuilder = lazy(() => import("./pages/admin/Roadmaps/RoadmapBuilder"));
const AdminRegistrationWhitelist = lazy(() => import("./pages/admin/RegistrationWhitelist"));
const AdminCampuses = lazy(() => import("./pages/admin/Campuses"));

const Dashboard = lazy(() => import("./pages/portal/Dashboard"));
const Notifications = lazy(() => import("./pages/portal/Notifications"));
const Roadmaps = lazy(() => import("./pages/portal/Roadmaps"));
const RoadmapView = lazy(() => import("./pages/portal/RoadmapView"));
const Discussions = lazy(() => import("./pages/portal/Discussions"));
const CreateDiscussion = lazy(() => import("./pages/portal/CreateDiscussion"));
const EditDiscussion = lazy(() => import("./pages/portal/EditDiscussion"));

const SavedDiscussions = lazy(() => import("./pages/portal/SavedDiscussions"));
const Groups = lazy(() => import("./pages/portal/Groups"));
const CreateGroup = lazy(() => import("./pages/portal/CreateGroup"));
const Clubs = lazy(() => import("./pages/portal/Clubs"));
const Resources = lazy(() => import("./pages/portal/Resources"));
const ManageContent = lazy(() => import("./pages/portal/ManageContent"));
const Feed = lazy(() => import("./pages/portal/Feed"));
const Profile = lazy(() => import("./pages/portal/Profile"));
const GroupDetail = lazy(() => import("./pages/portal/GroupDetail"));
const GroupProfile = lazy(() => import("./pages/portal/GroupProfile"));
const DiscussionDetail = lazy(() => import("./pages/portal/DiscussionDetail"));
const ClubDetail = lazy(() => import("./pages/portal/ClubDetail"));

const publicRoutes = [
  { path: "/", element: <RedirectIfAuthenticated /> },
  { path: "/it-fields", element: <ITFields /> },
  { path: "/academic-guide", element: <AcademicGuide /> },
  { path: "/it-jobs", element: <ITJobs /> },
  { path: "/it-clubs", element: <ITClubs /> },
  { path: "/career-paths", element: <CareerPaths /> },
];

const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
];

const requireAuthRoutes = [
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/pending-approval", element: <PendingApproval /> },
];

const adminRoutes = [
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/admin/pending", element: <AdminPending /> },
  { path: "/admin/students", element: <AdminStudents /> },
  { path: "/admin/reports", element: <AdminReports /> },
  { path: "/admin/logs", element: <AdminLogs /> },
  { path: "/admin/roadmaps", element: <AdminRoadmapManagement /> },
  { path: "/admin/roadmaps/:id/builder", element: <AdminRoadmapBuilder /> },
  { path: "/admin/registration-whitelist", element: <AdminRegistrationWhitelist /> },
  { path: "/admin/campuses", element: <AdminCampuses /> },
  { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },

  { path: "/admin/reference/it-fields", element: <ItFieldsAdmin /> },
  { path: "/admin/reference/academic-degrees", element: <AcademicDegreesAdmin /> },
  { path: "/admin/reference/it-jobs", element: <ItJobsAdmin /> },
  { path: "/admin/reference/it-clubs", element: <ItClubsAdmin /> },
  { path: "/admin/reference/programs", element: <ProgramsAdmin /> },
  { path: "/admin/reference/tags", element: <TagsAdmin /> },
];

const moderatorRoutes = [
  { path: "/admin/resources/pending", element: <AdminPendingResources /> },
];

const portalRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/roadmaps", element: <Roadmaps /> },
  { path: "/roadmaps/:id", element: <RoadmapView /> },
  { path: "/discussions", element: <Discussions /> },
  { path: "/discussions/new", element: <CreateDiscussion /> },

  { path: "/discussions/saved", element: <SavedDiscussions /> },
  { path: "/discussions/:id/edit", element: <EditDiscussion /> },
  { path: "/discussions/:id", element: <DiscussionDetail /> },
  { path: "/groups", element: <Groups /> },
  { path: "/groups/new", element: <CreateGroup /> },
  { path: "/groups/:id", element: <GroupDetail /> },
  { path: "/groups/:id/profile", element: <GroupProfile /> },
  { path: "/clubs", element: <Clubs /> },
  { path: "/clubs/:slug", element: <ClubDetail /> },
  { path: "/resources", element: <Resources /> },
  { path: "/feed", element: <Feed /> },
  { path: "/manage", element: <ManageContent /> },
  { path: "/profile/:userId", element: <Profile /> },
  { path: "/it-fields", element: <ITFields /> },
  { path: "/academic-guide", element: <AcademicGuide /> },
  { path: "/it-jobs", element: <ITJobs /> },
  { path: "/it-clubs", element: <ITClubs /> },
  { path: "/career-paths", element: <CareerPaths /> },
];

const PageLoader = () => (
  <LoadingSpinner
    size="sm"
    className="min-h-[60vh] py-0"
  />
);

const PublicNavbarWrapper = ({ variant, user }) => {
  const { toggle } = useSidebar();
  return (
    <>
      <Navbar onMobileMenuToggle={toggle} variant={variant} user={user} />
      <PublicMobileMenuWrapper variant={variant} user={user} />
    </>
  );
};

const PublicMobileMenuWrapper = ({ variant, user }) => {
  const { isMobileOpen, closeMobile } = useSidebar();
  return (
    <MobileMenu isOpen={isMobileOpen} onClose={closeMobile} variant={variant} user={user} />
  );
};

const PublicSidebarWrapper = ({ isAdmin }) => {
  const { isMobile } = useSidebar();
  if (isMobile) return null;
  return isAdmin ? <AdminSidebar /> : <Sidebar />;
};

const PublicMainWrapper = ({ isAdminRoute, children }) => {
  const { isCollapsed } = useSidebar();
  const mlClass = !isAdminRoute
    ? "lg:ml-64"
    : isCollapsed
    ? "lg:ml-[4.5rem]"
    : "lg:ml-64";
  return (
    <main
      className={`w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 transition-all duration-300 ${mlClass}`}
    >
      {children}
    </main>
  );
};

function PublicLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const navbarVariant = isAdminRoute ? "admin" : "public";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-bg-main text-text-main transition-colors duration-300">
        <PublicNavbarWrapper variant={navbarVariant} user={user} />
        <div className="flex-1 flex pt-16">
          <PublicSidebarWrapper isAdmin={isAdminRoute} />
          <PublicMainWrapper isAdminRoute={isAdminRoute}>
            <Routes>
              {publicRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              <Route element={<PublicRoute />}>
                {authRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Route>

              <Route element={<RequireAuth />}>
                {requireAuthRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Route>

              <Route element={<AdminRoute />}>
                {adminRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Route>

              <Route element={<ModeratorRoute />}>
                {moderatorRoutes.map(({ path, element }) => (
                  <Route key={path} path={path} element={element} />
                ))}
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PublicMainWrapper>
        </div>
        <Footer withSidebarOffset />
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen bg-bg-main py-0" />;
  }

  const portalPaths = [
    "/dashboard",
    "/notifications",
    "/roadmaps",
    "/discussions",
    "/groups",
    "/clubs",
    "/resources",
    "/manage",
    "/profile",
    "/feed",
    "/it-fields",
    "/academic-guide",
    "/it-jobs",
    "/it-clubs",
    "/career-paths",
  ];

  const isPortalRoute = portalPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  const isApprovedUser = user?.student_status === "approved";
  const isPendingUser =
    isAuthenticated &&
    user?.email_status === "verified" &&
    user?.student_status === "pending";

  if (isPortalRoute && isPendingUser) {
    return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="*" element={<PendingAccessMessage />} />
        </Route>
      </Routes>
    );
  }

  if (isPortalRoute && isApprovedUser) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
              {portalRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
              {}
              <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return <PublicLayout />;
}

function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        }
      />
    </Router>
  );
}

export default App;