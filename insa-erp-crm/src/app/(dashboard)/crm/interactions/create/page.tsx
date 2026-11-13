"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Building2,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function CreateInteractionPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [type, setType] = useState<"Visit" | "Meeting" | "Call" | "Escalation">("Visit");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push("/crm/interactions");
    }, 1200);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/interactions" className="hover:text-[#059669] font-semibold">Interactions</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Log Interaction</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Log Customer Visit or Meeting</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record on-site client interactions, meeting minutes, calls, or urgent escalations.</p>
        </div>
        <Link
          href="/crm/interactions"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to List</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Interaction logged successfully! Redirecting to interactions log...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Customer / Organization *
            </label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Ethiopian Airlines"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Contact Person / Title *
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Ato Samuel (Head of IT)"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Interaction Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Visit">On-Site Customer Visit</option>
              <option value="Meeting">Formal Meeting</option>
              <option value="Call">Phone Call</option>
              <option value="Escalation">Service Escalation</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Subject / Discussion Topic *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Q3 Security Suite Renewal and Key Deliverables"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Discussion Summary &amp; Action Items *
          </label>
          <textarea
            required
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Document key points discussed, agreements reached, and follow-up tasks..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/interactions"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#059669] text-white font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            Save Interaction
          </button>
        </div>
      </form>
    </div>
  );
}
