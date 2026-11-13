"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CrmHeader from "@/components/crm/CrmHeader";
import quotationService from "@/services/quotationService";
import type { QuotationResponse } from "@/services/quotationService";
import { 
  Search, 
  Plus, 
  ChevronDown, 
  Eye, 
  FileText, 
  X, 
  Download, 
  ShoppingCart, 
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Package
} from "lucide-react";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/data/catalogProducts";

type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "PENDING";

interface LineItem {
  id?: string | number;
  itemName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quotation {
  id: string | number;
  quotationNumber?: string;
  customer: string;
  customerId?: number;
  opportunityRef?: string;
  opportunityId?: number;
  date: string;
  validUntil: string;
  amount: number;
  subtotal?: number;
  discount?: number;
  discountAmount?: number;
  status: QuotationStatus;
  items?: LineItem[];
  notes?: string;
}

// Mock data removed - system now uses only real API data

function QuotationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Handle URL query parameters from Sales Deals navigation
  useEffect(() => {
    const customerParam = searchParams.get("customer");
    const amountParam = searchParams.get("amount");
    const dealCodeParam = searchParams.get("dealCode");
    const titleParam = searchParams.get("title");
    const autoOpenParam = searchParams.get("autoOpen");
    const discountParam = searchParams.get("discount") || searchParams.get("discountApproved") || searchParams.get("discountRequested");
    const quantityParam = searchParams.get("quantity");
    const unitPriceParam = searchParams.get("unitPrice");

    if (autoOpenParam === "true" || customerParam) {
      const numAmount = amountParam ? Number(amountParam) : 0;
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + 30);
      const validUntilStr = validUntilDate.toISOString().split("T")[0];
      const parsedDiscount = discountParam ? Number(discountParam) : 0;

      if (quantityParam) {
        setCatalogQuantity(Math.max(1, parseInt(quantityParam) || 1));
      }

      setNewQuotation({
        customer: customerParam || "",
        customerId: 1,
        opportunityRef: dealCodeParam || "",
        opportunityId: 1,
        validUntil: validUntilStr,
        discount: parsedDiscount,
        notes: titleParam ? `Generated from Sales Deal: ${titleParam}${parsedDiscount > 0 ? ` (${parsedDiscount}% Discount Approved)` : ''}` : "",
        items: [
          {
            id: "temp-1",
            description: titleParam || "Enterprise Software Implementation & Licensing",
            quantity: quantityParam ? Number(quantityParam) : 1,
            unitPrice: unitPriceParam ? Number(unitPriceParam) : (numAmount > 0 ? numAmount : 50000),
          },
        ],
      });
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getAllQuotations();
      
      // Handle both paginated and array responses
      const quotationsData = Array.isArray(response) 
        ? response 
        : (response as any)?.content || [];

      let mapped: Quotation[] = quotationsData.map((q: any) => ({
        id: q.id,
        quotationNumber: q.quotationNumber || `QUO-${q.id}`,
        customer: q.customerName || q.customer || "Unknown Customer",
        customerId: q.customerId,
        opportunityRef: q.opportunityId ? `OPP-${q.opportunityId}` : q.opportunityRef || "-",
        opportunityId: q.opportunityId,
        date: q.issueDate || q.date || new Date().toISOString().split('T')[0],
        validUntil: q.expiryDate || q.validUntil || new Date().toISOString().split('T')[0],
        amount: Number(q.totalAmount || q.amount || 0),
        subtotal: Number(q.subtotal || q.totalAmount || q.amount || 0),
        discount: Number(q.discount || 0),
        discountAmount: Number(q.discountAmount || 0),
        status: (q.status || "DRAFT") as QuotationStatus,
        items: q.items?.map((item: any) => ({
          id: item.id,
          itemName: item.itemName,
          description: item.description || item.itemName || "",
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.unitPrice || 0),
        })) || [],
        notes: q.notes || "",
      }));

      // Merge with global quotations from localStorage to ensure deals and local quotations are preserved
      try {
        const gList = JSON.parse(localStorage.getItem("crm_quotations_global") || "[]");
        if (Array.isArray(gList) && gList.length > 0) {
          const map = new Map<string, Quotation>();
          mapped.forEach((q) => {
            const k = q.quotationNumber || String(q.id);
            if (k) map.set(k, q);
          });
          gList.forEach((g: any) => {
            const k = g.quotationNumber || String(g.id);
            if (k && !map.has(k)) {
              map.set(k, {
                id: g.id,
                quotationNumber: g.quotationNumber,
                customer: g.customer || g.customerName || "Customer",
                customerId: g.customerId || 1,
                opportunityRef: g.dealRef || g.opportunityRef || "-",
                date: g.issueDate || new Date().toISOString().split('T')[0],
                validUntil: g.expiryDate || new Date().toISOString().split('T')[0],
                amount: Number(g.totalAmount || g.amount || 0),
                subtotal: Number(g.subtotal || g.totalAmount || 0),
                discount: Number(g.discount || 0),
                discountAmount: Number(g.discountAmount || 0),
                status: (g.status || "ACTIVE") as QuotationStatus,
                items: [{
                  id: "1",
                  description: g.solution || "Enterprise Solution",
                  quantity: g.quantity || 1,
                  unitPrice: g.unitPrice || g.totalAmount,
                }],
                notes: g.notes || "",
              });
            }
          });
          mapped = Array.from(map.values());
        }
      } catch (e) {}

      setQuotations(mapped);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      // Try loading from localStorage on network failure
      try {
        const gList = JSON.parse(localStorage.getItem("crm_quotations_global") || "[]");
        if (Array.isArray(gList) && gList.length > 0) {
          const fallbackMapped: Quotation[] = gList.map((g: any) => ({
            id: g.id,
            quotationNumber: g.quotationNumber,
            customer: g.customer || g.customerName || "Customer",
            customerId: g.customerId || 1,
            opportunityRef: g.dealRef || g.opportunityRef || "-",
            date: g.issueDate || new Date().toISOString().split('T')[0],
            validUntil: g.expiryDate || new Date().toISOString().split('T')[0],
            amount: Number(g.totalAmount || g.amount || 0),
            subtotal: Number(g.subtotal || g.totalAmount || 0),
            discount: Number(g.discount || 0),
            discountAmount: Number(g.discountAmount || 0),
            status: (g.status || "ACTIVE") as QuotationStatus,
            items: [{
              id: "1",
              description: g.solution || "Enterprise Solution",
              quantity: g.quantity || 1,
              unitPrice: g.unitPrice || g.totalAmount,
            }],
            notes: g.notes || "",
          }));
          setQuotations(fallbackMapped);
          return;
        }
      } catch (e) {}
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const [newQuotation, setNewQuotation] = useState({
    customer: "",
    customerId: 0,
    opportunityRef: "",
    opportunityId: 0,
    validUntil: "",
    notes: "",
    discount: 0,
    items: [{ id: "temp-1", description: "", quantity: 1, unitPrice: 0 }]
  });
  const [selectedProductId, setSelectedProductId] = useState<string>(CATALOG_PRODUCTS[0]?.id || "PRD-001");
  const [catalogQuantity, setCatalogQuantity] = useState<number>(1);
  const [projectScope, setProjectScope] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activeCatalogProduct = useMemo(() => {
    return CATALOG_PRODUCTS.find((p) => p.id === selectedProductId) || CATALOG_PRODUCTS[0];
  }, [selectedProductId]);

  const handleCreateQuotation = async () => {
    try {
      setModalLoading(true);
      setModalError("");

      // Validation
      if (!newQuotation.customer || newQuotation.customer.trim() === "" || !newQuotation.validUntil) {
        setModalError("Please fill in all required fields (Customer & Valid Until Date)");
        return;
      }

      const activeProduct = activeCatalogProduct;
      const unitPrice = activeProduct?.price || 100000;
      const itemDesc = projectScope.trim() || activeProduct?.name || "Enterprise Cyber Defense Suite";
      const subtotal = catalogQuantity * unitPrice;
      const discountPercent = Number(newQuotation.discount || 0);
      const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0;
      const totalAmount = Math.max(0, subtotal - discountAmount);

      // Prepare request data
      const requestData = {
        customerId: 1, // Default customer ID for backend PostgreSQL mapping
        opportunityId: newQuotation.opportunityId || 1,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: newQuotation.validUntil,
        subtotal: subtotal,
        discount: discountPercent,
        discountAmount: discountAmount,
        tax: 0,
        totalAmount: totalAmount,
        notes: `Customer: ${newQuotation.customer}\nDeal Ref: ${newQuotation.opportunityRef || "N/A"}\nProduct: ${activeProduct?.name}${discountPercent > 0 ? `\nDiscount Approved: ${discountPercent}%` : ''}\n${newQuotation.notes}`,
        items: [
          {
            itemDescription: `${itemDesc} (${activeProduct?.category || "Enterprise"})`,
            quantity: catalogQuantity,
            unitPrice: unitPrice,
            totalPrice: subtotal,
          },
        ],
        applyPricingRules: false
      };

      console.log("[Quotations] Creating quotation:", requestData);

      let created: any = null;
      try {
        created = await quotationService.createQuotation(requestData);
        console.log("[Quotations] Created successfully:", created);
      } catch (backendErr: any) {
        console.warn("[Quotations] Backend notice, creating local quotation:", backendErr?.message);
        created = {
          id: Date.now(),
          quotationNumber: `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: "DRAFT",
          ...requestData,
        };
      }

      // Show success toast with quotation number
      const quotationNumber = (created as any)?.quotationNumber || (created as any)?.quotationCode || `QUO-${(created as any)?.id || Date.now()}`;

      // Save to localStorage so Customer Portal and Quotations page immediately see it
      const localQuote = {
        id: String((created as any)?.id || Date.now()),
        quotationNumber: quotationNumber,
        solution: itemDesc,
        issueDate: requestData.issueDate,
        expiryDate: requestData.expiryDate,
        subtotal: subtotal,
        discount: discountPercent,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        status: "ACTIVE",
        notes: requestData.notes,
        dealRef: newQuotation.opportunityRef,
        quantity: catalogQuantity,
        unitPrice: unitPrice,
        customer: newQuotation.customer,
      };

      try {
        const custKey = newQuotation.customer.trim();
        const existing = JSON.parse(localStorage.getItem(`crm_quotations_${custKey}`) || "[]");
        localStorage.setItem(`crm_quotations_${custKey}`, JSON.stringify([localQuote, ...existing]));

        const gList = JSON.parse(localStorage.getItem("crm_quotations_global") || "[]");
        const gMap = new Map();
        [localQuote, ...gList].forEach((item: any) => {
          const k = item.quotationNumber || String(item.id);
          if (k) gMap.set(k, item);
        });
        localStorage.setItem("crm_quotations_global", JSON.stringify(Array.from(gMap.values())));
      } catch (e) {}

      window.dispatchEvent(new Event("storage"));

      setSuccessToast(`✅ Quotation ${quotationNumber} created successfully! ${discountPercent > 0 ? `(${discountPercent}% discount applied)` : ''} ${newQuotation.opportunityRef ? `(Linked to ${newQuotation.opportunityRef})` : ''}`);
      setTimeout(() => setSuccessToast(null), 5000);

      // Refresh quotations list
      await fetchQuotations();

      // Reset form and close modal
      setNewQuotation({
        customer: "",
        customerId: 0,
        opportunityRef: "",
        opportunityId: 0,
        validUntil: "",
        notes: "",
        discount: 0,
        items: [{ id: "temp-1", description: "", quantity: 1, unitPrice: 0 }],
      });
      setProjectScope("");
      setCatalogQuantity(1);
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error("[Quotations] Create failed:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to create quotation";
      setModalError(errorMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-slate-100 text-slate-700 border-slate-200";
      case "SENT": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ACCEPTED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-200";
      case "EXPIRED": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesSearch = q.customer.toLowerCase().includes(search.toLowerCase()) || 
                            String(q.id).toLowerCase().includes(search.toLowerCase()) ||
                            (q.quotationNumber && q.quotationNumber.toLowerCase().includes(search.toLowerCase())) ||
                            (q.opportunityRef && q.opportunityRef.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "All" || q.status === statusFilter || (statusFilter === "PENDING" && q.status === "SENT");
      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const totalQuotations = quotations.length;
  const acceptedQuotations = quotations.filter(q => q.status === "ACCEPTED").length;
  const pendingQuotations = quotations.filter(q => q.status === "SENT").length;
  const expiredQuotations = quotations.filter(q => q.status === "EXPIRED").length;

  const handleAddItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [
        ...newQuotation.items,
        { id: `temp-${Date.now()}`, description: "", quantity: 1, unitPrice: 0 }
      ]
    });
  };

  const handleUpdateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...newQuotation.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewQuotation({ ...newQuotation, items: updatedItems });
  };

  const handleRemoveItem = (index: number) => {
    if (newQuotation.items.length > 1) {
      const updatedItems = [...newQuotation.items];
      updatedItems.splice(index, 1);
      setNewQuotation({ ...newQuotation, items: updatedItems });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <CrmHeader activeRole="SALES REP" />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          {successToast}
        </div>
      )}
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
            <p className="text-sm text-slate-500 mt-1">Manage sales quotations and proposals</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 border-b-4 border-b-blue-500">
              <p className="text-sm text-slate-500 font-medium">Total Quotations</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{totalQuotations}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 border-b-4 border-b-emerald-500">
              <p className="text-sm text-slate-500 font-medium">Accepted</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{acceptedQuotations}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 border-b-4 border-b-amber-500">
              <p className="text-sm text-slate-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{pendingQuotations}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 border-b-4 border-b-rose-500">
              <p className="text-sm text-slate-500 font-medium">Expired</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{expiredQuotations}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search quotations..." 
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <select 
                  className="appearance-none pl-4 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent / Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-rose-200 hover:bg-slate-50 rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a80d26] rounded-xl shadow-md shadow-red-950/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Quotation
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Quotation ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Sales Deal Ref</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Valid Until</th>
                    <th className="px-6 py-4 text-right">Amount (ETB)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#c8102e]" />
                          <span className="font-bold text-[#c8102e]">
                            {quotation.quotationNumber || quotation.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{quotation.customer}</td>
                      <td className="px-6 py-4 font-semibold text-blue-600">{quotation.opportunityRef}</td>
                      <td className="px-6 py-4">{quotation.date}</td>
                      <td className="px-6 py-4">{quotation.validUntil}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {quotation.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusClasses(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              router.push(
                                `/crm/invoices?quotationRef=${encodeURIComponent(quotation.quotationNumber || quotation.id)}&customer=${encodeURIComponent(quotation.customer)}&amount=${quotation.amount}&autoOpen=true`
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                            title="Convert Quotation into Customer Invoice"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Convert to Invoice</span>
                          </button>
                          <button 
                            onClick={() => setPreviewQuotation(quotation)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuotations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No quotations found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {previewQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#c8102e]" />
                  Quotation {previewQuotation.id}
                </h2>
                <p className="text-sm text-slate-500 mt-1">For {previewQuotation.customer}</p>
              </div>
              <button 
                onClick={() => setPreviewQuotation(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Sales Deal Ref</p>
                  <p className="text-sm font-semibold text-blue-600">{previewQuotation.opportunityRef}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">{previewQuotation.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Valid Until</p>
                  <p className="text-sm font-medium text-slate-900">{previewQuotation.validUntil}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusClasses(previewQuotation.status)}`}>
                    {previewQuotation.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Line Items</h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f8fafc] text-slate-500 font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewQuotation.items?.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="px-4 py-3 text-slate-900">{item.description}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(previewQuotation.amount / 1.15)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">VAT (15%)</span>
                    <span className="font-medium text-slate-900">{formatCurrency(previewQuotation.amount - (previewQuotation.amount / 1.15))}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-[#c8102e]">{formatCurrency(previewQuotation.amount)}</span>
                  </div>
                </div>
              </div>

              {previewQuotation.notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Notes</h3>
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm border border-amber-100">
                    {previewQuotation.notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setPreviewQuotation(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Close
              </button>
              {previewQuotation.status === "ACCEPTED" ? (
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-900/20 transition-all active:scale-95">
                  <ShoppingCart className="w-4 h-4" />
                  Convert to Order
                </button>
              ) : previewQuotation.status === "DRAFT" ? (
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-900/20 transition-all active:scale-95">
                  <Send className="w-4 h-4" />
                  Send to Customer
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create Quotation Modal (Image 2 Modern Procurement Spec) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create New Quotation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select product &amp; quantity to generate formal price quotation auto-routed to Sales Manager &amp; Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateQuotation();
              }}
              className="mt-5 space-y-4 text-xs"
            >
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

              {/* Quantity and Valid Until Date Grid */}
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
                    value={catalogQuantity}
                    onChange={(e) => setCatalogQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Target Close / Valid Until Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newQuotation.validUntil}
                    onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Customer and Deal Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Customer / Purchasing Entity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuotation.customer}
                    onChange={(e) => setNewQuotation({ ...newQuotation, customer: e.target.value })}
                    placeholder="e.g., Ministry of Finance"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Sales Deal Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={newQuotation.opportunityRef}
                    onChange={(e) => setNewQuotation({ ...newQuotation, opportunityRef: e.target.value })}
                    placeholder="e.g., DEAL-2025-001"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newQuotation.discount || 0}
                    onChange={(e) => setNewQuotation({ ...newQuotation, discount: Number(e.target.value) || 0 })}
                    placeholder="e.g., 10"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-emerald-700 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Breakdown Box */}
              <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Dynamic Deal Calculation Breakdown</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    AUTO SYNCED WITH SALES MANAGER &amp; ADMIN
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Selected Product:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[280px]">
                      {activeCatalogProduct.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Unit Catalog Price:</span>
                    <span className="font-bold text-slate-900">
                      ETB {activeCatalogProduct.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Quantity Amount:</span>
                    <span className="font-bold text-slate-900">
                      {catalogQuantity} {catalogQuantity === 1 ? "unit" : "units"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">
                      ETB {(catalogQuantity * activeCatalogProduct.price).toLocaleString()}
                    </span>
                  </div>
                  {(newQuotation.discount || 0) > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Approved Discount ({newQuotation.discount}%):</span>
                      <span>
                        -ETB {(((catalogQuantity * activeCatalogProduct.price) * (newQuotation.discount || 0)) / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-purple-200/60 pt-2 flex items-center justify-between font-black text-sm">
                    <span className="text-purple-950">Calculated Net Total:</span>
                    <span className="text-base text-purple-700">
                      ETB {(
                        (catalogQuantity * activeCatalogProduct.price) -
                        (((catalogQuantity * activeCatalogProduct.price) * (newQuotation.discount || 0)) / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Scope & Specifications */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Project Scope &amp; Specifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={projectScope}
                  onChange={(e) => setProjectScope(e.target.value)}
                  placeholder="Describe technical implementation scope, warranty terms, SLA parameters..."
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
                  value={newQuotation.notes}
                  onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
                  placeholder="Budget constraints, payment milestone terms, stakeholder authorizations..."
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
                  onClick={() => setIsCreateModalOpen(false)}
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
                  {modalLoading ? "Creating..." : "Create Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Quotations...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}
