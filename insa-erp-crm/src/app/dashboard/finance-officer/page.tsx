"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import InsaLogo from "@/components/ui/InsaLogo";
import Link from "next/link";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  LogOut,
  RefreshCw,
  Building2,
  Eye,
  ArrowRight,
  Receipt,
  Package,
  Bell,
  X,
  Check,
} from "lucide-react";
import invoiceService from "@/services/invoiceService";
import paymentService from "@/services/paymentService";
import customerService from "@/services/customerService";
import orderService from "@/services/orderService";
import { dispatchCustomerNotification } from "@/utils/helpers/notificationHelper";

interface PendingItem {
  id: number | string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  type: "invoice" | "payment" | "deal";
  paymentMethod?: string;
  reference?: string;
  storageKey?: string;
}

interface FinanceNotification {
  id: string;
  title: string;
  message: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod?: string;
  paymentRef?: string;
  timestamp: string;
  date: string;
  read: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

const areArraysEqual = (a: any[], b: any[]) => {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export default function FinanceOfficerDashboard() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"approvals" | "invoices" | "payments" | "customers">("approvals");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingItem[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<FinanceNotification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState<{ item: PendingItem; notifId?: string } | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("Transaction reference could not be verified with bank.");

  // Auth Protection & Load Data
  useEffect(() => {
    if (!ready) return;

    let currentRole = (user?.role || "").toLowerCase();
    let currentUname = (user?.username || user?.name || "").toLowerCase();

    if (typeof window !== "undefined") {
      // Purge mock storage keys once on mount
      try {
        localStorage.removeItem("crm_invoices_Unknown Customer");
        localStorage.removeItem("crm_invoices_null");
        localStorage.removeItem("crm_invoices_undefined");
      } catch {}

      const activeUname = (localStorage.getItem("active_customer_username") || localStorage.getItem("active_customer") || "").toLowerCase();
      if (!currentUname && activeUname) {
        currentUname = activeUname;
      }
      try {
        const rawUser = localStorage.getItem("crm_user") || localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed.role) currentRole = parsed.role.toLowerCase();
          if (parsed.username || parsed.name) currentUname = (parsed.username || parsed.name).toLowerCase();
        }
      } catch {}
    }

    if (!user && !currentUname) {
      router.push("/login?from=/dashboard/finance-officer");
      return;
    }

    // Allow user melona and non-customer internal users into Finance Portal
    if ((currentRole.includes("customer") || currentRole.includes("client")) && !currentUname.includes("melona")) {
      router.push("/customer/dashboard");
      return;
    }

    loadFinanceData(true);
    loadNotifications();

    // Auto polling every 3 seconds for new customer settlement requests
    const interval = setInterval(() => {
      loadNotifications();
      loadFinanceData(false);
    }, 3000);

    const handleSync = () => {
      loadNotifications();
      loadFinanceData(false);
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("crm_invoice_submitted", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("crm_invoice_submitted", handleSync);
    };
  }, [ready, user, router]);

  const loadNotifications = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("crm_finance_notifications");
      const list: FinanceNotification[] = raw ? JSON.parse(raw) : [];
      setNotifications((prev) => (areArraysEqual(prev, list) ? prev : list));
    } catch (e) {}
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_finance_notifications", JSON.stringify(updated));
    }
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_finance_notifications", JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read && n.status !== "APPROVED").length;

  const loadFinanceData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      let invs: any[] = [];
      let pays: any[] = [];
      let custs: any[] = [];
      let ords: any[] = [];

      try {
        const [invData, payData, custData, orderData] = await Promise.all([
          invoiceService.getAllInvoices(),
          paymentService.getAllPayments(),
          customerService.getAllCustomers(),
          orderService.getAllOrders(),
        ]);
        invs = Array.isArray(invData) ? invData : (invData as any)?.content || [];
        pays = Array.isArray(payData) ? payData : (payData as any)?.content || [];
        custs = Array.isArray(custData) ? custData : (custData as any)?.content || [];
        ords = Array.isArray(orderData) ? orderData : (orderData as any)?.content || [];
      } catch (e) {}

      setInvoices((prev) => (areArraysEqual(prev, invs) ? prev : invs));
      setPayments((prev) => (areArraysEqual(prev, pays) ? prev : pays));
      setCustomers((prev) => (areArraysEqual(prev, custs) ? prev : custs));
      setOrders((prev) => (areArraysEqual(prev, ords) ? prev : ords));

      // Collect pending approvals from DB and localStorage
      const pendingMap = new Map<string, PendingItem>();

      // 1. From DB
      invs.forEach((inv: any) => {
        const st = String(inv.status || "").toUpperCase();
        if (st === "REJECTED" || st === "PAID" || st === "SETTLED") return;
        if (st === "PENDING_APPROVAL" || st === "PENDING_FINANCE_APPROVAL" || st === "PENDING" || st === "WAITING_FINANCE_APPROVAL") {
          const key = `invoice-${inv.id || inv.invoiceNumber}`;
          pendingMap.set(key, {
            id: inv.id,
            number: inv.invoiceNumber || `INV-${inv.id}`,
            customer: inv.customerName || inv.customerOrg || inv.organizationName || "Ministry of Finance",
            amount: Number(inv.totalAmount || inv.amount || 0),
            date: inv.invoiceDate || inv.createdAt || new Date().toISOString().split("T")[0],
            type: "invoice",
          });
        }
      });
      pays.forEach((pay: any) => {
        const st = String(pay.status || "").toUpperCase();
        if (st === "REJECTED" || st === "PAID" || st === "COMPLETED") return;
        if (st === "PENDING_APPROVAL" || st === "PENDING") {
          const key = `payment-${pay.id || pay.paymentCode}`;
          pendingMap.set(key, {
            id: pay.id,
            number: pay.paymentCode || `PAY-${pay.id}`,
            customer: pay.customerName || pay.customerOrg || pay.organizationName || "Ministry of Finance",
            amount: Number(pay.amount || 0),
            date: pay.paymentDate || pay.createdAt || new Date().toISOString().split("T")[0],
            type: "payment",
            paymentMethod: pay.paymentMethod,
            reference: pay.transactionReference,
          });
        }
      });

      // 2. From localStorage (Customer Portal Invoices) - Filter out mock & unknown accounts
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage);
        keys.forEach((lKey) => {
          if (lKey && lKey.startsWith("crm_invoices_")) {
            const rawKeyName = lKey.replace("crm_invoices_", "").trim();
            if (
              !rawKeyName ||
              rawKeyName === "Unknown Customer" ||
              rawKeyName.toLowerCase().includes("unknown") ||
              rawKeyName === "null" ||
              rawKeyName === "undefined"
            ) {
              return;
            }

            try {
              const custInvs = JSON.parse(localStorage.getItem(lKey) || "[]");
              if (Array.isArray(custInvs)) {
                custInvs.forEach((inv: any) => {
                  const custName = (inv.customerName || inv.customerOrg || rawKeyName).trim();
                  if (
                    !custName ||
                    custName === "Unknown Customer" ||
                    custName.toLowerCase().includes("unknown")
                  ) {
                    return; // Skip mock invoices
                  }

                  const st = String(inv.status || "").toUpperCase();
                  const fst = String(inv.financeStatus || "").toUpperCase();
                  if (st === "REJECTED" || fst === "REJECTED" || st === "PAID" || st === "SETTLED") {
                    return;
                  }

                  const isPending =
                    st === "WAITING_FINANCE_APPROVAL" ||
                    st === "PENDING_FINANCE_APPROVAL" ||
                    st === "PENDING_APPROVAL" ||
                    st === "PENDING" ||
                    st === "CONFIRMED" ||
                    st === "AWAITING_FINANCE_APPROVAL" ||
                    st === "WAITING_FOR_APPROVAL" ||
                    fst === "PENDING_APPROVAL" ||
                    fst === "PENDING" ||
                    (Boolean(inv.paymentSubmitted) && st !== "PAID" && st !== "REJECTED");

                  if (isPending) {
                    const mapKey = `invoice-${inv.invoiceNumber || inv.id}`;
                    pendingMap.set(mapKey, {
                      id: inv.id || inv.invoiceNumber,
                      number: inv.invoiceNumber,
                      customer: custName,
                      amount: Number(inv.amount || 0),
                      date: inv.date || new Date().toISOString().split("T")[0],
                      type: "invoice",
                      paymentMethod: inv.paymentMethod || "Telebirr",
                      reference: inv.paymentRef || inv.transactionRef || "TLB-SETTLE",
                      storageKey: lKey,
                    });
                  }
                });
              }
            } catch (err) {}
          }
        });

        // 3. From localStorage (crm_payments_global)
        try {
          const rawPays = localStorage.getItem("crm_payments_global");
          if (rawPays) {
            const list = JSON.parse(rawPays);
            if (Array.isArray(list)) {
              list.forEach((pay: any) => {
                const st = String(pay.status || "").toUpperCase();
                if (st === "REJECTED" || st === "PAID" || st === "COMPLETED") return;
                if (st === "PENDING_APPROVAL" || st === "PENDING" || st === "CONFIRMED") {
                  const mapKey = `payment-${pay.id || pay.transactionReference || pay.invoiceNumber}`;
                  if (!pendingMap.has(mapKey)) {
                    pendingMap.set(mapKey, {
                      id: pay.id,
                      number: pay.invoiceNumber || pay.transactionReference || `PAY-${pay.id}`,
                      customer: pay.customerName || "Ministry of Finance",
                      amount: Number(pay.amount || 0),
                      date: pay.paymentDate || pay.submittedAt || new Date().toISOString().split("T")[0],
                      type: pay.invoiceNumber ? "invoice" : "payment",
                      paymentMethod: pay.paymentMethod || "Bank Transfer",
                      reference: pay.transactionReference || pay.transactionId,
                    });
                  }
                }
              });
            }
          }
        } catch (e) {}

        // 4. From localStorage (crm_deals_global) - Forwarded deals awaiting finance approval
        try {
          const rawDeals = localStorage.getItem("crm_deals_global");
          if (rawDeals) {
            const list = JSON.parse(rawDeals);
            if (Array.isArray(list)) {
              list.forEach((deal: any) => {
                const st = String(deal.workflowStatus || "").toUpperCase();
                if (
                  st === "PENDING_FINANCE_APPROVAL" ||
                  st === "PENDING_APPROVAL" ||
                  st === "ORDER_PLACED" ||
                  st === "PAYMENT_SUBMITTED"
                ) {
                  const mapKey = `deal-${deal.id || deal.dealCode}`;
                  if (!pendingMap.has(mapKey)) {
                    pendingMap.set(mapKey, {
                      id: deal.id || deal.dealCode,
                      number: deal.dealCode || `DEAL-${deal.id}`,
                      customer: deal.customerName || deal.customer || "Ministry of Finance",
                      amount: Number(deal.amount || 0),
                      date: deal.expectedCloseDate || deal.date || new Date().toISOString().split("T")[0],
                      type: "deal",
                      reference: deal.productName || deal.title || "Enterprise Deal",
                      paymentMethod: deal.paymentMethod || "Bank Transfer",
                    });
                  }
                }
              });
            }
          }
        } catch (e) {}
      }

      const nextApprovals = Array.from(pendingMap.values());
      setPendingApprovals((prev) => (areArraysEqual(prev, nextApprovals) ? prev : nextApprovals));
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleApprove = async (item: PendingItem, specificNotifId?: string) => {
    try {
      if (item.type === "deal") {
        // Approve deal across crm_deals_global and customer deal storage
        try {
          const rawDeals = localStorage.getItem("crm_deals_global");
          if (rawDeals) {
            const deals = JSON.parse(rawDeals);
            if (Array.isArray(deals)) {
              const updatedDeals = deals.map((d: any) => {
                if (
                  String(d.dealCode || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
                  (d.id && item.id && String(d.id).trim() === String(item.id).trim())
                ) {
                  return {
                    ...d,
                    workflowStatus: "APPROVED",
                    financeApproved: true,
                    stage: "Approved by Finance",
                    approvedAt: new Date().toISOString(),
                  };
                }
                return d;
              });
              localStorage.setItem("crm_deals_global", JSON.stringify(updatedDeals));
            }
          }

          // Also update customer deals
          const custKey = `crm_deals_${item.customer}`;
          const rawCustDeals = localStorage.getItem(custKey);
          if (rawCustDeals) {
            const custDeals = JSON.parse(rawCustDeals);
            if (Array.isArray(custDeals)) {
              const updatedCustDeals = custDeals.map((d: any) => {
                if (
                  String(d.dealCode || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
                  (d.id && item.id && String(d.id).trim() === String(item.id).trim())
                ) {
                  return {
                    ...d,
                    workflowStatus: "APPROVED",
                    financeApproved: true,
                    stage: "Approved by Finance",
                    approvedAt: new Date().toISOString(),
                  };
                }
                return d;
              });
              localStorage.setItem(custKey, JSON.stringify(updatedCustDeals));
            }
          }

          // Customer notification
          dispatchCustomerNotification({
            id: `cust-notif-${Date.now()}`,
            title: "Sales Deal Approved by Finance",
            message: `Your Sales Deal ${item.number} has been reviewed and APPROVED by Finance! Status is now Approved.`,
            dealCode: item.number,
            amount: item.amount,
            type: "SUCCESS",
            customerName: item.customer,
            customerOrg: item.customer,
          });

          // Finance notification mark approved
          const finNotifs: FinanceNotification[] = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
          const updatedFinNotifs = finNotifs.map((n) => {
            if (n.invoiceNumber === item.number || (n as any).dealCode === item.number || n.id === specificNotifId) {
              return { ...n, read: true, status: "APPROVED" as const };
            }
            return n;
          });
          localStorage.setItem("crm_finance_notifications", JSON.stringify(updatedFinNotifs));
          setNotifications(updatedFinNotifs);

          // Automatically synchronize & record Paid Order in My Orders for approved deal
          try {
            const targetCust = item.customer || "";
            const orderKeys = [
              targetCust ? `crm_orders_${targetCust}` : "",
            ].filter(Boolean);

            const now = new Date();
            const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const dateNow = now.toISOString().split("T")[0];

            orderKeys.forEach((oKey) => {
              const currentOrders = JSON.parse(localStorage.getItem(oKey) || "[]");
              let orderFound = false;

              const updatedOrders = currentOrders.map((o: any) => {
                const matchInv = o.invoiceRef === item.number;
                const matchNum = o.orderNumber === item.number || String(o.orderNumber).includes(String(item.number).replace(/[^0-9]/g, ""));

                if (matchInv || matchNum) {
                  orderFound = true;
                  const currentHist = o.history || [];
                  return {
                    ...o,
                    status: "Confirmed",
                    paymentStatus: "PAID",
                    paidAt: dateNow,
                    trackingStep: Math.max(o.trackingStep || 1, 2),
                    history: [
                      ...currentHist,
                      {
                        id: `hist-deal-fin-${Date.now()}`,
                        title: "Sales Deal Payment Cleared by Finance",
                        description: `Deal ${item.number} (ETB ${(item.amount || 0).toLocaleString()}) approved and released for delivery dispatch.`,
                        timestamp: timeNow,
                        date: dateNow,
                        status: "Paid",
                        actor: "Finance Officer (FMS)",
                      },
                    ],
                  };
                }
                return o;
              });

              if (!orderFound) {
                const newPaidOrder = {
                  id: `order-deal-${Date.now()}`,
                  orderNumber: `SO-${String(item.number).replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000)}`,
                  invoiceRef: item.number,
                  date: item.date || dateNow,
                  deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                  totalAmount: item.amount || 0,
                  status: "Confirmed",
                  paymentStatus: "PAID",
                  paidAt: dateNow,
                  trackingStep: 2,
                  items: `Enterprise Security Deployment (Deal: ${item.number})`,
                  trackingNumber: `INSA-DEL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  carrier: "INSA Central MMS Express Logistics",
                  driverName: "Getachew Alemu",
                  driverPhone: "+251 911 554433",
                  deliveryAddress: "King George VI St, INSA Headquarters, Addis Ababa",
                  receiverName: targetCust,
                  receiverPhone: "+251 911 000000",
                  history: [
                    {
                      id: `hist-deal-1-${Date.now()}`,
                      title: "Deal Registered & Procurement Confirmed",
                      description: `Enterprise deal registered for ${targetCust}.`,
                      timestamp: "09:00 AM",
                      date: dateNow,
                      status: "Order Placed",
                      actor: "Customer Portal",
                    },
                    {
                      id: `hist-deal-2-${Date.now()}`,
                      title: "Finance Verification & Deal Authorization",
                      description: `Finance Officer verified transaction of ETB ${(item.amount || 0).toLocaleString()} for Deal ${item.number}. Order confirmed and authorized for fulfillment.`,
                      timestamp: timeNow,
                      date: dateNow,
                      status: "Paid",
                      actor: "Finance Officer (FMS)",
                    },
                  ],
                };
                updatedOrders.unshift(newPaidOrder);
              }

              localStorage.setItem(oKey, JSON.stringify(updatedOrders));
            });
          } catch (e) {}

          setActionNotice({
            text: `✅ Sales Deal ${item.number} APPROVED by Finance! Customer portal updated in real-time.`,
            type: "success",
          });

          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("crm_deal_approved", { detail: { dealCode: item.number, customer: item.customer } }));
          window.dispatchEvent(new CustomEvent("crm_order_updated", { detail: { number: item.number } }));
          setTimeout(() => loadFinanceData(), 200);
          return;
        } catch (e) {
          console.error("Error approving deal:", e);
        }
      }

      if (item.type === "invoice") {
        // Try DB update
        try {
          const dbInv = invoices.find(
            (inv) =>
              String(inv.invoiceNumber || "").trim().toUpperCase() ===
                String(item.number || item.id).trim().toUpperCase() ||
              (inv.id && item.id && String(inv.id).trim() === String(item.id).trim())
          );
          const idToCall = dbInv && dbInv.id ? Number(dbInv.id) : !isNaN(Number(item.id)) ? Number(item.id) : null;
          if (idToCall) {
            try {
              await invoiceService.markAsPaid(idToCall);
            } catch {
              try {
                await invoiceService.approveInvoice(idToCall);
                await invoiceService.confirmPayment(idToCall);
                await invoiceService.markAsPaid(idToCall);
              } catch {}
            }
          }
        } catch (e) {}

        // Update localStorage keys for Customer Portal
        if (typeof window !== "undefined") {
          let foundAny = false;
          const invoiceKeys = Object.keys(localStorage).filter((k) => k.startsWith("crm_invoices_"));

          invoiceKeys.forEach((lKey) => {
            try {
              const list = JSON.parse(localStorage.getItem(lKey) || "[]");
              if (Array.isArray(list)) {
                let keyChanged = false;
                const updated = list.map((inv: any) => {
                  const matchNum =
                    String(inv.invoiceNumber || "").trim().toUpperCase() ===
                    String(item.number || "").trim().toUpperCase();
                  const matchId = inv.id && item.id && String(inv.id).trim() === String(item.id).trim();

                  if (matchNum || matchId) {
                    keyChanged = true;
                    foundAny = true;
                    return {
                      ...inv,
                      status: "PAID",
                      paid: Number(inv.amount || item.amount || 0),
                      balance: 0,
                      financeApproved: true,
                      approvedAt: new Date().toISOString(),
                      paymentMethod: item.paymentMethod || inv.paymentMethod || "CBE Bank Transfer",
                      paymentRef: item.reference || inv.paymentRef || "APPROVED",
                    };
                  }
                  return inv;
                });

                if (keyChanged) {
                  localStorage.setItem(lKey, JSON.stringify(updated));
                }
              }
            } catch (e) {}
          });

          // If not found in any existing key, create/prepend it in the customer's key
          const targetCust = item.customer || "Enterprise Client";
          const targetKey = `crm_invoices_${targetCust}`;
          try {
            const list = JSON.parse(localStorage.getItem(targetKey) || "[]");
            if (!foundAny) {
              const newPaidInv = {
                id: item.id || `inv-${Date.now()}`,
                invoiceNumber: item.number,
                customerName: targetCust,
                amount: item.amount,
                paid: item.amount,
                balance: 0,
                status: "PAID",
                date: item.date || new Date().toISOString().split("T")[0],
                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
                paymentMethod: item.paymentMethod || "CBE Bank Transfer",
                paymentRef: item.reference || "APPROVED",
                financeApproved: true,
                approvedAt: new Date().toISOString(),
              };
              localStorage.setItem(targetKey, JSON.stringify([newPaidInv, ...list]));
            }
          } catch (e) {}

          // Also update crm_invoices_Ministry of Finance and active customer keys
          const activeCust = localStorage.getItem("active_customer") || localStorage.getItem("active_customer_username");
          if (activeCust && activeCust !== targetCust) {
            const activeKey = `crm_invoices_${activeCust}`;
            try {
              const aList = JSON.parse(localStorage.getItem(activeKey) || "[]");
              const aUpdated = aList.map((inv: any) =>
                String(inv.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase()
                  ? { ...inv, status: "PAID", paid: inv.amount || item.amount, balance: 0, financeApproved: true }
                  : inv
              );
              localStorage.setItem(activeKey, JSON.stringify(aUpdated));
            } catch {}
          }

          // Send confirmation notification to Customer Portal
          try {
            dispatchCustomerNotification({
              id: `cust-notif-${Date.now()}`,
              title: "Payment Approved by Finance",
              message: `Your payment of ETB ${(item.amount || 0).toLocaleString()} for Invoice ${item.number} has been verified and APPROVED by Finance. Invoice status is now PAID!`,
              invoiceNumber: item.number,
              amount: item.amount,
              type: "SUCCESS",
              customerName: item.customer,
              customerOrg: item.customer,
            });
          } catch (e) {}

          // Mark notification in finance notifications list as APPROVED & READ
          try {
            const finNotifs: FinanceNotification[] = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
            const updatedFinNotifs = finNotifs.map((n) => {
              const matchNum =
                String(n.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase();
              const matchId = specificNotifId ? n.id === specificNotifId : n.id === item.id;
              if (matchNum || matchId) {
                return { ...n, read: true, status: "APPROVED" as const };
              }
              return n;
            });
            localStorage.setItem("crm_finance_notifications", JSON.stringify(updatedFinNotifs));
            setNotifications(updatedFinNotifs);
          } catch (e) {}

          // Also update crm_invoices_global
          try {
            const globalInvs = JSON.parse(localStorage.getItem("crm_invoices_global") || "[]");
            const gUpdated = globalInvs.map((inv: any) =>
              String(inv.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
              (inv.id && item.id && String(inv.id).trim() === String(item.id).trim())
                ? {
                    ...inv,
                    status: "PAID",
                    paid: Number(inv.amount || item.amount || 0),
                    balance: 0,
                    financeApproved: true,
                    approvedAt: new Date().toISOString(),
                    approvedBy: user?.username || "Finance Officer",
                  }
                : inv
            );
            localStorage.setItem("crm_invoices_global", JSON.stringify(gUpdated));
          } catch (e) {}

          // Also update crm_payments_global
          try {
            const pays = JSON.parse(localStorage.getItem("crm_payments_global") || "[]");
            const pUpdated = pays.map((p: any) =>
              String(p.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
              String(p.id) === String(item.id)
                ? {
                    ...p,
                    status: "COMPLETED",
                    approvedBy: user?.username || "Finance Officer",
                    approvedAt: new Date().toISOString(),
                  }
                : p
            );
            localStorage.setItem("crm_payments_global", JSON.stringify(pUpdated));
          } catch (e) {}

          // Record permanent approval log in Finance Portal
          try {
            const histLog = {
              id: `hist-fin-${Date.now()}`,
              number: item.number,
              customer: item.customer,
              amount: item.amount,
              paymentMethod: item.paymentMethod || "Bank Transfer",
              reference: item.reference || "APPROVED",
              action: "APPROVED",
              status: "PAID",
              timestamp: new Date().toISOString(),
              date: new Date().toISOString().split("T")[0],
              approvedBy: user?.username || "Finance Officer",
            };
            const existingHist = JSON.parse(localStorage.getItem("crm_finance_history_logs") || "[]");
            localStorage.setItem("crm_finance_history_logs", JSON.stringify([histLog, ...existingHist]));
          } catch (e) {}

          // Also update related deal in crm_deals_global if present
          try {
            const rawDeals = localStorage.getItem("crm_deals_global");
            if (rawDeals) {
              const deals = JSON.parse(rawDeals);
              if (Array.isArray(deals)) {
                const updatedDeals = deals.map((d: any) => {
                  if (
                    d.invoiceNumber === item.number ||
                    (d.customerName && d.customerName.toLowerCase() === item.customer.toLowerCase() && d.workflowStatus === "PENDING_FINANCE_APPROVAL")
                  ) {
                    return { ...d, workflowStatus: "CLOSED_WON", stage: "Closed Won", financeApproved: true };
                  }
                  return d;
                });
                localStorage.setItem("crm_deals_global", JSON.stringify(updatedDeals));
              }
            }
          } catch (e) {}

          // Automatically synchronize & record Paid Order in My Orders with complete timeline history
          try {
            const orderKeys = [
              targetCust ? `crm_orders_${targetCust}` : "",
            ].filter(Boolean);

            const now = new Date();
            const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const dateNow = now.toISOString().split("T")[0];

            orderKeys.forEach((oKey) => {
              const currentOrders = JSON.parse(localStorage.getItem(oKey) || "[]");
              let orderFound = false;

              const updatedOrders = currentOrders.map((o: any) => {
                const matchInv = o.invoiceRef === item.number;
                const matchNum = o.orderNumber === item.number || String(o.orderNumber).replace(/[^0-9]/g, "") === String(item.number).replace(/[^0-9]/g, "");

                if (matchInv || matchNum) {
                  orderFound = true;
                  const currentHist = o.history || [];
                  return {
                    ...o,
                    status: o.status === "Pending Approval" ? "Confirmed" : o.status,
                    paymentStatus: "PAID",
                    paidAt: dateNow,
                    trackingStep: Math.max(o.trackingStep || 1, 2),
                    history: [
                      ...currentHist,
                      {
                        id: `hist-fin-${Date.now()}`,
                        title: "Payment Approved & Verified by Finance",
                        description: `Finance Officer verified transaction of ETB ${(item.amount || 0).toLocaleString()} for Invoice ${item.number}. Order confirmed for warehouse preparation and logistics dispatch.`,
                        timestamp: timeNow,
                        date: dateNow,
                        status: "Paid",
                        actor: "Finance Officer (FMS)",
                      },
                    ],
                  };
                }
                return o;
              });

              if (!orderFound) {
                const newPaidOrder = {
                  id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  orderNumber: `SO-${String(item.number).replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000)}`,
                  invoiceRef: item.number,
                  date: item.date || dateNow,
                  deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                  totalAmount: item.amount || 0,
                  status: "Confirmed",
                  paymentStatus: "PAID",
                  paidAt: dateNow,
                  trackingStep: 2,
                  items: `INSA Enterprise Security & Hardware (Invoice: ${item.number})`,
                  trackingNumber: `INSA-DEL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  carrier: "INSA Central MMS Express Logistics",
                  driverName: "Getachew Alemu",
                  driverPhone: "+251 911 554433",
                  deliveryAddress: "King George VI St, INSA Headquarters, Addis Ababa",
                  receiverName: targetCust,
                  receiverPhone: "+251 911 000000",
                  history: [
                    {
                      id: `hist-1-${Date.now()}`,
                      title: "Order Placed & Registered",
                      description: `Procurement order registered for ${targetCust} at INSA Central MMS Logistics Hub.`,
                      timestamp: "09:00 AM",
                      date: item.date || dateNow,
                      status: "Order Placed",
                      actor: "Customer Portal",
                    },
                    {
                      id: `hist-2-${Date.now()}`,
                      title: "Payment Submitted via Settle Invoice",
                      description: `Payment submitted for Invoice ${item.number} via ${item.paymentMethod || "Bank Transfer"} (Ref: ${item.reference || "TXN-PAID"}).`,
                      timestamp: "10:15 AM",
                      date: item.date || dateNow,
                      status: "Payment Submitted",
                      actor: "Customer Settlement",
                    },
                    {
                      id: `hist-3-${Date.now()}`,
                      title: "Payment Approved & Verified by Finance",
                      description: `Finance Officer verified transaction of ETB ${(item.amount || 0).toLocaleString()}. Invoice ${item.number} marked as PAID. Order authorized for fulfillment.`,
                      timestamp: timeNow,
                      date: dateNow,
                      status: "Finance Approved",
                      actor: "Finance Officer (FMS)",
                    },
                    {
                      id: `hist-4-${Date.now()}`,
                      title: "Warehouse Consignment Prepared",
                      description: "Hardware items allocated and packed into tamper-evident transit containers at INSA Central MMS Logistics Hub.",
                      timestamp: "02:00 PM",
                      date: dateNow,
                      status: "Processing",
                      actor: "INSA Central MMS Hub",
                    },
                  ],
                };
                updatedOrders.unshift(newPaidOrder);
              }

              localStorage.setItem(oKey, JSON.stringify(updatedOrders));
            });
          } catch (e) {}

          // Broadcast to customer portal immediately
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(
            new CustomEvent("crm_invoice_paid", {
              detail: {
                number: item.number,
                invoiceNumber: item.number,
                amount: item.amount,
                customer: item.customer,
              },
            })
          );
          window.dispatchEvent(
            new CustomEvent("crm_invoice_updated", {
              detail: {
                number: item.number,
                invoiceNumber: item.number,
                status: "PAID",
              },
            })
          );
          window.dispatchEvent(
            new CustomEvent("crm_order_updated", {
              detail: {
                number: item.number,
                invoiceNumber: item.number,
                status: "PAID",
              },
            })
          );
        }

        setInvoices((prev) =>
          prev.map((inv) =>
            String(inv.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
            String(inv.id) === String(item.id)
              ? { ...inv, status: "PAID" }
              : inv
          )
        );
      } else {
        try {
          if (item.id && !isNaN(Number(item.id))) {
            await paymentService.updatePayment(Number(item.id), { status: "COMPLETED" } as any);
          }
        } catch (e) {}
        setPayments((prev) =>
          prev.map((pay) => (pay.id === item.id ? { ...pay, status: "COMPLETED" } : pay))
        );
      }

      setPendingApprovals((prev) =>
        Array.isArray(prev)
          ? prev.filter(
              (p) =>
                String(p.number || "").trim().toUpperCase() !== String(item.number || "").trim().toUpperCase() &&
                p.id !== item.id
            )
          : []
      );
      setActionNotice({
        text: `✅ Invoice ${item.number} APPROVED by Finance. Status updated to PAID across all customer and officer portals!`,
        type: "success",
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      setActionNotice({ text: "Failed to approve", type: "error" });
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleApproveFromNotification = async (notif: FinanceNotification) => {
    // Immediate optimistic update of notification drawer status so user sees instant feedback!
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, status: "APPROVED", read: true } : n))
    );

    const foundItem = pendingApprovals.find(
      (p) =>
        String(p.number || "").trim().toUpperCase() === String(notif.invoiceNumber || "").trim().toUpperCase() ||
        String(p.id) === String(notif.invoiceNumber)
    );

    if (foundItem) {
      await handleApprove(foundItem, notif.id);
    } else {
      await handleApprove(
        {
          id: notif.invoiceNumber,
          number: notif.invoiceNumber,
          customer: notif.customerName,
          amount: notif.amount,
          date: notif.date || new Date().toISOString().split("T")[0],
          type: "invoice",
          paymentMethod: notif.paymentMethod,
          reference: notif.paymentRef,
        },
        notif.id
      );
    }
  };

  const openRejectModal = (item: PendingItem, notifId?: string) => {
    setRejectingItem({ item, notifId });
    setRejectReasonInput("Transaction reference could not be verified with bank.");
  };

  const handleRejectFromNotification = (notif: FinanceNotification) => {
    const foundItem = pendingApprovals.find(
      (p) =>
        String(p.number || "").trim().toUpperCase() === String(notif.invoiceNumber || "").trim().toUpperCase() ||
        String(p.id) === String(notif.invoiceNumber)
    );

    const itemToReject: PendingItem = foundItem || {
      id: notif.invoiceNumber,
      number: notif.invoiceNumber,
      customer: notif.customerName,
      amount: notif.amount,
      date: notif.date || new Date().toISOString().split("T")[0],
      type: "invoice",
      paymentMethod: notif.paymentMethod,
      reference: notif.paymentRef,
    };

    openRejectModal(itemToReject, notif.id);
  };

  const executeReject = async (item: PendingItem, specificNotifId?: string, explicitReason?: string) => {
    try {
      const reason = (explicitReason || rejectReasonInput || "Transaction reference could not be verified with bank.").trim();

      // 1. Optimistic notification state update
      setNotifications((prev) =>
        prev.map((n) => {
          const matchNum = String(n.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase();
          const matchId = specificNotifId ? n.id === specificNotifId : n.id === item.id;
          if (matchNum || matchId) {
            return { ...n, status: "REJECTED" as const, read: true, rejectionReason: reason };
          }
          return n;
        })
      );

      // 2. If it's a deal
      if (item.type === "deal") {
        if (typeof window !== "undefined") {
          try {
            const salesDealService = (await import("@/services/salesDealService")).default;
            salesDealService.syncDealStatusToAllStorages(item.number, "REJECTED", { rejectionReason: reason });
          } catch (e) {}
        }
      } else {
        // Invoice or payment
        if (item.id && !isNaN(Number(item.id))) {
          if (item.type === "invoice") {
            try {
              await invoiceService.rejectInvoice(Number(item.id), reason);
            } catch {}
            try {
              await invoiceService.updateInvoice(Number(item.id), { status: "REJECTED" });
            } catch {}
          } else if (item.type === "payment") {
            try {
              await paymentService.updatePayment(Number(item.id), { status: "REJECTED" } as any);
            } catch {}
          }
        }

        if (typeof window !== "undefined") {
          // Update all crm_invoices_* in localStorage for Customer Portal
          const invoiceKeys = Object.keys(localStorage).filter((k) => k.startsWith("crm_invoices_"));
          invoiceKeys.forEach((lKey) => {
            try {
              const list = JSON.parse(localStorage.getItem(lKey) || "[]");
              if (Array.isArray(list)) {
                let changed = false;
                const updated = list.map((inv: any) => {
                  const matchNum =
                    String(inv.invoiceNumber || "").trim().toUpperCase() ===
                    String(item.number || "").trim().toUpperCase();
                  const matchId = inv.id && item.id && String(inv.id).trim() === String(item.id).trim();
                  const matchRef = inv.paymentRef && item.reference && String(inv.paymentRef).trim() === String(item.reference).trim();
                  if (matchNum || matchId || matchRef) {
                    changed = true;
                    return {
                      ...inv,
                      status: "REJECTED",
                      rejectionReason: reason,
                      financeStatus: "REJECTED",
                      paymentSubmitted: false,
                      rejectedAt: new Date().toISOString(),
                    };
                  }
                  return inv;
                });
                if (changed) {
                  localStorage.setItem(lKey, JSON.stringify(updated));
                }
              }
            } catch (e) {}
          });

          // Update crm_invoices_global
          try {
            const globalInvs = JSON.parse(localStorage.getItem("crm_invoices_global") || "[]");
            const gUpdated = globalInvs.map((inv: any) =>
              String(inv.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
              (inv.id && item.id && String(inv.id).trim() === String(item.id).trim())
                ? {
                    ...inv,
                    status: "REJECTED",
                    rejectionReason: reason,
                    financeStatus: "REJECTED",
                    paymentSubmitted: false,
                    rejectedAt: new Date().toISOString(),
                  }
                : inv
            );
            localStorage.setItem("crm_invoices_global", JSON.stringify(gUpdated));
          } catch (e) {}

          // Update crm_payments_global
          try {
            const pays = JSON.parse(localStorage.getItem("crm_payments_global") || "[]");
            const pUpdated = pays.map((p: any) =>
              String(p.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
              String(p.id) === String(item.id) ||
              (p.transactionReference && item.reference && String(p.transactionReference) === String(item.reference))
                ? { ...p, status: "REJECTED", rejectionReason: reason }
                : p
            );
            localStorage.setItem("crm_payments_global", JSON.stringify(pUpdated));
          } catch (e) {}

          // Dispatch notification to Customer Portal
          try {
            dispatchCustomerNotification({
              id: `cust-notif-rej-${Date.now()}`,
              title: "Payment Rejected by Finance Officer",
              message: `Your payment of ETB ${(item.amount || 0).toLocaleString()} for Invoice ${item.number} was rejected. Reason: ${reason}. Please click "Re-Settle Invoice" in your Invoices tab to submit corrected payment details.`,
              invoiceNumber: item.number,
              amount: item.amount,
              type: "ERROR",
              customerName: item.customer,
              customerOrg: item.customer,
            });
          } catch (e) {}

          // Update crm_finance_notifications in localStorage
          try {
            const finNotifs = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
            const updatedFin = finNotifs.map((n: any) => {
              const matchNum = String(n.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase();
              const matchId = specificNotifId ? n.id === specificNotifId : n.id === item.id;
              if (matchNum || matchId) {
                return { ...n, read: true, status: "REJECTED", rejectionReason: reason };
              }
              return n;
            });
            localStorage.setItem("crm_finance_notifications", JSON.stringify(updatedFin));
          } catch (e) {}

          // Save permanent rejection audit log in Finance Portal
          try {
            const histLog = {
              id: `hist-fin-${Date.now()}`,
              number: item.number,
              customer: item.customer,
              amount: item.amount,
              paymentMethod: item.paymentMethod,
              reference: item.reference,
              action: "REJECTED",
              status: "REJECTED",
              reason: reason,
              timestamp: new Date().toISOString(),
              date: new Date().toISOString().split("T")[0],
              rejectedBy: user?.username || "Finance Officer",
            };
            const existingHist = JSON.parse(localStorage.getItem("crm_finance_history_logs") || "[]");
            localStorage.setItem("crm_finance_history_logs", JSON.stringify([histLog, ...existingHist]));
          } catch (e) {}

          // Broadcast events for real-time customer portal update
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(
            new CustomEvent("crm_invoice_rejected", {
              detail: { invoiceNumber: item.number, number: item.number, reason, customer: item.customer },
            })
          );
          window.dispatchEvent(
            new CustomEvent("crm_invoice_updated", {
              detail: { invoiceNumber: item.number, status: "REJECTED", reason },
            })
          );
          window.dispatchEvent(new CustomEvent("crm_customer_notification_added"));
        }

        setInvoices((prev) =>
          prev.map((inv) =>
            String(inv.invoiceNumber || "").trim().toUpperCase() === String(item.number || "").trim().toUpperCase() ||
            String(inv.id) === String(item.id)
              ? { ...inv, status: "REJECTED", rejectionReason: reason, paymentSubmitted: false }
              : inv
          )
        );
      }

      setPendingApprovals((prev) =>
        Array.isArray(prev)
          ? prev.filter(
              (p) =>
                String(p.number || "").trim().toUpperCase() !== String(item.number || "").trim().toUpperCase() &&
                p.id !== item.id
            )
          : []
      );

      setActionNotice({
        text: `❌ ${item.type === "deal" ? "Deal" : "Invoice"} ${item.number} REJECTED. Rejection notice sent to Customer Portal.`,
        type: "info",
      });
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err) {
      console.error(err);
      setActionNotice({ text: "Failed to reject item", type: "error" });
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleReject = (item: PendingItem) => {
    openRejectModal(item);
  };

  const totalRevenue = invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const pendingAmount = pendingApprovals.filter(p => p.type === "invoice").reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = payments.filter(p => p.status === "COMPLETED" || p.status === "PAID").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalCustomers = customers.length;

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={["FINANCE", "ADMIN", "FINANCE_OFFICER"]}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-blue-500/30 px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <InsaLogo size={40} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Finance Officer Portal</h1>
              <p className="text-xs text-blue-100 mt-0.5">Manage billing, payments, and financial operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="relative text-xs text-white/90 hover:text-white flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
                title="Customer Settlement Notifications"
              >
                <Bell className="w-4 h-4 text-amber-300" />
                <span className="font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-slate-900">
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-xs uppercase tracking-wider">Settlement Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-blue-300 hover:text-white font-bold underline"
                      >
                        Mark all read
                      </button>
                      <button onClick={() => setShowNotificationDrawer(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={`notif-${n.id}-${idx}`}
                          className={`p-3.5 transition text-xs ${n.status === "APPROVED" ? "bg-emerald-50/40" : n.read ? "bg-white" : "bg-blue-50/60"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ETB {n.amount.toLocaleString()} ({n.paymentMethod})
                            </span>
                            {n.status === "APPROVED" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg shadow-xs">
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                                Approved (Paid) ✅
                              </span>
                            ) : n.status === "REJECTED" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 text-white font-extrabold text-[10px] rounded-lg shadow-xs">
                                <XCircle className="w-3.5 h-3.5 text-white" />
                                Rejected ❌
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    handleApproveFromNotification(n);
                                  }}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Approve settlement and mark invoice as Paid"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    handleRejectFromNotification(n);
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Reject settlement and request customer re-settle"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveTab("approvals");
                                    setShowNotificationDrawer(false);
                                    markNotificationRead(n.id);
                                  }}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition cursor-pointer"
                                >
                                  Review ➔
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Customer Portal Link for User Melona & Navigating Staff */}
            <Link
              href="/customer/dashboard"
              className="text-xs text-white bg-white/20 hover:bg-white/30 border border-white/25 px-3.5 py-1.5 rounded-lg transition font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>← Customer Portal</span>
            </Link>

            {/* Active User Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-blue-100 font-bold capitalize">{user?.username || user?.name || "melona"}</span>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                loadFinanceData().finally(() => setRefreshing(false));
              }}
              disabled={refreshing}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Notification Toast */}
        {actionNotice && (
          <div
            className={`p-4 rounded-xl border ${
              actionNotice.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
              actionNotice.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
              "bg-blue-50 border-blue-200 text-blue-800"
            } text-sm font-semibold`}
          >
            {actionNotice.text}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs font-bold text-slate-500">REVENUE</span>
            </div>
            <div className="text-2xl font-black text-slate-900">ETB {(totalRevenue / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-slate-600 mt-1">Total paid invoices</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-amber-600" />
              <span className="text-xs font-bold text-slate-500">PENDING</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{pendingApprovals.length}</div>
            <div className="text-xs text-slate-600 mt-1">Awaiting approval</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-bold text-slate-500">PAYMENTS</span>
            </div>
            <div className="text-2xl font-black text-slate-900">ETB {(totalPayments / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-slate-600 mt-1">Total payments received</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-bold text-slate-500">CUSTOMERS</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalCustomers}</div>
            <div className="text-xs text-slate-600 mt-1">Active accounts</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { key: "approvals", label: "Pending Approvals", count: pendingApprovals.length },
            { key: "invoices", label: "All Invoices", count: invoices.length },
            { key: "payments", label: "All Payments", count: payments.length },
            { key: "customers", label: "Customers (View Only)", count: customers.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Pending Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-900">Pending Approvals</h2>
              <p className="text-sm text-slate-600 mt-1">Review and approve customer invoice and payment requests</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-500 py-8">Loading...</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((item, idx) => (
                    <div key={`pending-${item.type}-${item.id}-${item.number}-${idx}`} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.type === "invoice" ? "bg-blue-100" : item.type === "deal" ? "bg-indigo-100" : "bg-green-100"
                        }`}>
                          {item.type === "invoice" ? <FileText className="w-6 h-6 text-blue-600" /> : item.type === "deal" ? <TrendingUp className="w-6 h-6 text-indigo-600" /> : <CreditCard className="w-6 h-6 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.number}</p>
                          <p className="text-sm font-semibold text-slate-700">Account: {item.customer}</p>
                          {item.paymentMethod && (
                            <p className="text-xs text-emerald-700 font-bold mt-0.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              Via {item.paymentMethod} {item.reference ? `• Ref: ${item.reference}` : ''}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">Date: {item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">ETB {item.amount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 uppercase">{item.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-bold transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-bold transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">All Invoices</h2>
                <p className="text-sm text-slate-600 mt-1">Full CRUD access to invoice management</p>
              </div>
              <Link
                href="/crm/invoices/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold flex items-center gap-2 transition"
              >
                <FileText className="w-4 h-4" />
                Create Invoice
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.slice(0, 20).map((inv, idx) => (
                    <tr key={inv.invoiceNumber ? `fin-inv-${inv.invoiceNumber}-${idx}` : `fin-inv-${inv.id}-${idx}`} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{inv.customerName || "N/A"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">ETB {Number(inv.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.status === "PAID" ? "bg-green-100 text-green-800" :
                          inv.status === "PENDING" || inv.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" :
                          inv.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{inv.invoiceDate || inv.createdAt}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/crm/invoices/${inv.id}`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">All Payments</h2>
                <p className="text-sm text-slate-600 mt-1">Full CRUD access to payment management</p>
              </div>
              <Link
                href="/crm/payments/create"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold flex items-center gap-2 transition"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Payment #</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.slice(0, 20).map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{pay.paymentCode || `PAY-${pay.id}`}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pay.invoiceNumber || "N/A"}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">ETB {Number(pay.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pay.paymentMethod || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          pay.status === "COMPLETED" || pay.status === "PAID" ? "bg-green-100 text-green-800" :
                          pay.status === "PENDING" || pay.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{pay.paymentDate || pay.createdAt}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/crm/payments/${pay.id}`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab (Read-Only) */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-900">Customers (View Only)</h2>
              <p className="text-sm text-slate-600 mt-1">Customer information for financial context</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-black text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.slice(0, 20).map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{cust.customerName || cust.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{cust.organizationName || cust.company || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{cust.email || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{cust.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/crm/customers/${cust.id}`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/crm/orders"
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900">View Orders</h3>
              <p className="text-xs text-slate-600 mt-1">Read-only access</p>
            </div>
            <Package className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition" />
          </Link>

          <Link
            href="/crm/leads"
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-purple-300 transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900">View Leads</h3>
              <p className="text-xs text-slate-600 mt-1">Read-only access</p>
            </div>
            <Users className="w-8 h-8 text-slate-400 group-hover:text-purple-600 transition" />
          </Link>

          <Link
            href="/crm/sales-deals"
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 transition flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900">View Sales Deals</h3>
              <p className="text-xs text-slate-600 mt-1">Read-only access</p>
            </div>
            <TrendingUp className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition" />
          </Link>
        </div>

        {/* Dedicated Rejection Modal */}
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">Reject Settlement Request</h3>
                    <p className="text-[11px] text-rose-100">Send rejection notice &amp; reason to Customer</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectingItem(null)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Item summary box */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Item:</span>
                    <span className="font-black text-slate-800">{rejectingItem.item.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Customer:</span>
                    <span className="font-bold text-slate-800">{rejectingItem.item.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Amount:</span>
                    <span className="font-black text-emerald-700">ETB {Number(rejectingItem.item.amount || 0).toLocaleString()}</span>
                  </div>
                  {rejectingItem.item.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Payment Method:</span>
                      <span className="font-bold text-slate-800">{rejectingItem.item.paymentMethod} {rejectingItem.item.reference ? `(${rejectingItem.item.reference})` : ""}</span>
                    </div>
                  )}
                </div>

                {/* Reason input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={rejectReasonInput}
                    onChange={(e) => setRejectReasonInput(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for customer..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-900 resize-none"
                  />
                </div>

                {/* Quick reason presets */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Transaction reference could not be verified with bank.",
                      "Bank transaction receipt ID mismatch.",
                      "Payment amount does not match invoice total.",
                      "Duplicate transaction reference submitted.",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectReasonInput(preset)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition text-left cursor-pointer ${
                          rejectReasonInput === preset
                            ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRejectingItem(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = rejectReasonInput.trim() || "Transaction reference could not be verified with bank.";
                      const current = rejectingItem;
                      setRejectingItem(null);
                      if (current) {
                        await executeReject(current.item, current.notifId, reason);
                      }
                    }}
                    className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RoleProtectedRoute>
  );
}

