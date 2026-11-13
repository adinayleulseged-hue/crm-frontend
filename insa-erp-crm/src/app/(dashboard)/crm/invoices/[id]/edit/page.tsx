"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { InvoiceStatus } from "@/types/invoice.types";
import invoiceService from "@/services/invoiceService";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [status, setStatus] = useState<InvoiceStatus>("PENDING");
  const [dueDate, setDueDate] = useState("2025-08-30");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2025-041");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInv() {
      if (id) {
        try {
          const inv = await invoiceService.getInvoiceById(Number(id));
          if (inv) {
            setStatus(inv.status);
            setDueDate(inv.dueDate);
            setNotes(inv.notes || "");
            setInvoiceNumber(inv.invoiceNumber);
          }
        } catch {}
      }
    }
    fetchInv();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (id) {
        await invoiceService.updateInvoice(Number(id), {
          status,
          dueDate,
          notes,
        });
      }
    } catch {}
    setIsSubmitting(false);
    router.push(`/crm/invoices`);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/crm/invoices"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Edit Invoice {invoiceNumber}
          </h1>
          <p className="text-xs text-slate-500">Update status, due date or notes</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 outline-none font-semibold text-slate-800 focus:border-[#c8102e]"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 outline-none focus:border-[#c8102e]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/crm/invoices"
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#c8102e] px-5 py-2 font-bold text-white shadow-md shadow-red-950/20 hover:bg-[#a80d26] transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
