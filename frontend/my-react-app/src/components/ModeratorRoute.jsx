import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

const ModeratorRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin" && !user.is_moderator)
    return <Navigate to="/dashboard" replace />;

  return children ? children : <Outlet />;
};

export default ModeratorRoute;
