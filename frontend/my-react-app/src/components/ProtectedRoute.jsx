import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import { getUserLandingPath } from "../utils/authRedirect";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const nextPath = getUserLandingPath(user);
  if (nextPath && nextPath !== "/dashboard") {
    return <Navigate to={nextPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
