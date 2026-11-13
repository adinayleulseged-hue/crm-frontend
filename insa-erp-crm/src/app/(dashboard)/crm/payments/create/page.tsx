"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { PaymentMethod } from "@/types/payment.types";
import paymentService from "@/services/paymentService";

export default function CreatePaymentPage() {
  const router = useRouter();

  const [invoiceId, setInvoiceId] = useState("1");
  const [customerId, setCustomerId] = useState("1");
  const [customerName, setCustomerName] = useState("Ministry of Finance");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [amount, setAmount] = useState("1050000");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionRef, setTransactionRef] = useState("CBE-FT251928");
  const [receivedBy, setReceivedBy] = useState("Salam Haile");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openInvoices = [
    { id: "1", num: "INV-2025-041", cusId: "1", cusName: "Ministry of Finance", bal: 1050000 },
    { id: "2", num: "INV-2025-042", cusId: "3", cusName: "Commercial Bank of Ethiopia", bal: 760000 },
    { id: "5", num: "INV-2025-045", cusId: "6", cusName: "National Bank of Ethiopia", bal: 950000 },
    { id: "6", num: "INV-2025-046", cusId: "7", cusName: "Addis Ababa City Admin", bal: 650000 },
    { id: "7", num: "INV-2025-047", cusId: "8", cusName: "Oromia Water Works", bal: 480000 },
  ];

  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    const inv = openInvoices.find((i) => i.id === invId);
    if (inv) {
      setCustomerId(inv.cusId);
      setCustomerName(inv.cusName);
      setAmount(inv.bal.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await paymentService.createPayment({
        invoiceId: Number(invoiceId),
        customerId: Number(customerId),
        paymentMethod,
        amount: Number(amount),
        paymentDate,
        transactionReference: transactionRef,
        receivedBy,
        notes,
      });
    } catch {}
    setIsSubmitting(false);
    router.push("/crm/payments");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/crm/payments"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Record Payment Settlement
          </h1>
          <p className="text-xs text-slate-500">
            Settle open invoices &middot; FMS Treasury Gateway
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Invoice to Settle
            </label>
            <select
              value={invoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
            >
              {openInvoices.map((inv, idx) => (
                <option key={`opt-inv-${inv.id}-${idx}`} value={inv.id}>
                  {inv.num} — {inv.cusName} (Balance: ETB {inv.bal.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payer / Customer
              </label>
              <input
                type="text"
                readOnly
                value={customerName}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-medium text-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Amount (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-[#c8102e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="ONLINE_PAYMENT">Online Gateway</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Reference / Slip #
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Received By
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Deposit confirmation details, branch reference, etc."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/crm/payments"
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c8102e] px-5 py-2 font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition disabled:opacity-50"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
