"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState("Commercial Bank of Ethiopia");
  const [amount, setAmount] = useState("750000");
  const [deliveryDate, setDeliveryDate] = useState("2025-08-15");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => router.push("/crm/orders"), 1000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/orders" className="hover:text-[#c8102e] font-semibold">Orders</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Edit Order #{id}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Modify Sales Order #{id}</h1>
        </div>
        <Link href="/crm/orders" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Order updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Customer Name</label>
          <input
            type="text"
            required
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Order Amount (ETB)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Delivery Date</label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link href="/crm/orders" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
          <button type="submit" className="px-5 py-2 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
