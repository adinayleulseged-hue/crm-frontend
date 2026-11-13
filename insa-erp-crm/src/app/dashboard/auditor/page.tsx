"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import InsaLogo from "@/components/ui/InsaLogo";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";

const stats = [
  { label: "Audits Completed", value: "23", sub: "5 this week", color: "#10b981" },
  { label: "Pending Reviews", value: "7", sub: "2 overdue", color: "#f59e0b" },
  { label: "Flagged Issues", value: "4", sub: "2 critical", color: "#ef4444" },
  { label: "Compliance Score", value: "94%", sub: "+2% vs last quarter", color: "#3b82f6" },
];

const auditLog = [
  { id: "AUD-2025-112", type: "Transaction", user: "Salam Haile", action: "Unapproved discount — Order #2091", severity: "critical", time: "10 min ago" },
  { id: "AUD-2025-111", type: "Contract", user: "Hanna Tesfaye", action: "Missing customer signature — Contract #445", severity: "high", time: "2h ago" },
  { id: "AUD-2025-110", type: "Expense", user: "Dawit Mulatu", action: "Expense report exceeds ETB 5K threshold", severity: "high", time: "Yesterday" },
  { id: "AUD-2025-109", type: "Access", user: "SYSTEM", action: "New user role assigned — Account Manager", severity: "info", time: "Yesterday" },
  { id: "AUD-2025-108", type: "Finance", user: "Finance Dept", action: "Q3 revenue reconciliation completed", severity: "resolved", time: "2 days ago" },
  { id: "AUD-2025-107", type: "Login", user: "Yonas Bekele", action: "Login from unrecognised IP — flagged", severity: "high", time: "3 days ago" },
];

const complianceItems = [
  { module: "CRM", item: "Sales Order Approval Flow", status: "pass", last: "Today" },
  { module: "FMS", item: "Invoice to Payment Matching", status: "pass", last: "Today" },
  { module: "HRM", item: "Employee Contract Renewal", status: "warn", last: "Yesterday" },
  { module: "PRMS", item: "Procurement Policy Adherence", status: "fail", last: "3 days ago" },
  { module: "MMS", item: "Stock Reconciliation", status: "pass", last: "This week" },
];

const actions = [
  { title: "Audit Trail", icon: "🔍", href: "/crm/audit", desc: "Full transaction & activity logs" },
  { title: "Compliance Check", icon: "✅", href: "/crm/audit", desc: "Run policy checks" },
  { title: "Financial Reports", icon: "📊", href: "/crm/reports/sales", desc: "Revenue & expense reports" },
  { title: "Flagged Transactions", icon: "🚩", href: "/crm/audit", desc: "Review flagged items" },
  { title: "User Activity", icon: "👁️", href: "/crm/audit", desc: "Login & role change logs" },
  { title: "Generate Report", icon: "📋", href: "/crm/reports", desc: "Export audit report" },
];

const sevColor: Record<string, { bg: string; text: string }> = {
  critical: { bg: "rgba(239,68,68,0.25)", text: "#f87171" },
  high: { bg: "rgba(245,158,11,0.2)", text: "#fbbf24" },
  info: { bg: "rgba(59,130,246,0.2)", text: "#60a5fa" },
  resolved: { bg: "rgba(16,185,129,0.2)", text: "#34d399" },
};

const compStatus: Record<string, { icon: string; color: string }> = {
  pass: { icon: "✓", color: "#34d399" },
  warn: { icon: "⚠", color: "#fbbf24" },
  fail: { icon: "✗", color: "#f87171" },
};

export default function AuditorPage() {
  const { user, ready, logout, switchRole } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"log" | "compliance">("log");

  useEffect(() => {
    if (!ready) return;
    if (!user) { window.location.href = "/login?from=/dashboard/auditor"; return; }
    const role = user.role.toLowerCase();
    if (role.includes("customer") || role.includes("client")) {
      window.location.href = "/customer/dashboard";
      return;
    }
    if (!role.includes("auditor") && !role.includes("admin")) {
      window.location.href = "/role-login";
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0f2d5a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Loading…</div>
      </main>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={["AUDITOR", "ADMIN"]}>
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0f2d5a 50%, #1b3b6f 100%)", padding: "28px 24px" }}>
      {/* ── Header ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 3 }}><InsaLogo size={26} /></div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: 0 }}>Auditor Dashboard</h1>
              <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>AUDITOR</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "2px 0 0" }}>
              Welcome back, <span style={{ color: "white", fontWeight: 600 }}>{user.name}</span> · Compliance & Audit Review
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/crm/audit" style={{ padding: "8px 16px", background: "#f59e0b", color: "#1a1200", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px rgba(245,158,11,0.35)" }}>
            Full Audit Log
          </a>
          <a href="/crm/dashboard" style={{ padding: "8px 14px", background: "rgba(255,255,255,0.1)", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)" }}>
            ERP Dashboard
          </a>
          <button onClick={switchRole} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Switch Role
          </button>
          <button onClick={logout} style={{ padding: "8px 14px", background: "rgba(200,16,46,0.12)", color: "#f87171", borderRadius: 8, border: "1px solid rgba(200,16,46,0.2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", borderRadius: 16, padding: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>{s.value}</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* LEFT — tabs */}
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {(["log", "compliance"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s", background: tab === t ? "#f59e0b" : "rgba(255,255,255,0.07)", color: tab === t ? "#1a1200" : "rgba(255,255,255,0.6)" }}
              >
                {t === "log" ? "Recent Audit Events" : "Compliance Status"}
              </button>
            ))}
          </div>

          {tab === "log" && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
              {auditLog.map((item, i) => (
                <div key={i} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: i < auditLog.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", gap: 12, cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 700 }}>{item.id}</span>
                      <span style={{ padding: "1px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>{item.type}</span>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{item.user}</span>
                    </div>
                    <div style={{ color: "white", fontSize: 12, marginTop: 4 }}>{item.action}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: sevColor[item.severity]?.bg, color: sevColor[item.severity]?.text, display: "block", marginBottom: 4, textTransform: "capitalize" }}>
                      {item.severity}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "compliance" && (
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 0.8fr 1fr", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <span>Module</span><span>Check</span><span>Status</span><span>Last Run</span>
              </div>
              {complianceItems.map((c, i) => {
                const cs = compStatus[c.status];
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "0.6fr 2fr 0.8fr 1fr", padding: "13px 16px", alignItems: "center", borderBottom: i < complianceItems.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "rgba(191,219,254,0.8)", display: "inline-block" }}>{c.module}</span>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{c.item}</span>
                    <span style={{ color: cs.color, fontSize: 13, fontWeight: 700 }}>{cs.icon} {c.status.toUpperCase()}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{c.last}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Actions */}
        <div>
          <h2 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>Audit Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actions.map((a) => (
              <Link key={a.title} href={a.href} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{a.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
    </RoleProtectedRoute>
  );
}
