import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import { getUserLandingPath } from "../utils/authRedirect";

const RedirectIfAuthenticated = () => {
  const { user } = useAuth();
  const landingPath = getUserLandingPath(user);
  return landingPath ? <Navigate to={landingPath} replace /> : <Home />;
};

export default RedirectIfAuthenticated;
