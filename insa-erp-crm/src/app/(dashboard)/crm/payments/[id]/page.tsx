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
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Landmark,
} from "lucide-react";
import { PaymentItem, PaymentStatus } from "@/types/payment.types";
import paymentService from "@/services/paymentService";

export default function PaymentDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPay() {
      if (id) {
        try {
          const p = await paymentService.getPaymentById(Number(id));
          if (p) {
            setPayment({
              paymentNumber: `PAY-2025-00${p.id}`,
              customerId: (p as any).customerId || 1,
              ...p,
              customerName: "Ministry of Finance",
              invoiceNumber: `INV-2025-0${String(p.invoiceId + 40).padStart(2, "0")}`,
            } as any);
          }
        } catch {
          // Fallback demo
          setPayment({
            id: Number(id) || 1,
            paymentNumber: `PAY-2025-00${id || 1}`,
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
          });
        } finally {
          setLoading(false);
        }
      }
    }
    fetchPay();
  }, [id]);

  const handleReverse = async () => {
    if (!payment) return;
    if (confirm(`Reverse payment ${payment.paymentNumber}? This will restore the open balance on invoice ${payment.invoiceNumber}.`)) {
      try {
        await paymentService.updatePayment(payment.id, { status: "CANCELLED" });
      } catch {}
      setPayment({ ...payment, status: "CANCELLED" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">
          Loading payment details...
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-base font-bold text-slate-900">Payment Not Found</h2>
        <Link
          href="/crm/payments"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#071d3a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2b5b]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Payments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/crm/payments"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Payment Voucher {payment.paymentNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Invoice Ref: {payment.invoiceNumber} &middot; FMS Settlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6 text-xs text-slate-700">
        <div className="text-center border-b border-slate-200 pb-6">
          <div className="text-sm font-black text-slate-900">
            INFORMATION NETWORK SECURITY ADMINISTRATION
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            ERP Settlement Receipt &amp; Treasury Ledger
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600">
            ETB {payment.amount.toLocaleString()}
          </div>
          <div className="mt-2">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-0.5 text-xs font-bold text-emerald-700">
              {payment.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Payer (Customer)
            </div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              {payment.customerName}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Invoice Settled
            </div>
            <Link
              href={`/crm/invoices/${payment.invoiceId}`}
              className="font-bold text-blue-600 text-sm mt-0.5 hover:underline block"
            >
              {payment.invoiceNumber}
            </Link>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Payment Method
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {payment.paymentMethod}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Transaction Reference
            </div>
            <div className="font-mono text-slate-800 font-bold mt-0.5">
              {payment.transactionReference || "—"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Payment Date
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {payment.paymentDate}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Received By
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {payment.receivedBy || "Salam Haile"}
            </div>
          </div>
        </div>

        {payment.notes && (
          <div className="rounded-xl border border-slate-200 p-4 bg-white">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
              Remarks
            </div>
            <p className="text-slate-700">{payment.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Link
            href="/crm/payments"
            className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Back
          </Link>

          {payment.status === "COMPLETED" && (
            <button
              type="button"
              onClick={handleReverse}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-bold text-red-700 hover:bg-red-100 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reverse Payment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
