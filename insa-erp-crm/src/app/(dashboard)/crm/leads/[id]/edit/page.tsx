"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState("Ethiopian Airlines");
  const [contactName, setContactName] = useState("Ato Kebede");
  const [value, setValue] = useState("1850000");
  const [stage, setStage] = useState("Qualified");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => router.push("/crm/leads"), 1000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/leads" className="hover:text-[#c8102e] font-semibold">Leads</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Edit Lead #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Modify Lead Record #{id}</h1>
        </div>
        <Link href="/crm/leads" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lead updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Company Name</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Contact Person</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Estimated Value (ETB)</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Pipeline Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link href="/crm/leads" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
          <button type="submit" className="px-5 py-2 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
