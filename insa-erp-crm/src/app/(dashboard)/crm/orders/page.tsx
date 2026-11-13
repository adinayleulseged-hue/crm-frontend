"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import orderService from "@/services/orderService";
import {
  Search,
  Plus,
  ChevronDown,
  Eye,
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Package,
  Send,
  Building2,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import { CATALOG_PRODUCTS } from "@/data/catalogProducts";

interface OrderItem {
  id: string | number;
  orderCode: string;
  quotationRef: string;
  customer: string;
  orderDate: string;
  deliveryDate: string;
  amount: number;
  status: "Draft" | "Pending Approval" | "Confirmed" | "Processing" | "Delivered" | "Cancelled";
  assignedTo?: string;
  itemsCount?: number;
}

const initialOrders: OrderItem[] = [
  {
    id: 1,
    orderCode: "SO-2025-021",
    quotationRef: "SQ-2025-084",
    customer: "Ministry of Finance",
    orderDate: "2025-06-28",
    deliveryDate: "2025-07-30",
    amount: 2100000,
    status: "Processing",
    assignedTo: "Salam Haile",
    itemsCount: 4,
  },
  {
    id: 2,
    orderCode: "SO-2025-022",
    quotationRef: "SQ-2025-083",
    customer: "Commercial Bank of Ethiopia",
    orderDate: "2025-07-14",
    deliveryDate: "2025-08-15",
    amount: 750000,
    status: "Confirmed",
    assignedTo: "Salam Haile",
    itemsCount: 2,
  },
  {
    id: 3,
    orderCode: "SO-2025-023",
    quotationRef: "SQ-2025-082",
    customer: "Ethio Telecom",
    orderDate: "2025-07-02",
    deliveryDate: "2025-08-01",
    amount: 1850000,
    status: "Delivered",
    assignedTo: "Salam Haile",
    itemsCount: 6,
  },
  {
    id: 4,
    orderCode: "SO-2025-024",
    quotationRef: "SQ-2025-081",
    customer: "Ministry of Revenues",
    orderDate: "2025-06-18",
    deliveryDate: "2025-07-25",
    amount: 1200000,
    status: "Delivered",
    assignedTo: "Salam Haile",
    itemsCount: 3,
  },
  {
    id: 5,
    orderCode: "SO-2025-025",
    quotationRef: "SQ-2025-080",
    customer: "National Bank of Ethiopia",
    orderDate: "2025-07-20",
    deliveryDate: "2025-08-20",
    amount: 950000,
    status: "Pending Approval",
    assignedTo: "Salam Haile",
    itemsCount: 1,
  },
  {
    id: 6,
    orderCode: "SO-2025-026",
    quotationRef: "SQ-2025-079",
    customer: "Addis Ababa City Admin",
    orderDate: "2025-07-22",
    deliveryDate: "2025-08-25",
    amount: 650000,
    status: "Processing",
    assignedTo: "Salam Haile",
    itemsCount: 2,
  },
];

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const mapOrderStatus = (backendStatus: string): OrderItem["status"] => {
    const statusMap: Record<string, OrderItem["status"]> = {
      "DRAFT": "Draft",
      "PENDING": "Pending Approval",
      "PENDING_APPROVAL": "Pending Approval",
      "APPROVED": "Confirmed",
      "CONFIRMED": "Confirmed",
      "PROCESSING": "Processing",
      "IN_PROGRESS": "Processing",
      "DELIVERED": "Delivered",
      "COMPLETED": "Delivered",
      "CANCELLED": "Cancelled",
      "CANCELED": "Cancelled",
    };
    return statusMap[backendStatus?.toUpperCase()] || "Confirmed";
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      const items = Array.isArray(data) ? data : (data.content || []);
      const mapped: OrderItem[] = items.map((order: any) => ({
        id: order.id,
        orderCode: order.salesOrderCode || order.orderCode || `SO-${order.id}`,
        quotationRef: order.quotationCode || order.quotationRef || "-",
        customer: order.customerName || "Customer",
        orderDate: order.orderDate || order.createdAt || "",
        deliveryDate: order.deliveryDate || order.expectedDeliveryDate || "",
        amount: Number(order.totalAmount || order.amount || 0),
        status: mapOrderStatus(order.status),
        assignedTo: order.assignedTo || order.createdBy || "Sales Rep",
        itemsCount: order.itemsCount || order.orderItems?.length || 0,
      }));
      setOrders(mapped.length > 0 ? mapped : initialOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders(initialOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // New order form state matching Image 2 specifications
  const [selectedProductId, setSelectedProductId] = useState<string>("PROD-001");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderTitle, setOrderTitle] = useState("");
  const [newCustomer, setNewCustomer] = useState("Ministry of Finance");
  const [newQuoteRef, setNewQuoteRef] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [scopeNotes, setScopeNotes] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const currentProduct = useMemo(() => {
    return CATALOG_PRODUCTS.find((p) => p.id === selectedProductId) || CATALOG_PRODUCTS[0];
  }, [selectedProductId]);

  const currentUnitCatalogPrice = currentProduct.price;
  const calculatedOrderValue = currentUnitCatalogPrice * Math.max(1, orderQuantity);

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.orderCode.toLowerCase().includes(search.toLowerCase()) ||
        item.quotationRef.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, selectedStatus]);

  // Metrics
  const totalOrdersCount = orders.length;
  const totalOrdersValue = orders.reduce((sum, o) => sum + o.amount, 0);
  const pendingApprovalCount = orders.filter((o) => o.status === "Pending Approval").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  const formatETB = (val: number) => {
    if (val >= 1000000) {
      return `ETB ${(val / 1000000).toFixed(2)}M`;
    }
    return `ETB ${val.toLocaleString()}`;
  };

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "Processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending Approval":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setModalLoading(true);
      setModalError("");

      const totalVal = calculatedOrderValue;
      const effectiveTitle = orderTitle.trim() || `${currentProduct.name} Deployment`;

      // Prepare request data
      const requestData = {
        customerId: 1, // Default customer ID
        quotationId: 1, // Default quotation ID
        orderDate: new Date().toISOString().split("T")[0],
        deliveryDate: newDeliveryDate,
        subtotal: totalVal,
        discount: 0,
        tax: 0,
        totalAmount: totalVal,
        notes: `Product: ${currentProduct.name} | Qty: ${orderQuantity} units\nTitle: ${effectiveTitle}\nScope: ${scopeNotes}\nNotes: ${additionalNotes}\nCustomer: ${newCustomer}\nQuotation Ref: ${newQuoteRef || "N/A"}`,
        items: [
          {
            itemDescription: currentProduct.name,
            quantity: orderQuantity,
            unitPrice: currentUnitCatalogPrice,
            totalPrice: totalVal,
          },
        ],
      };

      console.log("[Orders] Creating order:", requestData);
      
      const created = await orderService.createOrder(requestData);
      console.log("[Orders] Created successfully:", created);

      // Show success toast
      const orderCode = (created as any)?.salesOrderCode || (created as any)?.orderCode || `SO-${Date.now().toString().slice(-4)}`;
      setSuccessToast(`✅ Sales Order ${orderCode} created successfully!`);
      setTimeout(() => setSuccessToast(null), 5000);

      // Refresh orders list
      await fetchOrders();

      // Reset form and close modal
      setIsModalOpen(false);
      setOrderTitle("");
      setScopeNotes("");
      setAdditionalNotes("");
      setOrderQuantity(1);
    } catch (error: any) {
      console.error("[Orders] Create failed:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to create order";
      setModalError(errorMsg);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          {successToast}
        </div>
      )}
      
      {/* Top CRM Header (Role pills, 7 KPI cards, Integrations banner) */}
      <CrmHeader activeRole="SALES REP" />

      {/* 4 Sales Orders Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Total Orders</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{totalOrdersCount}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-700">Total Value</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{formatETB(totalOrdersValue)}</div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-amber-700">Pending Approval</div>
          <div className="mt-1 text-2xl font-black text-amber-600">{pendingApprovalCount}</div>
        </div>

        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Delivered</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{deliveredCount}</div>
        </div>
      </div>

      {/* Controls Row: Search, Filter, + New Order */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        {/* Right filters & actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter orders by status"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Delivered">Delivered</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* + New Order Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Main Table: Sales Orders (8) */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Sales Orders ({filteredOrders.length})
          </h2>
          <span className="text-xs text-slate-400">
            Showing {filteredOrders.length} of {orders.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Quotation Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4 text-right">Amount (ETB)</th>
                <th className="py-3 px-4 text-center">Order Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                  onClick={() => setSelectedOrder(ord)}
                >
                  <td className="py-3.5 px-4 font-bold text-[#c8102e]">
                    {ord.orderCode}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-blue-600">
                    {ord.quotationRef}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ord.customer}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{ord.orderDate}</td>
                  <td className="py-3.5 px-4 text-slate-600">{ord.deliveryDate}</td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ETB {ord.amount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
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

      {/* New Order Modal (Matching Image 2 Design Specifications) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <Package className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create New Sales Order
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select product &amp; quantity to request custom procurement routed directly to Sales Manager &amp; Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4 text-xs">
              {/* Product Select with Dropdown Badge */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Select Product / Solution Package <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                    Product Catalog Dropdown
                  </span>
                </div>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition cursor-pointer"
                  required
                >
                  {CATALOG_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.category}) — ETB {prod.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Delivery Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">
                      Amount of Quantity Needed <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Units / Pails / Drums</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Target Close / Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Customer and Quote Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Customer / Entity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="e.g., Ministry of Finance"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Quotation Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={newQuoteRef}
                    onChange={(e) => setNewQuoteRef(e.target.value)}
                    placeholder="e.g., SQ-2025-085"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Order Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Deal Title / Order Scope <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                  placeholder="e.g., Enterprise Cyber Defense Procurement"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {/* Dynamic Deal Calculation Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200/80">
                  <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Dynamic Deal Calculation Breakdown</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    AUTO SYNCED WITH SALES MANAGER &amp; ADMIN
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span>Selected Product:</span>
                  <span className="font-extrabold text-slate-900 max-w-[280px] truncate text-right">
                    {currentProduct.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span>Unit Catalog Price:</span>
                  <span className="font-extrabold text-slate-900">
                    ETB {currentUnitCatalogPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span>Quantity Amount:</span>
                  <span className="font-extrabold text-slate-900">
                    {orderQuantity} {orderQuantity > 1 ? "units" : "unit"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-black text-purple-950 pt-2 border-t border-purple-200">
                  <span>Calculated Deal Value:</span>
                  <span className="text-purple-700 text-base font-black">
                    ETB {calculatedOrderValue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Project Scope & Specifications */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Project Scope &amp; Specifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={scopeNotes}
                  onChange={(e) => setScopeNotes(e.target.value)}
                  placeholder="Describe deployment requirements, delivery site address, technical specifications..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {/* Additional Notes & Terms */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Additional Notes &amp; Terms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Budget constraints, installment preferences, stakeholder contact information..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {modalError}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold shadow-lg shadow-purple-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {modalLoading ? "Creating..." : "Create Sales Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#c8102e]">{selectedOrder.orderCode}</span>
                <span className="text-sm font-bold text-slate-900">{selectedOrder.customer}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Quotation Reference</div>
                  <div className="font-bold text-blue-600">{selectedOrder.quotationRef}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Order Status</div>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Order Date</div>
                  <div className="font-bold text-slate-900">{selectedOrder.orderDate}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">Delivery Date</div>
                  <div className="font-bold text-slate-900">{selectedOrder.deliveryDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-slate-400 font-medium">Total Amount</div>
                  <div className="font-bold text-slate-900 text-sm">ETB {selectedOrder.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-medium">FMS Invoice Status</div>
                  <div className="font-bold text-emerald-600">Pending Generation</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
              >
                Close
              </button>
              <Link
                href={`/crm/invoices?fromOrder=${selectedOrder.id}`}
                className="rounded-xl bg-[#071d3a] px-4 py-2 font-bold text-white hover:bg-[#0c2b5b] text-xs shadow-xs"
              >
                Generate FMS Invoice
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}