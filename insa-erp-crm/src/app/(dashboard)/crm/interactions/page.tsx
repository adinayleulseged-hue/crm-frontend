"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Filter,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface InteractionItem {
  id: string;
  customer: string;
  contactPerson: string;
  type: "Meeting" | "Call" | "Visit" | "Escalation" | "Email";
  subject: string;
  summary: string;
  date: string;
  loggedBy: string;
  status: "Completed" | "Pending Follow-up" | "Open Escalation" | "Resolved";
  priority: "High" | "Medium" | "Low";
}

const initialInteractions: InteractionItem[] = [
  {
    id: "INT-2025-081",
    customer: "Ethiopian Airlines",
    contactPerson: "Ato Samuel",
    type: "Meeting",
    subject: "Contract Renewal & SLA Negotiation",
    summary: "Discussed annual maintenance agreement terms, service levels, and enterprise support discount.",
    date: "2025-07-28 14:00",
    loggedBy: "Yonas Bekele",
    status: "Pending Follow-up",
    priority: "High",
  },
  {
    id: "INT-2025-080",
    customer: "Zemen Bank S.C.",
    contactPerson: "W/ro Helen",
    type: "Escalation",
    subject: "Service Latency in Core Network Security",
    summary: "Customer reported delayed packet filtering responses on secondary gateway. Technical team dispatched.",
    date: "2025-07-28 11:30",
    loggedBy: "Dawit Mulatu",
    status: "Open Escalation",
    priority: "High",
  },
  {
    id: "INT-2025-079",
    customer: "Commercial Bank of Ethiopia",
    contactPerson: "W/ro Almaz",
    type: "Visit",
    subject: "On-site Q3 Security Assessment Review",
    summary: "Met with Head of Infrastructure regarding biometric access integration for head office.",
    date: "2025-07-27 10:00",
    loggedBy: "Salam Haile",
    status: "Completed",
    priority: "Medium",
  },
  {
    id: "INT-2025-078",
    customer: "Ethio Telecom",
    contactPerson: "Ato Kedir",
    type: "Meeting",
    subject: "Quarterly Performance & Expansion Review",
    summary: "Reviewed network health KPI dashboard and discussed upcoming procurement batch for 5G core.",
    date: "2025-07-26 15:30",
    loggedBy: "Yonas Bekele",
    status: "Completed",
    priority: "Medium",
  },
  {
    id: "INT-2025-077",
    customer: "Awash Bank",
    contactPerson: "Ato Tesfaye",
    type: "Call",
    subject: "Monthly Account Health Check",
    summary: "Routine check-in call with IT Director. Systems stable; expressed interest in automated threat intelligence.",
    date: "2025-07-25 09:15",
    loggedBy: "Yonas Bekele",
    status: "Completed",
    priority: "Low",
  },
];

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<InteractionItem[]>(initialInteractions);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedItem, setSelectedItem] = useState<InteractionItem | null>(null);

  const filtered = interactions.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.loggedBy.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeIcon = {
    Meeting: "📅",
    Call: "📞",
    Visit: "🤝",
    Escalation: "🚨",
    Email: "✉️",
  };

  const statusBadge = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Pending Follow-up": "bg-amber-50 text-amber-700 border-amber-200",
    "Open Escalation": "bg-rose-50 text-rose-700 border-rose-200",
    Resolved: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/customers" className="hover:text-[#059669] font-semibold">Customers</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Interactions &amp; Escalations</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Customer Interactions &amp; Logged Visits</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track stakeholder meetings, customer visits, calls, and service escalations.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/crm/interactions/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Visit / Meeting</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600">Total Logged</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{interactions.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Customer interactions</div>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-rose-700">Open Escalations</div>
          <div className="mt-1 text-2xl font-black text-rose-600">
            {interactions.filter((i) => i.type === "Escalation" && i.status !== "Resolved").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Immediate attention</div>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Follow-ups Due</div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            {interactions.filter((i) => i.status === "Pending Follow-up").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scheduled for this week</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Completed Visits</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {interactions.filter((i) => i.status === "Completed").length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Healthy relationships</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interactions by customer, subject, or rep..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Meeting">Meetings</option>
            <option value="Visit">On-Site Visits</option>
            <option value="Call">Phone Calls</option>
            <option value="Escalation">Escalations</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Interaction Records ({filtered.length})</h2>
          <span className="text-xs text-slate-400">Total {interactions.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Customer &amp; Contact</th>
                <th className="py-3 px-4">Subject &amp; Summary</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <td className="py-3.5 px-4">
                    <span className="text-lg mr-1.5">{typeIcon[item.type]}</span>
                    <span className="font-bold text-slate-800">{item.type}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.customer}</div>
                    <div className="text-[11px] text-slate-400">{item.contactPerson}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-800">{item.subject}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.summary}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.date}</td>
                  <td className="py-3.5 px-4 text-slate-700">{item.loggedBy}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadge[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeIcon[selectedItem.type]}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedItem.customer}</h3>
                  <span className="text-xs text-slate-400">{selectedItem.id} · {selectedItem.type}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Subject</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedItem.subject}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Detailed Interaction Notes</span>
                <p className="font-medium text-slate-700 mt-1 leading-relaxed">{selectedItem.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Contact Person</span>
                  <div className="font-bold text-slate-900">{selectedItem.contactPerson}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Logged By</span>
                  <div className="font-bold text-slate-900">{selectedItem.loggedBy}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Date &amp; Time</span>
                  <div className="font-bold text-slate-900">{selectedItem.date}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Status</span>
                  <div>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold mt-0.5 ${statusBadge[selectedItem.status]}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
