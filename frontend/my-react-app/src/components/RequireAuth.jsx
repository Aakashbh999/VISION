import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

/**
 * RequireAuth - Requires user to be logged in but doesn't check email/student status
 * Use this for pages like verify-email and pending-approval
 */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children ? children : <Outlet />;
};

export default RequireAuth;
