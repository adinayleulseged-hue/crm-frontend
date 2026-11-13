"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Building2,
  DollarSign,
  Calendar,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function SalesDealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/sales-deals/pipeline" className="hover:text-[#c8102e] font-semibold">Sales Deals</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Deal #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Sales Deal #{id}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Deal progression, proposal value, and expected close date.</p>
        </div>
        <Link
          href="/crm/sales-deals/pipeline"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Deals</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Deal Title</span>
            <div className="font-bold text-slate-900 text-base mt-0.5">Enterprise Security Project #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Deal Value</span>
            <div className="font-extrabold text-emerald-600 text-base mt-0.5">ETB 1,850,000</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Stage</span>
            <div className="font-bold text-purple-700 mt-0.5">Negotiation</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Probability</span>
            <div className="font-bold text-slate-900 mt-0.5">75% Confidence</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Target Close</span>
            <div className="font-bold text-slate-900 mt-0.5">2025-08-30</div>
          </div>
        </div>
      </div>
    </div>
  );
}
