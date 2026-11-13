"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  List as ListIcon,
  Kanban as KanbanIcon,
  Phone,
  Building2,
  DollarSign,
  User,
  ArrowRight,
  Filter,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface KanbanLead {
  id: string;
  leadCode: string;
  company: string;
  contactName: string;
  value: number;
  score: number;
  stage: "New" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won";
  assignedTo: string;
}

const initialLeads: KanbanLead[] = [
  { id: "1", leadCode: "LED-001", company: "Ethiopian Airlines", contactName: "Ato Kebede", value: 1850000, score: 72, stage: "Qualified", assignedTo: "Salam Haile" },
  { id: "2", leadCode: "LED-002", company: "Addis Ababa City Admin", contactName: "Ato Solomon", value: 1200000, score: 85, stage: "Proposal", assignedTo: "Salam Haile" },
  { id: "3", leadCode: "LED-003", company: "Zemen Bank S.C.", contactName: "W/ro Tigist", value: 420000, score: 91, stage: "Proposal", assignedTo: "Dawit Mulatu" },
  { id: "4", leadCode: "LED-004", company: "Ethio Telecom Core", contactName: "Ato Dawit", value: 3500000, score: 94, stage: "Negotiation", assignedTo: "Dawit Mulatu" },
  { id: "5", leadCode: "LED-005", company: "Awash Insurance S.C.", contactName: "Ato Yonas", value: 185000, score: 68, stage: "New", assignedTo: "Salam Haile" },
  { id: "6", leadCode: "LED-006", company: "Nib International Bank", contactName: "W/ro Hanna", value: 90000, score: 45, stage: "New", assignedTo: "Salam Haile" },
  { id: "7", leadCode: "LED-007", company: "Ministry of Innovation (MInT)", contactName: "Ato Haile", value: 890000, score: 78, stage: "Qualified", assignedTo: "Yonas Girma" },
  { id: "8", leadCode: "LED-008", company: "Commercial Bank of Ethiopia", contactName: "Ato Ermias", value: 2100000, score: 98, stage: "Closed Won", assignedTo: "Salam Haile" },
];

const COLUMNS: Array<{ key: KanbanLead["stage"]; title: string; color: string; bg: string }> = [
  { key: "New", title: "New Leads", color: "#64748b", bg: "#f1f5f9" },
  { key: "Qualified", title: "Qualified", color: "#2563eb", bg: "#eff6ff" },
  { key: "Proposal", title: "Proposal Sent", color: "#d97706", bg: "#fffbeb" },
  { key: "Negotiation", title: "Negotiation", color: "#7c3aed", bg: "#f5f3ff" },
  { key: "Closed Won", title: "Closed Won", color: "#059669", bg: "#ecfdf5" },
];

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<KanbanLead[]>(initialLeads);
  const [search, setSearch] = useState("");

  const filtered = leads.filter(
    (l) =>
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      l.leadCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="MARKETING MANAGER" />

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/leads" className="hover:text-[#c8102e] font-semibold">Leads</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Visual Pipeline Kanban</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Lead Pipeline &amp; Stage Flow</h1>
          <p className="text-xs text-slate-500 mt-0.5">Visualize your marketing and sales lead progression across deal stages.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/crm/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ListIcon className="w-4 h-4" />
            <span>Table View</span>
          </Link>
          <Link
            href="/crm/leads/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8102e] text-white text-xs font-bold hover:bg-[#a80d26] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter pipeline leads..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#c8102e]"
        />
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colLeads = filtered.filter((l) => l.stage === col.key);
          const colTotal = colLeads.reduce((s, l) => s + l.value, 0);

          return (
            <div
              key={col.key}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-xs font-bold text-slate-800">{col.title}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {colLeads.length}
                </span>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ETB {(colTotal / 1000).toFixed(0)}K Total
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:shadow-xs transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-[#c8102e]">{lead.leadCode}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                        Score: {lead.score}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">
                      {lead.company}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-2.5">
                      {lead.contactName}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-bold text-emerald-600">
                        ETB {(lead.value / 1000).toFixed(0)}K
                      </span>
                      <span className="text-[10px] text-slate-400">{lead.assignedTo.split(" ")[0]}</span>
                    </div>
                  </div>
                ))}

                {colLeads.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
