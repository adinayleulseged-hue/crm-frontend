"use client";

import React, { useRef } from "react";
import {
  X,
  Printer,
  Download,
  CreditCard,
  Building2,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { InvoiceItem } from "@/types/invoice.types";

interface InvoicePreviewModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
  onRecordPayment?: (invoice: InvoiceItem) => void;
}

export default function InvoicePreviewModal({
  invoice,
  onClose,
  onRecordPayment,
}: InvoicePreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: InvoiceItem["status"]) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "OVERDUE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatETB = (val?: number) => {
    if (val === undefined || val === null) return "ETB 0.00";
    return `ETB ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isFullyPaid = invoice.status === "PAID" || (invoice.balanceAmount !== undefined && invoice.balanceAmount <= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#071d3a] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8102e] text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">
                Invoice Details — {invoice.invoiceNumber}
              </div>
              <div className="text-[11px] text-blue-200">
                FMS Finance Subsystem &middot; Sales Reference:{" "}
                {invoice.salesOrderCode || `SO-${invoice.salesOrderId}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div ref={printRef} className="p-6 md:p-8 space-y-6 text-xs text-slate-700">
          {/* Header row with Organization and Invoice Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-base font-black tracking-tight text-slate-900">
                  INFORMATION NETWORK SECURITY ADMINISTRATION
                </div>
              </div>
              <div className="mt-1 text-slate-500 font-medium">
                Enterprise Resource Planning (ERP_INSA)
              </div>
              <div className="text-[11px] text-slate-400">
                Wollo Sefer, Ethio-China Road &middot; Addis Ababa, Ethiopia
              </div>
              <div className="text-[11px] text-slate-400">
                TIN: 0009847123 &middot; VAT No: 9812470
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl font-black tracking-tight text-[#c8102e]">
                TAX INVOICE
              </div>
              <div className="mt-1 font-bold text-slate-900 text-sm">
                {invoice.invoiceNumber}
              </div>
              <div className="mt-1.5">
                <span
                  className={`inline-flex rounded-full border px-3 py-0.5 text-[11px] font-bold ${getStatusBadge(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Billed To (Customer)
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {invoice.customerName || `Customer #${invoice.customerId}`}
              </div>
              <div className="mt-0.5 text-slate-500">
                Federal Democratic Republic of Ethiopia
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Customer ID: CUS-{String(invoice.customerId).padStart(3, "0")}
              </div>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Invoice Metadata
              </div>
              <div>
                <span className="text-slate-400 font-medium">Invoice Date: </span>
                <span className="font-bold text-slate-900">{invoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Due Date: </span>
                <span className="font-bold text-slate-900">{invoice.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Sales Order Ref: </span>
                <span className="font-bold text-blue-600">
                  {invoice.salesOrderCode || `SO-${invoice.salesOrderId}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Currency: </span>
                <span className="font-bold text-slate-900">
                  {invoice.currency || "ETB (Ethiopian Birr)"}
                </span>
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item Description / Services</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      ERP Enterprise License & Module Implementation
                    </div>
                    <div className="text-[11px] text-slate-400">
                      As per Sales Agreement {invoice.salesOrderCode || `SO-${invoice.salesOrderId}`}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-right">
                    {formatETB(invoice.subtotal || invoice.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatETB(invoice.subtotal || invoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Balance */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="max-w-xs space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700">Notes & Payment Terms</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {invoice.notes ||
                  "Payment is due within 30 days of invoice issuance. Electronic bank transfer or direct voucher deposit to INSA Treasury Account."}
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 rounded-xl bg-[#f8fafc] p-4 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">{formatETB(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (VAT 15%):</span>
                <span className="font-bold text-slate-900">{formatETB(invoice.taxAmount)}</span>
              </div>
              {invoice.discountAmount ? (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span className="font-bold text-emerald-600">
                    -{formatETB(invoice.discountAmount)}
                  </span>
                </div>
              ) : null}

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span>{formatETB(invoice.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-bold border-t border-dashed border-slate-200 pt-2">
                <span>Paid Amount:</span>
                <span>{formatETB(invoice.paidAmount)}</span>
              </div>

              <div
                className={`flex justify-between font-black pt-1 ${
                  invoice.balanceAmount > 0 ? "text-[#c8102e]" : "text-slate-900"
                }`}
              >
                <span>Remaining Balance:</span>
                <span>{formatETB(invoice.balanceAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Close
            </button>

            {!isFullyPaid && onRecordPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
