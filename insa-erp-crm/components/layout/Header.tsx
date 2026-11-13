"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, Settings, Check, CheckCheck, X, RefreshCw, Download } from "lucide-react";
import notificationService from "@/services/notificationService";
import { SystemNotification } from "@/types/notification.types";

interface UserInfo {
  name: string;
  role: string;
  email: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PAGE_MAP: Record<string, { section: string; page: string }> = {
  "/crm/leads": { section: "Sales & CRM", page: "Leads" },
  "/crm/products": { section: "Catalog", page: "Products & Services" },
  "/crm/sales-deals": { section: "Sales & CRM", page: "Sales Deals" },
  "/crm/opportunities": { section: "Sales & CRM", page: "Sales Deals" },
  "/crm/orders": { section: "Sales & CRM", page: "Sales Orders" },
  "/crm/customers": { section: "Sales & CRM", page: "Customers" },
  "/crm/invoices": { section: "Sales & CRM", page: "Invoices" },
  "/crm/payments": { section: "Sales & CRM", page: "Payments" },
  "/crm/campaigns": { section: "Sales & CRM", page: "Campaigns" },
  "/crm/reports": { section: "Sales & CRM", page: "Reports" },
  "/crm/segments": { section: "Sales & CRM", page: "Segments" },
  "/crm/audit": { section: "Sales & CRM", page: "Audit Log" },
  "/crm/dashboard": { section: "ERP Dashboard", page: "" },
};

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserInfo>({ name: "Salam Haile", role: "Sales Officer", email: "" });
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setRefreshing(true);
    try {
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) setUser(parsed);
      }
    } catch {}

    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const handleMarkAsRead = async (id: number | string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
  };

  const handleExportNotifications = () => {
    const dataStr = JSON.stringify(notifications, null, 2);
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `notifications_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pageEntry =
    Object.entries(PAGE_MAP).find(([key]) => pathname.startsWith(key)) ||
    Object.entries(PAGE_MAP).find(([key]) => pathname === key);
  const { section = "INSA ERP", page = "" } = pageEntry ? pageEntry[1] : {};

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
          <span>{section}</span>
          {page && (
            <>
              <ChevronRight style={{ width: 14, height: 14, color: "#94a3b8" }} />
              <span style={{ color: "#c8102e", fontWeight: 700 }}>{page}</span>
            </>
          )}
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, marginTop: 1 }}>
          INSA Enterprise Resource Planning System
        </p>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              height: 36,
              width: 220,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              paddingLeft: 34,
              paddingRight: 12,
              fontSize: 12,
              color: "#1e293b",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#c8102e";
              e.target.style.boxShadow = "0 0 0 3px rgba(200,16,46,0.1)";
              e.target.style.background = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#f8fafc";
            }}
          />
        </div>

        {/* Settings */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "white",
            color: "#64748b",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          title="Settings"
        >
          <Settings style={{ width: 16, height: 16 }} />
        </button>

        {/* Notifications Bell Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((p) => !p)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: isNotifOpen ? "#f8fafc" : "white",
              color: "#64748b",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            aria-label="Notifications"
          >
            <Bell style={{ width: 16, height: 16 }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#c8102e",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "white",
                  padding: "0 3px",
                  boxShadow: "0 1px 4px rgba(200,16,46,0.4)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Tray Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 340,
                background: "white",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: 10, background: "#fee2e2", color: "#c8102e", fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadNotifications();
                    }}
                    disabled={refreshing}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#64748b",
                      cursor: refreshing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      borderRadius: 6,
                    }}
                    title="Refresh notifications"
                  >
                    <RefreshCw style={{ width: 13, height: 13, transform: refreshing ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} className={refreshing ? "animate-spin" : ""} />
                  </button>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportNotifications();
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                      borderRadius: 6,
                    }}
                    title="Export notifications"
                  >
                    <Download style={{ width: 13, height: 13 }} />
                  </button>

                  {/* Mark All Read Button */}
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#0284c7",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCheck style={{ width: 13, height: 13 }} />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.readStatus && handleMarkAsRead(n.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        background: n.readStatus ? "white" : "#fff5f5",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                          {n.title}
                        </span>
                        {!n.readStatus && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8102e" }} />
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0", lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px 4px 4px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "white",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#071d3a",
              fontSize: 11,
              fontWeight: 800,
              color: "white",
            }}
          >
            {getInitials(user.name)}
          </div>
          <div style={{ display: "none" }} className="sm:block">
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 10, color: "#c8102e", fontWeight: 600 }}>
              {user.role}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}