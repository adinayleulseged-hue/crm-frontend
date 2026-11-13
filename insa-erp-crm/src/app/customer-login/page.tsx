"use client";

import { FormEvent, Suspense, useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import InsaLogo from "@/components/ui/InsaLogo";

function clearPreviousCustomerCache() {
  // Do not purge customer-specific deals, quotations, invoices or orders.
  // Records are strictly isolated by customerId / customerName / username.
}

function saveCustomerSession(token: string, user: { name: string; role: string; email: string; username: string; customerId?: number | string; id?: number | string }) {


  const userStr = JSON.stringify(user);
  const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
  localStorage.setItem("crm_auth_token", token);
  localStorage.setItem("token", token);
  localStorage.setItem("accessToken", token);
  localStorage.setItem("crm_user", userStr);
  localStorage.setItem("user", userStr);
  localStorage.setItem("active_customer", user.name);
  localStorage.setItem("active_customer_username", user.username);
  document.cookie = `crm_auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
  document.cookie = `token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

function CustomerLoginFormInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim(), password }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.token) {
        const userPayload = {
          name: data.name || data.username || email.trim(),
          role: data.role || "CUSTOMER",
          email: data.email || email.trim(),
          username: data.username || email.trim(),
          customerId: data.customerId || data.id || data.userId || undefined,
          id: data.id || data.userId || data.customerId || undefined,
        };
        saveCustomerSession(data.token, userPayload);
        window.location.href = "/customer/dashboard";
      } else {
        setError(data?.message || "Invalid email or password.");
        setLoading(false);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 440 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 5px" }}>
          Customer Sign In
        </h2>
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
          Enter your email and password to access your portal.
        </p>
      </div>

      <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 800, color: "#1e293b" }}>
            Username or Email
          </label>
          <div style={{ position: "relative" }}>
            <User style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#64748b" }} />
            <input
              type="text"
              required
              autoComplete="nope"
              data-lpignore="true"
              data-form-type="other"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username or email"
              style={{
                height: 44, width: "100%", borderRadius: 10, border: "1px solid #e2e8f0",
                background: "#f8fafc", padding: "0 14px 0 40px", fontSize: 13, color: "#0f172a",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 800, color: "#1e293b" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#64748b" }} />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                height: 44, width: "100%", borderRadius: 10, border: "1px solid #e2e8f0",
                background: "#f8fafc", padding: "0 44px 0 40px", fontSize: 13, color: "#0f172a",
                outline: "none", boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex",
              }}
            >
              {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 46, width: "100%", borderRadius: 12, border: "none",
            background: loading ? "#94a3b8" : "#c8102e", color: "white", fontSize: 13.5,
            fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(200,16,46,0.35)", marginTop: 4,
          }}
        >
          <Lock style={{ width: 15, height: 15 }} />
          <span>{loading ? "Authenticating…" : "Sign In"}</span>
          {!loading && <ArrowRight style={{ width: 15, height: 15 }} />}
        </button>

        <div style={{ marginTop: 8, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <Link href="/register" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>
            Create Account
          </Link>
          <Link href="/login" style={{ color: "#c8102e", fontWeight: 700, textDecoration: "none" }}>
            Staff Login →
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#071d3a",
        position: "relative",
      }}
    >
      <CustomerLoginFormInner />
    </main>
  );
}
