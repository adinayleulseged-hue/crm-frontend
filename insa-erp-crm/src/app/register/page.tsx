"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postRegister } from "@/lib/api";
import InsaLogo from "@/components/ui/InsaLogo";
import { UserPlus, Eye, EyeOff, ArrowRight } from "lucide-react";

const inputStyle: React.CSSProperties = {
  height: 44,
  width: "100%",
  borderRadius: 11,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 500,
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLElement).style.borderColor = "#c8102e";
    (e.target as HTMLElement).style.boxShadow = "0 0 0 3px rgba(200,16,46,0.12)";
    (e.target as HTMLElement).style.background = "white";
  };

  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    (e.target as HTMLElement).style.borderColor = "#e2e8f0";
    (e.target as HTMLElement).style.boxShadow = "none";
    (e.target as HTMLElement).style.background = "#f8fafc";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await postRegister({
        username: form.username.trim(),
        name: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "CUSTOMER",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

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
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "white",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <InsaLogo size={48} />
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "12px 0 4px" }}>Create Account</h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>Register as a Customer to get started.</p>
        </div>
        {success ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>Account Created!</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              Your customer account has been registered successfully.
            </p>
            <Link
              href="/customer/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "11px 24px",
                borderRadius: 10,
                background: "#c8102e",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Launch Customer Portal →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" style={labelStyle}>Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="nope"
                data-lpignore="true"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="nope"
                data-lpignore="true"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, padding: "0 44px 0 14px" }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  aria-label={showPw ? "Hide" : "Show"}
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
                  {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 44,
                width: "100%",
                borderRadius: 11,
                border: "none",
                background: loading ? "#94a3b8" : "#c8102e",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(200,16,46,0.35)",
              }}
            >
              <UserPlus style={{ width: 15, height: 15 }} />
              <span>{loading ? "Creating Account…" : "Create Account"}</span>
              {!loading && <ArrowRight style={{ width: 15, height: 15 }} />}
            </button>
          </form>
        )}
        <div style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: "#64748b" }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: "#c8102e", fontWeight: 700, textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
            © {new Date().getFullYear()} Information Network Security Administration (INSA)
          </p>
        </div>
      </div>
    </main>
  );
}
