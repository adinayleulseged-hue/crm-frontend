"use client";

import React, { useState } from "react";
import { X, FileText } from "lucide-react";

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData) => void;
  defaultCustomer?: string;
  defaultOrderRef?: string;
  defaultAmount?: number;
}

export interface InvoiceFormData {
  customerName: string;
  orderRef: string;
  totalAmount: number;
  dueDate: string;
}

export default function GenerateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  defaultCustomer = "",
  defaultOrderRef = "",
  defaultAmount = 0,
}: GenerateInvoiceModalProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: defaultCustomer,
    orderRef: defaultOrderRef,
    totalAmount: defaultAmount,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error generating invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Generate Invoice</h2>
              <p className="text-xs text-slate-500">Create new invoice record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Customer Account / Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ethiopian Airlines"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Associated Order / Quotation Ref
            </label>
            <input
              type="text"
              placeholder="e.g. QUO-2025-001 or ORD-705566"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              value={formData.orderRef}
              onChange={(e) => setFormData({ ...formData, orderRef: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Total Amount (ETB)
              </label>
              <input
                type="number"
                placeholder="12400"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold"
                value={formData.totalAmount || ""}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Real-time Automated Total & Tax Breakdown */}
          {formData.totalAmount > 0 && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 shadow-2xs">
              <div className="font-extrabold text-emerald-900 flex items-center justify-between border-b border-emerald-200 pb-1">
                <span>Automated Invoice Calculation</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  Auto Tax Calculated
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-bold text-slate-900">ETB {(formData.totalAmount / 1.15).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>VAT (15% Tax):</span>
                <span className="font-bold text-slate-900">ETB {(formData.totalAmount - formData.totalAmount / 1.15).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-950 text-xs pt-1 border-t border-emerald-200">
                <span>Grand Total Amount:</span>
                <span className="text-[#c8102e] text-sm">ETB {formData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
