"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingCart,
  Package,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  CheckCircle2,
  Plus,
  Download,
  RefreshCw,
  DollarSign,
} from "lucide-react";

/* ──────────────────────────────────────────
   Static data (replace with API calls)
────────────────────────────────────────── */
const moduleKpis = [
  {
    module: "HRM",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: Users,
    title: "Total Employees",
    value: "284",
    subtext: "12 on leave today",
    trend: "+3.2%",
    positive: true,
    href: "/crm/reports",
  },
  {
    module: "PRMS",
    color: "#be123c",
    bg: "#fff1f2",
    border: "#fecdd3",
    icon: ShoppingCart,
    title: "Purchase Requests",
    value: "47",
    subtext: "5 pending approval",
    trend: "+12.5%",
    positive: true,
    href: "/crm/orders",
  },
  {
    module: "MMS",
    color: "#475569",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    icon: Package,
    title: "Stock Items",
    value: "1,842",
    subtext: "23 below reorder",
    trend: "-1.8%",
    positive: false,
    href: "/crm/orders",
  },
  {
    module: "CRM",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: Building2,
    title: "Active Sales Orders",
    value: "138",
    subtext: "ETB 4.2M pipeline",
    trend: "+8.7%",
    positive: true,
    href: "/crm/leads",
  },
  {
    module: "FMS",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: DollarSign,
    title: "Accounts Receivable",
    value: "ETB 2.8M",
    subtext: "14 overdue invoices",
    trend: "+5.1%",
    positive: true,
    href: "/crm/invoices",
  },
];

const pendingApprovals = [
  { id: "PR-2025-047", module: "PRMS", moduleColor: "#be123c", moduleBg: "#fff1f2", title: "Purchase Request", dept: "Procurement Dept", amount: "ETB 45,000", priority: "High", priorityColor: "#c8102e" },
  { id: "SO-2025-021", module: "CRM", moduleColor: "#7c3aed", moduleBg: "#f5f3ff", title: "Sales Order Review", dept: "Corporate Sales", amount: "ETB 2,100,000", priority: "High", priorityColor: "#c8102e" },
  { id: "PV-2025-112", module: "FMS", moduleColor: "#059669", moduleBg: "#ecfdf5", title: "Payment Voucher", dept: "Finance Dept", amount: "ETB 89,400", priority: "Normal", priorityColor: "#1d4ed8" },
  { id: "LR-2025-089", module: "HRM", moduleColor: "#1d4ed8", moduleBg: "#eff6ff", title: "Leave Request", dept: "Cyber Operations", amount: "4 Days", priority: "Normal", priorityColor: "#1d4ed8" },
  { id: "QU-2025-063", module: "CRM", moduleColor: "#7c3aed", moduleBg: "#f5f3ff", title: "Special Pricing Quotation", dept: "Commercial Division", amount: "ETB 750,000", priority: "High", priorityColor: "#c8102e" },
];

const moduleStatuses = [
  { code: "HRM", color: "#1d4ed8", bg: "#eff6ff", status: "284 employees active" },
  { code: "PRMS", color: "#be123c", bg: "#fff1f2", status: "14 purchase orders active" },
  { code: "MMS", color: "#475569", bg: "#f1f5f9", status: "1,842 inventory items" },
  { code: "CRM", color: "#7c3aed", bg: "#f5f3ff", status: "138 active sales orders" },
  { code: "FMS", color: "#059669", bg: "#ecfdf5", status: "All ledgers reconciled" },
];

const revenueData = [
  { month: "Jan", rev: 280, exp: 190 },
  { month: "Feb", rev: 360, exp: 240 },
  { month: "Mar", rev: 320, exp: 260 },
  { month: "Apr", rev: 440, exp: 300 },
  { month: "May", rev: 480, exp: 330 },
  { month: "Jun", rev: 520, exp: 340 },
  { month: "Jul", rev: 590, exp: 380 },
];

const stockData = [
  { month: "Jan", receipt: 250, issue: 180 },
  { month: "Feb", receipt: 360, issue: 220 },
  { month: "Mar", receipt: 290, issue: 250 },
  { month: "Apr", receipt: 420, issue: 310 },
  { month: "May", receipt: 440, issue: 340 },
  { month: "Jun", receipt: 490, issue: 330 },
  { month: "Jul", receipt: 530, issue: 420 },
];

const MAX_VAL = 600;
const CHART_H = 160; // px for bar area

/* ──────────────────────────────────────────
   Sub-components
────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Revenue line chart rendered as SVG */
function RevenueChart() {
  const W = 420;
  const H = 160;
  const padL = 0;
  const padR = 0;
  const n = revenueData.length;
  const stepX = W / (n - 1);

  const toY = (v: number) => H - (v / MAX_VAL) * H;

  const revPoints = revenueData.map((d, i) => `${i * stepX},${toY(d.rev)}`).join(" ");
  const expPoints = revenueData.map((d, i) => `${i * stepX},${toY(d.exp)}`).join(" ");

  // Build smooth polyline path for area fill
  const areaPath =
    `M ${revenueData.map((d, i) => `${i * stepX},${toY(d.rev)}`).join(" L ")} L ${(n - 1) * stepX},${H} L 0,${H} Z`;

  return (
    <div style={{ position: "relative", marginTop: 16 }}>
      {/* Y-axis labels */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {["600k", "450k", "300k", "150k", "0k"].map((l) => (
          <span key={l} style={{ fontSize: 10, color: "#94a3b8", width: 32, textAlign: "right" }}>{l}</span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block", width: "calc(100% - 40px)", height: CHART_H, marginLeft: 40 }}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={0} y1={H * t} x2={W} y2={H * t} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* Revenue area */}
        <path d={areaPath} fill="url(#revGrad)" />
        {/* Revenue line */}
        <polyline points={revPoints} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Expenses line */}
        <polyline points={expPoints} fill="none" stroke="#c8102e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5,3" />
        {/* Dots on revenue line */}
        {revenueData.map((d, i) => (
          <circle key={i} cx={i * stepX} cy={toY(d.rev)} r="3" fill="#2563eb" />
        ))}
      </svg>

      {/* X axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginLeft: 40, marginTop: 6 }}>
        {revenueData.map((d) => (
          <span key={d.month} style={{ fontSize: 10, color: "#94a3b8", flex: 1, textAlign: "center" }}>{d.month}</span>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#2563eb" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Revenue</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#c8102e" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Expenses</span>
        </div>
      </div>
    </div>
  );
}

/* Stock bar chart */
function StockBarChart() {
  return (
    <div style={{ position: "relative", marginTop: 16 }}>
      {/* Y-axis labels */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {[600, 450, 300, 150, 0].map((l) => (
          <span key={l} style={{ fontSize: 10, color: "#94a3b8", width: 32, textAlign: "right" }}>{l}</span>
        ))}
      </div>

      {/* Bar area */}
      <div
        style={{
          marginLeft: 40,
          height: CHART_H,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          borderBottom: "2px solid #f1f5f9",
          paddingBottom: 0,
        }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${t * 100}%`,
              borderTop: "1px dashed #f1f5f9",
              pointerEvents: "none",
            }}
          />
        ))}

        {stockData.map((d) => (
          <div
            key={d.month}
            style={{ display: "flex", alignItems: "flex-end", gap: 4, flex: 1, justifyContent: "center" }}
            title={`Receipt: ${d.receipt} | Issue: ${d.issue}`}
          >
            {/* Receipt bar */}
            <div
              style={{
                width: 14,
                height: `${(d.receipt / MAX_VAL) * CHART_H}px`,
                background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                borderRadius: "4px 4px 0 0",
                transition: "opacity 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            />
            {/* Issue bar */}
            <div
              style={{
                width: 14,
                height: `${(d.issue / MAX_VAL) * CHART_H}px`,
                background: "linear-gradient(180deg, #f87171, #c8102e)",
                borderRadius: "4px 4px 0 0",
                transition: "opacity 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            />
          </div>
        ))}
      </div>

      {/* X axis labels */}
      <div style={{ display: "flex", justifyContent: "space-around", marginLeft: 40, marginTop: 8 }}>
        {stockData.map((d) => (
          <span key={d.month} style={{ fontSize: 10, color: "#94a3b8", flex: 1, textAlign: "center" }}>{d.month}</span>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#2563eb" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Goods Receipt</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#c8102e" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>Goods Issue</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Dashboard Component
────────────────────────────────────────── */
export default function ErpDashboardPage() {
  const [showAllApprovals, setShowAllApprovals] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Top bar: title + actions ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px", margin: 0 }}>
            ERP System Dashboard
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
            Cross-module overview — HRM · PRMS · MMS · CRM · FMS
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Fiscal period badge */}
          <div
            style={{
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "#0f172a",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <span style={{ color: "#64748b", fontWeight: 500 }}>Fiscal Period: </span>July 2025
          </div>

          {/* Refresh */}
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 12,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Refresh
          </button>

          {/* Export */}
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 12,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <Download style={{ width: 13, height: 13 }} />
            Export
          </button>

          {/* Quotations */}
          <Link
            href="/crm/quotations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 12,
              fontWeight: 600,
              color: "#374151",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f8fafc";
              (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "white";
              (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
            }}
          >
            Quotations
          </Link>

          {/* New Lead */}
          <Link
            href="/crm/leads"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 10,
              background: "#c8102e",
              color: "white",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(200,16,46,0.3)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#a80d26")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#c8102e")}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Lead
          </Link>
        </div>
      </div>

      {/* ── 5 KPI Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
        }}
        className="kpi-grid"
      >
        {moduleKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.module}
              href={kpi.href}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "white",
                borderRadius: 16,
                border: "1px solid #f1f5f9",
                padding: 18,
                textDecoration: "none",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    borderRadius: 6,
                    border: `1px solid ${kpi.border}`,
                    background: kpi.bg,
                    color: kpi.color,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  {kpi.module}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: kpi.bg,
                    color: kpi.color,
                  }}
                >
                  <Icon style={{ width: 16, height: 16 }} />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{kpi.title}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginTop: 2, letterSpacing: "-0.5px" }}>
                  {kpi.value}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 11,
                }}
              >
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>{kpi.subtext}</span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontWeight: 700,
                    color: kpi.positive ? "#059669" : "#dc2626",
                  }}
                >
                  {kpi.positive ? <TrendingUp style={{ width: 12, height: 12 }} /> : <TrendingDown style={{ width: 12, height: 12 }} />}
                  {kpi.trend}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── 2 Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Revenue vs Expenses */}
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Revenue vs Expenses</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>FMS — Monthly (ETB)</p>
            </div>
            <span
              style={{
                borderRadius: 6,
                border: "1px solid #a7f3d0",
                background: "#ecfdf5",
                color: "#059669",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
              }}
            >
              FMS
            </span>
          </div>
          <RevenueChart />
        </Card>

        {/* Stock Movement */}
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Stock Movement</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>MMS — Goods Receipt vs Issue</p>
            </div>
            <span
              style={{
                borderRadius: 6,
                border: "1px solid #bfdbfe",
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
              }}
            >
              MMS
            </span>
          </div>
          <StockBarChart />
        </Card>
      </div>

      {/* ── Pending Approvals + Module Status ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Pending Approvals */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock style={{ width: 16, height: 16, color: "#c8102e" }} />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>Pending Approvals</h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#c8102e",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {pendingApprovals.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAllApprovals((v) => !v)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1d4ed8",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {showAllApprovals ? "Show Less" : "View All"} →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(showAllApprovals ? pendingApprovals : pendingApprovals.slice(0, 4)).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 12,
                  border: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  padding: "12px 14px",
                  transition: "border-color 0.15s, background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "white";
                  (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                  (e.currentTarget as HTMLElement).style.borderColor = "#f1f5f9";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      borderRadius: 6,
                      background: item.moduleBg,
                      color: item.moduleColor,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      flexShrink: 0,
                    }}
                  >
                    {item.module}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{item.id}</span>
                      <span style={{ fontSize: 12, color: "#374151" }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.dept}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{item.amount}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.priorityColor, marginTop: 2 }}>{item.priority}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Module Status */}
        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16, marginTop: 0 }}>Module Status</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {moduleStatuses.map((m) => (
                <div
                  key={m.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 10,
                    background: "#f8fafc",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        borderRadius: 6,
                        background: m.bg,
                        color: m.color,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                      }}
                    >
                      {m.code}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{m.status}</span>
                  </div>
                  <CheckCircle2 style={{ width: 15, height: 15, color: "#059669", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <Link
              href="/crm/leads"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                background: "#071d3a",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#0f2d5a")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#071d3a")}
            >
              Preview CRM Subsystem
              <ExternalLink style={{ width: 13, height: 13 }} />
            </Link>
          </div>
        </Card>
      </div>

    </div>
  );
}