"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Users,
  Building2,
  Megaphone,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="MARKETING MANAGER" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/segments" className="hover:text-[#7c3aed] font-semibold">Segments</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Segment #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Audience Segment #{id}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Target sector criteria, member counts, and active campaign engagement.</p>
        </div>
        <Link
          href="/crm/segments"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Segments</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Segment Name</span>
            <div className="font-bold text-slate-900 text-base mt-0.5">Key Financial Institutions #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Member Contacts</span>
            <div className="text-purple-700 font-extrabold text-base mt-0.5">48 Organizations</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Industry Sector</span>
            <div className="font-bold text-slate-900 mt-0.5">Banking &amp; Financial</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Engagement Level</span>
            <div className="font-bold text-emerald-600 mt-0.5">72% Active</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Last Campaign</span>
            <div className="font-bold text-slate-900 mt-0.5">Q3 Banking Outreach</div>
          </div>
        </div>
      </div>
    </div>
  );
}
