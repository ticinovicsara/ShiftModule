import type { UserRole } from "@repo/types";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_PATHS } from "../constants";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("ProtectedRoute must be used within AuthProvider");
  }

  const { role, isAuthenticated, isLoading } = auth;

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />;
  }

  return <Outlet />;
}
