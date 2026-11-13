"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, FileText, CheckCircle2 } from "lucide-react";
import invoiceService from "@/services/invoiceService";

export default function CreateInvoicePage() {
  const router = useRouter();

  const [salesOrderId, setSalesOrderId] = useState("1");
  const [customerId, setCustomerId] = useState("1");
  const [customerName, setCustomerName] = useState("Ministry of Finance");
  const [subtotal, setSubtotal] = useState("1826086.96");
  const [tax, setTax] = useState("273913.04");
  const [discount, setDiscount] = useState("0");
  const [dueDate, setDueDate] = useState("2025-08-30");
  const [notes, setNotes] = useState("FMS Automated Billing Generation");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orders = [
    { id: "1", code: "SO-2025-021", cusId: "1", cusName: "Ministry of Finance", sub: "1826086.96" },
    { id: "2", code: "SO-2025-022", cusId: "3", cusName: "Commercial Bank of Ethiopia", sub: "660869.57" },
    { id: "3", code: "SO-2025-023", cusId: "4", cusName: "Ethio Telecom", sub: "1608695.65" },
    { id: "4", code: "SO-2025-024", cusId: "5", cusName: "Ministry of Revenues", sub: "1043478.26" },
    { id: "5", code: "SO-2025-025", cusId: "6", cusName: "National Bank of Ethiopia", sub: "826086.96" },
  ];

  const handleOrderChange = (ordId: string) => {
    setSalesOrderId(ordId);
    const ord = orders.find((o) => o.id === ordId);
    if (ord) {
      setCustomerId(ord.cusId);
      setCustomerName(ord.cusName);
      setSubtotal(ord.sub);
      setTax((Number(ord.sub) * 0.15).toFixed(2));
    }
  };

  const totalAmount = Number(subtotal) + Number(tax) - Number(discount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await invoiceService.createInvoice({
        salesOrderId: Number(salesOrderId),
        customerId: Number(customerId),
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate,
        taxAmount: Number(tax),
        discountAmount: Number(discount),
        currency: "ETB",
        notes,
      });
    } catch {
      // Handled
    }
    setIsSubmitting(false);
    router.push("/crm/invoices");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/crm/invoices"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Generate New Tax Invoice
          </h1>
          <p className="text-xs text-slate-500">
            Select Sales Order &middot; FMS Integration &middot; ETB Treasury
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sales Order Reference
            </label>
            <select
              value={salesOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.cusName} (ETB {Number(o.sub).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Billed Customer
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
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtotal (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={subtotal}
                onChange={(e) => {
                  setSubtotal(e.target.value);
                  setTax((Number(e.target.value) * 0.15).toFixed(2));
                }}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                VAT 15% (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discount (ETB)
              </label>
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 outline-none focus:border-[#c8102e]"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-700 text-sm">Total Invoice Amount:</span>
            <span className="font-black text-slate-900 text-base">
              ETB {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Invoice Terms & Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/crm/invoices"
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c8102e] px-5 py-2 font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition disabled:opacity-50"
            >
              {isSubmitting ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
