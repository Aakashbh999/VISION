import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./components/PublicRoute";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import PortalSidebar from "./components/portal/PortalSidebar";
import AdminSidebar from "./components/admin/AdminSidebar"; // import admin sidebar
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
import RoadmapDetail from "./pages/portal/RoadmapDetail";
import Discussions from "./pages/portal/Discussions";
import DiscussionDetail from "./pages/portal/DiscussionDetail";
import CreateDiscussion from "./pages/portal/CreateDiscussion";
import EditDiscussion from "./pages/portal/EditDiscussion";
import MyPosts from "./pages/portal/MyPosts";
import SavedDiscussions from "./pages/portal/SavedDiscussions";
import Groups from "./pages/portal/Groups";
import GroupDetail from "./pages/portal/GroupDetail";
import CreateGroup from "./pages/portal/CreateGroup";
import Clubs from "./pages/portal/Clubs";
import ClubDetail from "./pages/portal/ClubDetail";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import CareerPaths from "./pages/CareerPaths";
// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPending from "./pages/admin/PendingStudents";
import AdminStudents from "./pages/admin/StudentsList";
import AdminReports from "./pages/admin/Reports";

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading } = useAuth();

  // Show a full-page spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPortalRoute = location.pathname.startsWith("/portal");
  const showPortalLayout = !isAdminRoute && user?.student_status === "approved";

  // Determine navbar variant
  const navbarVariant = isAdminRoute
    ? "admin"
    : showPortalLayout
      ? "portal"
      : "public";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
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

      {/* Main content area – grows to push footer down */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar conditional */}
        {isAdminRoute && <AdminSidebar />}
        {!isAdminRoute && showPortalLayout && <PortalSidebar />}
        {!isAdminRoute && !showPortalLayout && <Sidebar />}

        <main
          className={`w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 ${
            // All sidebars are fixed with w-64, so always apply margin on desktop
            "lg:ml-64"
          }`}
        >
          <Routes>
            {/* Public routes (accessible to everyone) */}
            <Route path="/" element={<RedirectIfAuthenticated />} />
            <Route path="/it-fields" element={<ITFields />} />
            <Route path="/academic-guide" element={<AcademicGuide />} />
            <Route path="/it-jobs" element={<ITJobs />} />
            <Route path="/it-clubs" element={<ITClubs />} />
            <Route path="/career-paths" element={<CareerPaths />} />

            {/* Auth routes with PublicRoute protection */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <RequireAuth>
                  <VerifyEmail />
                </RequireAuth>
              }
            />
            <Route
              path="/pending-approval"
              element={
                <RequireAuth>
                  <PendingApproval />
                </RequireAuth>
              }
            />

            {/* Admin routes (protected by AdminRoute) */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/pending"
              element={
                <AdminRoute>
                  <AdminPending />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminRoute>
                  <AdminStudents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Protected portal routes */}
            <Route
              path="/portal/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/roadmaps"
              element={
                <ProtectedRoute>
                  <Roadmaps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/roadmaps/:id"
              element={
                <ProtectedRoute>
                  <RoadmapDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions"
              element={
                <ProtectedRoute>
                  <Discussions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions/new"
              element={
                <ProtectedRoute>
                  <CreateDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions/my-posts"
              element={
                <ProtectedRoute>
                  <MyPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions/saved"
              element={
                <ProtectedRoute>
                  <SavedDiscussions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions/:id/edit"
              element={
                <ProtectedRoute>
                  <EditDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/discussions/:id"
              element={
                <ProtectedRoute>
                  <DiscussionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/groups"
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/groups/new"
              element={
                <ProtectedRoute>
                  <CreateGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/clubs"
              element={
                <ProtectedRoute>
                  <Clubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/clubs/:id"
              element={
                <ProtectedRoute>
                  <ClubDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
