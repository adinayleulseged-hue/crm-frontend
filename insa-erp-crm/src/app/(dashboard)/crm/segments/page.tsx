"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Layers,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  X,
  Eye,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface SegmentItem {
  id: number;
  name: string;
  category: "Industry" | "Tier" | "Region" | "Revenue";
  customerCount: number;
  totalPipelineValue: number;
  description: string;
  color: string;
}

const initialSegments: SegmentItem[] = [
  {
    id: 1,
    name: "Federal Government Ministries",
    category: "Industry",
    customerCount: 4,
    totalPipelineValue: 4250000,
    description: "Ministries and federal agencies with high-security ERP & SOC requirements.",
    color: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    id: 2,
    name: "Commercial & State Banking Sector",
    category: "Industry",
    customerCount: 2,
    totalPipelineValue: 2850000,
    description: "CBE, NBE, and private banks requiring high-availability cyber infrastructure.",
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    id: 3,
    name: "Strategic Public Utilities",
    category: "Industry",
    customerCount: 2,
    totalPipelineValue: 2330000,
    description: "Ethio Telecom, Oromia Water Works, and national utility corporations.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: 4,
    name: "Enterprise Tier 1 (ETB > 2M)",
    category: "Tier",
    customerCount: 3,
    totalPipelineValue: 5800000,
    description: "High-value enterprise accounts with dedicated Account Managers.",
    color: "border-amber-200 bg-amber-50 text-amber-700",
  },
];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New segment form
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<SegmentItem["category"]>("Industry");
  const [newDesc, setNewDesc] = useState("");

  const filtered = segments.filter((s) => {
    return (
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSeg: SegmentItem = {
      id: Date.now(),
      name: newName,
      category: newCat,
      customerCount: 1,
      totalPipelineValue: 1200000,
      description: newDesc || "Custom customer segment.",
      color: "border-blue-200 bg-blue-50 text-blue-700",
    };
    setSegments([newSeg, ...segments]);
    setIsModalOpen(false);
    setNewName("");
    setNewDesc("");
  };

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer segments..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#c8102e]"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#a80d26]"
        >
          <Plus className="h-4 w-4" />
          <span>New Segment</span>
        </button>
      </div>

      {/* Grid of Segments */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((seg) => (
          <div
            key={seg.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold ${seg.color}`}
                >
                  {seg.category}
                </span>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{seg.customerCount} Customers</span>
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900">
                {seg.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {seg.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">
                  Pipeline Value
                </div>
                <div className="text-sm font-black text-slate-900">
                  ETB {(seg.totalPipelineValue / 1000000).toFixed(2)}M
                </div>
              </div>

              <Link
                href={`/crm/customers?segment=${seg.id}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>View Accounts</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* New Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Create Customer Segment
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Commercial Banking Group"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as SegmentItem["category"])}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                >
                  <option value="Industry">Industry</option>
                  <option value="Tier">Tier</option>
                  <option value="Region">Region</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Criteria and targeting notes for this segment."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#c8102e] px-4 py-2 font-bold text-white shadow hover:bg-[#a80d26]"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
