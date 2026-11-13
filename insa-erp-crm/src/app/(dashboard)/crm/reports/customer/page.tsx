"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  Award,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

const accountsHealth = [
  { name: "Ethio Telecom", tier: "Platinum", annualRevenue: 12400000, contractsCount: 4, renewalDays: 90, health: "Good", healthScore: 94, owner: "Yonas Bekele" },
  { name: "Commercial Bank of Ethiopia", tier: "Gold", annualRevenue: 8500000, contractsCount: 3, renewalDays: 45, health: "Good", healthScore: 88, owner: "Yonas Bekele" },
  { name: "Ethiopian Airlines", tier: "Platinum", annualRevenue: 9800000, contractsCount: 3, renewalDays: 18, health: "Warning", healthScore: 68, owner: "Yonas Bekele" },
  { name: "Zemen Bank S.C.", tier: "Gold", annualRevenue: 3400000, contractsCount: 2, renewalDays: 12, health: "Risk", healthScore: 52, owner: "Dawit Mulatu" },
  { name: "Awash Bank", tier: "Silver", annualRevenue: 2100000, contractsCount: 1, renewalDays: 120, health: "Good", healthScore: 82, owner: "Salam Haile" },
  { name: "Ethiopian Shipping & Logistics", tier: "Silver", annualRevenue: 1800000, contractsCount: 1, renewalDays: 60, health: "Good", healthScore: 79, owner: "Salam Haile" },
];

export default function CustomerReportPage() {
  const totalRevenue = accountsHealth.reduce((s, a) => s + a.annualRevenue, 0);

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/reports" className="hover:text-[#059669] font-semibold">Reports</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Account Health &amp; Retention</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Key Account Portfolio &amp; Relationship Health</h1>
          <p className="text-xs text-slate-500 mt-0.5">Account ARR value, renewal countdowns, health metrics, and account manager ownership.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/crm/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Reports</span>
          </Link>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Total Portfolio Value</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">ETB {(totalRevenue / 1000000).toFixed(1)}M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Annual recurring revenue</div>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Contract Retention Rate</div>
          <div className="mt-1 text-2xl font-black text-blue-700">91.4%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">+3% vs last quarter</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Expiring &lt; 30 Days</div>
          <div className="mt-1 text-2xl font-black text-amber-600">2 Accounts</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Renewal meetings required</div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Platinum Tier Accounts</div>
          <div className="mt-1 text-2xl font-black text-purple-600">2 Accounts</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ETB 22.2M total share</div>
        </div>
      </div>

      {/* Account Health Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Key Enterprise Accounts Health Index</h2>
          <span className="text-xs text-slate-400">Total {accountsHealth.length} managed accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Annual Value (ETB)</th>
                <th className="py-3 px-4 text-center">Active Contracts</th>
                <th className="py-3 px-4 text-center">Renewal Due</th>
                <th className="py-3 px-4 text-center">Health Score</th>
                <th className="py-3 px-4">Account Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {accountsHealth.map((acc) => (
                <tr key={acc.name} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{acc.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        acc.tier === "Platinum"
                          ? "bg-purple-100 text-purple-800"
                          : acc.tier === "Gold"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      ★ {acc.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                    ETB {(acc.annualRevenue / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">{acc.contractsCount}</td>
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className={acc.renewalDays <= 20 ? "text-red-600" : acc.renewalDays <= 50 ? "text-amber-600" : "text-slate-600"}>
                      {acc.renewalDays} Days
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-extrabold text-slate-900">{acc.healthScore}%</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          acc.health === "Good"
                            ? "bg-emerald-500"
                            : acc.health === "Warning"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{acc.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
