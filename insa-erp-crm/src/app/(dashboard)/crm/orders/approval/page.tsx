"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Filter,
  Check,
  X,
  FileText,
  Building2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";

interface ApprovalOrder {
  id: string;
  orderCode: string;
  customer: string;
  rep: string;
  amount: number;
  priority: "High" | "Normal" | "Urgent";
  submittedDate: string;
  itemsCount: number;
  discountRequested: string;
  notes: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialApprovalList: ApprovalOrder[] = [
  {
    id: "1",
    orderCode: "SO-2025-047",
    customer: "Ethio Telecom",
    rep: "Salam Haile",
    amount: 750000,
    priority: "High",
    submittedDate: "2025-07-28 09:30",
    itemsCount: 4,
    discountRequested: "8%",
    notes: "Special enterprise discount for telecom infrastructure expansion bundle.",
    status: "Pending",
  },
  {
    id: "2",
    orderCode: "SO-2025-044",
    customer: "Zemen Bank S.C.",
    rep: "Dawit Mulatu",
    amount: 420000,
    priority: "High",
    submittedDate: "2025-07-28 07:15",
    itemsCount: 2,
    discountRequested: "5%",
    notes: "Core network security hardware & quarterly maintenance.",
    status: "Pending",
  },
  {
    id: "3",
    orderCode: "SO-2025-041",
    customer: "Nib International Bank",
    rep: "Hanna Tesfaye",
    amount: 185000,
    priority: "Normal",
    submittedDate: "2025-07-27 16:40",
    itemsCount: 1,
    discountRequested: "0%",
    notes: "Annual software subscription renewal.",
    status: "Pending",
  },
  {
    id: "4",
    orderCode: "SO-2025-039",
    customer: "Ethiopian Airlines",
    rep: "Yonas Girma",
    amount: 1200000,
    priority: "Urgent",
    submittedDate: "2025-07-27 14:10",
    itemsCount: 5,
    discountRequested: "12%",
    notes: "Executive sign-off required for airport terminals cyber monitoring upgrade.",
    status: "Pending",
  },
  {
    id: "5",
    orderCode: "SO-2025-037",
    customer: "Commercial Bank of Ethiopia",
    rep: "Tigist Bekele",
    amount: 320000,
    priority: "Normal",
    submittedDate: "2025-07-26 11:20",
    itemsCount: 2,
    discountRequested: "3%",
    notes: "Branch firewall licenses & endpoint protection.",
    status: "Pending",
  },
];

export default function OrderApprovalPage() {
  const [orders, setOrders] = useState<ApprovalOrder[]>(initialApprovalList);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<ApprovalOrder | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApprove = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Approved" } : o))
    );
    notify(`Order #${id} approved successfully and sent to FMS for invoicing.`);
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const handleReject = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Rejected" } : o))
    );
    notify(`Order #${id} rejected and returned to sales rep with revision notes.`);
    if (selectedOrder?.id === id) setSelectedOrder(null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.rep.toLowerCase().includes(search.toLowerCase());
    const matchPri = selectedPriority === "All" || o.priority === selectedPriority;
    return matchSearch && matchPri;
  });

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const approvedCount = orders.filter((o) => o.status === "Approved").length;
  const rejectedCount = orders.filter((o) => o.status === "Rejected").length;
  const pendingValue = orders
    .filter((o) => o.status === "Pending")
    .reduce((s, o) => s + o.amount, 0);

  const priorityStyle = {
    Urgent: "bg-red-50 text-red-700 border-red-200",
    High: "bg-amber-50 text-amber-700 border-amber-200",
    Normal: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-5">
      <CrmHeader activeRole="SALES MANAGER" />

      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/crm/orders" className="hover:text-[#c8102e] font-semibold">Sales Orders</Link>
            <span>/</span>
            <span className="font-bold text-slate-800">Approvals Management</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Manager Order Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review, approve, or reject high-value sales orders &amp; discount requests.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/crm/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Orders</span>
          </Link>
          <Link
            href="/dashboard/sales-manager"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1d4ed8] text-white text-xs font-bold hover:bg-blue-800 transition shadow-xs"
          >
            <span>Manager Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700">Pending Review</div>
          <div className="mt-1 text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Action required</div>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700">Pending Value</div>
          <div className="mt-1 text-2xl font-black text-blue-700">ETB {(pendingValue / 1000000).toFixed(2)}M</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting manager authorization</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700">Approved Today</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{approvedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dispatched to FMS</div>
        </div>

        <div className="rounded-2xl border border-red-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold text-red-700">Rejected / Returned</div>
          <div className="mt-1 text-2xl font-black text-red-600">{rejectedCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Revisions requested</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, or sales rep..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1d4ed8]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Orders Requiring Authorization ({filtered.length})</h2>
          <span className="text-xs text-slate-400">Total {orders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Sales Rep</th>
                <th className="py-3 px-4 text-right">Amount (ETB)</th>
                <th className="py-3 px-4 text-center">Discount</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-blue-700">{ord.orderCode}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ord.customer}</td>
                  <td className="py-3.5 px-4 text-slate-700">{ord.rep}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    ETB {ord.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700">{ord.discountRequested}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${priorityStyle[ord.priority]}`}>
                      {ord.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        ord.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      {ord.status === "Pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition"
                            title="Approve Order"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold hover:bg-red-200 transition"
                            title="Reject / Return"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Processed</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600">{selectedOrder.orderCode}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedOrder.customer}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Sales Rep</span>
                  <div className="font-bold text-slate-900">{selectedOrder.rep}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Order Amount</span>
                  <div className="font-extrabold text-emerald-600 text-sm">ETB {selectedOrder.amount.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Discount Requested</span>
                  <div className="font-bold text-amber-700">{selectedOrder.discountRequested}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Priority Level</span>
                  <div className="font-bold text-red-600">{selectedOrder.priority}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 font-medium">Submission Notes</span>
                <p className="font-medium text-slate-700 mt-1">{selectedOrder.notes}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {selectedOrder.status === "Pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedOrder.id)}
                    className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
                  >
                    Reject Order
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedOrder.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                  >
                    Authorize &amp; Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
