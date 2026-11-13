"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  getDefaultDashboard,
  isAdmin,
  isCustomer,
  Permission,
} from "@/utils/permissions";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  username?: string;
  organization?: string;
}

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  ready: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  switchRole: () => void;
  refreshUser: (updated: UserProfile) => void;
  // Permission checking functions
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  getDefaultDashboard: () => string;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/** Write a cookie with a 7-day expiry */
function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Expire a cookie immediately */
function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken =
      localStorage.getItem("crm_auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");
    const storedUser =
      localStorage.getItem("crm_user") || localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setTokenState(storedToken);
        setUser(parsed);
        // Re-stamp cookies so they don't expire mid-session
        setCookie("crm_auth_token", storedToken);
        setCookie("token", storedToken);
        setCookie("crm_user", storedUser);
      } catch {
        // corrupted storage — clear it
        localStorage.clear();
      }
    }
    setReady(true);
  }, []);

  const login = (newToken: string, userInfo: UserProfile) => {
    const userStr = JSON.stringify(userInfo);
    setTokenState(newToken);
    setUser(userInfo);
    // localStorage
    localStorage.setItem("crm_auth_token", newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("crm_user", userStr);
    localStorage.setItem("user", userStr);
    // Cookies (with 7-day expiry so middleware always reads them)
    setCookie("crm_auth_token", newToken);
    setCookie("token", newToken);
    setCookie("crm_user", userStr);
  };

  const clearAuth = () => {
    setTokenState(null);
    setUser(null);
    ["crm_auth_token", "token", "accessToken", "crm_user", "user"].forEach(
      (k) => localStorage.removeItem(k)
    );
    deleteCookie("crm_auth_token");
    deleteCookie("token");
    deleteCookie("crm_user");
  };

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const switchRole = () => {
    clearAuth();
    window.location.href = "/dashboard";
  };

  const refreshUser = (updated: UserProfile) => {
    setUser(updated);
    const userStr = JSON.stringify(updated);
    localStorage.setItem("crm_user", userStr);
    localStorage.setItem("user", userStr);
    setCookie("crm_user", userStr);
  };

  // Permission checking functions that use current user's role
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(user?.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return hasAnyPermission(user?.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return hasAllPermissions(user?.role, permissions);
  };

  const checkCanAccessRoute = (route: string): boolean => {
    return canAccessRoute(user?.role, route);
  };

  const getUserDefaultDashboard = (): string => {
    return getDefaultDashboard(user?.role);
  };

  const checkIsAdmin = (): boolean => {
    return isAdmin(user?.role);
  };

  const checkIsCustomer = (): boolean => {
    return isCustomer(user?.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        login,
        logout,
        switchRole,
        refreshUser,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        canAccessRoute: checkCanAccessRoute,
        getDefaultDashboard: getUserDefaultDashboard,
        isAdmin: checkIsAdmin,
        isCustomer: checkIsCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

