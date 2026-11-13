"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Users,
  Target,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function CreateSegmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("Banking & Financial");
  const [minRevenue, setMinRevenue] = useState("1000000");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push("/crm/segments");
    }, 1200);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="MARKETING MANAGER" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/segments" className="hover:text-[#7c3aed] font-semibold">Segments</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Target Segment</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Create Audience Segment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Define criteria to group prospective customers for targeted campaigns.</p>
        </div>
        <Link
          href="/crm/segments"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Segments</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Segment created and ready for campaigns! Redirecting...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Segment Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Commercial Banks - Tier 1"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Industry Sector *
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Banking & Financial">Banking &amp; Financial Services</option>
              <option value="Telecommunications">Telecommunications &amp; ISPs</option>
              <option value="Federal Government">Federal Government Ministries</option>
              <option value="Healthcare & Insurance">Healthcare &amp; Insurance</option>
              <option value="Manufacturing & Transport">Manufacturing &amp; Logistics</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Minimum Annual IT/Security Budget (ETB)
          </label>
          <input
            type="number"
            value={minRevenue}
            onChange={(e) => setMinRevenue(e.target.value)}
            placeholder="1000000"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Segment Description &amp; Targeting Notes
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Target organizations requiring PCI-DSS compliance, SOC integration..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/segments"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-purple-800 transition shadow-xs"
          >
            Create Segment
          </button>
        </div>
      </form>
    </div>
  );
}
