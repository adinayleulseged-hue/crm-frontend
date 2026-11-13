"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  CreditCard,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Printer,
  X,
  AlertCircle,
  RotateCcw,
  Landmark,
  Wallet,
  Receipt,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import PaymentModal from "@/components/modals/PaymentModal";
import {
  PaymentItem,
  PaymentStatus,
  PaymentMethod,
  PaymentCreateDTO,
} from "@/types/payment.types";
import { InvoiceItem } from "@/types/invoice.types";
import paymentService from "@/services/paymentService";
import invoiceService from "@/services/invoiceService";

const initialPayments: PaymentItem[] = [
  {
    id: 1,
    paymentNumber: "PAY-2025-001",
    invoiceId: 1,
    invoiceNumber: "INV-2025-041",
    customerId: 1,
    customerName: "Ministry of Finance",
    paymentMethod: "BANK_TRANSFER",
    status: "COMPLETED",
    amount: 1050000,
    paymentDate: "2025-06-28",
    transactionReference: "CBE-FT25192801",
    receivedBy: "Salam Haile",
    notes: "50% advance settlement via MoF treasury account transfer.",
  },
  {
    id: 2,
    paymentNumber: "PAY-2025-002",
    invoiceId: 3,
    invoiceNumber: "INV-2025-043",
    customerId: 4,
    customerName: "Ethio Telecom",
    paymentMethod: "BANK_TRANSFER",
    status: "COMPLETED",
    amount: 1850000,
    paymentDate: "2025-07-02",
    transactionReference: "CBE-FT25192802",
    receivedBy: "Salam Haile",
    notes: "Full payment received for Data Center cyber defense project.",
  },
  {
    id: 3,
    paymentNumber: "PAY-2025-003",
    invoiceId: 4,
    invoiceNumber: "INV-2025-044",
    customerId: 5,
    customerName: "Ministry of Revenues",
    paymentMethod: "BANK_TRANSFER",
    status: "COMPLETED",
    amount: 1200000,
    paymentDate: "2025-06-18",
    transactionReference: "NBE-RTGS-98214",
    receivedBy: "Salam Haile",
    notes: "Interbank electronic settlement cleared by National Bank.",
  },
  {
    id: 4,
    paymentNumber: "PAY-2025-004",
    invoiceId: 6,
    invoiceNumber: "INV-2025-046",
    customerId: 7,
    customerName: "Addis Ababa City Admin",
    paymentMethod: "CHEQUE",
    status: "COMPLETED",
    amount: 480000,
    paymentDate: "2025-07-22",
    transactionReference: "CHQ-8829104",
    receivedBy: "Salam Haile",
    notes: "Treasury cheque deposited and cleared at CBE main branch.",
  },
  {
    id: 5,
    paymentNumber: "PAY-2025-005",
    invoiceId: 2,
    invoiceNumber: "INV-2025-042",
    customerId: 3,
    customerName: "Commercial Bank of Ethiopia",
    paymentMethod: "BANK_TRANSFER",
    status: "PENDING",
    amount: 760000,
    paymentDate: "2025-07-28",
    transactionReference: "CBE-FT25192805",
    receivedBy: "Salam Haile",
    notes: "Transfer authorization pending finance controller approval.",
  },
  {
    id: 6,
    paymentNumber: "PAY-2025-006",
    invoiceId: 5,
    invoiceNumber: "INV-2025-045",
    customerId: 6,
    customerName: "National Bank of Ethiopia",
    paymentMethod: "BANK_TRANSFER",
    status: "PENDING",
    amount: 510000,
    paymentDate: "2025-07-30",
    transactionReference: "NBE-SCH-20918",
    receivedBy: "Salam Haile",
    notes: "Voucher processed, waiting for NBE batch release.",
  },
  {
    id: 7,
    paymentNumber: "PAY-2025-007",
    invoiceId: 1,
    invoiceNumber: "INV-2025-041",
    customerId: 1,
    customerName: "Ministry of Finance",
    paymentMethod: "BANK_TRANSFER",
    status: "PROCESSING",
    amount: 1050000,
    paymentDate: "2025-08-01",
    transactionReference: "CBE-FT25192807",
    receivedBy: "Salam Haile",
    notes: "Second milestone settlement currently in reconciliation.",
  },
  {
    id: 8,
    paymentNumber: "PAY-2025-008",
    invoiceId: 7,
    invoiceNumber: "INV-2025-047",
    customerId: 8,
    customerName: "Oromia Water Works",
    paymentMethod: "ONLINE_PAYMENT",
    status: "COMPLETED",
    amount: 85000,
    paymentDate: "2025-07-26",
    transactionReference: "ETH-SW-881920",
    receivedBy: "Salam Haile",
    notes: "Digital gateway settlement for preliminary assessment fees.",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await paymentService.getAllPayments();
        const mapped = (Array.isArray(data) ? data : (data as any).content || []).map((p: any) => ({
          id: p.id,
          paymentNumber: p.paymentNumber || `PAY-${p.id}`,
          invoiceId: p.invoiceId,
          invoiceNumber: p.invoiceNumber,
          customerId: p.customerId,
          customerName: p.customerName,
          paymentDate: p.paymentDate,
          amount: Number(p.amount || 0),
          paymentMethod: p.paymentMethod,
          referenceNumber: p.referenceNumber,
          status: p.status,
          notes: p.notes,
        }));
        setPayments(mapped.length ? mapped : initialPayments);
      } catch { setPayments(initialPayments); } finally { setLoading(false); }
    };
    fetch();
  }, []);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [previewPayment, setPreviewPayment] = useState<PaymentItem | null>(null);
  const [availableInvoices, setAvailableInvoices] = useState<InvoiceItem[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentData, invoiceData] = await Promise.allSettled([
          paymentService.getAllPayments(),
          invoiceService.getAllInvoices(),
        ]);

        if (paymentData.status === "fulfilled" && paymentData.value) {
          const content = Array.isArray(paymentData.value) ? paymentData.value : (paymentData.value as any)?.content || [];
          if (content.length > 0) {
            const customerMap: Record<number, string> = {
              1: "Ministry of Finance",
              2: "Ethiopian Airlines",
              3: "Commercial Bank of Ethiopia",
              4: "Ethio Telecom",
              5: "Ministry of Revenues",
              6: "National Bank of Ethiopia",
              7: "Addis Ababa City Admin",
              8: "Oromia Water Works",
            };

            const mapped: PaymentItem[] = content.map((p: any) => ({
              ...p,
              customerName: customerMap[p.customerId] || `Customer #${p.customerId}`,
              invoiceNumber: `INV-2025-0${String(p.invoiceId + 40).padStart(2, "0")}`,
            }));
            setPayments(mapped);
          }
        }

        if (invoiceData.status === "fulfilled" && invoiceData.value?.content) {
          const content = invoiceData.value.content;
          const mappedInv: InvoiceItem[] = content.map((inv) => ({
            ...inv,
            customerName: `Customer #${inv.customerId}`,
            salesOrderCode: `SO-${inv.salesOrderId}`,
          }));
          setAvailableInvoices(mappedInv);
        }
      } catch (err) {
        // Fallback demo active
      }
    }
    fetchData();
  }, [API_URL]);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        item.paymentNumber.toLowerCase().includes(q) ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.transactionReference &&
          item.transactionReference.toLowerCase().includes(q));

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      const matchesMethod =
        selectedMethod === "All" || item.paymentMethod === selectedMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, selectedStatus, selectedMethod]);

  // Aggregate Metrics matching Screenshot 2
  const totalPaymentsCount = payments.filter((p) => p.status === "COMPLETED").length;
  const totalCollected = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingTxnCount = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PROCESSING"
  ).length;

  // Breakdown by Method
  const bankTransferTotal = payments
    .filter((p) => p.paymentMethod === "BANK_TRANSFER" && p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);
  const bankTransferCount = payments.filter(
    (p) => p.paymentMethod === "BANK_TRANSFER"
  ).length;

  const chequeTotal = payments
    .filter((p) => p.paymentMethod === "CHEQUE" && p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);
  const chequeCount = payments.filter((p) => p.paymentMethod === "CHEQUE").length;

  const cashTotal = payments
    .filter((p) => p.paymentMethod === "CASH" && p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);
  const cashCount = payments.filter((p) => p.paymentMethod === "CASH").length;

  const formatETB = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getStatusBadge = (status: PaymentItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "REFUNDED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case "BANK_TRANSFER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CHEQUE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CASH":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "MOBILE_MONEY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-sky-50 text-sky-700 border-sky-200";
    }
  };

  const formatMethodName = (method: PaymentMethod) => {
    switch (method) {
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "CHEQUE":
        return "Cheque";
      case "CASH":
        return "Cash";
      case "MOBILE_MONEY":
        return "Mobile Money";
      case "ONLINE_PAYMENT":
        return "Online Gateway";
      default:
        return method;
    }
  };

  const handleRecordSubmit = async (dto: PaymentCreateDTO) => {
    const customerMap: Record<number, string> = {
      1: "Ministry of Finance",
      2: "Ethiopian Airlines",
      3: "Commercial Bank of Ethiopia",
      4: "Ethio Telecom",
      5: "Ministry of Revenues",
      6: "National Bank of Ethiopia",
      7: "Addis Ababa City Admin",
      8: "Oromia Water Works",
    };

    const newPayment: PaymentItem = {
      id: Date.now(),
      paymentNumber: `PAY-2025-${String(payments.length + 1).padStart(3, "0")}`,
      invoiceId: dto.invoiceId,
      invoiceNumber: `INV-2025-0${String(dto.invoiceId + 40).padStart(2, "0")}`,
      customerId: dto.customerId,
      customerName: customerMap[dto.customerId] || `Customer #${dto.customerId}`,
      paymentMethod: dto.paymentMethod,
      status: "COMPLETED",
      amount: dto.amount,
      paymentDate: dto.paymentDate || new Date().toISOString().split("T")[0],
      transactionReference: dto.transactionReference || `CBE-FT${Date.now().toString().slice(-6)}`,
      receivedBy: dto.receivedBy || "Salam Haile",
      notes: dto.notes,
    };

    try {
      await paymentService.createPayment(dto);
    } catch {}

    setPayments([newPayment, ...payments]);
  };

  const handleReversePayment = async (payment: PaymentItem) => {
    if (confirm(`Are you sure you want to reverse payment ${payment.paymentNumber}?`)) {
      try {
        await paymentService.updatePayment(payment.id, { status: "CANCELLED" });
      } catch {}

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "CANCELLED" as PaymentStatus } : p
        )
      );
      if (previewPayment?.id === payment.id) {
        setPreviewPayment({ ...previewPayment, status: "CANCELLED" });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top CRM Header */}
      <CrmHeader activeRole="SALES REP" />

      {/* Row 1: 4 Payment Overview Metric Cards (Screenshot 2) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Payments */}
        <div className="rounded-2xl border border-blue-400/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Total Payments</div>
          <div className="mt-1 text-2xl font-black text-blue-700">
            {totalPaymentsCount}
          </div>
        </div>

        {/* Collected */}
        <div className="rounded-2xl border border-emerald-400/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Collected</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {formatETB(totalCollected)}
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-amber-400/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Pending</div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            {formatETB(pendingAmount)}
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="rounded-2xl border border-amber-400/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">
            Pending Transactions
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600">
            {pendingTxnCount}
          </div>
        </div>
      </div>

      {/* Row 2: 3 Payment Method Cards (Screenshot 2) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Bank Transfer */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-600">
              Bank Transfer
            </span>
            <Landmark className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            ETB {bankTransferTotal.toLocaleString()}
          </div>
          <div className="mt-1 text-[10.5px] text-slate-400 font-medium">
            {bankTransferCount} transactions
          </div>
        </div>

        {/* Cheque */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-600">Cheque</span>
            <Receipt className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            ETB {chequeTotal.toLocaleString()}
          </div>
          <div className="mt-1 text-[10.5px] text-slate-400 font-medium">
            {chequeCount} transaction
          </div>
        </div>

        {/* Cash */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-600">Cash</span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            ETB {cashTotal.toLocaleString()}
          </div>
          <div className="mt-1 text-[10.5px] text-slate-400 font-medium">
            {cashCount} transactions
          </div>
        </div>
      </div>

      {/* Controls Row: Search, Filter, + Record Payment (Screenshot 2) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        {/* Filter and Record Payment Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter payments by status"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* + Record Payment Button (Red #c8102e) */}
          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Main Table: Payment Transactions (8) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Payment Transactions ({filteredPayments.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing {filteredPayments.length} of {payments.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference No</th>
                <th className="py-3 px-4 text-right">Amount (ETB)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setPreviewPayment(p)}
                >
                  {/* Payment ID */}
                  <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-[#c8102e]" />
                      <span>{p.paymentNumber}</span>
                    </div>
                  </td>

                  {/* Invoice Ref */}
                  <td className="py-3.5 px-4 font-semibold text-blue-600">
                    {p.invoiceNumber || `INV-0${p.invoiceId}`}
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.customerName}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-600">{p.paymentDate}</td>

                  {/* Method */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${getMethodBadge(
                        p.paymentMethod
                      )}`}
                    >
                      {formatMethodName(p.paymentMethod)}
                    </span>
                  </td>

                  {/* Reference No */}
                  <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                    {p.transactionReference || "—"}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    ETB {p.amount.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewPayment(p);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleRecordSubmit}
        invoicesList={availableInvoices}
      />

      {/* Payment Receipt / Transaction Preview Modal */}
      {previewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#071d3a] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8102e] text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    Payment Voucher Receipt
                  </h3>
                  <p className="text-[10.5px] text-blue-200">
                    {previewPayment.paymentNumber} &middot; ETB Treasury Ledger
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Receipt Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <div className="text-sm font-black text-slate-900">
                  INFORMATION NETWORK SECURITY ADMINISTRATION
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  OFFICIAL PAYMENT RECEIPT &amp; SETTLEMENT VOUCHER
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  ETB {previewPayment.amount.toLocaleString()}
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold ${getStatusBadge(
                      previewPayment.status
                    )}`}
                  >
                    {previewPayment.status}
                  </span>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Customer / Payer
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">
                    {previewPayment.customerName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Settled Invoice
                  </div>
                  <div className="font-bold text-blue-600 text-xs mt-0.5">
                    {previewPayment.invoiceNumber}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Payment Method
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatMethodName(previewPayment.paymentMethod)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Transaction Ref
                  </div>
                  <div className="font-mono text-slate-800 font-bold mt-0.5">
                    {previewPayment.transactionReference || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Settlement Date
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {previewPayment.paymentDate}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Processed By
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {previewPayment.receivedBy || "Salam Haile"}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {previewPayment.notes && (
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Settlement Remarks
                  </div>
                  <p className="text-slate-600 mt-1">{previewPayment.notes}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>

                <div className="flex items-center gap-2">
                  {previewPayment.status === "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => handleReversePayment(previewPayment)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-bold text-red-700 hover:bg-red-100 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reverse</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewPayment(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
