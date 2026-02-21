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
//import PortalSidebar from "./components/portal/PortalSidebar";
import MobileMenu from "./components/layout/MobileMenu";
import Footer from "./components/layout/Footer";
import ITFields from "./pages/ITFields";
import AcademicGuide from "./pages/AcademicGuide";
import ITJobs from "./pages/ITJobs";
import ITClubs from "./pages/ITClubs";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import VerifyEmail from "./pages/VerifyEmail";
// import PendingApproval from "./pages/PendingApproval";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Dashboard from "./pages/portal/Dashboard";
// import Notifications from "./pages/portal/Notifications";
// import Roadmaps from "./pages/portal/Roadmaps";
// import RoadmapDetail from "./pages/portal/RoadmapDetail";
// import Discussions from "./pages/portal/Discussions";
// import DiscussionDetail from "./pages/portal/DiscussionDetail";
// import CreateDiscussion from "./pages/portal/CreateDiscussion";
// import Groups from "./pages/portal/Groups";
// import GroupDetail from "./pages/portal/GroupDetail";
// import CreateGroup from "./pages/portal/CreateGroup";
// import Clubs from "./pages/portal/Clubs";
// import ClubDetail from "./pages/portal/ClubDetail";
// import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
// import CareerPaths from "./pages/CareerPaths";

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

  // Show portal layout for approved users on ALL pages
  const showPortalLayout = user?.student_status === "approved";
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant={showPortalLayout ? "portal" : "public"}
        user={showPortalLayout ? user : null}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        variant={showPortalLayout ? "portal" : "public"}
        user={showPortalLayout ? user : null}
      />

      {/* Main content area – grows to push footer down */}
      <div className="flex-1 flex pt-16">
        {/* Show portal sidebar for approved users, otherwise public sidebar */}
        {showPortalLayout ? <PortalSidebar /> : <Sidebar />}

        <main
          className={`w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 ${
            showPortalLayout ? "lg:ml-64" : "lg:ml-64"
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
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

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
