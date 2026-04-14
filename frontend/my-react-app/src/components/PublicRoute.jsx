import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import { getUserLandingPath } from "../utils/authRedirect";

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  const landingPath = getUserLandingPath(user);

  // Let incomplete onboarding users access auth pages.
  if (landingPath === "/dashboard" || landingPath === "/admin/dashboard") {
    return <Navigate to={landingPath} replace />;
  }

  // If user is logged in but not verified/approved, they should stay on public pages
  // but maybe we want to show a message? For now, allow access to public pages.
  return children ? children : <Outlet />;
};

export default PublicRoute;
