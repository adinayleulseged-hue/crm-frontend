"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/orders" className="hover:text-[#c8102e] font-semibold">Sales Orders</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Order #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Sales Order #{id} Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enterprise order fulfillment and invoicing status.</p>
        </div>
        <Link
          href="/crm/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Customer Entity</span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Enterprise Client #{id}</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Order Status</span>
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                Confirmed &amp; Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 font-semibold">Order Date</span>
            <div className="font-bold text-slate-900 mt-0.5">2025-07-20</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Fulfillment Date</span>
            <div className="font-bold text-slate-900 mt-0.5">2025-08-20</div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Assigned Representative</span>
            <div className="font-bold text-slate-900 mt-0.5">Salam Haile</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <h3 className="font-bold text-slate-900 mb-2">Order Line Items</h3>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Enterprise Security Gateway License</span>
            <span className="font-bold text-slate-900">ETB 1,200,000</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Quarterly SOC Monitoring &amp; Support</span>
            <span className="font-bold text-slate-900">ETB 650,000</span>
          </div>
          <div className="flex justify-between pt-3 text-sm font-extrabold text-slate-900">
            <span>Total Value</span>
            <span className="text-emerald-600">ETB 1,850,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
