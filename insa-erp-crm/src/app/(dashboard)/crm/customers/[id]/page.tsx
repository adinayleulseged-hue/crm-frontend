"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/customers" className="hover:text-[#059669] font-semibold">Customers</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Customer #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Customer Profile #{id}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enterprise organization account details and contract overview.</p>
        </div>
        <Link
          href="/crm/customers"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Organization Name</span>
            <div className="font-bold text-slate-900 text-base mt-0.5">Enterprise Account #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Account Status</span>
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                Active &amp; Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">City</span>
            <div className="font-bold text-slate-900 mt-0.5">Addis Ababa, Ethiopia</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Credit Limit</span>
            <div className="font-bold text-slate-900 mt-0.5">ETB 5,000,000</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Account Manager</span>
            <div className="font-bold text-slate-900 mt-0.5">Yonas Bekele</div>
          </div>
        </div>
      </div>
    </div>
  );
}
