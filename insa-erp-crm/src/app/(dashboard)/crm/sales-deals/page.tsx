"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  X,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Bell,
  Sparkles,
  Package,
  Send,
  Building2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import salesDealService from "@/services/salesDealService";
import CustomerChatbot from "@/components/chat/CustomerChatbot";
import { CATALOG_PRODUCTS } from "@/data/catalogProducts";
import { dispatchCustomerNotification } from "@/utils/helpers/notificationHelper";

interface SalesDealItem {
  id: string | number;
  oppCode: string;
  title: string;
  subtitle: string;
  customer: string;
  customerId?: number | string;
  company?: string;
  stage: "Needs Analysis" | "Qualification" | "Proposal" | "Negotiation" | "Won" | "Lost";
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo?: string;
}

const initialSalesDeals: SalesDealItem[] = [
  {
    id: 1,
    oppCode: "OPP-2025-001",
    title: "IT Security Audit — Ministry of Finance",
    subtitle: "Contract awarded. Delivery in progress.",
    customer: "Ministry of Finance",
    stage: "Won",
    value: 2100000,
    probability: 100,
    expectedCloseDate: "2025-07-15",
    assignedTo: "Salam Haile",
  },
  {
    id: 2,
    oppCode: "OPP-2025-002",
    title: "Network Infrastructure Upgrade — CBE",
    subtitle: "Core router deployment & SOC monitoring",
    customer: "Commercial Bank of Ethiopia",
    stage: "Negotiation",
    value: 750000,
    probability: 80,
    expectedCloseDate: "2025-08-30",
    assignedTo: "Salam Haile",
  },
  {
    id: 3,
    oppCode: "OPP-2025-003",
    title: "Data Center Cyber Defense — Ethio Telecom",
    subtitle: "Next-gen firewall & DDoS mitigation suite",
    customer: "Ethio Telecom",
    stage: "Proposal",
    value: 1850000,
    probability: 65,
    expectedCloseDate: "2025-09-10",
    assignedTo: "Salam Haile",
  },
  {
    id: 4,
    oppCode: "OPP-2025-004",
    title: "ERP Implementation Consulting — Ministry of Revenues",
    subtitle: "Revenue ledger & custom tax integration modules",
    customer: "Ministry of Revenues",
    stage: "Proposal",
    value: 1200000,
    probability: 60,
    expectedCloseDate: "2025-09-20",
    assignedTo: "Salam Haile",
  },
  {
    id: 5,
    oppCode: "OPP-2025-005",
    title: "Threat Intelligence Platform — National Bank",
    subtitle: "Real-time threat feed integration for core banking",
    customer: "National Bank of Ethiopia",
    stage: "Qualification",
    value: 950000,
    probability: 45,
    expectedCloseDate: "2025-10-05",
    assignedTo: "Salam Haile",
  },
  {
    id: 6,
    oppCode: "OPP-2025-006",
    title: "Endpoint Security Rollout — Addis Ababa City Admin",
    subtitle: "2,000 endpoint licenses & central policy server",
    customer: "Addis Ababa City Admin",
    stage: "Negotiation",
    value: 620000,
    probability: 75,
    expectedCloseDate: "2025-08-25",
    assignedTo: "Salam Haile",
  },
  {
    id: 7,
    oppCode: "OPP-2025-007",
    title: "Security Operations Center — Oromia Water Works",
    subtitle: "SCADA network isolation & 24/7 SIEM monitoring",
    customer: "Oromia Water Works",
    stage: "Qualification",
    value: 450000,
    probability: 40,
    expectedCloseDate: "2025-10-15",
    assignedTo: "Salam Haile",
  },
  {
    id: 8,
    oppCode: "OPP-2025-008",
    title: "Vulnerability Assessment — Ethiopian Airlines",
    subtitle: "Aviation cloud infrastructure penetration testing",
    customer: "Ethiopian Airlines",
    stage: "Needs Analysis",
    value: 820000,
    probability: 30,
    expectedCloseDate: "2025-11-01",
    assignedTo: "Salam Haile",
  },
];

export default function SalesDealsPage() {
  const router = useRouter();
  const [salesDeals, setSalesDeals] = useState<SalesDealItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  const [salesNotifications, setSalesNotifications] = useState<any[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const rawDeals = await salesDealService.getAllSalesDeals();
        const localDeals = salesDealService.getAllLocalDeals();

        const map = new Map<string, any>();
        rawDeals.forEach((o: any) => {
          const key = o.opportunityNumber || o.oppCode || o.dealCode || String(o.id);
          const stageStr = String(o.stage || "Proposal").toUpperCase();
          let stageLabel: "Needs Analysis" | "Qualification" | "Proposal" | "Negotiation" | "Won" | "Lost" = "Proposal";
          if (stageStr.includes("WON")) stageLabel = "Won";
          else if (stageStr.includes("LOST")) stageLabel = "Lost";
          else if (stageStr.includes("NEGOTIAT")) stageLabel = "Negotiation";
          else if (stageStr.includes("QUALIF")) stageLabel = "Qualification";
          else if (stageStr.includes("NEED")) stageLabel = "Needs Analysis";

          map.set(key, {
            id: o.id,
            oppCode: o.opportunityNumber || o.oppCode || o.dealCode || `OPP-${o.id}`,
            title: o.opportunityName || o.title || "Sales Deal",
            subtitle: o.description || "",
            customer: o.customerName || o.customer || "Enterprise Customer",
            stage: stageLabel,
            value: Number(o.expectedRevenue || o.amount || 0),
            probability: Number(o.probability || 50),
            expectedCloseDate: o.expectedCloseDate || "",
            assignedTo: o.assignedTo || "Salam Haile",
          });
        });

        localDeals.forEach((o: any) => {
          const key = o.dealCode || o.opportunityNumber || o.oppCode || String(o.id);
          if (!map.has(key)) {
            const stageStr = String(o.stage || "Proposal").toUpperCase();
            let stageLabel: "Needs Analysis" | "Qualification" | "Proposal" | "Negotiation" | "Won" | "Lost" = "Proposal";
            if (stageStr.includes("WON")) stageLabel = "Won";
            else if (stageStr.includes("LOST")) stageLabel = "Lost";
            else if (stageStr.includes("NEGOTIAT")) stageLabel = "Negotiation";
            else if (stageStr.includes("QUALIF")) stageLabel = "Qualification";
            else if (stageStr.includes("NEED")) stageLabel = "Needs Analysis";

            map.set(key, {
              id: o.id,
              oppCode: o.dealCode || o.opportunityNumber || `OPP-${o.id}`,
              title: o.title || o.opportunityName || "Sales Deal",
              subtitle: o.description || "",
              customer: o.customerName || o.customer || "Enterprise Customer",
              stage: stageLabel,
              value: Number(o.amount || o.value || 0),
              probability: Number(o.probability || 60),
              expectedCloseDate: o.expectedCloseDate || o.closeDate || "",
              assignedTo: o.assignedTo || "Salam Haile",
            });
          }
        });

        const all = Array.from(map.values());
        setSalesDeals(all.length ? all : initialSalesDeals);
      } catch {
        setSalesDeals(initialSalesDeals);
      }
    };
    fetchDeals();

    window.addEventListener("crm_deals_updated", fetchDeals);
    window.addEventListener("crm_deal_submitted", fetchDeals);
    window.addEventListener("storage", fetchDeals);

    return () => {
      window.removeEventListener("crm_deals_updated", fetchDeals);
      window.removeEventListener("crm_deal_submitted", fetchDeals);
      window.removeEventListener("storage", fetchDeals);
    };
  }, [API_URL]);

  useEffect(() => {
    loadSalesNotifications();
    const interval = setInterval(loadSalesNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadSalesNotifications = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("crm_sales_notifications");
      const list = raw ? JSON.parse(raw) : [];
      setSalesNotifications(list);
    } catch (e) {}
  };

  const handleAgreeDeal = async (opp: SalesDealItem) => {
    const updated = salesDeals.map((item) =>
      item.id === opp.id || item.oppCode === opp.oppCode
        ? { ...item, stage: "Won" as const, probability: 100 }
        : item
    );
    setSalesDeals(updated);

    try {
      if (opp.id && !isNaN(Number(opp.id))) {
        await salesDealService.updateSalesDeal(Number(opp.id), { stage: "CLOSED_WON", probability: 100 });
      }
    } catch (e) {}

    // Send decision notification to Customer
    try {
      dispatchCustomerNotification({
        id: `notif-cust-agree-${Date.now()}`,
        title: "Sales Deal Approved! 🟢",
        message: `Your sales deal "${opp.title}" (${opp.oppCode}) has been AGREED & APPROVED by Sales Manager (Salam Haile). Stage updated to Won!`,
        type: "SUCCESS",
        customerId: opp.customerId,
        customerName: opp.customer,
        customerOrg: opp.company || opp.customer,
        dealCode: opp.oppCode,
      });
    } catch (e) {}

    setSuccessToast(`🟢 Agreed & Approved deal ${opp.oppCode}! Status updated to Won & Customer notified.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDisagreeDeal = async (opp: SalesDealItem) => {
    const updated = salesDeals.map((item) =>
      item.id === opp.id || item.oppCode === opp.oppCode
        ? { ...item, stage: "Lost" as const, probability: 0 }
        : item
    );
    setSalesDeals(updated);

    try {
      if (opp.id && !isNaN(Number(opp.id))) {
        await salesDealService.updateSalesDeal(Number(opp.id), { stage: "CLOSED_LOST", probability: 0 });
      }
    } catch (e) {}

    // Send decision notification to Customer
    try {
      dispatchCustomerNotification({
        id: `notif-cust-disagree-${Date.now()}`,
        title: "Sales Deal Status Update 🔴",
        message: `Your sales deal "${opp.title}" (${opp.oppCode}) was reviewed by Sales Manager. Status updated to Disagreed / Lost.`,
        type: "INFO",
        customerId: opp.customerId,
        customerName: opp.customer,
        customerOrg: opp.company || opp.customer,
        dealCode: opp.oppCode,
      });
    } catch (e) {}

    setSuccessToast(`🔴 Marked deal ${opp.oppCode} as Disagreed/Lost. Customer notified.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSendProposal = async (opp: SalesDealItem) => {
    const updated = salesDeals.map((item) =>
      item.id === opp.id || item.oppCode === opp.oppCode
        ? { ...item, stage: "Proposal" as const, probability: 75 }
        : item
    );
    setSalesDeals(updated);

    try {
      if (opp.id && !isNaN(Number(opp.id))) {
        await salesDealService.generateQuotation(Number(opp.id));
      }
    } catch (e) {}

    // Auto-generate quotation item for Customer
    try {
      const newQuoteNo = `QUO-2025-${Math.floor(200 + Math.random() * 800)}`;
      const quoteObj = {
        id: String(Date.now()),
        quotationNumber: newQuoteNo,
        solution: opp.title,
        issueDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalAmount: opp.value,
        status: "ACTIVE",
        notes: `Official proposal generated by Sales Manager for ${opp.oppCode}`,
      };
      const custKey = opp.customer || "Ministry of Finance";
      const existingQuotes = JSON.parse(localStorage.getItem(`crm_quotations_${custKey}`) || "[]");
      localStorage.setItem(`crm_quotations_${custKey}`, JSON.stringify([quoteObj, ...existingQuotes]));

      // Send Proposal notification to Customer
      dispatchCustomerNotification({
        id: `notif-cust-proposal-${Date.now()}`,
        title: "Official Proposal & Quotation Received! 📄",
        message: `Sales Manager (Salam Haile) generated official Proposal ${newQuoteNo} for your deal "${opp.title}" (ETB ${opp.value.toLocaleString()}).`,
        type: "SUCCESS",
        customerId: opp.customerId,
        customerName: opp.customer,
        customerOrg: opp.company || opp.customer,
        dealCode: opp.oppCode,
      });
    } catch (e) {}

    setSuccessToast(`📄 Sent Official Proposal & Quotation for deal ${opp.oppCode}! Customer notified.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<SalesDealItem | null>(null);

  // New Sales Deal form matching Image 2
  const [selectedProductId, setSelectedProductId] = useState<string>("PROD-001");
  const [dealQuantity, setDealQuantity] = useState<number>(1);
  const [newTitle, setNewTitle] = useState("");
  const [newCustomer, setNewCustomer] = useState("Ministry of Finance");
  const [newProbability, setNewProbability] = useState("70");
  const [newStage, setNewStage] = useState<SalesDealItem["stage"]>("Proposal");
  const [newExpectedCloseDate, setNewExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [scopeNotes, setScopeNotes] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const currentProduct = useMemo(() => {
    return CATALOG_PRODUCTS.find((p) => p.id === selectedProductId) || CATALOG_PRODUCTS[0];
  }, [selectedProductId]);

  const currentUnitCatalogPrice = currentProduct.price;
  const calculatedDealValue = currentUnitCatalogPrice * Math.max(1, dealQuantity);

  const filteredDeals = useMemo(() => {
    return salesDeals.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.oppCode.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase());

      const matchesStage =
        selectedStage === "All" || item.stage === selectedStage;

      return matchesSearch && matchesStage;
    });
  }, [salesDeals, search, selectedStage]);

  // Metrics
  const openCount = salesDeals.filter((o) => o.stage !== "Won" && o.stage !== "Lost").length;
  const pipelineTotal = salesDeals
    .filter((o) => o.stage !== "Lost")
    .reduce((sum, o) => sum + o.value, 0);
  const weightedForecast = salesDeals
    .filter((o) => o.stage !== "Lost")
    .reduce((sum, o) => sum + (o.value * o.probability) / 100, 0);
  const wonThisPeriod = salesDeals
    .filter((o) => o.stage === "Won")
    .reduce((sum, o) => sum + o.value, 0);

  const formatETB = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getStageBadge = (stage: SalesDealItem["stage"]) => {
    switch (stage) {
      case "Won":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Negotiation":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Proposal":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Qualification":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Needs Analysis":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Lost":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    const stageMap: Record<string, string> = {
      "Needs Analysis": "NEEDS_ANALYSIS",
      "Qualification": "QUALIFICATION",
      "Proposal": "PROPOSAL",
      "Negotiation": "NEGOTIATION",
      "Won": "CLOSED_WON",
      "Lost": "CLOSED_LOST",
    };

    try {
      const dealTotal = calculatedDealValue;
      const effectiveTitle = newTitle.trim() || `${currentProduct.name} Procurement`;
      const dealCodeStr = `DEAL-2025-${Math.floor(100 + Math.random() * 900)}`;

      const created = await salesDealService.createSalesDeal({
        title: effectiveTitle,
        description: `Product: ${currentProduct.name} | Qty: ${dealQuantity} units | Scope: ${scopeNotes} | Notes: ${additionalNotes}`,
        customerId: 1,
        customerName: newCustomer || "Ministry of Finance",
        stage: stageMap[newStage] ?? "PROPOSAL",
        amount: dealTotal,
        expectedRevenue: dealTotal,
        probability: Number(newProbability) || 70,
        expectedCloseDate: newExpectedCloseDate,
        assignedTo: "Salam Haile",
      } as any);

      const newDeal: SalesDealItem = {
        id: (created as any)?.id || Date.now(),
        oppCode: (created as any)?.opportunityCode || (created as any)?.dealCode || dealCodeStr,
        title: effectiveTitle,
        subtitle: `Product: ${currentProduct.name} (${dealQuantity} units) — ${scopeNotes}`,
        customer: newCustomer || "Ministry of Finance",
        stage: newStage,
        value: dealTotal,
        probability: Number(newProbability) || 70,
        expectedCloseDate: newExpectedCloseDate,
        assignedTo: "Salam Haile",
      };
      setSalesDeals([newDeal, ...salesDeals]);

      // Persist to crm_deals_global for Sales Manager & Admin
      try {
        const globalDeals = JSON.parse(localStorage.getItem("crm_deals_global") || "[]");
        localStorage.setItem("crm_deals_global", JSON.stringify([{
          ...newDeal,
          dealCode: newDeal.oppCode,
          productName: currentProduct.name,
          quantity: dealQuantity,
          unitPrice: currentUnitCatalogPrice,
          amount: dealTotal,
          closeDate: newExpectedCloseDate,
        }, ...globalDeals]));
      } catch (e) {}
      
      setSuccessToast(`✅ Sales Deal ${newDeal.oppCode} created & synchronized with Sales Manager & Admin!`);
      setTimeout(() => setSuccessToast(null), 5000);
      
      setIsModalOpen(false);
      setNewTitle("");
      setScopeNotes("");
      setAdditionalNotes("");
      setDealQuantity(1);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create sales deal.";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          {successToast}
        </div>
      )}
      
      {/* Top CRM Header (Role pills, 7 KPI cards, Integrations banner) */}
      <CrmHeader activeRole="SALES REP" />

      {/* 4 Sales Deal Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Open Sales Deals</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{openCount}</div>
        </div>

        <div className="rounded-xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-purple-700">Pipeline Total</div>
          <div className="mt-1 text-2xl font-black text-purple-700">{formatETB(pipelineTotal)}</div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-amber-700">Weighted Forecast</div>
          <div className="mt-1 text-2xl font-black text-amber-600">{formatETB(weightedForecast)}</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Won This Period</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{formatETB(wonThisPeriod)}</div>
        </div>
      </div>

      {/* Controls Row: Search, Filter, + New Sales Deal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales deals..."
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
              aria-label="Filter sales deals by stage"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All Stages</option>
              <option value="Won">Won</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Proposal">Proposal</option>
              <option value="Qualification">Qualification</option>
              <option value="Needs Analysis">Needs Analysis</option>
              <option value="Lost">Lost</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* + New Sales Deal Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>New Sales Deal</span>
          </button>
        </div>
      </div>

      {/* Main Table: Sales Deals */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Sales Deals ({filteredDeals.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing {filteredDeals.length} of {salesDeals.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Sales Deal</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Probability</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDeals.map((opp) => (
                <tr
                  key={opp.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setSelectedOpp(opp)}
                >
                  <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                    {opp.oppCode}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{opp.title}</div>
                    <div className="text-[10.5px] text-slate-400 font-normal">
                      {opp.subtitle}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {opp.customer}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStageBadge(
                        opp.stage
                      )}`}
                    >
                      {opp.stage}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ETB {opp.value.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                      <span>{opp.probability}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center gap-1.5 justify-center flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgreeDeal(opp);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                        title="Agree & Approve Deal"
                      >
                        <ThumbsUp className="h-3 w-3 text-emerald-600" />
                        <span>Agree</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDisagreeDeal(opp);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-extrabold text-rose-700 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                        title="Disagree & Mark Lost"
                      >
                        <ThumbsDown className="h-3 w-3 text-rose-600" />
                        <span>Disagree</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendProposal(opp);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        title="Send Proposal & Quotation"
                      >
                        <FileText className="h-3 w-3 text-purple-600" />
                        <span>Send Proposal</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpp(opp);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>Qualification</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Sales Deal (Matching Image 2 Design Specifications) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Submit New Sales Deal Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select product &amp; quantity to request custom procurement routed directly to Sales Manager &amp; Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              {/* Product Select with Dropdown Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Select Product / Solution Package <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                    Product Catalog Dropdown
                  </span>
                </div>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition cursor-pointer"
                  required
                >
                  {CATALOG_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.category}) — ETB {prod.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Target Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">
                      Amount of Quantity Needed <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Units / Pails / Drums</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={dealQuantity}
                    onChange={(e) => setDealQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Target Close / Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpectedCloseDate}
                    onChange={(e) => setNewExpectedCloseDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Customer and Deal Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Customer / Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="e.g., Ministry of Finance"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Deal Stage &amp; Confidence
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as SalesDealItem["stage"])}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition cursor-pointer"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Needs Analysis">Needs Analysis</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                  </select>
                </div>
              </div>

              {/* Deal Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Deal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Enterprise Cyber Defense Procurement"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {/* Dynamic Deal Calculation Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
                  <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Dynamic Deal Calculation Breakdown</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    AUTO SYNCED WITH SALES MANAGER &amp; ADMIN
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span>Selected Product:</span>
                  <span className="font-extrabold text-slate-900 max-w-[280px] truncate text-right">
                    {currentProduct.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span>Unit Catalog Price:</span>
                  <span className="font-extrabold text-slate-900">
                    ETB {currentUnitCatalogPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span>Quantity Amount:</span>
                  <span className="font-extrabold text-slate-900">
                    {dealQuantity} {dealQuantity > 1 ? "units" : "unit"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-black text-purple-950 pt-2 border-t border-purple-200">
                  <span>Calculated Deal Value:</span>
                  <span className="text-purple-700 text-base font-black">
                    ETB {calculatedDealValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Project Scope & Specifications */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Project Scope &amp; Specifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={scopeNotes}
                  onChange={(e) => setScopeNotes(e.target.value)}
                  placeholder="Describe deployment requirements, delivery site address, technical specifications..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {/* Additional Notes & Terms */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Additional Notes &amp; Terms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Budget constraints, installment preferences, stakeholder contact information..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {modalError}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold shadow-lg shadow-purple-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {modalLoading ? "Saving…" : "Submit Deal Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Sales Deal Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#c8102e]">{selectedOpp.oppCode}</span>
                <span className="text-sm font-bold text-slate-900 truncate max-w-[280px]">
                  {selectedOpp.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-400 font-medium">Customer / Client</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedOpp.customer}</div>
                <div className="text-slate-500 mt-1">{selectedOpp.subtitle}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Stage</div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStageBadge(selectedOpp.stage)}`}>
                    {selectedOpp.stage}
                  </span>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Win Probability</div>
                  <div className="font-bold text-slate-900">{selectedOpp.probability}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Contract Value</div>
                  <div className="font-bold text-slate-900">ETB {selectedOpp.value.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Expected Delivery</div>
                  <div className="font-bold text-slate-900">{selectedOpp.expectedCloseDate}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Close
              </button>
              <Link
                href={`/crm/orders?fromOpp=${selectedOpp.id}`}
                className="rounded-xl bg-[#071d3a] px-4 py-2 font-bold text-white hover:bg-[#0c2b5b] text-xs shadow-xs"
              >
                Generate Sales Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
