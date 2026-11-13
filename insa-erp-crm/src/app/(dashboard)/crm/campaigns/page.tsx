"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  Megaphone,
  Calendar,
  Users,
  TrendingUp,
  Target,
  X,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface CampaignItem {
  id: number;
  campaignCode: string;
  name: string;
  type: "Email" | "Conference" | "Government Outreach" | "Digital";
  status: "ACTIVE" | "PLANNED" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  leadsGenerated: number;
  revenueGenerated: number;
}

const initialCampaigns: CampaignItem[] = [
  {
    id: 1,
    campaignCode: "CMP-2025-01",
    name: "National Cyber Security Awareness 2025",
    type: "Conference",
    status: "ACTIVE",
    startDate: "2025-06-01",
    endDate: "2025-08-30",
    budget: 850000,
    spent: 420000,
    leadsGenerated: 14,
    revenueGenerated: 3200000,
  },
  {
    id: 2,
    campaignCode: "CMP-2025-02",
    name: "Financial Institutions ERP Cloud Summit",
    type: "Government Outreach",
    status: "ACTIVE",
    startDate: "2025-07-10",
    endDate: "2025-09-15",
    budget: 500000,
    spent: 210000,
    leadsGenerated: 8,
    revenueGenerated: 2100000,
  },
  {
    id: 3,
    campaignCode: "CMP-2025-03",
    name: "Critical Infrastructure SOC Modernization",
    type: "Email",
    status: "PLANNED",
    startDate: "2025-09-01",
    endDate: "2025-11-30",
    budget: 350000,
    spent: 0,
    leadsGenerated: 0,
    revenueGenerated: 0,
  },
  {
    id: 4,
    campaignCode: "CMP-2025-04",
    name: "Q1 Public Sector Digital Transformation Expo",
    type: "Conference",
    status: "COMPLETED",
    startDate: "2025-01-15",
    endDate: "2025-03-30",
    budget: 650000,
    spent: 640000,
    leadsGenerated: 22,
    revenueGenerated: 4800000,
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<CampaignItem | null>(null);

  // New form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CampaignItem["type"]>("Conference");
  const [newBudget, setNewBudget] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.campaignCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leadsGenerated, 0);
  const totalRev = campaigns.reduce((s, c) => s + c.revenueGenerated, 0);

  const getStatusBadge = (status: CampaignItem["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PLANNED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: CampaignItem = {
      id: Date.now(),
      campaignCode: `CMP-2025-0${campaigns.length + 1}`,
      name: newName || "Strategic CRM Initiative",
      type: newType,
      status: "ACTIVE",
      startDate: newStartDate || "2025-08-01",
      endDate: newEndDate || "2025-10-31",
      budget: Number(newBudget) || 500000,
      spent: 0,
      leadsGenerated: 0,
      revenueGenerated: 0,
    };
    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    setNewName("");
    setNewBudget("");
  };

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="MARKETING OFFICER" />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Total Budget</div>
          <div className="mt-1 text-2xl font-black text-blue-700">
            ETB {(totalBudget / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700">Budget Spent</div>
          <div className="mt-1 text-2xl font-black text-purple-700">
            ETB {(totalSpent / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Leads Generated</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{totalLeads}</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Pipeline Revenue</div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            ETB {(totalRev / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#c8102e]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Marketing Campaigns ({filtered.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4 text-right">Budget</th>
                <th className="py-3 px-4 text-center">Leads</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setPreviewCampaign(c)}
                >
                  <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                    {c.campaignCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{c.type}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {c.startDate} ~ {c.endDate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ETB {c.budget.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                    {c.leadsGenerated}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewCampaign(c);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Launch Marketing Campaign
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
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Cyber Security Summit 2025"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Channel Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CampaignItem["type"])}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  >
                    <option value="Conference">Conference / Expo</option>
                    <option value="Government Outreach">Government Outreach</option>
                    <option value="Email">Email Marketing</option>
                    <option value="Digital">Digital / Media</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="750000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
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
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
