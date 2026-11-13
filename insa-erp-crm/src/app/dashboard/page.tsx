"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import InsaLogo from "@/components/ui/InsaLogo";

const roleCards = [
  { key: "admin",             name: "System Admin",     path: "/dashboard/admin",              emoji: "🛡️", description: "Manage users, IAM roles, security configurations, and node operations",         color: "#dc2626", badge: "Admin",      roleMatch: (r: string) => r.includes("admin") },
  { key: "sales-officer",     name: "Sales Officer",    path: "/dashboard/sales-officer",      emoji: "💼", description: "Manage customers, track leads & sales deals, create orders, and drive sales",  color: "#c8102e", badge: "Sales Officer", roleMatch: (r: string) => r.includes("officer") || r.includes("sales") || r.includes("sales_officer") || r.includes("sales rep") },
  { key: "sales-manager",     name: "Sales Manager",    path: "/dashboard/sales-manager",      emoji: "📊", description: "Approve orders, monitor team performance, and set sales targets",              color: "#1d4ed8", badge: "Management", roleMatch: (r: string) => r.includes("sales manager") || r.includes("sales_manager") },
  { key: "finance-officer",   name: "Finance Officer",  path: "/dashboard/finance-officer",    emoji: "💰", description: "Monitor invoices, payments, billing, and financial reports",                  color: "#dc2626", badge: "Finance",    roleMatch: (r: string) => r.includes("finance") || r.includes("fms") || r.includes("finance_officer") },
  { key: "auditor",           name: "Auditor",          path: "/dashboard/auditor",            emoji: "🔍", description: "Review audit trails, run compliance checks, and generate reports",             color: "#f59e0b", badge: "Compliance", roleMatch: (r: string) => r.includes("auditor") },
  { key: "customer",          name: "Customer Portal",  path: "/dashboard/customer",           emoji: "🏢", description: "Review quotations, track orders, invoices, and submit support tickets",        color: "#0284c7", badge: "Client",     roleMatch: (r: string) => r.includes("customer") || r.includes("client") },
];

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setChecked(true);
    // If already logged in, go straight to the right role page
    if (user?.role) {
      const role = user.role.toLowerCase();
      const match = roleCards.find(c => c.roleMatch(role));
      if (match) {
        window.location.href = match.path;
      }
    }
  }, [ready, user]);

  // Navigate to role — if already logged in with correct role, go directly;
  // otherwise go to role login page for this role.
  const handleRoleClick = (card: typeof roleCards[0]) => {
    if (user?.role && card.roleMatch(user.role.toLowerCase())) {
      window.location.href = card.path;
    } else {
      if (card.key === "customer") {
        window.location.href = "/customer-login";
      } else {
        window.location.href = `/role-login?role=${encodeURIComponent(card.key)}&from=${encodeURIComponent(card.path)}`;
      }
    }
  };

  // Show spinner while auth is loading or redirecting
  if (!checked || (user?.role)) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0f2d5a 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          <InsaLogo size={48} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
          {user?.role ? "Redirecting to your dashboard…" : "Loading…"}
        </p>
      </main>
    );
  }

  // Not logged in — show role picker
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0f2d5a 50%, #1b3b6f 100%)", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ width: 76, height: 76, borderRadius: 18, background: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", padding: 10 }}>
          <InsaLogo size={56} />
        </div>
        <h1 style={{ color: "white", fontSize: 30, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Welcome to INSA ERP CRM
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
          Select your role or client portal to sign in and access your dashboard
        </p>
      </div>

      {/* Role Cards - 3x2 Grid */}
      <div style={{ maxWidth: 1020, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {roleCards.map(card => (
            <RoleCard key={card.name} card={card} onClick={() => handleRoleClick(card)} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 16, alignItems: "center" }}>
        <a
          href="/crm/dashboard"
          style={{
            padding: "8px 18px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            color: "#93c5fd",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          ← Go to ERP System Dashboard
        </a>
        <a
          href="/login"
          style={{
            padding: "8px 18px",
            borderRadius: 10,
            background: "rgba(200,16,46,0.2)",
            color: "#fca5a5",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            border: "1px solid rgba(200,16,46,0.3)",
          }}
        >
          System Login
        </a>
      </div>

      <p style={{ marginTop: 24, color: "rgba(255,255,255,0.22)", fontSize: 11, textAlign: "center" }}>
        © {new Date().getFullYear()} Information Network Security Administration (INSA) · Addis Ababa, Ethiopia
      </p>
    </main>
  );
}

function RoleCard({ card, onClick }: { card: typeof roleCards[0]; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "26px 22px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center", transition: "all 0.25s", display: "block", width: "100%", cursor: "pointer" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.11)";
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
        el.style.borderColor = `${card.color}55`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.06)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: `${card.color}22`, color: card.color === "#f59e0b" ? "#fbbf24" : card.color, border: `1px solid ${card.color}44` }}>
          {card.badge}
        </span>
      </div>
      <div style={{ fontSize: 42, marginBottom: 10 }}>{card.emoji}</div>
      <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: "0 0 7px" }}>{card.name}</h2>
      <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 12, margin: "0 0 18px", lineHeight: 1.55 }}>{card.description}</p>
      <div style={{ display: "inline-block", padding: "8px 22px", borderRadius: 10, background: card.color, color: "white", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 14px ${card.color}55` }}>
        Sign In →
      </div>
    </button>
  );
}
