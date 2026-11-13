"use client";

import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/app/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (user?.role) {
      const r = user.role.toLowerCase();
      // Strict Customer Role Isolation: Customers cannot access internal CRM staff routes
      if (r.includes("customer") || r.includes("client")) {
        window.location.href = "/customer/dashboard";
      }
    }
  }, [ready, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <Sidebar />

      {/* Main content area — shifts right by sidebar width */}
      <div
        style={{
          marginLeft: 260,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        id="dashboard-main"
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: "24px 28px",
            maxWidth: 1600,
            width: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}