"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  DollarSign,
  Layers,
  CheckCircle2,
  Send,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import campaignService from "@/services/campaignService";

// Map display channel → backend CampaignType enum
const toCampaignType = (channel: string): string => {
  const map: Record<string, string> = {
    "Email Outreach": "EMAIL",
    "Digital / Web": "WEBSITE",
    "Direct Executive Briefing": "OTHER",
    "Trade Show / Seminar": "SEMINAR",
    "Social Channels": "SOCIAL_MEDIA",
  };
  return map[channel] ?? "OTHER";
};

export default function CreateCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("Email Outreach");
  const [segment, setSegment] = useState("Enterprise & Financial");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [objective, setObjective] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await campaignService.createCampaign({
        campaignName: name,
        campaignType: toCampaignType(channel),
        budget: budget ? Number(budget) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        notes: objective || undefined,
        targetAudience: segment,
      } as any);
      setSuccess(true);
      setTimeout(() => {
        router.push("/crm/campaigns");
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create campaign. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="MARKETING MANAGER" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/campaigns" className="hover:text-[#7c3aed] font-semibold">Campaigns</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Campaign</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Launch Marketing Campaign</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure target segment, budget allocation, schedule, and messaging channel.</p>
        </div>
        <Link
          href="/crm/campaigns"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Campaign configured and activated successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Campaign Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Banking Cybersecurity Infrastructure Awareness"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Marketing Channel *
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Email Outreach">Direct Email Outreach</option>
              <option value="Digital / Web">Digital &amp; Web Portals</option>
              <option value="Direct Executive Briefing">Direct Executive Briefing</option>
              <option value="Trade Show / Seminar">Trade Show / Seminar</option>
              <option value="Social Channels">Social Channels</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Target Audience Segment *
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Enterprise & Financial">Enterprise &amp; Financial Institutions</option>
              <option value="Telecom & Utilities">Telecom &amp; Public Utilities</option>
              <option value="Federal Government Ministries">Federal Government Ministries</option>
              <option value="Private SME Cyber Sector">Private SME Cyber Sector</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Budget Allocation (ETB) *
            </label>
            <input
              type="number"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="180000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              End Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Campaign Objectives &amp; Expected Leads
          </label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Target 40+ qualified leads, demonstrate enterprise cryptographic solutions..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#7c3aed] focus:bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/campaigns"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-purple-800 transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Launch Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
