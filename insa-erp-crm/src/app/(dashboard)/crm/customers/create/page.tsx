"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import customerService from "@/services/customerService";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tin, setTin] = useState("");
  const [type, setType] = useState<"Government" | "State Enterprise" | "Private" | "NGO">("Government");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [creditLimit, setCreditLimit] = useState("5000000");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Map display type to backend CustomerType enum
  const toCustomerType = (t: string): string => {
    const map: Record<string, string> = {
      "Government": "GOVERNMENT",
      "State Enterprise": "ORGANIZATION",
      "Private": "PRIVATE",
      "NGO": "NGO",
    };
    return map[t] ?? "ORGANIZATION";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await customerService.createCustomer({
        customerName: contactPerson,       // @NotBlank — contact person name
        organizationName: name,            // @NotBlank — company / org name
        customerType: toCustomerType(type),
        email,
        phone,
        city,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/crm/customers");
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create customer. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <CrmHeader activeRole="ACCOUNT MANAGER" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/customers" className="hover:text-[#059669] font-semibold">Customers</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">New Account</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Register Enterprise Customer</h1>
          <p className="text-xs text-slate-500 mt-0.5">Add a verified ministry, government organ, or commercial client account.</p>
        </div>
        <Link
          href="/crm/customers"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Customer account created and registered in ERP! Redirecting...</span>
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
              Customer / Organization Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ministry of Innovation & Technology"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Tax Identification Number (TIN) *
            </label>
            <input
              type="text"
              required
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder="0001234567"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Customer Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white font-semibold cursor-pointer"
            >
              <option value="Government">Federal Government Ministry</option>
              <option value="State Enterprise">State Enterprise</option>
              <option value="Private">Private Commercial Bank / Corp</option>
              <option value="NGO">International Organization / NGO</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              City / Region *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Addis Ababa"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Approved Credit Limit (ETB)
            </label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="5000000"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Key Contact Person *
            </label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Ato Meron Bekele"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 115 517 700"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@org.gov.et"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#059669] focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            href="/crm/customers"
            className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#059669] text-white font-bold hover:bg-emerald-700 transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : "Register Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
