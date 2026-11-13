"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Building2,
  Phone,
  Mail,
  DollarSign,
  Target,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import leadService from "@/services/leadService";

// Map display source label → backend LeadSource enum
const toLeadSource = (s: string): string => {
  const map: Record<string, string> = {
    "Direct Outreach": "COLD_CALL",
    "Government Tender": "EVENT",
    "Inbound Campaign": "WEBSITE",
    "Partner Referral": "REFERRAL",
    "Expo / Trade Event": "EVENT",
  };
  return map[s] ?? "COLD_CALL";
};

export default function CreateLeadPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("Direct Outreach");
  const [stage, setStage] = useState("Qualified");
  const [value, setValue] = useState("");
  const [score, setScore] = useState("75");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Split contactName into first + last for the DTO
  const splitName = (full: string) => {
    const parts = full.trim().split(/\s+/);
    const firstName = parts[0] ?? full;
    const lastName = parts.slice(1).join(" ") || "-";
    return { firstName, lastName };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { firstName, lastName } = splitName(contactName);
      await leadService.createLead({
        firstName,
        lastName,
        company,
        phone,
        email,
        source: toLeadSource(source),
        score: Number(score),
        budget: value ? Number(value) : undefined,
        notes,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/crm/leads");
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create lead. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/leads" className="hover:text-[#c8102e] font-semibold">Leads</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Prospect</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Create New Sales Lead</h1>
          <p className="text-xs text-slate-500 mt-0.5">Register a new enterprise customer lead into the CRM pipeline.</p>
        </div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lead created successfully! Redirecting to leads list...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Company / Entity Name *
            </label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Ethiopian Sugar Corporation"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Primary Contact Person *
            </label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Ato Tadesse Mekonnen"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 911 000 000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@entity.gov.et"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Lead Source *
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Direct Outreach">Direct Outreach</option>
              <option value="Government Tender">Government Tender</option>
              <option value="Inbound Campaign">Inbound Campaign</option>
              <option value="Partner Referral">Partner Referral</option>
              <option value="Expo / Trade Event">Expo / Trade Event</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Estimated Value (ETB) *
            </label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="1200000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Initial Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="New">New Prospect</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Sales Deal Notes &amp; Scope
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Security requirements, current infrastructure, budget cycle..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/leads"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
