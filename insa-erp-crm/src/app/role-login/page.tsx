"use client";

import { FormEvent, Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, UserCheck, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import InsaLogo from "@/components/ui/InsaLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

/* ── helpers ─────────────────────────────────────────── */

function saveAuth(token: string, user: object) {
  const userStr = JSON.stringify(user);
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  localStorage.setItem("crm_auth_token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("accessToken", token);
  localStorage.setItem("crm_user", userStr);
  localStorage.setItem("user", userStr);
  document.cookie = `crm_auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
  document.cookie = `token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

interface RoleConfig {
  key: string;
  name: string;
  badge: string;
  path: string;
  emoji: string;
  color: string;
  description: string;
  demoUser: { name: string; email: string; username: string };
}

const ROLES: RoleConfig[] = [
  {
    key: "admin",
    name: "System Admin",
    badge: "Admin",
    path: "/dashboard/admin",
    emoji: "🛡️",
    color: "#dc2626",
    description: "Manage users, IAM roles, security configurations, and node operations",
    demoUser: { name: "System Administrator", email: "admin@insa.gov.et", username: "admin" },
  },
  {
    key: "sales-rep",
    name: "Sales Rep",
    badge: "Sales",
    path: "/dashboard/sales-rep",
    emoji: "🛒",
    color: "#c8102e",
    description: "Daily customer pipeline, orders, leads & sales activities",
    demoUser: { name: "Salam Haile", email: "salam.haile@insa.gov.et", username: "salam.haile" },
  },
  {
    key: "sales-manager",
    name: "Sales Manager",
    badge: "Management",
    path: "/dashboard/sales-manager",
    emoji: "📊",
    color: "#1d4ed8",
    description: "Approve orders, track team targets & rep quotas",
    demoUser: { name: "Dawit Kebede", email: "dawit.kebede@insa.gov.et", username: "dawit.kebede" },
  },
  {
    key: "auditor",
    name: "Auditor",
    badge: "Compliance",
    path: "/dashboard/auditor",
    emoji: "🔍",
    color: "#f59e0b",
    description: "Audit trail, compliance checks, flagged events & risk review",
    demoUser: { name: "Tigist Alemu", email: "tigist.alemu@insa.gov.et", username: "tigist.alemu" },
  },
  {
    key: "finance-officer",
    name: "Finance Officer (FMS)",
    badge: "Finance",
    path: "/dashboard/finance-officer",
    emoji: "💳",
    color: "#dc2626",
    description: "Invoices & billing settlement, client organization receivables & payment approvals",
    demoUser: { name: "Adi", email: "adi@insa.gov.et", username: "adi" },
  },
  {
    key: "customer",
    name: "Customer",
    badge: "Client",
    path: "/dashboard/customer",
    emoji: "🏢",
    color: "#0284c7",
    description: "Client self-service: quotations, orders, invoices & tickets",
    demoUser: { name: "Meron Bekele", email: "meron.bekele@mof.gov.et", username: "meron.bekele" },
  },
];

function RoleLoginFormInner() {
  const searchParams = useSearchParams();
  const initialRoleKey = searchParams.get("role") || "sales-rep";
  const fromPath = searchParams.get("from");

  const [selectedRole, setSelectedRole] = useState<RoleConfig>(() => {
    return ROLES.find(r => r.key === initialRoleKey || r.path === fromPath) || ROLES[0];
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam) {
      const match = ROLES.find(r => r.key === roleParam);
      if (match) setSelectedRole(match);
    }
  }, [searchParams]);

  function handleRoleSelect(role: RoleConfig) {
    setSelectedRole(role);
    setError("");
  }

  function doRoleLogin(token: string, name: string, email: string) {
    const roleString = selectedRole.key === "admin" ? "ADMIN" : selectedRole.key === "finance-officer" ? "FINANCE_OFFICER" : selectedRole.name;
    const user = {
      name,
      role: roleString,
      email,
      username: username.trim() || selectedRole.demoUser.username,
    };
    saveAuth(token, user);
    window.location.href = fromPath || selectedRole.path;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please fill in username and password.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = data.token || data.accessToken || data.data?.token || "demo-token";
        const u = data.user || data.data?.user || {};
        doRoleLogin(token, u.name || username, u.email || `${username}@insa.gov.et`);
        return;
      }
      if (data?.message) {
        setError(data.message);
        setLoading(false);
        return;
      }
    } catch {
      // Demo fallback when offline
    }

    // Demo fallback for role
    doRoleLogin("demo-token-2025", selectedRole.demoUser.name, selectedRole.demoUser.email);
  }

  function quickRoleDemo(role: RoleConfig) {
    const roleString = role.key === "admin" ? "ADMIN" : role.key === "finance-officer" ? "FINANCE_OFFICER" : role.name;
    saveAuth("demo-token-2025", {
      name: role.demoUser.name,
      role: roleString,
      email: role.demoUser.email,
      username: role.demoUser.username,
    });
    window.location.href = role.path;
  }

  return (
    <div>
      {/* Role Selection Tabs */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Select Role Subsystem
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
          {ROLES.map((r) => {
            const isSelected = selectedRole.key === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 4px",
                  borderRadius: 10,
                  border: isSelected ? `2px solid ${r.color}` : "1px solid #e2e8f0",
                  background: isSelected ? `${r.color}14` : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 20, marginBottom: 2 }}>{r.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? r.color : "#475569", textAlign: "center", lineHeight: 1.2 }}>
                  {r.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 12,
          background: `${selectedRole.color}12`,
          border: `1px solid ${selectedRole.color}35`,
          marginBottom: 18,
        }}
      >
        <span style={{ fontSize: 24 }}>{selectedRole.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{selectedRole.name} Dashboard</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: selectedRole.color, color: "white" }}>
              {selectedRole.badge}
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
            {selectedRole.description}
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Username */}
        <div>
          <label htmlFor="role-un" style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 700, color: "#374151" }}>
            Username
          </label>
          <input
            id="role-un"
            type="text"
            autoComplete="off"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              height: 44,
              width: "100%",
              borderRadius: 11,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              padding: "0 14px",
              fontSize: 14,
              color: "#1e293b",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = selectedRole.color;
              e.target.style.boxShadow = `0 0 0 3px ${selectedRole.color}18`;
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#f8fafc";
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="role-pw" style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 700, color: "#374151" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="role-pw"
              type={showPw ? "text" : "password"}
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                height: 44,
                width: "100%",
                borderRadius: 11,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "0 44px 0 14px",
                fontSize: 14,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = selectedRole.color;
                e.target.style.boxShadow = `0 0 0 3px ${selectedRole.color}18`;
                e.target.style.background = "white";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
                e.target.style.background = "#f8fafc";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
              }}
            >
              {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 46,
            width: "100%",
            borderRadius: 11,
            border: "none",
            background: loading ? "#94a3b8" : selectedRole.color,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 4px 14px ${selectedRole.color}40`,
            transition: "all 0.15s",
          }}
        >
          <Lock style={{ width: 15, height: 15 }} />
          <span>{loading ? "Authenticating…" : `Enter ${selectedRole.name} Dashboard`}</span>
          {!loading && <ArrowRight style={{ width: 15, height: 15 }} />}
        </button>

        {/* One-Click Direct Access */}
        <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
          <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Instant One-Click Access
          </div>
          <button
            type="button"
            onClick={() => quickRoleDemo(selectedRole)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 10,
              border: `1px solid ${selectedRole.color}40`,
              background: `${selectedRole.color}0a`,
              padding: "10px",
              fontSize: 12,
              fontWeight: 700,
              color: selectedRole.color,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${selectedRole.color}15`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${selectedRole.color}0a`;
            }}
          >
            <UserCheck style={{ width: 14, height: 14 }} />
            <span>Launch {selectedRole.name} as {selectedRole.demoUser.name}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RoleLoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "linear-gradient(135deg, #071d3a 0%, #0f2d5a 50%, #1b3b6f 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "fixed", top: -128, left: -128, width: 380, height: 380, borderRadius: "50%", background: "#1d4ed8", opacity: 0.08, filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -128, right: -128, width: 320, height: 320, borderRadius: "50%", background: "#7c3aed", opacity: 0.08, filter: "blur(80px)", pointerEvents: "none" }} />

      <div
        style={{
          width: "100%",
          maxWidth: 960,
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
        }}
      >
        {/* LEFT — Role Info & Branding */}
        <div
          style={{
            background: "linear-gradient(160deg, #071d3a 0%, #0a2348 100%)",
            color: "white",
            padding: "44px 38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              <div style={{ background: "white", borderRadius: 14, padding: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", flexShrink: 0 }}>
                <InsaLogo size={48} />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-0.5px" }}>INSA ERP</div>
                <div style={{ fontSize: 11, color: "rgba(147,197,253,0.75)", fontWeight: 500 }}>Role Access Subsystems</div>
              </div>
            </div>

            <h1 style={{ fontSize: 23, fontWeight: 900, lineHeight: 1.3, margin: "0 0 12px" }}>
              Dedicated Role<br />Management Portals
            </h1>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(191,219,254,0.7)", margin: "0 0 24px" }}>
              Select your department role to access customized dashboards, operational workflows, and permissions.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ROLES.map((r) => (
                <div
                  key={r.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{r.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{r.description.slice(0, 38)}…</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "#93c5fd",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Back to ERP System Login</span>
            </Link>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div style={{ background: "white", padding: "40px 36px", display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 99, padding: "4px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                <ShieldCheck style={{ width: 13, height: 13 }} />
                ROLE-BASED AUTHENTICATION
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>Role Access Login</h2>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Sign in to unlock your role-specific dashboard &amp; tools.</p>
            </div>

            <Suspense fallback={<div style={{ fontSize: 13, color: "#64748b" }}>Loading role access…</div>}>
              <RoleLoginFormInner />
            </Suspense>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748b", flexWrap: "wrap", gap: 8 }}>
              <Link href="/login" style={{ color: "#c8102e", fontWeight: 700, textDecoration: "none" }}>
                ← Main System Login
              </Link>
              <Link href="/customer-login" style={{ color: "#0284c7", fontWeight: 700, textDecoration: "none" }}>
                🏢 Customer Self-Service Portal →
              </Link>
              <Link href="/dashboard" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
                Role Portal Overview →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
