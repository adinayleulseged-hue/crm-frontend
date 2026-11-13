"use client";

import React, { useState } from "react";
import { X, Building2, Phone, Wallet, DollarSign, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: string | number;
    invoiceNumber: string;
    amount: number;
  };
  onPaymentComplete: () => void;
}

type PaymentMethod = "CBE" | "TELEBIRR" | "AWASH" | "CASH" | null;
type PaymentStep = "METHOD" | "DETAILS" | "REVIEW" | "DONE";

export default function PaymentMethodModal({
  isOpen,
  onClose,
  invoice,
  onPaymentComplete,
}: PaymentMethodModalProps) {
  const [step, setStep] = useState<PaymentStep>("METHOD");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    // For Bank Transfer (CBE/Awash)
    senderAccountName: "",
    senderAccountNumber: "",
    senderBankBranch: "",
    transferDate: new Date().toISOString().split("T")[0],
    transactionId: "",
    
    // For Telebirr
    telebirrPhone: "",
    telebirrTransactionId: "",
    
    // For Cash
    cashReceivedBy: "",
    cashReceiptNumber: "",
    cashPaymentDate: new Date().toISOString().split("T")[0],
    
    // Common
    notes: "",
  });

  if (!isOpen) return null;

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep("DETAILS");
  };

  const handleBackToMethods = () => {
    setStep("METHOD");
    setSelectedMethod(null);
  };

  const handleReview = () => {
    // Validate based on payment method
    if (selectedMethod === "CBE" || selectedMethod === "AWASH") {
      if (!paymentForm.senderAccountName || !paymentForm.senderAccountNumber || !paymentForm.transactionId) {
        alert("Please fill in all required bank transfer fields");
        return;
      }
    } else if (selectedMethod === "TELEBIRR") {
      if (!paymentForm.telebirrPhone || !paymentForm.telebirrTransactionId) {
        alert("Please fill in all required Telebirr fields");
        return;
      }
    } else if (selectedMethod === "CASH") {
      if (!paymentForm.cashReceivedBy || !paymentForm.cashReceiptNumber) {
        alert("Please fill in all required cash payment fields");
        return;
      }
    }
    setStep("REVIEW");
  };

  const handleSubmitPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare payment data based on method
      const paymentData: any = {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,  // Also send invoice number as fallback
        amount: invoice.amount,
        paymentMethod: selectedMethod,
        paymentDate: paymentForm.transferDate || paymentForm.cashPaymentDate,
        notes: paymentForm.notes,
      };

      if (selectedMethod === "CBE" || selectedMethod === "AWASH") {
        paymentData.bankName = selectedMethod === "CBE" ? "Commercial Bank of Ethiopia" : "Awash International Bank";
        paymentData.senderAccountName = paymentForm.senderAccountName;
        paymentData.senderAccountNumber = paymentForm.senderAccountNumber;
        paymentData.senderBankBranch = paymentForm.senderBankBranch;
        paymentData.transactionId = paymentForm.transactionId;
      } else if (selectedMethod === "TELEBIRR") {
        paymentData.telebirrPhone = paymentForm.telebirrPhone;
        paymentData.transactionId = paymentForm.telebirrTransactionId;
      } else if (selectedMethod === "CASH") {
        paymentData.cashReceivedBy = paymentForm.cashReceivedBy;
        paymentData.cashReceiptNumber = paymentForm.cashReceiptNumber;
      }

      console.log("[Payment] Submitting payment:", paymentData);

      // Attempt backend API to create payment record (with graceful fallback if offline)
      let createdPayment: any = null;
      try {
        const paymentService = (await import("@/services/paymentService")).default;
        createdPayment = await paymentService.createPayment(paymentData);
        console.log("[Payment] Payment created in backend successfully:", createdPayment);
      } catch (backendError: any) {
        console.warn("[Payment] Backend payment creation handled gracefully:", backendError?.message || backendError);
      }

      // NOTE: Do NOT call confirmPayment here - invoice is in PENDING status awaiting finance approval
      // Finance will approve the invoice directly (PENDING → APPROVED)
      // The confirmPayment endpoint requires APPROVED status which happens after finance approval

      // Sync across all localStorage keys so customer dashboard & Finance Officer Portal update instantly
      if (typeof window !== "undefined") {
        const custName = localStorage.getItem("active_customer") || localStorage.getItem("active_customer_username") || "";
        const refCode = paymentForm.transactionId || paymentForm.telebirrTransactionId || paymentForm.cashReceiptNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const methodLabel = selectedMethod === "TELEBIRR" ? "Telebirr" : selectedMethod === "CBE" ? "CBE Bank Transfer" : selectedMethod === "AWASH" ? "Awash Bank Transfer" : "Cash";

        // 1. Record payment in crm_payments_global
        try {
          const paymentsList = JSON.parse(localStorage.getItem("crm_payments_global") || "[]");
          const newPaymentRecord = {
            id: createdPayment?.id || `PAY-${Date.now()}`,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            paymentMethod: methodLabel,
            paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
            status: "PENDING_APPROVAL",
            customerName: custName,
            transactionReference: refCode,
            transactionId: refCode,
            bankName: paymentData.bankName || (selectedMethod === "CBE" ? "Commercial Bank of Ethiopia" : selectedMethod === "AWASH" ? "Awash Bank" : undefined),
            senderAccountName: paymentForm.senderAccountName || custName,
            senderAccountNumber: paymentForm.senderAccountNumber,
            senderBankBranch: paymentForm.senderBankBranch,
            notes: paymentForm.notes,
            submittedAt: new Date().toISOString(),
          };
          localStorage.setItem("crm_payments_global", JSON.stringify([newPaymentRecord, ...paymentsList]));
        } catch (e) {}

        // 2. Sync across all localStorage `crm_invoices_*` keys
        let foundInAnyKey = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("crm_invoices_")) {
            try {
              const items = JSON.parse(localStorage.getItem(key) || "[]");
              if (Array.isArray(items)) {
                let keyUpdated = false;
                const synced = items.map((item: any) => {
                  const matchNum = String(item.invoiceNumber || "").trim().toUpperCase() === String(invoice.invoiceNumber || "").trim().toUpperCase();
                  const matchId = item.id && invoice.id && String(item.id).trim() === String(invoice.id).trim();
                  if (matchNum || matchId) {
                    foundInAnyKey = true;
                    keyUpdated = true;
                    return {
                      ...item,
                      status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount,
                      paymentMethod: methodLabel,
                      paymentRef: refCode,
                      customerName: item.customerName || custName,
                      submittedAt: new Date().toISOString(),
                      financeStatus: "PENDING_APPROVAL",
                      paymentSubmitted: true,
                    };
                  }
                  return item;
                });
                if (keyUpdated) {
                  localStorage.setItem(key, JSON.stringify(synced));
                }
              }
            } catch (e) {}
          }
        }

        // Explicitly update invoice in crm_invoices_global
        try {
          const globalInvs = JSON.parse(localStorage.getItem("crm_invoices_global") || "[]");
          const gIdx = globalInvs.findIndex(
            (x: any) =>
              String(x.invoiceNumber || "").trim().toUpperCase() === String(invoice.invoiceNumber || "").trim().toUpperCase() ||
              (x.id && invoice.id && String(x.id).trim() === String(invoice.id).trim())
          );
          if (gIdx >= 0) {
            globalInvs[gIdx] = {
              ...globalInvs[gIdx],
              status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount,
              paymentMethod: methodLabel,
              paymentRef: refCode,
              customerName: globalInvs[gIdx].customerName || custName,
              financeStatus: "PENDING_APPROVAL",
              paymentSubmitted: true,
            };
          } else {
            globalInvs.unshift({
              id: invoice.id || `inv-${Date.now()}`,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.amount,
              status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount,
              paymentMethod: methodLabel,
              paymentRef: refCode,
              customerName: custName,
              date: new Date().toISOString().split("T")[0],
              financeStatus: "PENDING_APPROVAL",
              paymentSubmitted: true,
            });
          }
          localStorage.setItem("crm_invoices_global", JSON.stringify(globalInvs));
        } catch (e) {}

        // Explicitly update invoice for this specific customer
        const targetKeys = [
          custName ? `crm_invoices_${custName}` : "",
        ].filter(Boolean);
        targetKeys.forEach((tKey) => {
          try {
            const list = JSON.parse(localStorage.getItem(tKey) || "[]");
            const existingIdx = list.findIndex(
              (x: any) =>
                String(x.invoiceNumber || "").trim().toUpperCase() === String(invoice.invoiceNumber || "").trim().toUpperCase() ||
                (x.id && invoice.id && String(x.id).trim() === String(invoice.id).trim())
            );
            if (existingIdx >= 0) {
              list[existingIdx] = {
                ...list[existingIdx],
                status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount,
                paymentMethod: methodLabel,
                paymentRef: refCode,
                customerName: custName,
                submittedAt: new Date().toISOString(),
                financeStatus: "PENDING_APPROVAL",
              };
              localStorage.setItem(tKey, JSON.stringify(list));
            } else if (!foundInAnyKey) {
              list.unshift({
                id: invoice.id || `inv-${Date.now()}`,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.amount,
                status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount,
                paymentMethod: methodLabel,
                paymentRef: refCode,
                customerName: custName,
                submittedAt: new Date().toISOString(),
                date: new Date().toISOString().split("T")[0],
                financeStatus: "PENDING_APPROVAL",
              });
              localStorage.setItem(tKey, JSON.stringify(list));
            }
          } catch (e) {}
        });

        // 3. Link & forward related Sales Deals to Finance Portal
        try {
          const dealsKeys = [...(custName ? [`crm_deals_${custName}`] : [])];
          dealsKeys.forEach((dKey) => {
            const rawDeals = localStorage.getItem(dKey);
            if (rawDeals) {
              const deals = JSON.parse(rawDeals);
              if (Array.isArray(deals)) {
                let dealsChanged = false;
                const updatedDeals = deals.map((d: any) => {
                  const matchesDeal = 
                    (d.invoiceId && (String(d.invoiceId) === String(invoice.id) || d.invoiceId === invoice.invoiceNumber)) ||
                    (d.invoiceNumber && d.invoiceNumber === invoice.invoiceNumber) ||
                    (invoice.invoiceNumber && d.quotationRef && invoice.invoiceNumber.includes(d.quotationRef)) ||
                    (d.customerName && d.customerName.toLowerCase() === custName.toLowerCase() && (d.workflowStatus === "ORDER_PLACED" || d.workflowStatus === "QUOTATION_GENERATED" || d.workflowStatus === "APPROVED"));
                  if (matchesDeal) {
                    dealsChanged = true;
                    return {
                      ...d,
                      workflowStatus: "PENDING_FINANCE_APPROVAL",
                      paymentSubmitted: true,
                      paymentMethod: methodLabel,
                      paymentRef: refCode,
                      invoiceNumber: invoice.invoiceNumber,
                      paidAmount: invoice.amount,
                    };
                  }
                  return d;
                });
                if (dealsChanged) {
                  localStorage.setItem(dKey, JSON.stringify(updatedDeals));
                }
              }
            }
          });
        } catch (e) {}

        // 3.5 Also synchronize order in customer-specific crm_orders_* with initial timeline history
        try {
          const orderKeys = [
            custName ? `crm_orders_${custName}` : "",
          ].filter(Boolean);
          const now = new Date();
          const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateNow = now.toISOString().split("T")[0];

          orderKeys.forEach((oKey) => {
            const list = JSON.parse(localStorage.getItem(oKey) || "[]");
            let found = false;
            const updated = list.map((o: any) => {
              const matchInv = o.invoiceRef === invoice.invoiceNumber;
              const matchNum = o.orderNumber === invoice.invoiceNumber || String(o.orderNumber).replace(/[^0-9]/g, "") === String(invoice.invoiceNumber).replace(/[^0-9]/g, "");
              if (matchInv || matchNum) {
                found = true;
                const hist = o.history || [];
                return {
                  ...o,
                  paymentStatus: "PENDING_FINANCE_APPROVAL",
                  paymentMethod: methodLabel,
                  paymentRef: refCode,
                  history: [
                    ...hist,
                    {
                      id: `hist-pay-${Date.now()}`,
                      title: `Payment Submitted via ${methodLabel}`,
                      description: `Payment of ETB ${invoice.amount.toLocaleString()} submitted (Ref: ${refCode}). Awaiting Finance Officer verification.`,
                      timestamp: timeNow,
                      date: dateNow,
                      status: "Payment Submitted",
                      actor: "Customer Portal",
                    },
                  ],
                };
              }
              return o;
            });

            if (!found) {
              const newOrder = {
                id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                orderNumber: `SO-${String(invoice.invoiceNumber).replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000)}`,
                invoiceRef: invoice.invoiceNumber,
                date: dateNow,
                deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                totalAmount: invoice.amount || 0,
                status: "Processing",
                paymentStatus: "PENDING_FINANCE_APPROVAL",
                paymentMethod: methodLabel,
                paymentRef: refCode,
                trackingStep: 1,
                items: `INSA Enterprise Solution (Invoice: ${invoice.invoiceNumber})`,
                trackingNumber: `INSA-DEL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                carrier: "INSA Central MMS Express Logistics",
                driverName: "Getachew Alemu",
                driverPhone: "+251 911 554433",
                deliveryAddress: "King George VI St, INSA Headquarters, Addis Ababa",
                receiverName: custName,
                receiverPhone: "+251 911 000000",
                history: [
                  {
                    id: `hist-1-${Date.now()}`,
                    title: "Order Placed & Registered",
                    description: `Procurement order registered for ${custName} at INSA Central MMS Logistics Hub.`,
                    timestamp: timeNow,
                    date: dateNow,
                    status: "Order Placed",
                    actor: "Customer Portal",
                  },
                  {
                    id: `hist-2-${Date.now()}`,
                    title: `Payment Submitted via ${methodLabel}`,
                    description: `Payment of ETB ${invoice.amount.toLocaleString()} submitted (Ref: ${refCode}). Sent to Finance Officer Portal for verification.`,
                    timestamp: timeNow,
                    date: dateNow,
                    status: "Payment Submitted",
                    actor: "Customer Portal",
                  },
                ],
              };
              updated.unshift(newOrder);
            }
            localStorage.setItem(oKey, JSON.stringify(updated));
          });
        } catch (e) {}

        // 4. Add high-priority notification for Finance Officer Portal
        try {
          const newFinanceNotif = {
            id: `notif-${Date.now()}`,
            title: "New Payment & Deal Settlement Request",
            message: `Customer ${custName} submitted a payment of ETB ${invoice.amount.toLocaleString()} for Invoice/Deal ${invoice.invoiceNumber} via ${methodLabel} (Ref: ${refCode}). Awaiting Finance Verification.`,
            invoiceNumber: invoice.invoiceNumber,
            customerName: custName,
            amount: invoice.amount,
            paymentMethod: methodLabel,
            paymentRef: refCode,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split("T")[0],
            read: false,
            status: "PENDING",
            type: "SETTLEMENT",
          };

          const existingNotifs = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
          localStorage.setItem("crm_finance_notifications", JSON.stringify([newFinanceNotif, ...existingNotifs]));
        } catch (e) {}

        // 5. Dispatch events so Finance Officer portal and Customer portal update in real-time
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("crm_invoice_updated", { detail: { invoiceNumber: invoice.invoiceNumber, status: "WAITING_FINANCE_APPROVAL", paid: 0, balance: invoice.amount } }));
        window.dispatchEvent(new CustomEvent("crm_invoice_submitted", { detail: { invoiceNumber: invoice.invoiceNumber, customerName: custName, amount: invoice.amount } }));
        window.dispatchEvent(new CustomEvent("crm_deal_submitted", { detail: { invoiceNumber: invoice.invoiceNumber, customerName: custName, amount: invoice.amount } }));
        window.dispatchEvent(new CustomEvent("crm_order_updated", { detail: { invoiceNumber: invoice.invoiceNumber } }));
      }

      setStep("DONE");
      
      // Call completion handler after short delay
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("[Payment] Error submitting payment:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to process payment";
      alert(`Payment Error: ${errorMsg}\n\nPlease try again or contact support.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getBankAccountInfo = () => {
    if (selectedMethod === "CBE") {
      return {
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountName: "INSA - Ethiopian Revenue Authority",
        accountNumber: "1000-2324785-00",
        branch: "Bole Branch, Addis Ababa",
      };
    } else if (selectedMethod === "AWASH") {
      return {
        bankName: "Awash International Bank",
        accountName: "INSA Enterprise Billing",
        accountNumber: "0011-2043-2626",
        branch: "Mesqel Square, Addis Ababa",
      };
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Select Payment Method</h2>
              <p className="text-sm text-blue-100 mt-1">
                Invoice: {invoice.invoiceNumber} • Amount: ETB {invoice.amount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "METHOD" ? "bg-white text-blue-600" : step === "DETAILS" || step === "REVIEW" || step === "DONE" ? "bg-blue-500 text-white" : "bg-white/20 text-white/60"}`}>
                1
              </div>
              <span className="text-xs font-semibold">Method</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/20 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "DETAILS" ? "bg-white text-blue-600" : step === "REVIEW" || step === "DONE" ? "bg-blue-500 text-white" : "bg-white/20 text-white/60"}`}>
                2
              </div>
              <span className="text-xs font-semibold">Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/20 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "REVIEW" ? "bg-white text-blue-600" : step === "DONE" ? "bg-blue-500 text-white" : "bg-white/20 text-white/60"}`}>
                3
              </div>
              <span className="text-xs font-semibold">Review</span>
            </div>
            <div className="flex-1 h-0.5 bg-white/20 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "DONE" ? "bg-white text-blue-600" : "bg-white/20 text-white/60"}`}>
                ✓
              </div>
              <span className="text-xs font-semibold">Done</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Payment Method Selection */}
          {step === "METHOD" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Choose Your Payment Method</h3>
                <p className="text-sm text-slate-600">Select how you want to settle this invoice</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CBE Bank Transfer */}
                <button
                  onClick={() => handleMethodSelect("CBE")}
                  className="group border-2 border-slate-200 hover:border-blue-500 rounded-xl p-6 text-left transition bg-gradient-to-br from-white to-slate-50 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">Commercial Bank of Ethiopia (CBE)</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Wire Transfer / RTGS</p>
                      <div className="mt-3 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold inline-block">
                        Most Common
                      </div>
                    </div>
                  </div>
                </button>

                {/* Telebirr Super App */}
                <button
                  onClick={() => handleMethodSelect("TELEBIRR")}
                  className="group border-2 border-slate-200 hover:border-green-500 rounded-xl p-6 text-left transition bg-gradient-to-br from-white to-slate-50 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-xl group-hover:bg-green-600 group-hover:text-white transition">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">Telebirr SuperApp</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Mobile Money Settlement</p>
                      <div className="mt-3 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold inline-block">
                        Instant
                      </div>
                    </div>
                  </div>
                </button>

                {/* Awash Bank */}
                <button
                  onClick={() => handleMethodSelect("AWASH")}
                  className="group border-2 border-slate-200 hover:border-yellow-500 rounded-xl p-6 text-left transition bg-gradient-to-br from-white to-slate-50 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl group-hover:bg-yellow-600 group-hover:text-white transition">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">Awash International Bank</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Bank Transfer</p>
                      <div className="mt-3 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold inline-block">
                        1-2 Hours
                      </div>
                    </div>
                  </div>
                </button>

                {/* Cash Payment */}
                <button
                  onClick={() => handleMethodSelect("CASH")}
                  className="group border-2 border-slate-200 hover:border-purple-500 rounded-xl p-6 text-left transition bg-gradient-to-br from-white to-slate-50 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">Cash Payment</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Pay in Person</p>
                      <div className="mt-3 bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold inline-block">
                        Visit Office
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details Form */}
          {step === "DETAILS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToMethods}
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Methods
                </button>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  {selectedMethod}
                </div>
              </div>

              {/* Bank Transfer Forms (CBE / Awash) */}
              {(selectedMethod === "CBE" || selectedMethod === "AWASH") && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Transfer To - INSA Beneficiary Account</h4>
                    {(() => {
                      const accountInfo = getBankAccountInfo();
                      return (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium">Bank:</span>
                            <span className="font-bold text-blue-900">{accountInfo?.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium">Account Name:</span>
                            <span className="font-bold text-blue-900">{accountInfo?.accountName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium">Account No:</span>
                            <span className="font-bold text-blue-900">{accountInfo?.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 font-medium">Branch:</span>
                            <span className="font-bold text-blue-900">{accountInfo?.branch}</span>
                          </div>
                          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                            <p className="text-xs text-yellow-800 font-semibold">
                              ⚠ Use Invoice ID <span className="font-black">{invoice.invoiceNumber}</span> as your payment description/reference
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Sender Account Name (Full name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abebe Kebede"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.senderAccountName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, senderAccountName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Sender Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1000-1234567-00"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.senderAccountNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, senderAccountNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Sender Bank Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bole Branch, Addis Ababa"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.senderBankBranch}
                      onChange={(e) => setPaymentForm({ ...paymentForm, senderBankBranch: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Transfer Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.transferDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transferDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Bank Reference / Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRN-352259801-00142"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Enter the reference number from your bank confirmation receipt
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Additional information about your transfer"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Telebirr Form */}
              {selectedMethod === "TELEBIRR" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-green-900 mb-2">Send or via Telebirr the INSA Business Account</h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">Business Name:</span>
                        <span className="font-bold text-green-900">INSA Enterprise Billing</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 font-medium">Account No:</span>
                        <span className="font-bold text-green-900">0011-2043-2626</span>
                      </div>
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-xs text-yellow-800 font-semibold">
                          ⚠ Use Invoice ID <span className="font-black">{invoice.invoiceNumber}</span> as your payment description/reference
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Sender Telebirr Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +251911234567"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      value={paymentForm.telebirrPhone}
                      onChange={(e) => setPaymentForm({ ...paymentForm, telebirrPhone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Telebirr Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TB2024091512345678"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      value={paymentForm.telebirrTransactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, telebirrTransactionId: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Check your Telebirr app transaction history for the ID
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Additional information"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Cash Payment Form */}
              {selectedMethod === "CASH" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <h4 className="font-bold text-purple-900 mb-2">Cash Payment Information</h4>
                    <p className="text-sm text-purple-700">
                      Visit our office at <strong>Wollo Sefer, Addis Ababa</strong> to make cash payment. 
                      Bring this invoice number: <strong>{invoice.invoiceNumber}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Cash Received By (Cashier Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tigist Alemayehu"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={paymentForm.cashReceivedBy}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cashReceivedBy: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Cash Receipt Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CR-2024-001234"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={paymentForm.cashReceiptNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cashReceiptNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={paymentForm.cashPaymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cashPaymentDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Additional information"
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleReview}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-bold transition"
              >
                Continue to Review
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === "REVIEW" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Review Payment Details</h3>
                <p className="text-sm text-slate-600">Please verify all information before submitting</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Payment Method:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Invoice Number:</span>
                  <span className="text-sm font-bold text-[#c8102e]">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Amount:</span>
                  <span className="text-lg font-black text-slate-900">ETB {invoice.amount.toLocaleString()}</span>
                </div>

                {(selectedMethod === "CBE" || selectedMethod === "AWASH") && (
                  <>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">TRANSFER DETAILS</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Sender Name:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.senderAccountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Sender Account:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.senderAccountNumber}</span>
                        </div>
                        {paymentForm.senderBankBranch && (
                          <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Branch:</span>
                            <span className="text-sm font-semibold text-slate-900">{paymentForm.senderBankBranch}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Transaction ID:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Date:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.transferDate}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === "TELEBIRR" && (
                  <>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">TELEBIRR DETAILS</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Phone Number:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.telebirrPhone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Transaction ID:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.telebirrTransactionId}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === "CASH" && (
                  <>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="text-xs font-bold text-slate-500 mb-2">CASH PAYMENT DETAILS</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Received By:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.cashReceivedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Receipt Number:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.cashReceiptNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Payment Date:</span>
                          <span className="text-sm font-semibold text-slate-900">{paymentForm.cashPaymentDate}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {paymentForm.notes && (
                  <div className="border-t border-slate-200 pt-3">
                    <div className="text-xs font-bold text-slate-500 mb-1">NOTES</div>
                    <p className="text-sm text-slate-700">{paymentForm.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("DETAILS")}
                  className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2 text-sm font-bold transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Payment
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "DONE" && (
            <div className="text-center py-12">
              <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Payment Submitted for Finance Approval!</h3>
              <p className="text-slate-600 mb-1">Your payment details have been transmitted to the Finance Officer Portal for verification.</p>
              <p className="text-sm text-slate-500">
                Invoice: <span className="font-bold text-[#c8102e]">{invoice.invoiceNumber}</span>
              </p>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  🎉 Finance will verify and mark your invoice as paid shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
