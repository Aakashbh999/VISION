import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admin accounts are not subject to student verification/approval gates.
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check student status
  if (user?.email_status !== "verified") {
    return <Navigate to="/verify-email" replace />;
  }
  if (user?.student_status !== "approved") {
    return <Navigate to="/pending-approval" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
