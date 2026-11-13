"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Boxes,
  Tag,
  DollarSign,
  Grid,
  List as ListIcon,
  ShieldAlert,
  RefreshCw,
  Download,
} from "lucide-react";
import CrmHeader from "@/components/crm/CrmHeader";
import productService from "@/services/productService";
import { ProductItem, ProductCategory, ProductStatus } from "@/types/product.types";

const CATEGORIES: { label: string; value: ProductCategory | "ALL" }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Security Hardware", value: "SECURITY_HARDWARE" },
  { label: "Software License", value: "SOFTWARE_LICENSE" },
  { label: "Cybersecurity Audit", value: "CYBERSECURITY_AUDIT" },
  { label: "Enterprise ERP", value: "ENTERPRISE_ERP" },
  { label: "Training & Certifications", value: "TRAINING_AND_CERTIFICATION" },
  { label: "Maintenance & Support", value: "MAINTENANCE_AND_SUPPORT" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "SECURITY_HARDWARE" as ProductCategory,
    description: "",
    unitPrice: "",
    sku: "",
    stockQuantity: "10",
    status: "ACTIVE" as ProductStatus,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    setRefreshing(true);
    try {
      const items = await productService.getAllProducts();
      setProducts(items);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.productCode.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockCount = products.filter((p) => p.stockQuantity < 10).length;
  const totalCatalogValue = products.reduce((sum, p) => sum + p.unitPrice * p.stockQuantity, 0);

  const formatETB = (val: number) => {
    if (val >= 1000000) return `ETB ${(val / 1000000).toFixed(2)}M`;
    return `ETB ${val.toLocaleString()}`;
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "SECURITY_HARDWARE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ENTERPRISE_ERP":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CYBERSECURITY_AUDIT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SOFTWARE_LICENSE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "SECURITY_HARDWARE",
      description: "",
      unitPrice: "",
      sku: "",
      stockQuantity: "10",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category as ProductCategory,
      description: p.description || "",
      unitPrice: String(p.unitPrice),
      sku: p.sku || "",
      stockQuantity: String(p.stockQuantity),
      status: p.status as ProductStatus,
    });
    setIsModalOpen(true);
  };

  const handleStockAdjust = async (id: number | string, delta: number) => {
    const updated = await productService.updateStock(id, delta);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await productService.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      unitPrice: Number(formData.unitPrice) || 0,
      sku: formData.sku,
      stockQuantity: Number(formData.stockQuantity) || 0,
      status: formData.status,
    };

    if (editingProduct) {
      const updated = await productService.updateProduct(editingProduct.id, payload);
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    } else {
      const created = await productService.createProduct(payload);
      setProducts((prev) => [created, ...prev]);
    }

    setLoading(false);
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ["Product Code", "Name", "Category", "SKU", "Price (ETB)", "Stock", "Status"];
    const rows = filteredProducts.map((p) => [
      p.productCode,
      p.name,
      p.category.replace(/_/g, " "),
      p.sku || "-",
      p.unitPrice.toString(),
      p.stockQuantity.toString(),
      p.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `products_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top CRM Header */}
      <CrmHeader activeRole="ADMIN / CATALOG MANAGER" />

      {/* 4 Product Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Products</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{totalProducts}</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Active Items</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{activeProducts}</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-medium text-amber-700">Low Stock Warning</div>
          <div className="mt-1 text-2xl font-black text-amber-600">{lowStockCount}</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Catalog Inventory Value</div>
          <div className="mt-1 text-2xl font-black text-blue-700">{formatETB(totalCatalogValue)}</div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by code, name, SKU..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
          />
        </div>

        {/* Right actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter products by category"
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* List / Grid Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-[#c8102e] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadProducts}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh products"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Export Button with Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1 hidden w-40 rounded-xl border border-slate-200 bg-white shadow-lg group-hover:block z-10">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-t-xl"
              >
                <Download className="h-3.5 w-3.5" />
                Export as CSV
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-b-xl"
              >
                <Download className="h-3.5 w-3.5" />
                Export as JSON
              </button>
            </div>
          </div>

          {/* + Add Product Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-950/20 transition hover:bg-[#a80d26]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product List View */}
      {viewMode === "list" ? (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Product Catalog ({filteredProducts.length})
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredProducts.length} of {products.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Price (ETB)</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-[#c8102e]">{p.productCode}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{p.name}</div>
                      {p.description && (
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getCategoryBadge(p.category)}`}>
                        {p.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{p.sku || "—"}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ETB {p.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(p.id, -1)}
                          className="h-6 w-6 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className={`min-w-8 text-center font-bold text-xs ${p.stockQuantity === 0 ? "text-red-600" : "text-slate-800"}`}>
                          {p.stockQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(p.id, 1)}
                          className="h-6 w-6 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "OUT_OF_STOCK"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-[#c8102e] hover:shadow-md transition">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                <span className="font-bold text-[#c8102e]">{p.productCode}</span>
                <span className={`rounded-full border px-2 py-0.5 font-bold ${getCategoryBadge(p.category)}`}>
                  {p.category.replace(/_/g, " ")}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{p.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{p.description || "No description provided."}</p>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Unit Price</div>
                  <div className="font-bold text-slate-900 text-sm">ETB {p.unitPrice.toLocaleString()}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">In Stock</div>
                  <div className={`font-bold ${p.stockQuantity === 0 ? "text-red-600" : "text-slate-800"}`}>
                    {p.stockQuantity} units
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Tag className="h-3 w-3 text-slate-400" />
                  <span>{p.sku || "No SKU"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(p)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. INSA Enterprise Shield Firewall"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  >
                    <option value="SECURITY_HARDWARE">Security Hardware</option>
                    <option value="SOFTWARE_LICENSE">Software License</option>
                    <option value="CYBERSECURITY_AUDIT">Cybersecurity Audit</option>
                    <option value="ENTERPRISE_ERP">Enterprise ERP</option>
                    <option value="TRAINING_AND_CERTIFICATION">Training & Certification</option>
                    <option value="MAINTENANCE_AND_SUPPORT">Maintenance & Support</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SKU-HW-101"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit Price (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="450000"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="15"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#c8102e]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed hardware or software specifications..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#c8102e]"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#c8102e] px-4 py-2 font-bold text-white hover:bg-[#a80d26] text-xs shadow-xs disabled:opacity-60"
                >
                  {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
