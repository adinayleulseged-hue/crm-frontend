"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  List as ListIcon,
  Kanban,
  ExternalLink,
  ChevronDown,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import leadService from "@/services/leadService";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED" | "UNQUALIFIED" | "LOST" | "CONVERTED";

interface LeadItem {
  id: string | number;
  leadCode: string;
  company: string;
  contactName: string;
  phone: string;
  source: string;
  stage: "New" | "Qualified" | "Disqualified" | "Proposal" | "Negotiation" | "Closed Won" | "Lost";
  status?: LeadStatus; // Backend lead status
  score: number;
  value: number;
  assignedTo?: string;
  email?: string;
  disqualificationReason?: string;
  notes?: string;
}

const initialLeads: LeadItem[] = [
  {
    id: 1,
    leadCode: "LED-2025-001",
    company: "Ethiopian Airlines",
    contactName: "Ato Kebede",
    phone: "+251 911 100 200",
    source: "Direct",
    stage: "Qualified",
    status: "QUALIFIED",
    score: 82,
    value: 1850000,
    email: "kebede@ethiopianairlines.com",
    assignedTo: "Salam Haile",
  },
  {
    id: 2,
    leadCode: "LED-2025-002",
    company: "Addis Ababa City Admin",
    contactName: "Ato Solomon",
    phone: "+251 911 200 300",
    source: "Government Tender",
    stage: "Proposal",
    status: "QUALIFIED",
    score: 85,
    value: 1200000,
    email: "solomon@addisababacity.gov.et",
    assignedTo: "Salam Haile",
  },
  {
    id: 3,
    leadCode: "LED-2025-003",
    company: "Commercial Bank of Ethiopia",
    contactName: "W/ro Aster",
    phone: "+251 911 300 400",
    source: "Referral",
    stage: "Negotiation",
    status: "QUALIFIED",
    score: 91,
    value: 2100000,
    email: "aster@cbe.com.et",
    assignedTo: "Salam Haile",
  },
  {
    id: 4,
    leadCode: "LED-2025-004",
    company: "Ethio Telecom",
    contactName: "Ato Henok",
    phone: "+251 911 400 500",
    source: "Conference",
    stage: "Closed Won",
    status: "CONVERTED",
    score: 98,
    value: 980000,
    email: "henok@ethiotelecom.et",
    assignedTo: "Salam Haile",
  },
  {
    id: 5,
    leadCode: "LED-2025-005",
    company: "Ministry of Innovation & Tech",
    contactName: "Dr. Birhanu",
    phone: "+251 911 500 600",
    source: "Government Tender",
    stage: "Qualified",
    status: "QUALIFIED",
    score: 78,
    value: 750000,
    email: "birhanu@mint.gov.et",
    assignedTo: "Salam Haile",
  },
  {
    id: 6,
    leadCode: "LED-2025-006",
    company: "Ministry of Revenues",
    contactName: "Ato Dawit",
    phone: "+251 911 600 700",
    source: "Direct",
    stage: "Proposal",
    status: "QUALIFIED",
    score: 76,
    value: 1100000,
    email: "dawit@mor.gov.et",
    assignedTo: "Salam Haile",
  },
  {
    id: 7,
    leadCode: "LED-2025-007",
    company: "National Bank of Ethiopia",
    contactName: "W/ro Tigist",
    phone: "+251 911 700 800",
    source: "Referral",
    stage: "New",
    status: "NEW",
    score: 54,
    value: 620000,
    email: "tigist@nbe.gov.et",
    assignedTo: "Salam Haile",
    notes: "New lead submitted via website contact form - awaiting admin review",
  },
  {
    id: 8,
    leadCode: "LED-2025-008",
    company: "Oromia Water Works",
    contactName: "Ato Gemechu",
    phone: "+251 911 800 900",
    source: "Website",
    stage: "New",
    status: "NEW",
    score: 60,
    value: 450000,
    email: "gemechu@owwdse.com",
    assignedTo: "Salam Haile",
    notes: "Inquired about biometric access control",
  },
];

const PRESET_DISQUALIFY_REASONS = [
  "Budget too low / Insufficient funding",
  "Product/Service mismatch (Not looking for INSA security/software)",
  "Invalid contact details or spam inquiry",
  "Competitor market research",
  "No response after multiple follow-ups",
  "Other",
];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  // New Lead Form State
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("Direct");
  const [newValue, setNewValue] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [qualifyingLeadId, setQualifyingLeadId] = useState<string | number | null>(null);

  // Disqualification Modal State
  const [disqualifyingLead, setDisqualifyingLead] = useState<LeadItem | null>(null);
  const [disqualifyReasonOption, setDisqualifyReasonOption] = useState(PRESET_DISQUALIFY_REASONS[0]);
  const [customDisqualifyReason, setCustomDisqualifyReason] = useState("");
  const [isSubmittingDisqualify, setIsSubmittingDisqualify] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  // Admin Qualify Action
  const handleQualifyLead = async (lead: LeadItem) => {
    setQualifyingLeadId(lead.id);
    try {
      await leadService.qualifyLead(lead.id);
      
      const updatedList = leads.map((l) =>
        l.id === lead.id
          ? {
              ...l,
              status: "QUALIFIED" as LeadStatus,
              stage: "Qualified" as const,
              score: Math.max(l.score, 80),
              disqualificationReason: undefined,
            }
          : l
      );
      setLeads(updatedList);
      
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead({
          ...selectedLead,
          status: "QUALIFIED",
          stage: "Qualified",
          score: Math.max(selectedLead.score, 80),
          disqualificationReason: undefined,
        });
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("crm_custom_leads", JSON.stringify(updatedList));
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to qualify lead");
    } finally {
      setQualifyingLeadId(null);
    }
  };

  // Admin Open Disqualify Modal
  const openDisqualifyModal = (lead: LeadItem) => {
    setDisqualifyingLead(lead);
    setDisqualifyReasonOption(PRESET_DISQUALIFY_REASONS[0]);
    setCustomDisqualifyReason("");
  };

  // Admin Submit Disqualify Action
  const handleConfirmDisqualify = async () => {
    if (!disqualifyingLead) return;
    setIsSubmittingDisqualify(true);

    const finalReason =
      disqualifyReasonOption === "Other"
        ? customDisqualifyReason.trim() || "Disqualified by Admin"
        : disqualifyReasonOption;

    try {
      await leadService.disqualifyLead(disqualifyingLead.id, finalReason);

      const updatedList = leads.map((l) =>
        l.id === disqualifyingLead.id
          ? {
              ...l,
              status: "DISQUALIFIED" as LeadStatus,
              stage: "Disqualified" as const,
              disqualificationReason: finalReason,
            }
          : l
      );
      setLeads(updatedList);

      if (selectedLead && selectedLead.id === disqualifyingLead.id) {
        setSelectedLead({
          ...selectedLead,
          status: "DISQUALIFIED",
          stage: "Disqualified",
          disqualificationReason: finalReason,
        });
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("crm_custom_leads", JSON.stringify(updatedList));
        } catch (e) {}
      }

      setDisqualifyingLead(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to disqualify lead");
    } finally {
      setIsSubmittingDisqualify(false);
    }
  };

  useEffect(() => {
    async function fetchLeads() {
      let apiMapped: LeadItem[] = [];
      try {
        const res = await fetch(`${API_URL}/api/leads`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data?.content || json?.data || json?.content || (Array.isArray(json) ? json : null);
          if (items && items.length > 0) {
            apiMapped = items.map((l: any, idx: number) => {
              const rawStage = l.stage || l.status || "NEW";
              let mappedStage: LeadItem["stage"] = "New";
              if (rawStage === "QUALIFIED" || rawStage === "Qualified") mappedStage = "Qualified";
              else if (rawStage === "DISQUALIFIED" || rawStage === "UNQUALIFIED" || rawStage === "Disqualified") mappedStage = "Disqualified";
              else if (rawStage === "PROPOSAL" || rawStage === "Proposal") mappedStage = "Proposal";
              else if (rawStage === "NEGOTIATION" || rawStage === "Negotiation") mappedStage = "Negotiation";
              else if (rawStage === "CLOSED_WON" || rawStage === "Closed Won" || rawStage === "CONVERTED") mappedStage = "Closed Won";
              else if (rawStage === "LOST" || rawStage === "Lost") mappedStage = "Lost";

              return {
                id: l.id || idx + 1,
                leadCode: l.leadCode || `LED-2025-${String(idx + 1).padStart(3, "0")}`,
                company: l.company || l.organizationName || l.companyName || "Unknown",
                contactName: l.contactName || l.contactPerson || l.name || "Unknown",
                phone: l.phone || "—",
                source: l.source || "Direct",
                stage: mappedStage,
                status: (l.status || rawStage) as LeadStatus,
                score: Number(l.score || l.leadScore || (mappedStage === "Qualified" ? 80 : 50)),
                value: Number(l.value || l.estimatedValue || l.budget || 500000),
                email: l.email || "",
                assignedTo: l.assignedTo || "Salam Haile",
                disqualificationReason: l.disqualificationReason,
                notes: l.notes,
              };
            });
          }
        }
      } catch (err) {
        // Backend offline fallback
      }

      if (typeof window !== "undefined") {
        try {
          const cachedStr = localStorage.getItem("crm_custom_leads");
          if (cachedStr) {
            const cachedLeads: LeadItem[] = JSON.parse(cachedStr);
            if (Array.isArray(cachedLeads) && cachedLeads.length > 0) {
              const mergedMap = new Map<string, LeadItem>();
              [...cachedLeads, ...apiMapped, ...initialLeads].forEach((item) => {
                const key = `${item.company}-${item.contactName}`;
                if (!mergedMap.has(key)) {
                  mergedMap.set(key, item);
                }
              });
              setLeads(Array.from(mergedMap.values()));
              return;
            }
          }
        } catch (e) {}
      }

      if (apiMapped.length > 0) {
        setLeads(apiMapped);
      }
    }
    fetchLeads();
  }, [API_URL]);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.leadCode.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.contactName.toLowerCase().includes(search.toLowerCase()) ||
        item.source.toLowerCase().includes(search.toLowerCase());

      const matchesStage =
        selectedStage === "All" || item.stage === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [leads, search, selectedStage]);

  // Lead metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter((l) => l.stage === "New" || l.status === "NEW").length;
  const qualifiedLeadsCount = leads.filter((l) => l.stage === "Qualified" || l.status === "QUALIFIED").length;
  const disqualifiedLeadsCount = leads.filter((l) => l.stage === "Disqualified" || l.status === "DISQUALIFIED" || l.status === "UNQUALIFIED").length;
  const pipelineVal = leads
    .filter((l) => l.stage !== "Closed Won" && l.stage !== "Lost" && l.stage !== "Disqualified")
    .reduce((sum, l) => sum + l.value, 0);

  const formatETB = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getStageBadge = (stage: LeadItem["stage"]) => {
    switch (stage) {
      case "Qualified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Disqualified":
        return "bg-red-50 text-red-700 border-red-200";
      case "Proposal":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Negotiation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Closed Won":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Lost":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    const nameParts = (newContact || "Contact").trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    const sourceMap: Record<string, string> = {
      Direct: "COLD_CALL",
      "Government Tender": "EVENT",
      Referral: "REFERRAL",
      Conference: "EVENT",
      Website: "WEBSITE",
    };

    let createdId: any = Date.now();
    let createdCode = `LED-2025-${String(leads.length + 1).padStart(3, "0")}`;

    try {
      const created = await leadService.createLead({
        firstName,
        lastName,
        company: newCompany,
        phone: newPhone,
        email: newEmail,
        source: sourceMap[newSource] ?? "COLD_CALL",
        budget: newValue ? Number(newValue) : undefined,
        stage: "NEW",
      });

      if (created && (created as any).id) {
        createdId = (created as any).id;
        if ((created as any).leadCode) createdCode = (created as any).leadCode;
      }
    } catch (err) {
      console.warn("API lead creation offline, creating lead locally:", err);
    }

    const newLead: LeadItem = {
      id: createdId,
      leadCode: createdCode,
      company: newCompany || "New Prospect",
      contactName: newContact || "Contact",
      phone: newPhone || "+251 911 000 000",
      email: newEmail,
      source: newSource,
      stage: "New",
      status: "NEW",
      score: 55,
      value: Number(newValue) || 120000,
      assignedTo: "Salam Haile",
      notes: "Newly created lead - pending admin qualification",
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("crm_custom_leads", JSON.stringify(updatedLeads));
      } catch (e) {}
    }

    setIsAddModalOpen(false);
    setNewCompany("");
    setNewContact("");
    setNewPhone("");
    setNewEmail("");
    setNewValue("");
    setModalLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Top CRM Header */}
      <CrmHeader activeRole="ADMIN / SALES MANAGER" />

      {/* 5 Leads Metrics Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Leads</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{totalLeadsCount}</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-amber-700">Pending Qualification</div>
          <div className="mt-1 text-2xl font-black text-amber-600">{newLeadsCount}</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Qualified Leads</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{qualifiedLeadsCount}</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-red-700">Disqualified</div>
          <div className="mt-1 text-2xl font-black text-red-600">{disqualifiedLeadsCount}</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Pipeline Value</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{formatETB(pipelineVal)}</div>
        </div>
      </div>

      {/* Admin Quick Action Banner for New Leads */}
      {newLeadsCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>{newLeadsCount} new lead(s)</strong> require Admin review and qualification. Review incoming leads below to qualify or disqualify them.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStage("New")}
            className="rounded-lg bg-amber-600 px-3 py-1 font-bold text-white transition hover:bg-amber-700"
          >
            Filter New Leads
          </button>
        </div>
      )}

      {/* Controls Row: Search, Filter, List/Kanban, + Add Lead */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by code, company, contact or source..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        {/* Right filters & actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage Dropdown */}
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              aria-label="Filter leads by stage"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All Stages</option>
              <option value="New">New (Pending Qualification)</option>
              <option value="Qualified">Qualified</option>
              <option value="Disqualified">Disqualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Lost">Lost</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* List / Kanban Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* + Add Lead Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {viewMode === "list" ? (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Lead Management ({filteredLeads.length})
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredLeads.length} of {leads.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Value (ETB)</th>
                  <th className="py-3 px-4 text-center">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                      {lead.leadCode}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{lead.company}</div>
                      {lead.email && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {lead.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-semibold">{lead.contactName}</div>
                      <div className="text-[10px] text-slate-400">{lead.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{lead.source}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStageBadge(
                          lead.stage
                        )}`}
                      >
                        {lead.stage === "New" ? "New (Pending)" : lead.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.score >= 80
                                ? "bg-emerald-500"
                                : lead.score >= 65
                                ? "bg-amber-500"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {lead.score}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ETB {lead.value.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 justify-center">
                        {/* Admin Qualify & Disqualify Buttons */}
                        {lead.stage === "New" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQualifyLead(lead);
                              }}
                              disabled={qualifyingLeadId === lead.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs disabled:opacity-50"
                              title="Qualify Lead for sales pipeline"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Qualify</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDisqualifyModal(lead);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
                              title="Disqualify Lead with reason"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Disqualify</span>
                            </button>
                          </>
                        )}

                        {lead.stage === "Qualified" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/crm/sales-deals/create?company=${encodeURIComponent(lead.company)}&contact=${encodeURIComponent(lead.contactName)}&phone=${encodeURIComponent(lead.phone)}&email=${encodeURIComponent(lead.email || "")}&value=${lead.value}`
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs"
                            title="Convert Lead into Customer and active Sales Deal"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Convert to Deal</span>
                          </button>
                        )}

                        {lead.stage === "Disqualify" as any || lead.stage === "Disqualified" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQualifyLead(lead);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                            title="Re-qualify lead"
                          >
                            Re-qualify
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["New", "Qualified", "Proposal", "Closed Won"] as const).map((col) => {
            const colLeads = leads.filter((l) => l.stage === col);
            const colTotal = colLeads.reduce((s, l) => s + l.value, 0);

            return (
              <div key={col} className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-3.5">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {col === "New" ? "New (Pending)" : col}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                      {colLeads.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatETB(colTotal)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:border-[#c8102e] hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-[#c8102e]">{lead.leadCode}</span>
                        <span>Score: {lead.score}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{lead.company}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{lead.contactName}</div>
                      
                      {lead.stage === "New" && (
                        <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQualifyLead(lead);
                            }}
                            className="flex-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 text-center"
                          >
                            Qualify
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDisqualifyModal(lead);
                            }}
                            className="flex-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100 text-center"
                          >
                            Disqualify
                          </button>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>ETB {lead.value.toLocaleString()}</span>
                        <span className="text-[10px] font-normal text-slate-400">{lead.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Disqualification Reason Modal */}
      {disqualifyingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <XCircle className="h-5 w-5" />
                <span>Disqualify Lead</span>
              </div>
              <button
                type="button"
                onClick={() => setDisqualifyingLead(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="font-bold text-slate-900">{disqualifyingLead.company}</div>
                <div className="text-slate-500">{disqualifyingLead.contactName} ({disqualifyingLead.phone})</div>
                <div className="text-[10px] text-slate-400 mt-1">Lead ID: {disqualifyingLead.leadCode}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Disqualification Reason *
                </label>
                <select
                  value={disqualifyReasonOption}
                  onChange={(e) => setDisqualifyReasonOption(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-red-500"
                >
                  {PRESET_DISQUALIFY_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {disqualifyReasonOption === "Other" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custom Disqualification Notes
                  </label>
                  <textarea
                    rows={3}
                    value={customDisqualifyReason}
                    onChange={(e) => setCustomDisqualifyReason(e.target.value)}
                    placeholder="Enter specific reason for disqualifying this lead..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisqualifyingLead(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisqualify}
                disabled={isSubmittingDisqualify}
                className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 text-xs shadow-xs disabled:opacity-60"
              >
                {isSubmittingDisqualify ? "Disqualifying..." : "Confirm Disqualification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Lead</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="e.g. Ato Kebede"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+251 911 000 000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  >
                    <option value="Direct">Direct</option>
                    <option value="Government Tender">Government Tender</option>
                    <option value="Referral">Referral</option>
                    <option value="Conference">Conference</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Value (ETB)
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 1500000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              {modalError && (
                <div className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl p-2.5">
                  {modalError}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 font-bold text-white hover:bg-[#a80d26] text-xs shadow-xs disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Lead Preview Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#c8102e]">{selectedLead.leadCode}</span>
                <span className="text-sm font-bold text-slate-900">{selectedLead.company}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Contact Person</div>
                  <div className="font-bold text-slate-800">{selectedLead.contactName}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Phone</div>
                  <div className="font-bold text-slate-800">{selectedLead.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Stage & Status</div>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStageBadge(selectedLead.stage)}`}>
                    {selectedLead.stage}
                  </span>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Value</div>
                  <div className="font-bold text-slate-900">ETB {selectedLead.value.toLocaleString()}</div>
                </div>
              </div>

              {selectedLead.disqualificationReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <div className="font-bold text-red-800 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Disqualification Reason</span>
                  </div>
                  <div className="mt-1 text-red-700 font-medium">{selectedLead.disqualificationReason}</div>
                </div>
              )}

              {selectedLead.notes && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-slate-400 font-medium">Notes / Inquiries</div>
                  <div className="text-slate-700 font-medium mt-1">{selectedLead.notes}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Source</div>
                  <div className="font-bold text-slate-800">{selectedLead.source}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Assigned Officer</div>
                  <div className="font-bold text-slate-800">{selectedLead.assignedTo || "Salam Haile"}</div>
                </div>
              </div>
            </div>

            {/* Modal Admin Qualification Actions */}
            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedLead.stage === "New" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQualifyLead(selectedLead)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Qualify Lead</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDisqualifyModal(selectedLead)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 shadow-xs transition"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Disqualify Lead</span>
                  </button>
                </div>
              ) : selectedLead.stage === "Qualified" ? (
                <Link
                  href={`/crm/sales-deals/create?company=${encodeURIComponent(selectedLead.company)}&contact=${encodeURIComponent(selectedLead.contactName)}&phone=${encodeURIComponent(selectedLead.phone)}&email=${encodeURIComponent(selectedLead.email || "")}&value=${selectedLead.value}`}
                  className="rounded-xl bg-[#071d3a] px-4 py-2 font-bold text-white hover:bg-[#0c2b5b] text-xs shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Convert to Customer & Deal</span>
                </Link>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
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