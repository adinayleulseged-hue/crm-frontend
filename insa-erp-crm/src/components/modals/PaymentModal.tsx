"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { InvoiceItem } from "@/types/invoice.types";
import { PaymentCreateDTO, PaymentMethod } from "@/types/payment.types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: PaymentCreateDTO) => Promise<void> | void;
  selectedInvoice?: InvoiceItem | null;
  invoicesList?: InvoiceItem[];
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  selectedInvoice,
  invoicesList = [],
}: PaymentModalProps) {
  const [invoiceId, setInvoiceId] = useState<number | string>(
    selectedInvoice?.id || ""
  );
  const [customerId, setCustomerId] = useState<number | string>(
    selectedInvoice?.customerId || ""
  );
  const [customerName, setCustomerName] = useState<string>(
    selectedInvoice?.customerName || ""
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("BANK_TRANSFER");
  const [amount, setAmount] = useState<string>(
    selectedInvoice?.balanceAmount?.toString() || ""
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receivedBy, setReceivedBy] = useState<string>("Salam Haile");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedInvoice) {
      setInvoiceId(selectedInvoice.id);
      setCustomerId(selectedInvoice.customerId);
      setCustomerName(selectedInvoice.customerName || `Customer #${selectedInvoice.customerId}`);
      setAmount(selectedInvoice.balanceAmount?.toString() || "");
    }
  }, [selectedInvoice]);

  const activeInvoice =
    selectedInvoice ||
    invoicesList.find((inv) => String(inv.id) === String(invoiceId));

  const handleInvoiceChange = (idStr: string) => {
    setInvoiceId(idStr);
    const found = invoicesList.find((i) => String(i.id) === idStr);
    if (found) {
      setCustomerId(found.customerId);
      setCustomerName(found.customerName || `Customer #${found.customerId}`);
      setAmount(found.balanceAmount?.toString() || "");
    }
  };

  const handlePayFullBalance = () => {
    if (activeInvoice?.balanceAmount) {
      setAmount(activeInvoice.balanceAmount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = Number(amount);
    if (!invoiceId) {
      setErrorMsg("Please select an invoice.");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setErrorMsg("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (activeInvoice && activeInvoice.balanceAmount !== undefined) {
      if (numAmount > activeInvoice.balanceAmount) {
        setErrorMsg(
          `Payment amount cannot exceed remaining invoice balance (ETB ${activeInvoice.balanceAmount.toLocaleString()}).`
        );
        return;
      }
    }

    const payload: PaymentCreateDTO = {
      invoiceId: Number(invoiceId),
      customerId: Number(customerId || 1),
      paymentMethod,
      amount: numAmount,
      paymentDate,
      transactionReference: transactionRef || `TXN-${Date.now().toString().slice(-6)}`,
      receivedBy,
      notes,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "Failed to record payment. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#071d3a] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8102e] text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Record Payment</h3>
              <p className="text-[10.5px] text-blue-200">
                FMS Finance Settlement &middot; ETB Treasury Account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Invoice Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Invoice to Settle <span className="text-[#c8102e]">*</span>
            </label>
            {selectedInvoice ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedInvoice.customerName} &middot; Ref:{" "}
                    {selectedInvoice.salesOrderCode || `SO-${selectedInvoice.salesOrderId}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Balance
                  </div>
                  <div className="font-bold text-[#c8102e]">
                    ETB {selectedInvoice.balanceAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
              >
                <option value="">-- Choose an Open Invoice --</option>
                {invoicesList
                  .filter((inv) => (inv.balanceAmount || 0) > 0)
                  .map((inv, idx) => (
                    <option key={`opt-inv-${inv.id}-${idx}`} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} (Bal: ETB{" "}
                      {inv.balanceAmount?.toLocaleString()})
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Amount and Quick Fill */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Payment Amount (ETB) <span className="text-[#c8102e]">*</span>
              </label>
              {activeInvoice?.balanceAmount ? (
                <button
                  type="button"
                  onClick={handlePayFullBalance}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  Pay Full Balance (ETB {activeInvoice.balanceAmount.toLocaleString()})
                </button>
              ) : null}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1050000"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#c8102e] focus:ring-1 focus:ring-[#c8102e]"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method <span className="text-[#c8102e]">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money (Telebirr/CBE Birr)</option>
                <option value="ONLINE_PAYMENT">Online Payment Gateway</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Date <span className="text-[#c8102e]">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
              />
            </div>
          </div>

          {/* Transaction Ref & Received By */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Reference / Slip No.
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. CBE-FT251928"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none font-medium text-slate-800 focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Received / Processed By
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="e.g. Salam Haile"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none font-medium text-slate-800 focus:border-[#c8102e]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Payment Settlement Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Second installment paid via Commercial Bank of Ethiopia direct deposit."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#c8102e]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c8102e] px-5 py-2 font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Confirm & Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
