import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!isAuthenticated)
      navigate("/login", { replace: true, state: { from: pathname + search } }); //AUTHENTICATION
  }, [isAuthenticated, navigate, pathname, search]);

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
