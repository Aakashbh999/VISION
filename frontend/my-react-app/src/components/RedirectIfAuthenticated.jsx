import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";

const RedirectIfAuthenticated = () => {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  const isApproved = user?.student_status === "approved";
  return isApproved ? <Navigate to="/dashboard" replace /> : <Home />;
};

export default RedirectIfAuthenticated;
