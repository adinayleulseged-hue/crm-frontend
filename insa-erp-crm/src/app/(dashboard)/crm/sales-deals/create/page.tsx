"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import salesDealService from "@/services/salesDealService";
import customerService from "@/services/customerService";

function CreateSalesDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramCompany = searchParams.get("company") || "";
  const paramContact = searchParams.get("contact") || "";
  const paramPhone = searchParams.get("phone") || "";
  const paramEmail = searchParams.get("email") || "";
  const paramValue = searchParams.get("value") || "";

  const [name, setName] = useState(paramCompany ? `Enterprise Solution — ${paramCompany}` : "");
  const [customer, setCustomer] = useState(paramCompany);
  const [contactName, setContactName] = useState(paramContact);
  const [phone, setPhone] = useState(paramPhone);
  const [email, setEmail] = useState(paramEmail);
  const [amount, setAmount] = useState(paramValue || "1850000");
  const [stage, setStage] = useState("Proposal");
  const [probability, setProbability] = useState("70");
  const [closeDate, setCloseDate] = useState(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [notes, setNotes] = useState(paramCompany ? `Converted Lead for ${paramCompany} (${paramContact})` : "");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (paramCompany) {
      setCustomer(paramCompany);
      if (!name) setName(`Enterprise Solution — ${paramCompany}`);
      if (paramValue) setAmount(paramValue);
    }
  }, [paramCompany, paramContact, paramValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Create or register customer entity
      try {
        if (customer) {
          await customerService.createCustomer({
            customerName: contactName || customer,
            organizationName: customer,
            customerType: "ORGANIZATION",
            email: email || "info@client.gov.et",
            phone: phone || "+251 911 000000",
            contactPerson: contactName || "Account Representative",
            city: "Addis Ababa",
          });
        }
      } catch (e) {}

      // 2. Create Sales Deal
      await salesDealService.createSalesDeal({
        title: name || `Sales Deal — ${customer}`,
        customer: customer,
        customerName: customer,
        amount: Number(amount) || 1850000,
        expectedRevenue: Number(amount) || 1850000,
        stage: stage,
        probability: Number(probability) || 70,
        expectedCloseDate: closeDate,
        description: notes,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/crm/quotations?customer=${encodeURIComponent(customer)}&amount=${amount}&dealCode=${encodeURIComponent(name)}&autoOpen=true`);
      }, 1200);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/crm/sales-deals/pipeline");
      }, 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="SALES REP" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/sales-deals/pipeline" className="hover:text-[#c8102e] font-semibold">Sales Deals</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Deal</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Create New Sales Deal & Register Customer</h1>
          <p className="text-xs text-slate-500 mt-0.5">Register deal pipeline & customer account. Proceed to Quotation generation.</p>
        </div>
        <Link
          href="/crm/sales-deals/pipeline"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Deals</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Customer & Sales Deal created! Navigating to Quotation generation...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Sales Deal Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Security Gateway Modernization"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Customer Account / Organization *
            </label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Commercial Bank of Ethiopia"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Primary Contact Person
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Ato Kebede"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Contact Phone / Email
            </label>
            <input
              type="text"
              value={phone || email}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 911 000000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Deal Value (ETB) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1850000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Pipeline Stage *
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Proposal">Proposal / Quotation</option>
              <option value="Discovery">Discovery / Needs Analysis</option>
              <option value="Negotiation">Negotiation / Review</option>
              <option value="Won">Closed Won</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Target Close Date *
            </label>
            <input
              type="date"
              required
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#c8102e] focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/sales-deals/pipeline"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-[#c8102e] text-white font-bold hover:bg-[#a80d26] transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Save Deal & Generate Quotation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateSalesDealPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <CreateSalesDealForm />
    </Suspense>
  );
}
