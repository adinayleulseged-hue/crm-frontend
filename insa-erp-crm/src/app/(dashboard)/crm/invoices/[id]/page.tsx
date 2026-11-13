"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Building2,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
} from "lucide-react";
import { InvoiceItem } from "@/types/invoice.types";
import { PaymentCreateDTO } from "@/types/payment.types";
import PaymentModal from "@/components/modals/PaymentModal";
import invoiceService from "@/services/invoiceService";
import paymentService from "@/services/paymentService";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        if (id) {
          const inv = await invoiceService.getInvoiceById(Number(id));
          if (inv) {
            setInvoice({
              ...inv,
              customerName: (inv as any).customerName || "Unknown Customer",
              salesOrderCode: (inv as any).salesOrderCode || `SO-2025-${String(inv.salesOrderId || 0).padStart(3, "0")}`,
            } as any);
          } else {
            setInvoice(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch invoice:", err);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [id]);

  const handlePaymentSubmit = async (dto: PaymentCreateDTO) => {
    try {
      await paymentService.createPayment(dto);
    } catch {}

    if (invoice) {
      const newPaid = (invoice.paidAmount || 0) + dto.amount;
      const newBal = Math.max(0, (invoice.totalAmount || 0) - newPaid);
      setInvoice({
        ...invoice,
        paidAmount: newPaid,
        balanceAmount: newBal,
        status: newBal <= 0 ? "PAID" : "PENDING",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-base font-bold text-slate-900">Invoice Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">
          The requested invoice does not exist or has been removed.
        </p>
        <Link
          href="/crm/invoices"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#071d3a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2b5b]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Invoices</span>
        </Link>
      </div>
    );
  }

  const formatETB = (val?: number) => {
    if (val === undefined || val === null) return "ETB 0.00";
    return `ETB ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/crm/invoices"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Tax Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Sales Order Ref: {invoice.salesOrderCode} &middot; FMS Integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </button>

          {invoice.balanceAmount > 0 && (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26]"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6 text-xs text-slate-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-base font-black tracking-tight text-slate-900">
              INFORMATION NETWORK SECURITY ADMINISTRATION
            </div>
            <div className="mt-1 text-slate-500 font-medium">
              Enterprise Resource Planning (ERP_INSA)
            </div>
            <div className="text-[11px] text-slate-400">
              Wollo Sefer, Addis Ababa, Ethiopia &middot; TIN: 0009847123
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xl font-black text-[#c8102e]">TAX INVOICE</div>
            <div className="font-bold text-slate-900 mt-1">{invoice.invoiceNumber}</div>
            <div className="mt-1.5">
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-[11px] font-bold text-amber-700">
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Billed Customer
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {invoice.customerName}
            </div>
            <div className="text-slate-500">Addis Ababa, Ethiopia</div>
          </div>

          <div className="space-y-1 sm:text-right">
            <div>
              <span className="text-slate-400 font-medium">Invoice Date: </span>
              <span className="font-bold text-slate-900">{invoice.invoiceDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Due Date: </span>
              <span className="font-bold text-slate-900">{invoice.dueDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Order Ref: </span>
              <span className="font-bold text-blue-600">{invoice.salesOrderCode}</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
                <th className="py-2.5 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">
                    ERP Solution Delivery & Integration License
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Agreement {invoice.salesOrderCode}
                  </div>
                </td>
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 text-right">{formatETB(invoice.subtotal)}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  {formatETB(invoice.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="max-w-xs text-[11px] text-slate-500">
            <div className="font-bold text-slate-700 mb-1">Notes:</div>
            <p>{invoice.notes || "Standard payment terms: 30 days net."}</p>
          </div>

          <div className="w-full sm:w-72 space-y-2 rounded-xl bg-[#f8fafc] p-4 border border-slate-200">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">{formatETB(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT 15%:</span>
              <span className="font-bold text-slate-900">{formatETB(invoice.taxAmount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900">
              <span>Total:</span>
              <span>{formatETB(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Paid:</span>
              <span>{formatETB(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-black text-[#c8102e] border-t border-dashed border-slate-200 pt-2">
              <span>Balance Due:</span>
              <span>{formatETB(invoice.balanceAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        selectedInvoice={invoice}
      />
    </div>
  );
}
