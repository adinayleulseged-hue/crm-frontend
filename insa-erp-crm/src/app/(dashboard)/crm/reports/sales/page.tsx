"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  ArrowLeft,
  Download,
  Calendar,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

const teamData = [
  { name: "Salam Haile", target: 1200000, closed: 1050000, deals: 6, pipeline: 1850000, status: "On Track" },
  { name: "Yonas Girma", target: 1200000, closed: 1210000, deals: 7, pipeline: 2100000, status: "Exceeded" },
  { name: "Dawit Mulatu", target: 1200000, closed: 820000, deals: 4, pipeline: 1400000, status: "Warning" },
  { name: "Hanna Tesfaye", target: 1200000, closed: 940000, deals: 5, pipeline: 1100000, status: "On Track" },
  { name: "Tigist Bekele", target: 1200000, closed: 180000, deals: 1, pipeline: 850000, status: "At Risk" },
];

const monthlySales = [
  { month: "Jan", amount: 2.8, deals: 14 },
  { month: "Feb", amount: 3.2, deals: 16 },
  { month: "Mar", amount: 3.9, deals: 19 },
  { month: "Apr", amount: 3.5, deals: 17 },
  { month: "May", amount: 4.1, deals: 21 },
  { month: "Jun", amount: 4.6, deals: 23 },
  { month: "Jul", amount: 4.2, deals: 23 },
];

export default function SalesReportPage() {
  const [period, setPeriod] = useState("Q3 FY2025");

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="SALES MANAGER" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/reports" className="hover:text-[#1d4ed8] font-semibold">Reports</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Sales &amp; Team Performance</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Sales &amp; Team Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive quota attainment, rep deal velocity, and team revenue output.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/crm/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Reports</span>
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071d3a] text-white text-xs font-bold hover:bg-[#0c2b5b] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Total Closed Sales</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">ETB 4.20M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">+8.7% vs last month</div>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Team Target Attainment</div>
          <div className="mt-1 text-2xl font-black text-blue-700">87.5%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ETB 4.2M / 4.8M Target</div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Active Deals in Pipe</div>
          <div className="mt-1 text-2xl font-black text-purple-600">23 Deals</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ETB 7.30M pipeline value</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Top Performer</div>
          <div className="mt-1 text-lg font-black text-amber-600">Yonas Girma</div>
          <div className="text-[10px] text-slate-400 mt-0.5">100.8% of individual quota</div>
        </div>
      </div>

      {/* Team Breakdown Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Sales Representative Attainment Leaderboard</h2>
          <span className="text-xs text-slate-400">Current Q3 Period</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Representative</th>
                <th className="py-3 px-4 text-right">Target (ETB)</th>
                <th className="py-3 px-4 text-right">Closed (ETB)</th>
                <th className="py-3 px-4 text-center">Deals Won</th>
                <th className="py-3 px-4 text-right">Pipeline (ETB)</th>
                <th className="py-3 px-4 text-center">Quota %</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamData.map((rep) => {
                const pct = Math.round((rep.closed / rep.target) * 100);
                return (
                  <tr key={rep.name} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{rep.name}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      ETB {(rep.target / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                      ETB {(rep.closed / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{rep.deals}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-blue-600">
                      ETB {(rep.pipeline / 1000).toLocaleString()}K
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-slate-900">{pct}%</span>
                      <div className="w-20 mx-auto h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct >= 100 ? "#10b981" : pct >= 70 ? "#3b82f6" : "#f59e0b",
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          rep.status === "Exceeded"
                            ? "bg-purple-100 text-purple-800"
                            : rep.status === "On Track"
                            ? "bg-emerald-100 text-emerald-800"
                            : rep.status === "Warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
