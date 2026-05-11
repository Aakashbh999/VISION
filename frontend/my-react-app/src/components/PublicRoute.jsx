import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import { getUserLandingPath } from "../utils/authRedirect";

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  const landingPath = getUserLandingPath(user);

  if (landingPath === "/dashboard" || landingPath === "/admin/dashboard") {
    return <Navigate to={landingPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
