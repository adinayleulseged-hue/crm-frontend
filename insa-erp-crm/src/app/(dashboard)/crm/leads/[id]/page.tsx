"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Building2,
  Phone,
  Mail,
  DollarSign,
  Target,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/leads" className="hover:text-[#c8102e] font-semibold">Leads</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Lead #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Lead Record #{id}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Prospect details, engagement score, and pipeline stage.</p>
        </div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Company / Entity</span>
            <div className="font-bold text-slate-900 text-base mt-0.5">Commercial Prospect #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Lead Score</span>
            <div className="text-emerald-600 font-extrabold text-base mt-0.5">85 / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Pipeline Stage</span>
            <div className="font-bold text-blue-600 mt-0.5">Qualified &amp; Proposal</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Estimated Value</span>
            <div className="font-bold text-slate-900 mt-0.5">ETB 1,850,000</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Assigned Rep</span>
            <div className="font-bold text-slate-900 mt-0.5">Salam Haile</div>
          </div>
        </div>
      </div>
    </div>
  );
}
