"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import customerService from "@/services/customerService";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface CustomerItem {
  id: string | number;
  customerCode: string;
  name: string;
  tin: string;
  type: "Government" | "State Enterprise" | "Private" | "NGO" | "International";
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  creditLimit: number;
  outstanding: number;
  status: "Active" | "Inactive" | "Suspended";
}

const initialCustomers: CustomerItem[] = [
  {
    id: 1,
    customerCode: "CUS-001",
    name: "Ministry of Finance",
    tin: "0001234567",
    type: "Government",
    contactPerson: "Meron Bekele",
    phone: "+251 115 517 700",
    email: "meron.bekele@mof.gov.et",
    city: "Addis Ababa",
    creditLimit: 5000000,
    outstanding: 1200000,
    status: "Active",
  },
  {
    id: 2,
    customerCode: "CUS-002",
    name: "Ethiopian Airlines",
    tin: "0007654321",
    type: "State Enterprise",
    contactPerson: "Ato Kebede Haile",
    phone: "+251 116 650 000",
    email: "kebedeh@ethiopianairlines.com",
    city: "Addis Ababa",
    creditLimit: 7000000,
    outstanding: 0,
    status: "Active",
  },
  {
    id: 3,
    customerCode: "CUS-003",
    name: "Commercial Bank of Ethiopia",
    tin: "0009876543",
    type: "State Enterprise",
    contactPerson: "W/ro Aster Worku",
    phone: "+251 115 515 004",
    email: "asterw@cbe.com.et",
    city: "Addis Ababa",
    creditLimit: 4000000,
    outstanding: 750000,
    status: "Active",
  },
  {
    id: 4,
    customerCode: "CUS-004",
    name: "Ethio Telecom",
    tin: "0003456789",
    type: "State Enterprise",
    contactPerson: "Ato Henok Teshome",
    phone: "+251 115 500 000",
    email: "henok.t@ethiotelecom.et",
    city: "Addis Ababa",
    creditLimit: 3500000,
    outstanding: 1850000,
    status: "Active",
  },
  {
    id: 5,
    customerCode: "CUS-005",
    name: "Ministry of Revenues",
    tin: "0002345678",
    type: "Government",
    contactPerson: "Ato Dawit Lemma",
    phone: "+251 111 240 000",
    email: "dawitl@mor.gov.et",
    city: "Addis Ababa",
    creditLimit: 2000000,
    outstanding: 0,
    status: "Active",
  },
  {
    id: 6,
    customerCode: "CUS-006",
    name: "National Bank of Ethiopia",
    tin: "0004567890",
    type: "Government",
    contactPerson: "W/ro Tigist Abebe",
    phone: "+251 115 517 430",
    email: "tigista@nbe.gov.et",
    city: "Addis Ababa",
    creditLimit: 1800000,
    outstanding: 690000,
    status: "Inactive",
  },
  {
    id: 7,
    customerCode: "CUS-007",
    name: "Addis Ababa City Admin",
    tin: "0005678901",
    type: "Government",
    contactPerson: "Ato Solomon Desta",
    phone: "+251 111 550 000",
    email: "solomon.d@addisababacity.gov.et",
    city: "Addis Ababa",
    creditLimit: 1500000,
    outstanding: 0,
    status: "Active",
  },
  {
    id: 8,
    customerCode: "CUS-008",
    name: "Oromia Water Works",
    tin: "0006789012",
    type: "State Enterprise",
    contactPerson: "Ato Gemechu Tola",
    phone: "+251 114 390 000",
    email: "gemechut@owwdse.com",
    city: "Addis Ababa",
    creditLimit: 1000000,
    outstanding: 0,
    status: "Inactive",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getAllCustomers();
        const mapped: CustomerItem[] = (Array.isArray(data) ? data : (data as any).content || []).map((c: any) => ({
          id: c.id,
          customerCode: c.customerCode || `CUS-${c.id}`,
          name: c.name,
          tin: c.tin || "",
          type: c.customerType || c.type || "Private",
          contactPerson: c.contactPerson || "",
          phone: c.phone || "",
          email: c.email || "",
          city: c.city || "",
          creditLimit: Number(c.creditLimit || 0),
          outstanding: Number(c.outstanding || 0),
          status: c.status || "Active",
        }));
        setCustomers(mapped.length > 0 ? mapped : initialCustomers);
      } catch {
        setCustomers(initialCustomers);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // New Customer Form State
  const [newName, setNewName] = useState("");
  const [newTin, setNewTin] = useState("");
  const [newType, setNewType] = useState<CustomerItem["type"]>("Government");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCity, setNewCity] = useState("Addis Ababa");
  const [newCreditLimit, setNewCreditLimit] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch(`${API_URL}/api/customers`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data?.content || json?.data || json?.content || (Array.isArray(json) ? json : null);
          if (items && items.length > 0) {
            const mapped: CustomerItem[] = items.map((c: any, idx: number) => ({
              id: c.id || idx + 1,
              customerCode: c.customerCode || `CUS-${String(idx + 1).padStart(3, "0")}`,
              name: c.name || c.companyName || "Organization",
              tin: c.tin || c.taxId || "0000000000",
              type: (c.customerType === "STATE_ENTERPRISE")
                ? "State Enterprise"
                : (c.customerType === "GOVERNMENT")
                ? "Government"
                : (c.customerType === "NGO")
                ? "NGO"
                : "Private",
              contactPerson: c.contactPerson || c.primaryContact || "Contact Person",
              phone: c.phone || "+251 110 000 000",
              email: c.email || "info@customer.et",
              city: c.city || "Addis Ababa",
              creditLimit: Number(c.creditLimit || 3000000),
              outstanding: Number(c.outstandingBalance || 0),
              status: (c.status === "ACTIVE" || c.status === "Active") ? "Active" : "Inactive",
            }));
            setCustomers(mapped);
          }
        }
      } catch (err) {
        // Fallback active
      }
    }
    fetchCustomers();
  }, [API_URL]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.customerCode.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.tin.toLowerCase().includes(search.toLowerCase()) ||
        item.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        item.city.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        selectedType === "All" || item.type === selectedType;

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, search, selectedType, selectedStatus]);

  // Metrics
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);

  const formatETB = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getTypeBadge = (type: CustomerItem["type"]) => {
    switch (type) {
      case "Government":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "State Enterprise":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Private":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "NGO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCus: CustomerItem = {
      id: Date.now(),
      customerCode: `CUS-${String(customers.length + 1).padStart(3, "0")}`,
      name: newName || "New Enterprise Client",
      tin: newTin || "0009998887",
      type: newType,
      contactPerson: newContact || "Ato Representative",
      phone: newPhone || "+251 115 000 000",
      email: newEmail || "contact@org.et",
      city: newCity || "Addis Ababa",
      creditLimit: Number(newCreditLimit) || 2500000,
      outstanding: 0,
      status: "Active",
    };
    setCustomers([newCus, ...customers]);
    setIsModalOpen(false);
    setNewName("");
    setNewTin("");
    setNewContact("");
    setNewPhone("");
    setNewEmail("");
    setNewCreditLimit("");
  };

  return (
    <div className="space-y-5">
      {/* Top CRM Header (Role pills, 7 KPI cards, Integrations banner) */}
      <CrmHeader activeRole="SALES REP" />

      {/* 4 Customer Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Total Customers</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{totalCount}</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Active</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</div>
        </div>

        <div className="rounded-xl border border-red-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-red-700">Total Outstanding</div>
          <div className="mt-1 text-2xl font-black text-[#c8102e]">{formatETB(totalOutstanding)}</div>
        </div>

        <div className="rounded-xl border border-purple-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-purple-700">Total Credit Limit</div>
          <div className="mt-1 text-2xl font-black text-purple-700">{formatETB(totalCreditLimit)}</div>
        </div>
      </div>

      {/* Controls Row: Search, Type Filter, Status Filter, + Add Customer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        {/* Right filters & actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Dropdown */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter customers by type"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="State Enterprise">State Enterprise</option>
              <option value="Private">Private</option>
              <option value="NGO">NGO</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter customers by status"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* + Add Customer Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Main Table: Customer Registry (8) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Customer Registry ({filteredCustomers.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing {filteredCustomers.length} of {customers.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map((cus) => (
                <tr
                  key={cus.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setSelectedCustomer(cus)}
                >
                  <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                    {cus.customerCode}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{cus.name}</div>
                    <div className="text-[10.5px] text-slate-400 font-normal">
                      TIN: {cus.tin}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getTypeBadge(
                        cus.type
                      )}`}
                    >
                      {cus.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{cus.contactPerson}</div>
                    <div className="text-[10px] text-slate-400">{cus.phone}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{cus.city}</td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ETB {cus.creditLimit.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold">
                    {cus.outstanding > 0 ? (
                      <span className="text-[#c8102e]">
                        ETB {cus.outstanding.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">NIL</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(cus);
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

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer / Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ministry of Transport"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    TIN / Registration No.
                  </label>
                  <input
                    type="text"
                    required
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    placeholder="0001122334"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CustomerItem["type"])}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  >
                    <option value="Government">Government</option>
                    <option value="State Enterprise">State Enterprise</option>
                    <option value="Private">Private</option>
                    <option value="NGO">NGO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Contact
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="Ato Yohannes"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+251 115 000 000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Addis Ababa"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Credit Limit (ETB)
                  </label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    placeholder="3000000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#c8102e] px-4 py-2 font-bold text-white shadow hover:bg-[#a80d26]"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#c8102e]">{selectedCustomer.customerCode}</span>
                <span className="text-sm font-bold text-slate-900">{selectedCustomer.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">TIN / Registration</div>
                  <div className="font-bold text-slate-900">{selectedCustomer.tin}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Customer Type</div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getTypeBadge(selectedCustomer.type)}`}>
                    {selectedCustomer.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Contact Person</div>
                  <div className="font-bold text-slate-900">{selectedCustomer.contactPerson}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Phone</div>
                  <div className="font-bold text-slate-900">{selectedCustomer.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Credit Limit</div>
                  <div className="font-bold text-slate-900">ETB {selectedCustomer.creditLimit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Outstanding Balance</div>
                  <div className="font-bold text-[#c8102e]">
                    {selectedCustomer.outstanding > 0 ? `ETB ${selectedCustomer.outstanding.toLocaleString()}` : "NIL"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Close
              </button>
              <Link
                href={`/crm/orders?customer=${selectedCustomer.id}`}
                className="rounded-xl bg-[#071d3a] px-4 py-2 font-bold text-white hover:bg-[#0c2b5b] text-xs shadow-xs"
              >
                Create Order for Customer
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
