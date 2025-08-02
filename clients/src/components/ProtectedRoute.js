// components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useWeb3 } from "../context/Web3Context";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = "/",
}) => {
  const { account, user, loading } = useWeb3();
  const navigate = useNavigate();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (loading) return;

    // Case: Wallet not connected
    if (requireAuth && !account) {
      toast.error("Please connect your wallet to access this page");
      setRedirectPath(redirectTo);
      return;
    }

    // Case: Wallet connected but user not registered
    if (requireAuth && account && !user?.isRegistered) {
      toast.error("Please register to access this page");
      setRedirectPath("/register");
      return;
    }

    // Case: Role-based restriction
    if (allowedRoles.length > 0 && user?.isRegistered) {
      const userRole =
        user.userType === "0"
          ? "client"
          : user.userType === "1"
          ? "freelancer"
          : "both";

      if (!allowedRoles.includes(userRole) && !allowedRoles.includes("both")) {
        toast.error("You do not have permission to access this page");
        setRedirectPath("/dashboard");
        return;
      }
    }

    // Case: Already authenticated, but visiting login/register (requireAuth = false)
    if (!requireAuth && account && user?.isRegistered) {
      setRedirectPath("/dashboard");
    }
  }, [account, user, loading, requireAuth, allowedRoles, redirectTo]);

  // Wait for user state to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  // If a redirect path was set, navigate there
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // Allow access
  return children;
};

export default ProtectedRoute;
