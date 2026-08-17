import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Admins and Sellers only ever see the dashboard — bounce them off every storefront route.
export function ShopperRoute() {
  const { isDashboardOnly } = useAuth();
  if (isDashboardOnly) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function DashboardRoute() {
  const { isAuthenticated, isAdmin, isSeller } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin && !isSeller) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function AdminOnlyRoute() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
