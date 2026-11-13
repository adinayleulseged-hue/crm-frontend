"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import {
  FileText,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Eye,
  CheckCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import invoiceService from "@/services/invoiceService";
import orderService from "@/services/orderService";

interface InvoiceItem {
  id: number | string;
  invoiceNumber: string;
  orderRef: string;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "PENDING_APPROVAL" | "PENDING_FINANCE_APPROVAL" | "AWAITING_CUSTOMER_CONFIRMATION" | "FINANCE_APPROVED" | "OVERDUE" | "CANCELLED" | string;
  customerName?: string;
  invoiceDate?: string;
}

function InvoicesContent() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Form state for creating / generating invoice
  const [formCustomer, setFormCustomer] = useState("");
  const [formOrderRef, setFormOrderRef] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState("2026-10-30");

  // Auth Protection
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/login?from=/crm/invoices");
      return;
    }
    fetchInvoices();
  }, [ready, user, router]);

  // URL Query params from Quotations page conversion
  useEffect(() => {
    const qRef = searchParams.get("quotationRef");
    const cust = searchParams.get("customer");
    const amt = searchParams.get("amount");
    const autoOpen = searchParams.get("autoOpen");

    if (autoOpen === "true" || qRef || cust) {
      if (qRef) setFormOrderRef(qRef);
      if (cust) setFormCustomer(cust);
      if (amt) setFormAmount(amt);
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // 1. Backend invoices
      let backendMapped: InvoiceItem[] = [];
      try {
        const data = await invoiceService.getAllInvoices();
        const rawItems = Array.isArray(data) ? data : data?.content || [];
        backendMapped = rawItems.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber || `INV-${inv.id}`,
          orderRef: inv.salesOrderCode || (inv.salesOrderId ? `SO-${inv.salesOrderId}` : "ORD-705566"),
          amount: Number(inv.totalAmount || inv.amount || 0),
          dueDate: inv.dueDate || "2026-10-15",
          status: inv.status || "PENDING",
          customerName: inv.customerName || "Valued Customer",
          invoiceDate: inv.invoiceDate || inv.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        }));
      } catch (e) {
        console.warn("Could not fetch backend invoices:", e);
      }

      // 2. Customer Portal cached invoices from localStorage
      const localInvoices: InvoiceItem[] = [];
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("crm_invoices_")) {
            try {
              const rawStr = localStorage.getItem(key);
              if (rawStr) {
                const items = JSON.parse(rawStr);
                if (Array.isArray(items)) {
                  items.forEach((item: any) => {
                    localInvoices.push({
                      id: item.id || item.invoiceNumber,
                      invoiceNumber: item.invoiceNumber || `INV-${item.id}`,
                      orderRef: item.orderRef || "ORD-705566",
                      amount: Number(item.amount || 0),
                      dueDate: item.dueDate || "2026-10-15",
                      status: item.status || "PENDING",
                      customerName: item.customerName || key.replace("crm_invoices_", "") || "Customer",
                      invoiceDate: item.date || new Date().toISOString().split("T")[0],
                    });
                  });
                }
              }
            } catch (e) {}
          }
        }
      }

      // 3. Merge backend and local, deduplicating by invoiceNumber
      const combinedMap = new Map<string, InvoiceItem>();
      backendMapped.forEach((inv, idx) => combinedMap.set(String(inv.invoiceNumber || `inv-${inv.id}-${idx}`), inv));
      localInvoices.forEach((inv, idx) => {
        const key = String(inv.invoiceNumber || `local-${inv.id}-${idx}`);
        if (!combinedMap.has(key) || inv.status === "PENDING_FINANCE_APPROVAL") {
          combinedMap.set(key, inv);
        }
      });

      const mergedList = Array.from(combinedMap.values());
      setInvoices(mergedList.length > 0 ? mergedList : backendMapped);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleInvoice = async (invoice: InvoiceItem) => {
    try {
      if (invoice.id && !isNaN(Number(invoice.id))) {
        await invoiceService.updateInvoice(invoice.id, { status: "PAID" });
      }
    } catch (error) {
      console.warn("Backend update error, resolving in local state:", error);
    }

    // Update state
    const updatedInvoices = invoices.map((inv) =>
      inv.invoiceNumber === invoice.invoiceNumber || inv.id === invoice.id
        ? { ...inv, status: "PAID" as const }
        : inv
    );
    setInvoices(updatedInvoices);

    // Sync across all localStorage `crm_invoices_*` keys
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("crm_invoices_")) {
          try {
            const items = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(items)) {
              const synced = items.map((item: any) =>
                item.invoiceNumber === invoice.invoiceNumber || item.id === invoice.id
                  ? { ...item, status: "PAID", paid: item.amount }
                  : item
              );
              localStorage.setItem(key, JSON.stringify(synced));
            }
          } catch (e) {}
        }
      }
    }

    // Broadcast to Customer Portal in real time
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("crm_invoice_paid", { detail: { number: invoice.invoiceNumber, invoiceNumber: invoice.invoiceNumber, amount: invoice.amount } }));
    window.dispatchEvent(new CustomEvent("crm_invoice_updated", { detail: { number: invoice.invoiceNumber, invoiceNumber: invoice.invoiceNumber, status: "PAID" } }));

    // Customer notification
    try {
      const activeCust = invoice.customerName || "Customer";
      const notifs = JSON.parse(localStorage.getItem(`crm_notifications_${activeCust}`) || localStorage.getItem("crm_customer_notifications") || "[]");
      const notif = {
        id: `cust-notif-${Date.now()}`,
        title: "Invoice Payment Approved by Finance",
        message: `Your payment of ETB ${Number(invoice.amount || 0).toLocaleString()} for Invoice ${invoice.invoiceNumber} has been verified and APPROVED by Finance! Status is now PAID.`,
        invoiceNumber: invoice.invoiceNumber,
        type: "SUCCESS",
        date: new Date().toISOString().split("T")[0],
        read: false,
      };
      localStorage.setItem("crm_customer_notifications", JSON.stringify([notif, ...notifs]));
      localStorage.setItem(`crm_notifications_${activeCust}`, JSON.stringify([notif, ...notifs]));
      window.dispatchEvent(new CustomEvent("crm_customer_notification_added", { detail: notif }));
    } catch (e) {}

    showToast(`✅ Invoice ${invoice.invoiceNumber} accepted & approved by Finance! Status updated to PAID.`, "success");
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvNum = `INV-${Math.floor(10000000 + Math.random() * 90000000).toString(16).toUpperCase()}`;
    const newInv: InvoiceItem = {
      id: newInvNum,
      invoiceNumber: newInvNum,
      orderRef: formOrderRef || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: Number(formAmount || 12400),
      dueDate: formDueDate || "2026-10-30",
      status: "PENDING",
      customerName: formCustomer || "Valued Customer",
      invoiceDate: new Date().toISOString().split("T")[0],
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);

    // Sync to default customer key
    if (typeof window !== "undefined") {
      const activeUname = localStorage.getItem("active_customer_username") || "Ministry of Finance";
      const key = `crm_invoices_${activeUname}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([newInv, ...existing]));
    }

    setShowCreateModal(false);
    showToast(`✅ Invoice ${newInvNum} created and sent to customer portal!`, "success");
  };

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
  const pendingCount = invoices.filter(
    (inv) =>
      inv.status === "PENDING" ||
      inv.status === "PENDING_APPROVAL" ||
      inv.status === "PENDING_FINANCE_APPROVAL"
  ).length;
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/30 px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/crm/dashboard" className="text-slate-300 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Finance & Invoices</h1>
                <p className="text-sm text-slate-300 mt-0.5">Manage Customer Invoices & Finance Settlement Approvals</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Generate Invoice
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-xs font-bold text-slate-300 mb-1">Total Amount</div>
              <div className="text-2xl font-black text-white">
                ETB {totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-xs font-bold text-slate-300 mb-1">Paid / Settled</div>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                <Check className="w-5 h-5" />
                {paidCount}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-xs font-bold text-slate-300 mb-1">Pending Approval / Payment</div>
              <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {pendingCount}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-xs font-bold text-slate-300 mb-1">Overdue</div>
              <div className="text-2xl font-black text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {overdueCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Notification Toast */}
        {actionNotice && (
          <div
            className={`mb-4 p-4 rounded-xl border ${
              actionNotice.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : actionNotice.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-slate-100 border-slate-200 text-slate-800"
            } text-sm font-semibold flex items-center justify-between`}
          >
            <span>{actionNotice.text}</span>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Invoice Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">No invoices found</p>
              <p className="text-sm text-slate-500 mt-1">Generate your first invoice to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      INVOICE ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      CUSTOMER
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      ASSOCIATED REF
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      AMOUNT (ETB)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      DUE DATE
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase tracking-wider">
                      FINANCE ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv, index) => {
                    const isPaid = inv.status === "PAID";
                    const isPendingFinance = inv.status === "PENDING_FINANCE_APPROVAL" || inv.status === "PENDING_APPROVAL" || inv.status === "CONFIRMED";
                    const isAwaitingConfirmation = inv.status === "AWAITING_CUSTOMER_CONFIRMATION" || inv.status === "FINANCE_APPROVED";
                    const isPending = inv.status === "PENDING" || isPendingFinance;
                    const rowKey = inv.invoiceNumber ? `inv-${inv.invoiceNumber}-${index}` : `inv-${inv.id}-${index}`;

                    return (
                      <tr key={rowKey} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/crm/invoices/${inv.id}`}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {inv.customerName || "Customer"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {inv.orderRef}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                          ETB {inv.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {inv.dueDate}
                        </td>
                        <td className="px-6 py-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3.5 h-3.5" />
                              PAID
                            </span>
                          ) : isAwaitingConfirmation ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              Awaiting Customer Confirmation
                            </span>
                          ) : isPendingFinance ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock className="w-3.5 h-3.5" />
                              Awaiting Finance Approval
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Settlement
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {inv.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isPaid && (
                              <button
                                onClick={() => handleSettleInvoice(inv)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Approve Payment & Mark Invoice as PAID"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve &amp; Mark Paid
                              </button>
                            )}
                            <Link
                              href={`/crm/invoices/${inv.id}`}
                              className="text-slate-500 hover:text-blue-600 p-2 hover:bg-slate-100 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Generate Invoice</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Account / Name</label>
                <input
                  type="text"
                  required
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  placeholder="e.g. Ethiopian Airlines"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Order / Quotation Ref</label>
                <input
                  type="text"
                  required
                  value={formOrderRef}
                  onChange={(e) => setFormOrderRef(e.target.value)}
                  placeholder="e.g. QUO-2025-001 or ORD-705566"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Amount (ETB)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="12400"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition shadow-sm"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
