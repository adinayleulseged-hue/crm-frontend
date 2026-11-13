"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Target,
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

const forecastQuarters = [
  { quarter: "Q3 FY2025 (Current)", committed: "ETB 4.8M", weighted: "ETB 5.6M", bestCase: "ETB 6.9M", target: "ETB 5.0M", probability: "92%" },
  { quarter: "Q4 FY2025", committed: "ETB 5.2M", weighted: "ETB 6.1M", bestCase: "ETB 7.8M", target: "ETB 5.5M", probability: "85%" },
  { quarter: "Q1 FY2026", committed: "ETB 4.0M", weighted: "ETB 5.4M", bestCase: "ETB 7.2M", target: "ETB 5.8M", probability: "74%" },
  { quarter: "Q2 FY2026", committed: "ETB 3.5M", weighted: "ETB 4.9M", bestCase: "ETB 6.5M", target: "ETB 6.0M", probability: "65%" },
];

export default function ForecastReportPage() {
  return (
    <div className="space-y-5">
      <CrmHeader activeRole="SALES MANAGER" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/reports" className="hover:text-[#1d4ed8] font-semibold">Reports</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Revenue Forecasting</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Revenue Forecast &amp; Target Modeling</h1>
          <p className="text-xs text-slate-500 mt-0.5">Weighted pipeline revenue projections, target quotas, and deal close probabilities.</p>
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
        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Committed Q3 Forecast</div>
          <div className="mt-1 text-2xl font-black text-blue-700">ETB 4.80M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">92% confidence level</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Weighted Pipeline</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">ETB 5.60M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Exceeds Q3 target (112%)</div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Best Case Scenario</div>
          <div className="mt-1 text-2xl font-black text-purple-600">ETB 6.90M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">If all active proposals close</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Annual Target</div>
          <div className="mt-1 text-2xl font-black text-amber-600">ETB 22.3M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">FY2025/2026 Budget</div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Quarterly Pipeline Projections</h2>
          <span className="text-xs text-slate-400">Model: Stage Weighted Probability</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Period / Quarter</th>
                <th className="py-3 px-4 text-right">Committed</th>
                <th className="py-3 px-4 text-right">Weighted Pipeline</th>
                <th className="py-3 px-4 text-right">Best Case</th>
                <th className="py-3 px-4 text-right">Target Quota</th>
                <th className="py-3 px-4 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {forecastQuarters.map((f) => (
                <tr key={f.quarter} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{f.quarter}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-blue-700">{f.committed}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">{f.weighted}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-purple-700">{f.bestCase}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-700">{f.target}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                      {f.probability}
                    </span>
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
