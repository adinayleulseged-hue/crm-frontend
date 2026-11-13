"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  FileText,
  CreditCard,
  Building2,
  Users,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface AuditItem {
  id: number;
  module: "INVOICE" | "PAYMENT" | "SALES_ORDER" | "CUSTOMER" | "LEAD" | "CAMPAIGN";
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "EXPORT";
  description: string;
  performedBy: string;
  role: string;
  ipAddress: string;
  timestamp: string;
}

const initialAuditLogs: AuditItem[] = [
  {
    id: 1,
    module: "PAYMENT",
    action: "CREATE",
    description: "Payment PAY-2025-001 (ETB 1,050,000) recorded for Invoice INV-2025-041",
    performedBy: "Salam Haile",
    role: "Sales Officer",
    ipAddress: "192.168.10.45",
    timestamp: "2025-06-28 14:32:10",
  },
  {
    id: 2,
    module: "INVOICE",
    action: "CREATE",
    description: "Tax Invoice INV-2025-041 generated from Sales Order SO-2025-021",
    performedBy: "Salam Haile",
    role: "Sales Officer",
    ipAddress: "192.168.10.45",
    timestamp: "2025-06-28 11:15:04",
  },
  {
    id: 3,
    module: "SALES_ORDER",
    action: "APPROVE",
    description: "Sales Order SO-2025-021 (ETB 2,100,000) approved for Ministry of Finance",
    performedBy: "Yohannes Mitiku",
    role: "Sales Manager",
    ipAddress: "192.168.10.12",
    timestamp: "2025-06-28 09:40:22",
  },
  {
    id: 4,
    module: "INVOICE",
    action: "EXPORT",
    description: "Invoices CSV export generated (7 records)",
    performedBy: "Selamawit Kebede",
    role: "Auditor",
    ipAddress: "192.168.10.88",
    timestamp: "2025-07-15 16:05:30",
  },
  {
    id: 5,
    module: "PAYMENT",
    action: "CREATE",
    description: "Payment PAY-2025-002 (ETB 1,850,000) settled for Ethio Telecom",
    performedBy: "Salam Haile",
    role: "Sales Officer",
    ipAddress: "192.168.10.45",
    timestamp: "2025-07-02 10:14:19",
  },
  {
    id: 6,
    module: "CUSTOMER",
    action: "UPDATE",
    description: "Credit limit for Commercial Bank of Ethiopia adjusted to ETB 4,000,000",
    performedBy: "Yohannes Mitiku",
    role: "Sales Manager",
    ipAddress: "192.168.10.12",
    timestamp: "2025-07-10 13:22:50",
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditItem[]>(initialAuditLogs);
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      l.description.toLowerCase().includes(q) ||
      l.performedBy.toLowerCase().includes(q) ||
      l.ipAddress.includes(q);
    const matchesModule =
      selectedModule === "All" || l.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const getActionBadge = (action: AuditItem["action"]) => {
    switch (action) {
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "APPROVE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "EXPORT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getModuleBadge = (mod: AuditItem["module"]) => {
    switch (mod) {
      case "INVOICE":
        return "bg-rose-50 text-[#c8102e]";
      case "PAYMENT":
        return "bg-emerald-50 text-emerald-700";
      case "SALES_ORDER":
        return "bg-blue-50 text-blue-700";
      case "CUSTOMER":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="AUDITOR" />

      {/* 4 Overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Total Audit Events</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{logs.length}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Payment Settlements</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {logs.filter((l) => l.module === "PAYMENT").length}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Invoices Logged</div>
          <div className="mt-1 text-2xl font-black text-purple-700">
            {logs.filter((l) => l.module === "INVOICE").length}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Active Operators</div>
          <div className="mt-1 text-2xl font-black text-amber-600">3</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#c8102e]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Modules</option>
            <option value="INVOICE">Invoices</option>
            <option value="PAYMENT">Payments</option>
            <option value="SALES_ORDER">Sales Orders</option>
            <option value="CUSTOMER">Customers</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Compliance &amp; Security Audit Trail ({filtered.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold ${getModuleBadge(
                        log.module
                      )}`}
                    >
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {log.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{log.performedBy}</div>
                    <div className="text-[10px] text-slate-400">{log.role}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
