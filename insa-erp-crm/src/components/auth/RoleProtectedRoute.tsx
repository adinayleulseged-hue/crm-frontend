"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requirePermissions?: string[];
  redirectTo?: string;
}

/**
 * Wrapper component that protects routes based on user role
 * Redirects unauthorized users to their appropriate dashboard
 */
export default function RoleProtectedRoute({
  children,
  allowedRoles,
  requirePermissions,
  redirectTo,
}: RoleProtectedRouteProps) {
  const { user, ready, canAccessRoute, getDefaultDashboard } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth to be ready
    if (!ready) return;

    // Not logged in - redirect to login
    if (!user) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Helper function to check role matching flexibly
    const checkRoleMatch = (userRoleStr: string, targetRoleStr: string): boolean => {
      const u = (userRoleStr || "").toUpperCase().trim();
      const t = (targetRoleStr || "").toUpperCase().trim();
      if (u === t) return true;
      if (t === "ADMIN" && (u.includes("ADMIN") || u.includes("SUPER") || u.includes("ROOT"))) return true;
      if (t.includes("FINANCE") && (u.includes("FINANCE") || u.includes("FMS"))) return true;
      if (t.includes("AUDITOR") && u.includes("AUDITOR")) return true;
      if (t.includes("SALES_MANAGER") && (u.includes("SALES MANAGER") || u.includes("SALES_MANAGER") || u.includes("ADMIN"))) return true;
      if (t.includes("SALES") && (u.includes("SALES") || u.includes("OFFICER") || u.includes("REP") || u.includes("ADMIN"))) return true;
      if (t.includes("CUSTOMER") && (u.includes("CUSTOMER") || u.includes("CLIENT"))) return true;
      return false;
    };

    // Check role-based access if allowedRoles specified
    const hasRoleAccess = !allowedRoles || allowedRoles.length === 0 || allowedRoles.some(
      (role) => checkRoleMatch(user.role, role)
    );

    // If not authorized, redirect to appropriate dashboard
    if (!hasRouteAccess && !hasRoleAccess) {
      const defaultDash = redirectTo || getDefaultDashboard();
      console.warn(`[RoleProtectedRoute] User ${user.role} denied access to ${pathname}, redirecting to ${defaultDash}`);
      router.push(defaultDash);
      return;
    }
  }, [user, ready, pathname, allowedRoles, router, canAccessRoute, getDefaultDashboard, redirectTo]);

  // Show loading while checking auth
  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#071d3a"
      }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
          Verifying access...
        </div>
      </div>
    );
  }

  // Not logged in - show nothing (will redirect)
  if (!user) {
    return null;
  }

  // Check access again before rendering
  const checkRoleMatch = (userRoleStr: string, targetRoleStr: string): boolean => {
    const u = (userRoleStr || "").toUpperCase().trim();
    const t = (targetRoleStr || "").toUpperCase().trim();
    if (u === t) return true;
    if (t === "ADMIN" && (u.includes("ADMIN") || u.includes("SUPER") || u.includes("ROOT"))) return true;
    if (t.includes("FINANCE") && (u.includes("FINANCE") || u.includes("FMS"))) return true;
    if (t.includes("AUDITOR") && u.includes("AUDITOR")) return true;
    if (t.includes("SALES_MANAGER") && (u.includes("SALES MANAGER") || u.includes("SALES_MANAGER") || u.includes("ADMIN"))) return true;
    if (t.includes("SALES") && (u.includes("SALES") || u.includes("OFFICER") || u.includes("REP") || u.includes("ADMIN"))) return true;
    if (t.includes("CUSTOMER") && (u.includes("CUSTOMER") || u.includes("CLIENT"))) return true;
    return false;
  };

  const hasRouteAccess = canAccessRoute(pathname);
  const hasRoleAccess = !allowedRoles || allowedRoles.length === 0 || allowedRoles.some(
    (role) => checkRoleMatch(user.role, role)
  );

  // Unauthorized - show nothing (will redirect)
  if (!hasRouteAccess && !hasRoleAccess) {
    return null;
  }

  // Authorized - render children
  return <>{children}</>;
}
