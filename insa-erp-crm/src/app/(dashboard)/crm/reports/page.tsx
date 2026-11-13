"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  FileText,
  CreditCard,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function ReportsPage() {
  const [period, setPeriod] = useState("FY 2025");

  const revenueByMonth = [
    { month: "Jan", revenue: 850000, target: 1000000 },
    { month: "Feb", revenue: 1200000, target: 1000000 },
    { month: "Mar", revenue: 950000, target: 1100000 },
    { month: "Apr", revenue: 1450000, target: 1200000 },
    { month: "May", revenue: 1850000, target: 1500000 },
    { month: "Jun", revenue: 2100000, target: 1800000 },
    { month: "Jul", revenue: 2400000, target: 2000000 },
  ];

  const leadConversionFunnel = [
    { stage: "Total Leads", count: 8, pct: "100%", val: "ETB 9.8M" },
    { stage: "Qualified", count: 6, pct: "75%", val: "ETB 7.3M" },
    { stage: "Proposals Submitted", count: 4, pct: "50%", val: "ETB 5.9M" },
    { stage: "Negotiations", count: 3, pct: "37.5%", val: "ETB 4.1M" },
    { stage: "Closed Won", count: 1, pct: "13%", val: "ETB 2.1M" },
  ];

  const paymentMethodShare = [
    { method: "Bank Transfer", amount: 2985000, pct: "86.1%", count: 5 },
    { method: "Cheque", amount: 480000, pct: "13.9%", count: 1 },
    { method: "Cash", amount: 0, pct: "0.0%", count: 0 },
  ];

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="SALES MANAGER" />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Total Invoiced</div>
          <div className="mt-1 text-2xl font-black text-blue-700">ETB 6.08M</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Total Collected</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">ETB 2.19M</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Outstanding Balance</div>
          <div className="mt-1 text-2xl font-black text-amber-600">ETB 3.89M</div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Win Rate</div>
          <div className="mt-1 text-2xl font-black text-purple-700">13%</div>
        </div>
      </div>

      {/* Grid of 2 Charts / Breakdown Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Monthly Revenue Trend */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Revenue Performance
              </h3>
              <p className="text-[11px] text-slate-400">
                Actual Collected vs Budget Target (ETB)
              </p>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              FY 2025
            </span>
          </div>

          <div className="relative mt-6 h-56 w-full">
            <div className="absolute bottom-4 left-4 right-4 flex h-40 items-end justify-between">
              {revenueByMonth.map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      className="w-3.5 rounded-t bg-blue-600 transition hover:opacity-80"
                      style={{ height: `${(item.revenue / 2500000) * 140}px` }}
                      title={`Actual: ETB ${item.revenue.toLocaleString()}`}
                    />
                    <div
                      className="w-3.5 rounded-t bg-slate-300 transition hover:opacity-80"
                      style={{ height: `${(item.target / 2500000) * 140}px` }}
                      title={`Target: ETB ${item.target.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-blue-600" />
              <span className="font-semibold text-slate-700">Actual Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded bg-slate-300" />
              <span className="font-semibold text-slate-700">Budget Target</span>
            </div>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sales Conversion Funnel
                </h3>
                <p className="text-[11px] text-slate-400">
                  Lead Qualification &rarr; Closed Won
                </p>
              </div>
              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                Pipeline
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {leadConversionFunnel.map((step, idx) => (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{step.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{step.val}</span>
                      <span className="font-bold text-slate-900">{step.count} ({step.pct})</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-[#c8102e]"
                      style={{ width: step.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Overall Conversion Win Rate:</span>
            <span className="font-bold text-[#c8102e] text-sm">13.0%</span>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Settlement Breakdown by Payment Channel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentMethodShare.map((m) => (
            <div key={m.method} className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4">
              <div className="text-[11px] font-semibold text-slate-500">{m.method}</div>
              <div className="mt-1 text-xl font-black text-slate-900">
                ETB {m.amount.toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-bold text-blue-600">
                {m.pct} of total collections ({m.count} txns)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
