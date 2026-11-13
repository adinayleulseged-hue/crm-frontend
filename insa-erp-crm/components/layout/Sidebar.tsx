"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import InsaLogo from "@/components/ui/InsaLogo";
import {
  LayoutDashboard,
  Users,
  Target,
  ShoppingCart,
  Building2,
  FileText,
  CreditCard,
  Megaphone,
  BarChart3,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Bell,
  LogOut,
  Menu,
  Package,
  UserCheck,
} from "lucide-react";

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

function getRoleDashboardPath(role: string): string {
  const r = (role || "").toLowerCase();
  if (r.includes("customer") || r.includes("client")) return "/dashboard/customer";
  if (r.includes("sales manager") || r.includes("sales_manager")) return "/dashboard/sales-manager";
  if (r.includes("auditor")) return "/dashboard/auditor";
  if (r.includes("account manager") || r.includes("account_manager")) return "/dashboard/account-manager";
  if (r.includes("marketing")) return "/dashboard/marketing-manager";
  return "/dashboard/sales-rep";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [salesCrmOpen, setSalesCrmOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo>({
    name: "Salam Haile",
    role: "Sales Officer",
    email: "salam.haile@insa.gov.et",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) setUser(parsed);
      }
    } catch {
      // keep default
    }
  }, []);

  const handleLogout = () => {
    ["crm_auth_token", "token", "accessToken", "crm_user", "user"].forEach(
      (k) => localStorage.removeItem(k)
    );
    ["crm_auth_token", "token", "crm_user"].forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    window.location.href = "/login";
  };

  const crmSubItems = [
    { title: "Dashboard", href: "/crm/dashboard", icon: LayoutDashboard },
    { title: "Products", href: "/crm/products", icon: Package },
    { title: "Leads", href: "/crm/leads", icon: Users },
    { title: "Sales Deals", href: "/crm/sales-deals", icon: Target },
    { title: "Quotations", href: "/crm/quotations", icon: FileText },
    { title: "Sales Orders", href: "/crm/orders", icon: ShoppingCart },
    { title: "Customers", href: "/crm/customers", icon: Building2 },
    { title: "Invoices", href: "/crm/invoices", icon: FileText },
    { title: "Payments", href: "/crm/payments", icon: CreditCard },
    { title: "Campaigns", href: "/crm/campaigns", icon: Megaphone },
    { title: "Reports", href: "/crm/reports", icon: BarChart3 },
    { title: "Segments", href: "/crm/segments", icon: Layers },
    { title: "Audit Log", href: "/crm/audit", icon: ShieldCheck },
  ];

  const isCrmActive = pathname.startsWith("/crm");
  const sidebarWidth = collapsed ? "72px" : "260px";

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        height: "100vh",
        width: sidebarWidth,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #071d3a 0%, #08213f 100%)",
        color: "white",
        userSelect: "none",
        boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}
    >
      {/* ─── HEADER LOGO ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "18px 16px",
          minHeight: 72,
        }}
      >
        {/* INSA Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            flexShrink: 0,
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            padding: 4,
          }}
        >
          <InsaLogo size={32} />
        </div>

        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3, color: "white" }}>
              Information Network
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.3, color: "white" }}>
              Security Administration
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(147,197,253,0.7)", marginTop: 2 }}>
              Enterprise Resource Planning
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "rgba(147,197,253,0.8)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* ─── NAV MENU ─── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.6px",
              color: "rgba(147,197,253,0.45)",
              textTransform: "uppercase",
              paddingLeft: 8,
              marginBottom: 8,
            }}
          >
            Main Menu
          </div>
        )}

        {/* Role Dashboard Link */}
        <Link
          href={getRoleDashboardPath(user.role)}
          title={collapsed ? "My Role Dashboard" : undefined}
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            borderRadius: 10,
            padding: collapsed ? "10px" : "10px 12px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            color: pathname.startsWith("/dashboard") ? "white" : "rgba(191,219,254,0.85)",
            background: pathname.startsWith("/dashboard") ? "rgba(200,16,46,0.22)" : "transparent",
            marginBottom: 6,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!pathname.startsWith("/dashboard")) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            if (!pathname.startsWith("/dashboard")) (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <UserCheck style={{ width: 15, height: 15, color: "#60a5fa" }} />
          </div>
          {!collapsed && <span>Role Dashboard</span>}
        </Link>

        {/* Sales & CRM Dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setSalesCrmOpen((o) => !o)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              gap: 10,
              borderRadius: 10,
              padding: collapsed ? "10px" : "10px 12px",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: isCrmActive ? "rgba(200,16,46,0.18)" : "transparent",
              color: isCrmActive ? "white" : "rgba(191,219,254,0.85)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isCrmActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              if (!isCrmActive) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            title="Sales & CRM"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}
              >
                <ShoppingCart style={{ width: 15, height: 15, color: "rgba(147,197,253,0.9)" }} />
              </div>
              {!collapsed && <span>Sales &amp; CRM</span>}
            </div>
            {!collapsed && (
              salesCrmOpen
                ? <ChevronUp style={{ width: 14, height: 14, color: "rgba(147,197,253,0.6)" }} />
                : <ChevronDown style={{ width: 14, height: 14, color: "rgba(147,197,253,0.6)" }} />
            )}
          </button>

          {/* Sub-items */}
          {salesCrmOpen && (
            <div
              style={{
                marginTop: 4,
                paddingLeft: collapsed ? 0 : 20,
                borderLeft: collapsed ? "none" : "1px solid rgba(255,255,255,0.08)",
                marginLeft: collapsed ? 0 : 18,
              }}
            >
              {crmSubItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/crm/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 8,
                      padding: collapsed ? "8px 6px" : "8px 10px",
                      marginBottom: 2,
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: "none",
                      color: isActive ? "white" : "rgba(191,219,254,0.75)",
                      background: isActive
                        ? "#c8102e"
                        : "transparent",
                      transition: "background 0.15s, color 0.15s",
                      boxShadow: isActive ? "0 2px 8px rgba(200,16,46,0.3)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLElement).style.color = "white";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "rgba(191,219,254,0.75)";
                      }
                    }}
                  >
                    {collapsed ? (
                      <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    ) : (
                      <>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: isActive ? "white" : "rgba(147,197,253,0.4)",
                            flexShrink: 0,
                          }}
                        />
                        <span>{item.title}</span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Approvals widget */}
        {!collapsed && (
          <div
            style={{
              marginTop: 20,
              borderRadius: 12,
              border: "1px solid rgba(96,165,250,0.15)",
              background: "rgba(12,43,91,0.9)",
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "rgba(191,219,254,0.9)" }}>
              <Bell style={{ width: 14, height: 14, color: "rgba(147,197,253,0.8)" }} />
              <span>6 Pending Approvals</span>
            </div>
            <p style={{ margin: "4px 0 0 22px", fontSize: 10, color: "rgba(147,197,253,0.65)" }}>
              Action required
            </p>
          </div>
        )}
      </div>

      {/* ─── USER PROFILE ─── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 10px",
          background: "rgba(5,22,46,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            borderRadius: 10,
            background: "rgba(12,43,91,0.5)",
            padding: collapsed ? "8px" : "10px 12px",
            gap: 10,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1b3b6f, #0f2d5a)",
              fontSize: 12,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            {getInitials(user.name)}
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#c8102e" }}>
                  {user.role}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "rgba(147,197,253,0.7)",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(200,16,46,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "#c8102e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(147,197,253,0.7)";
                }}
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </>
          )}
        </div>

        {/* Logout button when collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: 6,
              padding: "8px 0",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "rgba(147,197,253,0.7)",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(200,16,46,0.2)";
              (e.currentTarget as HTMLElement).style.color = "#c8102e";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(147,197,253,0.7)";
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>
    </aside>
  );
}