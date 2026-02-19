import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";

const RedirectIfAuthenticated = () => {
  const { user } = useAuth();
  const isApproved = user?.student_status === "approved";
  return isApproved ? <Navigate to="/portal/dashboard" replace /> : <Home />;
};

export default RedirectIfAuthenticated;
