"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function EditSalesDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("Enterprise Security Gateway Upgrade");
  const [amount, setAmount] = useState("1850000");
  const [stage, setStage] = useState("Proposal");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => router.push("/crm/sales-deals/pipeline"), 1000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/sales-deals/pipeline" className="hover:text-[#c8102e] font-semibold">Sales Deals</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Edit Deal #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Modify Sales Deal #{id}</h1>
        </div>
        <Link href="/crm/sales-deals/pipeline" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sales Deal updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Sales Deal Title</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Deal Value (ETB)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Discovery">Discovery</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link href="/crm/sales-deals/pipeline" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
          <button type="submit" className="px-5 py-2 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
