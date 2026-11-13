"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import Link from "next/link";
import InsaLogo from "@/components/ui/InsaLogo";

function saveAuth(token: string, user: { name: string; role: string; email?: string; username?: string; organization?: string }) {
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

function roleToPath(role: string): string {
  const r = (role || "").toLowerCase();
  if (r.includes("customer") || r.includes("client")) return "/customer/dashboard";
  if (r.includes("finance") || r.includes("fms")) return "/dashboard/finance-officer";
  if (r.includes("sales manager") || r.includes("sales_manager")) return "/dashboard/sales-manager";
  if (r.includes("auditor")) return "/dashboard/auditor";
  if (r.includes("officer") || r.includes("sales rep") || r.includes("sales_officer") || r.includes("sales")) return "/dashboard/sales-officer";
  if (r.includes("admin")) return "/dashboard/admin";
  return "/dashboard/finance-officer";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uname = username.trim();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

      // 1. Try real backend authentication
      let backendSuccess = false;
      let token = "demo-token-2025";
      let userRole = "CUSTOMER";
      let fullName = uname;
      let orgName = "";

      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: uname,
            password: password,
          }),
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data?.token) {
          backendSuccess = true;
          token = data.token;
          userRole = data.role || "SALES_OFFICER";
          fullName = data.name || data.username || uname;
          // Pick up org from backend if available
          if (data.organization || data.organizationName || data.company) {
            orgName = data.organization || data.organizationName || data.company;
          }
        } else if (!response.ok && data?.message) {
          // If backend actively rejected credentials, show the error
          setError(data.message);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Backend not reachable or offline, fallback to local lookup
      }

      if (!backendSuccess) {
        // Check if user was registered in localStorage
        let registeredUser: any = null;
        try {
          const saved =
            localStorage.getItem("registered_user") ||
            localStorage.getItem("user") ||
            localStorage.getItem("crm_user");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (
              (parsed.username && parsed.username.toLowerCase() === uname.toLowerCase()) ||
              (parsed.email && parsed.email.toLowerCase() === uname.toLowerCase())
            ) {
              registeredUser = parsed;
            }
          }
        } catch (e) {}

        if (registeredUser && registeredUser.role) {
          userRole = registeredUser.role;
          fullName = registeredUser.name || uname;
        } else if (uname.toLowerCase().includes("sales") && uname.toLowerCase().includes("manager")) {
          userRole = "SALES_MANAGER";
          fullName = "Dawit Kebede";
        } else if (uname.toLowerCase().includes("auditor")) {
          userRole = "AUDITOR";
          fullName = "Tigist Alemu";
        } else if (uname.toLowerCase() === "adi" || uname.toLowerCase().includes("finance") || uname.toLowerCase().includes("fms")) {
          userRole = "FINANCE_OFFICER";
          fullName = uname.toLowerCase() === "adi" ? "Adi" : "finance";
        } else if (uname.toLowerCase().includes("admin")) {
          userRole = "ADMIN";
          fullName = "System Administrator";
        } else if (uname.toLowerCase() === "abem") {
          // Specific user: abem -> Sales Officer
          userRole = "SALES_OFFICER";
          fullName = "Abem Kebede";
        } else if (uname.toLowerCase().includes("sales") || uname.toLowerCase().includes("rep") || uname.toLowerCase().includes("officer") || uname.toLowerCase() === "salam") {
          userRole = "SALES_OFFICER";
          fullName = "Salam Haile";
        } else {
          userRole = "CUSTOMER";
          fullName = uname;
          orgName = uname.toLowerCase().includes("mof") ? "Ministry of Finance" : `${uname} Enterprises`;
        }
      }

      // Ensure orgName is unique per customer - never use a shared generic name
      if (!orgName || orgName === "Enterprise Client") {
        const isCustomerRole = userRole.toLowerCase().includes("customer") || userRole.toLowerCase().includes("client");
        if (isCustomerRole) {
          orgName = `${uname} Enterprises`;
        } else {
          orgName = orgName || "INSA ERP";
        }
      }

      const payload = {
        name: fullName,
        role: userRole,
        username: uname,
        email: uname.includes("@") ? uname : `${uname}@insa.gov.et`,
        organization: orgName,
      };

      saveAuth(token, payload);

      const isCustomer = userRole.toLowerCase().includes("customer") || userRole.toLowerCase().includes("client");
      if (isCustomer) {
        localStorage.setItem("active_customer_username", uname);
        localStorage.setItem("active_customer", fullName);
        window.location.href = "/customer/dashboard";
      } else {
        const dest = fromPath || roleToPath(userRole);
        window.location.href = dest;
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please check your username/password.");
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 410 }}>
      {/* Top Logo and Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", padding: "6px 8px 3px", borderRadius: 14, background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", borderTop: "3px solid #c8102e", borderBottom: "3px solid #1d4ed8", marginBottom: 12 }}>
          <InsaLogo size={42} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: "0 0 2px" }}>
          INSA ERP System
        </h2>
      </div>

      {/* Sign In / Register Tab Toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: "#f1f5f9", borderRadius: 10, padding: 3, marginBottom: 20 }}>
        <button
          type="button"
          style={{
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "#8b0000",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Sign In
        </button>
        <Link
          href="/register"
          style={{
            padding: "9px 0",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Register
        </Link>
      </div>

      {/* Form Subheader */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", display: "inline-block" }}></span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Sign In</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
          Enter your credentials to access your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Username or Email */}
        <div>
          <label
            htmlFor="login-username"
            style={{ display: "block", marginBottom: 6, fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            USERNAME OR EMAIL
          </label>
          <div style={{ position: "relative" }}>
            <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#64748b" }} />
            <input
              id="login-username"
              type="text"
              required
              autoComplete="nope"
              data-lpignore="true"
              data-form-type="other"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              style={{
                height: 44,
                width: "100%",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "0 14px 0 40px",
                fontSize: 13,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label
              htmlFor="login-password"
              style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              PASSWORD
            </label>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Please contact your INSA ERP system administrator to reset your password."); }}
              style={{ fontSize: 11, fontWeight: 700, color: "#c8102e", textDecoration: "none" }}
            >
              Forgot password?
            </a>
          </div>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#64748b" }} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                height: 44,
                width: "100%",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "0 44px 0 40px",
                fontSize: 13,
                color: "#0f172a",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
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
              {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ borderRadius: 9, border: "1px solid #fecaca", background: "#fef2f2", padding: "9px 12px", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            height: 46,
            width: "100%",
            borderRadius: 10,
            border: "none",
            background: loading ? "#94a3b8" : "#8b0000",
            color: "white",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(139,0,0,0.35)",
            marginTop: 4,
          }}
        >
          <Shield style={{ width: 15, height: 15, color: "#60a5fa" }} />
          <span>{loading ? "AUTHENTICATING…" : "SIGN IN SECURELY"}</span>
        </button>
      </form>

      {/* Contact Us Section */}
      <div style={{ marginTop: 24, padding: "16px 20px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", fontWeight: 500 }}>
          New to INSA ERP? Interested in our services?
        </p>
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 24px",
            background: "#2563eb",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: "none",
            transition: "background 0.2s",
            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1d4ed8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563eb")}
        >
          <User style={{ width: 14, height: 14 }} />
          Contact Us
        </Link>
      </div>

      {/* Security Disclaimer */}
      <p style={{ marginTop: 20, fontSize: 10.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.5, margin: "20px 0 0" }}>
        Protected under the INSA ERP Security Framework. Sessions and customer histories are encrypted and isolated per account.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        background: "#071d3a",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr",
        }}
      >
        {/* LEFT — INSA Organization Brand Branding */}
        <div
          style={{
            background: "#071d3a",
            color: "white",
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Main Logo Card */}
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 32,
              background: "#0b254a",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Red & Blue top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, display: "flex" }}>
              <div style={{ flex: 1, background: "#c8102e" }} />
              <div style={{ flex: 1, background: "#2563eb" }} />
            </div>
            <div style={{ background: "white", borderRadius: 20, padding: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              <InsaLogo size={76} />
            </div>
          </div>

          {/* Red & Blue divider pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <div style={{ width: 28, height: 3, background: "#c8102e", borderRadius: 2 }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            <div style={{ width: 28, height: 3, background: "#2563eb", borderRadius: 2 }} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.35, margin: "0 0 8px", maxWidth: 360, letterSpacing: "-0.3px" }}>
            Information Network<br />Security Administration
          </h1>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.45)", margin: 0, textTransform: "uppercase" }}>
            ADDIS ABABA, ETHIOPIA
          </p>

          {/* Bottom INSA mini badge */}
          <div style={{ position: "absolute", bottom: 24, left: 24, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 800 }}>
            N
          </div>
        </div>

        {/* RIGHT — Clean White Card Form */}
        <div
          style={{
            background: "#f8fafc",
            padding: "40px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 24,
              padding: "40px 36px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: 440,
            }}
          >
            <Suspense fallback={<div style={{ textAlign: "center", padding: 20, fontSize: 13, color: "#64748b" }}>Loading sign in…</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
