"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  DollarSign,
  Layers,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="MARKETING MANAGER" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/campaigns" className="hover:text-[#7c3aed] font-semibold">Campaigns</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Campaign #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Campaign Performance #{id}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Marketing campaign reach, lead metrics, and conversion ROI.</p>
        </div>
        <Link
          href="/crm/campaigns"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Campaign Name</span>
            <div className="font-bold text-slate-900 text-base mt-0.5">Enterprise Outreach Initiative #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Status</span>
            <div>
              <span className="inline-flex rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                Active &amp; Running
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Budget Allocated</span>
            <div className="font-bold text-slate-900 mt-0.5">ETB 180,000</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Leads Generated</span>
            <div className="font-bold text-emerald-600 mt-0.5">42 Qualified</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Return on Investment</span>
            <div className="font-bold text-purple-700 mt-0.5">+24% ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
