"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  Percent,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import orderService from "@/services/orderService";

export default function CreateSalesOrderPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState("");
  const [quoteRef, setQuoteRef] = useState("");
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("0");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 Days Net");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Build a single line item from the total amount field
      const totalAmount = Number(amount) || 0;
      const discountPct = Number(discount) || 0;
      const discountedTotal = totalAmount * (1 - discountPct / 100);

      await orderService.createOrder({
        // customerName is used for look-up fallback; customerId must come from
        // a real customer selection in a full implementation. We pass the text
        // value so the backend can store it even without a resolved ID.
        customerName: customer,
        quotationRef: quoteRef || undefined,
        orderDate: new Date().toISOString().split("T")[0],
        deliveryDate: deliveryDate || undefined,
        totalAmount: discountedTotal,
        notes: `${notes ? notes + "\n" : ""}Payment Terms: ${paymentTerms}`,
        items: [
          {
            itemDescription: notes || "Enterprise Solution",
            quantity: 1,
            unitPrice: totalAmount,
            totalPrice: discountedTotal,
          },
        ],
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/crm/orders");
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create sales order. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/orders" className="hover:text-[#c8102e] font-semibold">Sales Orders</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Order</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Create Sales Order</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate a formal enterprise sales order and submit for approval.</p>
        </div>
        <Link
          href="/crm/orders"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Sales Order generated and routed for approval! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Customer / Purchasing Entity *
            </label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Ministry of Finance"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Quotation Reference
            </label>
            <input
              type="text"
              value={quoteRef}
              onChange={(e) => setQuoteRef(e.target.value)}
              placeholder="e.g. SQ-2025-086"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Total Order Amount (ETB) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2100000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Discount Requested (%)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="5"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Delivery / Fulfillment Date *
            </label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Payment Terms &amp; Conditions
          </label>
          <select
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
          >
            <option value="30 Days Net">30 Days Net</option>
            <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
            <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
            <option value="Immediate Upon Invoicing">Immediate Upon Invoicing</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Order Specifications &amp; Line Items
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Item descriptions, part numbers, quantity breakdown, and special delivery notes..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/orders"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Submit Order for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}
