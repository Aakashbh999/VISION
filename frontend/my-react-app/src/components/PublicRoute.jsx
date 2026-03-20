import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  // If user is fully authenticated and approved, redirect to dashboard
  if (
    user &&
    user.email_status === "verified" &&
    user.student_status === "approved"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in but not verified/approved, they should stay on public pages
  // but maybe we want to show a message? For now, allow access to public pages.
  return children ? children : <Outlet />;
};

export default PublicRoute;
