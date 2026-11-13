"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  List as ListIcon,
  Target,
  DollarSign,
  Building2,
  Calendar,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface PipelineDeal {
  id: string;
  name: string;
  customer: string;
  amount: number;
  stage: "Discovery" | "Proposal" | "Negotiation" | "Closed Won";
  closeDate: string;
  rep: string;
}

const initialDeals: PipelineDeal[] = [
  { id: "1", name: "Cyber Range Simulation Center", customer: "Ethio Telecom", amount: 3500000, stage: "Negotiation", closeDate: "2025-08-15", rep: "Dawit Mulatu" },
  { id: "2", name: "Core SOC Incident Response Integration", customer: "Commercial Bank of Ethiopia", amount: 2100000, stage: "Closed Won", closeDate: "2025-07-28", rep: "Salam Haile" },
  { id: "3", name: "Airport Access Cryptographic Modules", customer: "Ethiopian Airlines", amount: 1850000, stage: "Proposal", closeDate: "2025-08-20", rep: "Yonas Girma" },
  { id: "4", name: "Smart City Traffic Surveillance Security", customer: "Addis Ababa City Admin", amount: 1200000, stage: "Proposal", closeDate: "2025-08-30", rep: "Salam Haile" },
  { id: "5", name: "Cloud Firewall & DDoS Shield", customer: "Zemen Bank S.C.", amount: 420000, stage: "Discovery", closeDate: "2025-09-10", rep: "Dawit Mulatu" },
  { id: "6", name: "Endpoint Threat Detection", customer: "Awash Insurance", amount: 185000, stage: "Discovery", closeDate: "2025-09-15", rep: "Salam Haile" },
];

const STAGES = [
  { key: "Discovery", title: "Discovery", color: "#64748b" },
  { key: "Proposal", title: "Proposal", color: "#d97706" },
  { key: "Negotiation", title: "Negotiation", color: "#7c3aed" },
  { key: "Closed Won", title: "Closed Won", color: "#059669" },
];

export default function OpportunityPipelinePage() {
  const [deals, setDeals] = useState<PipelineDeal[]>(initialDeals);
  const [search, setSearch] = useState("");

  const filtered = deals.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.rep.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="SALES MANAGER" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/sales-deals" className="hover:text-[#c8102e] font-semibold">Sales Deals</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Visual Pipeline</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Sales Deals Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track deal flow through active qualification and negotiation stages.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/crm/sales-deals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ListIcon className="w-4 h-4" />
            <span>Table View</span>
          </Link>
          <Link
            href="/crm/sales-deals/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c8102e] text-white text-xs font-bold hover:bg-[#a80d26] transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Deal</span>
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {STAGES.map((st) => {
          const stDeals = filtered.filter((d) => d.stage === st.key);
          const stTotal = stDeals.reduce((s, d) => s + d.amount, 0);

          return (
            <div key={st.key} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
                  <span className="text-xs font-bold text-slate-800">{st.title}</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {stDeals.length}
                </span>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ETB {(stTotal / 1000000).toFixed(2)}M Total
              </div>

              <div className="space-y-2.5 flex-1">
                {stDeals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight mb-1">{deal.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mb-2">{deal.customer}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-extrabold text-emerald-600">ETB {(deal.amount / 1000).toLocaleString()}K</span>
                      <span className="text-[10px] text-slate-400">Due: {deal.closeDate.slice(5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
