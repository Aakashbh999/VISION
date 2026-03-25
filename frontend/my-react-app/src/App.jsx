import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import MainLayout from "./components/layout/MainLayout";
import AdminSidebar from "./components/admin/AdminSidebar";
import MobileMenu from "./components/layout/MobileMenu";
import Footer from "./components/layout/Footer";
import ITFields from "./pages/ITFields";
import AcademicGuide from "./pages/AcademicGuide";
import ITJobs from "./pages/ITJobs";
import ITClubs from "./pages/ITClubs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import PendingApproval from "./pages/PendingApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAuth from "./components/RequireAuth";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./pages/portal/Dashboard";
import Notifications from "./pages/portal/Notifications";
import Roadmaps from "./pages/portal/Roadmaps";
import RoadmapView from "./pages/portal/RoadmapView";
import Discussions from "./pages/portal/Discussions";
import CreateDiscussion from "./pages/portal/CreateDiscussion";
import EditDiscussion from "./pages/portal/EditDiscussion";
import MyPosts from "./pages/portal/MyPosts";
import SavedDiscussions from "./pages/portal/SavedDiscussions";
import Groups from "./pages/portal/Groups";
import CreateGroup from "./pages/portal/CreateGroup";
import Clubs from "./pages/portal/Clubs";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import CareerPaths from "./pages/CareerPaths";
import Resources from "./pages/portal/Resources";
import MyResources from "./pages/portal/MyResources";
import ManageContent from "./pages/portal/ManageContent";
import PendingAccessMessage from "./components/portal/PendingAccessMessage";
// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPending from "./pages/admin/PendingStudents";
import AdminStudents from "./pages/admin/StudentsList";
import AdminReports from "./pages/admin/Reports";
import AdminPendingResources from "./pages/admin/PendingResources";
import ModeratorRoute from "./components/ModeratorRoute";

// Lazy-loaded heavy pages (reduces initial bundle size significantly)
const Profile = lazy(() => import("./pages/portal/Profile"));
const GroupDetail = lazy(() => import("./pages/portal/GroupDetail"));
const GroupProfile = lazy(() => import("./pages/portal/GroupProfile"));
const DiscussionDetail = lazy(() => import("./pages/portal/DiscussionDetail"));
const ClubDetail = lazy(() => import("./pages/portal/ClubDetail"));

// Route Configurations
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
  { path: "/admin", element: <AdminDashboard /> },
];

const moderatorRoutes = [
  { path: "/admin/resources/pending", element: <AdminPendingResources /> },
];
const portalContentRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/roadmaps", element: <Roadmaps /> },
  { path: "/roadmaps/:id", element: <RoadmapView /> },
  { path: "/discussions", element: <Discussions /> },
  { path: "/discussions/new", element: <CreateDiscussion /> },
  { path: "/discussions/my-posts", element: <MyPosts /> },
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
  { path: "/resources/my", element: <MyResources /> },
  { path: "/manage", element: <ManageContent /> },
  { path: "/profile/:userId", element: <Profile /> },
];

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-main">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600"></div>
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  </div>
);

// Suspense fallback for lazy pages
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600" />
      <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Loading page...</p>
    </div>
  </div>
);

// Layout for public/non-portal pages
function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navbarVariant = isAdminRoute ? "admin" : "public";

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main transition-colors duration-300">
      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant={navbarVariant}
        user={user}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        variant={navbarVariant}
        user={user}
      />

      <div className="flex-1 flex pt-16">
        {isAdminRoute && <AdminSidebar />}
        {!isAdminRoute && <Sidebar />}

        <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 lg:ml-64">
          <Routes>
            {/* Public routes */}
            {publicRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            {/* Auth routes */}
            <Route element={<PublicRoute />}>
              {authRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* Require Auth routes */}
            <Route element={<RequireAuth />}>
              {requireAuthRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              {adminRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* Moderator routes */}
            <Route element={<ModeratorRoute />}>
              {moderatorRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            <Route path="/portal/*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Footer withSidebarOffset />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Portal paths that should use MainLayout
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
  ];
  
  const isPortalRoute = portalPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
  );
  
  const isApprovedUser = user?.student_status === "approved";
  const isPendingUser =
    isAuthenticated &&
    user?.email_status === "verified" &&
    user?.student_status === "pending";

  // Limited portal for pending users - only dashboard and profile
  if (isPortalRoute && isPendingUser) {
    return (
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<PendingAccessMessage />} />
        </Route>
      </Routes>
    );
  }

  // Use MainLayout for portal routes when user is approved
  if (isPortalRoute && isApprovedUser) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute />}>
              {portalContentRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
              <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    );
  }

  // Use PublicLayout for non-portal routes
  return <PublicLayout />;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
