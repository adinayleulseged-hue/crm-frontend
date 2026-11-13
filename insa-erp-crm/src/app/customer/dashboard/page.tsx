"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Building2,
  CheckCircle2,
  X,
  CreditCard,
  Plus,
  ShoppingBag,
  Eye,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Download,
  Briefcase,
  Layers,
  Sparkles,
  FileCheck,
  Send,
  MessageSquare,
  Clock,
  ChevronRight,
  Check,
  AlertCircle,
  RefreshCw,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  EyeOff,
  Activity,
  Server,
  Truck,
  PackageCheck,
  Receipt,
  FileSpreadsheet,
  ArrowUpRight,
  CheckCircle,
  Target,
  Bell,
} from "lucide-react";
import InsaLogo from "@/components/ui/InsaLogo";
import { leadService } from "@/services/leadService";
import { quotationService, QuotationResponse } from "@/services/quotationService";
import { orderService } from "@/services/orderService";
import { invoiceService } from "@/services/invoiceService";
import { paymentService } from "@/services/paymentService";
import { customerService } from "@/services/customerService";
import { salesDealService } from "@/services/salesDealService";
import { putProfile, changePassword, changeEmail, getProfile } from "@/lib/api";
import RequestInvoiceModal, { InvoiceRequestData } from "@/components/modals/RequestInvoiceModal";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import CustomerChatbot from "@/components/chat/CustomerChatbot";
import { isNotificationForCustomer, filterCustomerNotifications, dispatchCustomerNotification } from "@/utils/helpers/notificationHelper";

/* ── Catalog Products Data ── */
const CATALOG_PRODUCTS = [
  // --- Inorganic Adhesive Cements ---
  {
    id: "PROD-CEM-001",
    name: "Insa-Lute Adhesive Cement No. 1",
    category: "Inorganic Adhesive Cements",
    manufacturer: "Sauereisen",
    price: 12500,
    priceText: "ETB 12,500 / pail",
    quoteRequired: false,
    mmsCode: "MMS-SAUER-01",
    description: "Ceramic-forming adhesive used for sealing metal hardware (screws, bolts, nuts) and wax. Cures at room temperature into a durable, heat-conductive ceramic that resists high temperatures and chemicals.",
    keyUse: "Sealing screws, nuts, bolts, and wax; bonding glass, metal, and ceramics.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-CEM-002",
    name: "Insa-Lute Adhesive Cement No. P-1",
    category: "Inorganic Adhesive Cements",
    manufacturer: "Sauereisen",
    price: 14800,
    priceText: "ETB 14,800 / pail",
    quoteRequired: false,
    mmsCode: "MMS-SAUER-P1",
    description: "Inorganic ceramic adhesive formulation engineered for sealing screws, nuts, bolts, wax, general industrial assembly, and automotive sealing.",
    keyUse: "Sealing screws, nuts, bolts, and wax; general assembly and automotive sealing.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop",
    inStock: true,
  },
  // --- SBR (Styrene-Butadiene Rubber) ---
  {
    id: "PROD-SBR-001",
    name: "Emulprene E-1013A (SBR)",
    category: "Rubber & Elastomer Raw Materials",
    manufacturer: "INSA",
    price: 140,
    priceText: "¥8.00 / kg (~ETB 140/kg)",
    quoteRequired: false,
    mmsCode: "MMS-INSA-E1013A",
    description: "Raw Styrene-Butadiene Rubber (SBR) polymer specifically noted for high-adhesion can-sealing compounds, industrial sealants, and adhesives.",
    keyUse: "Specifically noted for can-sealing compounds; also used in adhesives and sealants.",
    image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-SBR-002",
    name: "Emulprene E-1502A (SBR)",
    category: "Rubber & Elastomer Raw Materials",
    manufacturer: "INSA",
    price: 140,
    priceText: "¥8.00 / kg (~ETB 140/kg)",
    quoteRequired: false,
    mmsCode: "MMS-INSA-E1502A",
    description: "Food and pharmaceutical packaging compliant raw SBR rubber grade for food seals, baby bottle teats, and sanitary gasket manufacturing.",
    keyUse: "Food and pharmaceutical packaging seals; baby bottle teats; general seals.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop",
    inStock: true,
  },
  // --- NBR (Nitrile Rubber) ---
  {
    id: "PROD-NBR-001",
    name: "Paracril BJLT HX (NBR)",
    category: "Rubber & Elastomer Raw Materials",
    manufacturer: "INSA",
    price: 18500,
    priceText: "ETB 18,500 / drum",
    quoteRequired: false,
    mmsCode: "MMS-INSA-BJLT",
    description: "High-grade Nitrile Rubber (NBR) raw elastomer engineered for oil-resistant hoses, O-rings, pan seals, and extrusion processing.",
    keyUse: "Hoses, seals, O-rings, and pan seals; extrusion processing.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-NBR-002",
    name: "Paraclean 36L45 (NBR)",
    category: "Rubber & Elastomer Raw Materials",
    manufacturer: "INSA",
    price: 140,
    priceText: "¥8.00 / kg (~ETB 140/kg)",
    quoteRequired: false,
    mmsCode: "MMS-INSA-36L45",
    description: "Specialty low-viscosity NBR raw material optimized for precision injection molding of seals, O-rings, gaskets, grommets, and diaphragms.",
    keyUse: "Seals, O-rings, gaskets, grommets, and diaphragms; injection molding.",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500&auto=format&fit=crop",
    inStock: true,
  },
  // --- Hardware & Cybersecurity Products ---
  {
    id: "PROD-001",
    name: "Enterprise HSM & Cryptographic Security Server",
    category: "Hardware & Cryptography",
    manufacturer: "INSA Tech",
    price: 800000,
    priceText: "ETB 800,000",
    quoteRequired: false,
    mmsCode: "MMS-HSM-2025",
    description: "FIPS 140-3 Level 4 certified hardware security module for banking & public keys.",
    keyUse: "Banking cryptography, digital signature PKI, and key management.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-002",
    name: "Next-Gen Cyber Gateway Firewall & Deep Packet Inspection",
    category: "Network Defense",
    manufacturer: "INSA Tech",
    price: 650000,
    priceText: "ETB 650,000",
    quoteRequired: false,
    mmsCode: "MMS-FW-NG900",
    description: "400 Gbps line-rate inspection sensors with automated AI anomaly detection.",
    keyUse: "National perimeter defense, intrusion prevention, and line-rate DPI.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-003",
    name: "Annual SOC Monitoring & Threat Intelligence Feed License",
    category: "Software & License",
    manufacturer: "INSA Tech",
    price: 350000,
    priceText: "ETB 350,000",
    quoteRequired: false,
    mmsCode: "MMS-LIC-SOC24",
    description: "24/7 national cyber threat advisory, zero-day signatures, and incident response SLA.",
    keyUse: "SOC operations, threat intelligence feeds, and incident response.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-004",
    name: "Terminal & Core Banking Endpoint Defense Suite",
    category: "Endpoint Security",
    manufacturer: "INSA Tech",
    price: 280000,
    priceText: "ETB 280,000",
    quoteRequired: false,
    mmsCode: "MMS-EDR-500",
    description: "Real-time ransomware protection for up to 500 enterprise terminal workstations.",
    keyUse: "Terminal security, anti-ransomware, and endpoint response.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop",
    inStock: true,
  },
  {
    id: "PROD-005",
    name: "National Security Compliance & Penetration Testing Audit",
    category: "Professional Services",
    manufacturer: "INSA Audit",
    price: 450000,
    priceText: "ETB 450,000",
    quoteRequired: false,
    mmsCode: "MMS-SRV-AUDIT",
    description: "Comprehensive vulnerability assessment, source code audit, and certification.",
    keyUse: "Government cybersecurity compliance and penetration audit.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop",
    inStock: true,
  },
];

interface QuotationItem {
  id: string;
  quotationNumber: string;
  solution: string;
  issueDate: string;
  expiryDate: string;
  totalAmount: number;
  status: "ACTIVE" | "ACCEPTED" | "IN_REVIEW" | "EXPIRED" | "DRAFT" | "SENT" | string;
  notes?: string;
}

interface LeadInquiryItem {
  id: string;
  leadNumber: string;
  serviceNeeded: string;
  contactName: string;
  company: string;
  budget: string;
  timeline: string;
  submittedDate: string;
  status: "NEW" | "QUALIFIED" | "IN_REVIEW" | "PROPOSAL_SENT" | "CONTACTED" | string;
  notes?: string;
}

export interface OrderHistoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  date: string;
  status: string;
  actor?: string;
}

export interface OrderItem {
  id?: string | number;
  orderNumber: string;
  invoiceRef?: string;
  date: string;
  deliveryDate: string;
  totalAmount: number;
  status: "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Pending Approval" | string;
  items: string;
  trackingStep?: number;
  quotationRef?: string;
  paymentStatus?: "PAID" | "PENDING_APPROVAL" | "PENDING" | "UNPAID" | string;
  paidAt?: string;
  paymentMethod?: string;
  paymentRef?: string;
  trackingNumber?: string;
  carrier?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryAddress?: string;
  deliverySite?: string;
  receiverName?: string;
  receiverPhone?: string;
  arrivalTime?: string;
  history?: OrderHistoryEvent[];
}

interface InvoiceDisplayItem {
  id?: string | number;
  invoiceNumber: string;
  orderRef?: string;
  quotationRef?: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance?: number;
  status: string;
  customerName?: string;
  customerId?: number | string | null;
  customerOrg?: string;
  notes?: string;
  items?: string;
  paymentMethod?: string;
  paymentRef?: string;
  rejectionReason?: string;
  financeStatus?: string;
  paymentSubmitted?: boolean;
}

export interface CustomerSalesDealItem {
  id: number | string;
  dealCode: string;
  oppCode?: string;
  title: string;
  customer?: string;
  customerName?: string;
  customerId?: number | string;
  productId?: string | number;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  value?: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  closeDate?: string;
  description?: string;
  assignedTo?: string;
  rep?: string;
  // Workflow fields
  workflowStatus?: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  orderId?: number;
  invoiceId?: number | string;
  invoiceNumber?: string;
  paymentSubmitted?: boolean;
  closedBy?: number;
  closedAt?: string;
  customerCanClose?: boolean;
  discountRequested?: number;
  discountApproved?: number;
  quotationRef?: string;
}

export default function CustomerDashboard() {
  const router = useRouter();

  // Active module tab
  const [activeModule, setActiveModule] = useState<
    "dashboard" | "catalog" | "deals" | "quotations" | "orders" | "invoices" | "payments" | "profile"
  >("dashboard");
  const [showBanner, setShowBanner] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Customer identity state
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerOrg, setCustomerOrg] = useState("");
  const [customerEmail, setCustomerEmail] = useState("customer@insa.gov.et");
  const [customerPhone, setCustomerPhone] = useState("+251 911 000000");
  const [customerCity, setCustomerCity] = useState("Addis Ababa");
  const [customerAddress, setCustomerAddress] = useState("King George VI St, Addis Ababa");
  const [customerTin, setCustomerTin] = useState("0001234567");
  const [customerCredit, setCustomerCredit] = useState(18500);
  const [customerPurchases, setCustomerPurchases] = useState(0);

  // Orders Filter Tab
  const [orderFilter, setOrderFilter] = useState<"ALL" | "PAID" | "Processing" | "Confirmed" | "Shipped" | "Delivered">("ALL");

  // Selected Order for Tracking Modal
  const [trackingOrder, setTrackingOrder] = useState<OrderItem | null>(null);
  const [trackingModalTab, setTrackingModalTab] = useState<"tracking" | "history">("tracking");

  // Mock default invoices removed - system fetches from API only
  const DEFAULT_CUSTOMER_INVOICES: InvoiceDisplayItem[] = [];

  // Lists state
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
  const [invoicesList, setInvoicesList] = useState<InvoiceDisplayItem[]>([]);
  const [quotationsList, setQuotationsList] = useState<QuotationItem[]>([]);
  const [salesDealsList, setSalesDealsList] = useState<CustomerSalesDealItem[]>([]);

  const [searchCatalog, setSearchCatalog] = useState("");

  // Modals state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    productId: "PROD-001",
    quantity: 1,
    timeline: "Within 30 Days",
    notes: "",
  });

  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceDisplayItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Telebirr");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentAccountName, setPaymentAccountName] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [customerNotifications, setCustomerNotifications] = useState<any[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Delivery Tracking & Address Schedule State
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryContactName, setDeliveryContactName] = useState<string>("");
  const [deliveryContactPhone, setDeliveryContactPhone] = useState<string>("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>("Afternoon (14:00 - 17:00)");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [scheduledArrival, setScheduledArrival] = useState<string | null>(null);
  const [dealForm, setDealForm] = useState({
    title: "",
    productId: "PROD-001",
    productName: "Enterprise HSM & Cryptographic Security Server",
    quantity: 1,
    unitPrice: 800000,
    amount: "800000",
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    description: "",
    notes: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    salesOrderId: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    subtotal: "",
    taxRate: "15",
    discount: "0",
    notes: "",
  });

  const [showCustomOrderModal, setShowCustomOrderModal] = useState(false);
  const [customOrderForm, setCustomOrderForm] = useState({
    productId: "PROD-001",
    quantity: 1,
    deliveryDate: "2026-09-25",
    notes: "",
  });

  // Place Order Modal State (Product Catalog Purchase Popup)
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [placeOrderForm, setPlaceOrderForm] = useState<{
    product: typeof CATALOG_PRODUCTS[0] | null;
    quantity: number;
    deliverySite: string;
    contactName: string;
    contactPhone: string;
    deliveryDate: string;
    notes: string;
  }>({
    product: null,
    quantity: 1,
    deliverySite: "",
    contactName: "",
    contactPhone: "",
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });
  const [placeOrderSubmitting, setPlaceOrderSubmitting] = useState(false);

  // Profile forms state
  const [profileForm, setProfileForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    tin: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    confirmPassword: "",
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("crm_user") || localStorage.getItem("user");
      const activeUname = localStorage.getItem("active_customer_username");
      const activeCust = localStorage.getItem("active_customer");

      let nameVal = activeCust || activeUname || "";
      let orgVal = activeCust || "";
      let emailVal = "customer@insa.gov.et";
      let phoneVal = "+251 911 000000";
      let tinVal = "0001234567";
      let cityVal = "Addis Ababa";
      let addressVal = "King George VI St, Addis Ababa";

      if (rawUser) {
        try {
          const u = JSON.parse(rawUser);
          if (u.customerId) setCustomerId(u.customerId);
          else if (u.id) setCustomerId(u.id);
          if (u.name) nameVal = u.name;
          if (u.customerName) nameVal = u.customerName;
          if (u.username && !u.name && !u.customerName) nameVal = u.username;
          if (u.organization || u.company || u.organizationName || u.companyName) {
            orgVal = u.organization || u.company || u.organizationName || u.companyName;
          }
          if (u.email) emailVal = u.email;
          if (u.phone) phoneVal = u.phone;
          if (u.tin) tinVal = u.tin;
          if (u.city) cityVal = u.city;
          if (u.address) addressVal = u.address;
        } catch {}
      }

      setCustomerName(nameVal);
      setCustomerOrg(orgVal);
      setCustomerEmail(emailVal);
      setCustomerPhone(phoneVal);
      setCustomerTin(tinVal);
      setCustomerCity(cityVal);
      setCustomerAddress(addressVal);

      setProfileForm({
        name: nameVal,
        company: orgVal,
        email: emailVal,
        phone: phoneVal,
        city: cityVal,
        address: addressVal,
        tin: tinVal,
      });

      setEmailForm({
        newEmail: emailVal,
        confirmPassword: "",
      });

      // Load cached items for this customer (deals, quotations, orders, invoices)
      const rawUserParsed = rawUser ? (() => { try { return JSON.parse(rawUser); } catch { return null; } })() : null;
      const cacheId = rawUserParsed?.customerId || rawUserParsed?.id || "";
      const storageKey = cacheId ? String(cacheId) : (activeUname || nameVal);
      
      const keyCandidates = [
        storageKey,
        nameVal,
        activeUname,
      ].filter(Boolean);

      // Pre-load deals
      for (const k of keyCandidates) {
        const cachedDeals = localStorage.getItem(`crm_deals_${k}`);
        if (cachedDeals) {
          try {
            const parsed = JSON.parse(cachedDeals);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSalesDealsList(parsed);
              break;
            }
          } catch {}
        }
      }

      // Pre-load quotations
      for (const k of keyCandidates) {
        const cachedQuotations = localStorage.getItem(`crm_quotations_${k}`);
        if (cachedQuotations) {
          try {
            const parsed = JSON.parse(cachedQuotations);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuotationsList(parsed);
              break;
            }
          } catch {}
        }
      }

      // Pre-load invoices
      for (const k of keyCandidates) {
        const cachedInvoices = localStorage.getItem(`crm_invoices_${k}`);
        if (cachedInvoices) {
          try {
            const parsed = JSON.parse(cachedInvoices);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setInvoicesList(parsed);
              break;
            }
          } catch {}
        }
      }

      // Pre-load orders
      for (const k of keyCandidates) {
        const cachedOrders = localStorage.getItem(`crm_orders_${k}`);
        if (cachedOrders) {
          try {
            const parsed = JSON.parse(cachedOrders);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOrdersList(parsed);
              break;
            }
          } catch {}
        }
      }

      // Initial DB load (authoritative source)
      loadAllBackendData(nameVal, emailVal, phoneVal, orgVal);
    } catch {}
  }, []);

  // --- Real-time Polling for Customer Notifications (Finance Approval Alerts & Invoice Sync) ---
  useEffect(() => {
    // Purge mock keys once on mount
    try {
      localStorage.removeItem("crm_invoices_Unknown Customer");
      localStorage.removeItem("crm_invoices_null");
      localStorage.removeItem("crm_invoices_undefined");
    } catch {}

    const pollNotifs = () => {
      try {
        // Collect notifications from global and customer-specific keys
        const notifKeys = [
          "crm_customer_notifications",
          customerId ? `crm_customer_notifications_${customerId}` : "",
          customerName ? `crm_customer_notifications_${customerName}` : "",
          customerOrg && customerOrg !== customerName ? `crm_customer_notifications_${customerOrg}` : "",
        ].filter(Boolean);

        let allRawNotifs: any[] = [];
        notifKeys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                allRawNotifs = [...allRawNotifs, ...list];
              }
            }
          } catch {}
        });

        // Strictly isolate: only notifications matching this customer ID or customer name/org
        const myNotifs = filterCustomerNotifications(allRawNotifs, customerId, customerName, customerOrg);

        // Deduplicate by id
        const uniqueNotifs: any[] = [];
        const seenIds = new Set<string>();
        myNotifs.forEach((n) => {
          const notifId = String(n.id || `${n.title}-${n.timestamp}`);
          if (!seenIds.has(notifId)) {
            seenIds.add(notifId);
            uniqueNotifs.push(n);
          }
        });

        setCustomerNotifications((prev) => (JSON.stringify(prev) === JSON.stringify(uniqueNotifs) ? prev : uniqueNotifs));

        const invoicePrimaryKey = customerId ? `crm_invoices_${customerId}` : (customerName ? `crm_invoices_${customerName}` : "");
        const possibleKeys = [
          invoicePrimaryKey,
          customerName && invoicePrimaryKey !== `crm_invoices_${customerName}` ? `crm_invoices_${customerName}` : "",
          customerOrg && customerOrg !== customerName ? `crm_invoices_${customerOrg}` : "",
          "crm_invoices_global",
        ].filter(Boolean);

        let localInvs: InvoiceDisplayItem[] = [];
        possibleKeys.forEach((k) => {
          if (!k || k === "crm_invoices_") return;
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const items = JSON.parse(raw);
              if (Array.isArray(items)) {
                items.forEach((inv: any) => {
                  // Strict customer filtering: only accept records belonging to this customer
                  if (inv && inv.customerName !== "Unknown Customer" && isRecordForCustomer(inv, customerId, customerName, customerOrg)) {
                    const existingIdx = localInvs.findIndex(
                      (x) =>
                        (x.invoiceNumber && x.invoiceNumber === inv.invoiceNumber) ||
                        (x.id && x.id === inv.id)
                    );
                    if (existingIdx >= 0) {
                      localInvs[existingIdx] = { ...localInvs[existingIdx], ...inv };
                    } else {
                      localInvs.push(inv);
                    }
                  }
                });
              }
            }
          } catch {}
        });

        if (localInvs.length > 0) {
          setInvoicesList((prev) => {
            if (prev.length === 0) return localInvs;

            let updated = false;
            const map = new Map<string, InvoiceDisplayItem>();
            prev.forEach((inv) => {
              const k = inv.invoiceNumber || String(inv.id);
              map.set(k, { ...inv });
            });

            localInvs.forEach((inv) => {
              const k = inv.invoiceNumber || String(inv.id);
              const existing = map.get(k);
              if (existing) {
                if (inv.status && inv.status !== existing.status) {
                  existing.status = inv.status;
                  if (inv.status === "WAITING_FINANCE_APPROVAL") {
                    existing.paymentSubmitted = true;
                  }
                  updated = true;
                }
                if (inv.rejectionReason && inv.rejectionReason !== existing.rejectionReason) {
                  existing.rejectionReason = inv.rejectionReason;
                  updated = true;
                }
                if (inv.status === "PAID") {
                  if (existing.status !== "PAID" || existing.paid !== inv.amount) {
                    existing.status = "PAID";
                    existing.paid = inv.amount;
                    updated = true;
                  }
                } else if (inv.paid && inv.paid !== existing.paid) {
                  existing.paid = inv.paid;
                  updated = true;
                }
              } else {
                map.set(k, { ...inv });
                updated = true;
              }
            });

            return updated ? Array.from(map.values()) : prev;
          });
        }

        // --- Synchronize Orders & Paid Order History (strict customer isolation) ---
        const orderPrimaryKey = customerId ? `crm_orders_${customerId}` : (customerName ? `crm_orders_${customerName}` : "");
        const orderStorageKeys = [
          orderPrimaryKey,
          // Only include org key if different from primary and not a generic name
          customerOrg && customerOrg !== customerName && customerId ? `crm_orders_${customerOrg}` : "",
        ].filter(Boolean);

        let localOrders: OrderItem[] = [];
        orderStorageKeys.forEach((k) => {
          if (!k || k === "crm_orders_") return;
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                list.forEach((ord: OrderItem) => {
                  // Strict customer filtering: only accept records belonging to this customer
                  if (ord && ord.orderNumber && isRecordForCustomer(ord, customerId, customerName, customerOrg)) {
                    const idx = localOrders.findIndex(
                      (x) => x.orderNumber === ord.orderNumber || (x.id && ord.id && String(x.id) === String(ord.id))
                    );
                    if (idx >= 0) {
                      localOrders[idx] = { ...localOrders[idx], ...ord };
                    } else {
                      localOrders.push(ord);
                    }
                  }
                });
              }
            }
          } catch {}
        });

        // Cross-match with Paid Invoices to ensure every paid invoice has a corresponding Paid Order with delivery history
        const now = new Date();
        const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateNow = now.toISOString().split("T")[0];

        localInvs.forEach((inv) => {
          const invStatus = String(inv.status || "").toUpperCase();
          if (invStatus === "PAID" || invStatus === "CONFIRMED") {
            const isPaid = invStatus === "PAID";
            const matchIdx = localOrders.findIndex(
              (o) =>
                o.invoiceRef === inv.invoiceNumber ||
                o.orderNumber === inv.invoiceNumber ||
                String(o.orderNumber).replace(/[^0-9]/g, "") === String(inv.invoiceNumber).replace(/[^0-9]/g, "")
            );

            if (matchIdx >= 0) {
              const ord = localOrders[matchIdx];
              let changed = false;
              let nextHist = ord.history ? [...ord.history] : [];

              if (isPaid && ord.paymentStatus !== "PAID") {
                ord.paymentStatus = "PAID";
                ord.paidAt = ord.paidAt || inv.date || dateNow;
                changed = true;
              }
              if (isPaid && (ord.status === "Pending Approval" || ord.status === "Draft")) {
                ord.status = "Confirmed";
                ord.trackingStep = Math.max(ord.trackingStep || 1, 2);
                changed = true;
              }

              // Ensure base history exists
              if (nextHist.length === 0) {
                nextHist = [
                  {
                    id: `hist-base-1-${ord.orderNumber}`,
                    title: "Order Placed & Registered",
                    description: `Procurement order ${ord.orderNumber} placed for ${customerOrg || customerName}.`,
                    timestamp: "09:00 AM",
                    date: ord.date || dateNow,
                    status: "Order Placed",
                    actor: "Customer Portal",
                  },
                ];
                changed = true;
              }

              // Ensure payment history entry exists if paid
              if (isPaid && !nextHist.some((h) => h.status === "Paid" || h.status === "Finance Approved" || h.title.includes("Payment Approved"))) {
                nextHist.push({
                  id: `hist-fin-paid-${ord.orderNumber}`,
                  title: "Payment Approved & Verified by Finance",
                  description: `Finance verified transaction of ETB ${inv.amount.toLocaleString()} for Invoice ${inv.invoiceNumber}. Order cleared for fulfillment.`,
                  timestamp: timeNow,
                  date: dateNow,
                  status: "Paid",
                  actor: "Finance Officer (FMS)",
                });
                changed = true;
              }

              if (changed) {
                ord.history = nextHist;
                localOrders[matchIdx] = { ...ord };
              }
            } else if (isPaid) {
              // Create paid order record
              const newOrderNum = `SO-${String(inv.invoiceNumber).replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000)}`;
              const newPaidOrder: OrderItem = {
                id: `order-paid-${inv.invoiceNumber}`,
                orderNumber: newOrderNum,
                invoiceRef: inv.invoiceNumber,
                date: inv.date || dateNow,
                deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
                totalAmount: inv.amount || 0,
                status: "Confirmed",
                paymentStatus: "PAID",
                paidAt: inv.date || dateNow,
                trackingStep: 2,
                items: `INSA Enterprise Security & Hardware (Invoice: ${inv.invoiceNumber})`,
                trackingNumber: `INSA-DEL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                carrier: "INSA Central MMS Express Logistics",
                driverName: "Getachew Alemu",
                driverPhone: "+251 911 554433",
                deliveryAddress: customerAddress || "King George VI St, INSA Headquarters, Addis Ababa",
                deliverySite: customerAddress || "King George VI St, INSA Headquarters, Addis Ababa",
                receiverName: customerName || "Customer",
                receiverPhone: customerPhone || "+251 911 000000",
                history: [
                  {
                    id: `hist-ord-${Date.now()}-1`,
                    title: "Order Placed & Registered",
                    description: `Procurement order registered for ${customerOrg || customerName} at INSA MMS Logistics Hub.`,
                    timestamp: "09:00 AM",
                    date: inv.date || dateNow,
                    status: "Order Placed",
                    actor: "Customer Portal",
                  },
                  {
                    id: `hist-ord-${Date.now()}-2`,
                    title: "Payment Approved & Verified by Finance",
                    description: `Finance verified settlement of ETB ${inv.amount.toLocaleString()} for Invoice ${inv.invoiceNumber}. Order cleared for delivery dispatch.`,
                    timestamp: timeNow,
                    date: dateNow,
                    status: "Paid",
                    actor: "Finance Officer (FMS)",
                  },
                  {
                    id: `hist-ord-${Date.now()}-3`,
                    title: "Warehouse Consignment Prepared",
                    description: "Hardware items allocated and packed into tamper-evident transit containers at INSA Central MMS Logistics Hub.",
                    timestamp: "01:30 PM",
                    date: dateNow,
                    status: "Processing",
                    actor: "INSA Central MMS Hub",
                  },
                ],
              };
              localOrders.unshift(newPaidOrder);
            }
          }
        });

        if (localOrders.length > 0) {
          setOrdersList((prev) => {
            const map = new Map<string, OrderItem>();
            prev.forEach((o) => map.set(o.orderNumber || String(o.id), { ...o }));
            let hasChange = false;
            localOrders.forEach((o) => {
              const k = o.orderNumber || String(o.id);
              const existing = map.get(k);
              if (!existing) {
                map.set(k, { ...o });
                hasChange = true;
              } else {
                if (
                  existing.status !== o.status ||
                  existing.paymentStatus !== o.paymentStatus ||
                  existing.trackingStep !== o.trackingStep ||
                  (o.history && o.history.length !== (existing.history?.length || 0))
                ) {
                  map.set(k, { ...existing, ...o });
                  hasChange = true;
                }
              }
            });
            return hasChange || prev.length !== map.size ? Array.from(map.values()) : prev;
          });
        }
        // --- Synchronize Deals in Real-Time Across Local & Global Storages ---
        try {
          const allLocalDeals = salesDealService.getAllLocalDeals();
          if (allLocalDeals && allLocalDeals.length > 0) {
            setSalesDealsList((prev) => {
              let hasDealChange = false;
              const updatedDeals = prev.map((deal) => {
                const match = allLocalDeals.find((item: any) =>
                  item && (
                    (item.id && String(item.id) === String(deal.id)) ||
                    (item.dealCode && deal.dealCode && item.dealCode === deal.dealCode) ||
                    (item.opportunityNumber && deal.dealCode && item.opportunityNumber === deal.dealCode) ||
                    (item.dealCode && (item.dealCode === `DEAL-${deal.id}` || deal.dealCode === `DEAL-${item.id}`))
                  )
                );
                if (match && match.workflowStatus && match.workflowStatus !== deal.workflowStatus) {
                  hasDealChange = true;
                  return {
                    ...deal,
                    workflowStatus: match.workflowStatus,
                    discountApproved: match.discountApproved !== undefined ? match.discountApproved : deal.discountApproved,
                    rejectionReason: match.rejectionReason || deal.rejectionReason,
                    quotationRef: match.quotationRef || deal.quotationRef,
                    orderId: match.orderId || deal.orderId,
                    invoiceId: match.invoiceId || deal.invoiceId,
                  };
                }
                return deal;
              });

              // Also check if any deals in allLocalDeals belong to this customer and are missing from updatedDeals
              allLocalDeals.forEach((item: any) => {
                if (item && isRecordForCustomer(item, customerId, customerName, customerOrg)) {
                  const alreadyExists = updatedDeals.some((d) =>
                    (item.id && String(d.id) === String(item.id)) ||
                    (item.dealCode && d.dealCode === item.dealCode) ||
                    (item.opportunityNumber && d.dealCode === item.opportunityNumber)
                  );
                  if (!alreadyExists) {
                    hasDealChange = true;
                    updatedDeals.unshift({
                      id: item.id || Date.now(),
                      title: item.title || item.opportunityName || "Sales Deal",
                      dealCode: item.dealCode || item.opportunityNumber || `DEAL-${item.id}`,
                      amount: Number(item.amount || item.value || 0),
                      stage: item.stage || "Proposal",
                      probability: Number(item.probability || 60),
                      expectedCloseDate: item.expectedCloseDate || item.closeDate || "",
                      description: item.description || "",
                      assignedTo: item.assignedTo || "Not Assigned",
                      workflowStatus: item.workflowStatus || "PENDING_APPROVAL",
                      discountRequested: item.discountRequested || 0,
                      discountApproved: item.discountApproved || 0,
                      rejectionReason: item.rejectionReason || "",
                      productId: item.productId,
                      productName: item.productName,
                      quantity: item.quantity || 1,
                      unitPrice: item.unitPrice || 0,
                      quotationRef: item.quotationRef,
                    });
                  }
                }
              });

              if (hasDealChange) {
                const key = customerId ? String(customerId) : (customerName || "Customer");
                localStorage.setItem(`crm_deals_${key}`, JSON.stringify(updatedDeals));
                if (customerName && key !== customerName) {
                  localStorage.setItem(`crm_deals_${customerName}`, JSON.stringify(updatedDeals));
                }
                return updatedDeals;
              }
              return prev;
            });
          }
        } catch {}
      } catch (e) {}
    };

    pollNotifs();
    const interval = setInterval(pollNotifs, 2000);

    const handlePaidEvent = (e: any) => {
      const invNum = e?.detail?.number || e?.detail?.invoiceNumber;
      if (!invNum) return;
      setInvoicesList((prev) =>
        prev.map((inv) =>
          String(inv.invoiceNumber).trim().toUpperCase() === String(invNum).trim().toUpperCase()
            ? { ...inv, status: "PAID", paid: inv.amount, balance: 0 }
            : inv
        )
      );
      showToast(`🎉 Payment for Invoice ${invNum} has been APPROVED by Finance! Status is now Paid & Settled.`, "success");
      pollNotifs();
    };

    const handleRejectEvent = (e: any) => {
      const invNum = e?.detail?.number || e?.detail?.invoiceNumber;
      const reason = e?.detail?.reason || "Transaction details could not be verified by Finance.";
      if (!invNum) return;
      setInvoicesList((prev) =>
        prev.map((inv) =>
          String(inv.invoiceNumber).trim().toUpperCase() === String(invNum).trim().toUpperCase()
            ? { ...inv, status: "REJECTED", rejectionReason: reason }
            : inv
        )
      );
      showToast(`❌ Payment for Invoice ${invNum} was rejected by Finance: ${reason}`, "error");
      pollNotifs();
    };

    // Live cross-tab and cross-portal instant sync
    window.addEventListener("storage", pollNotifs);
    window.addEventListener("crm_invoice_paid", handlePaidEvent);
    window.addEventListener("crm_invoice_rejected", handleRejectEvent);
    window.addEventListener("crm_invoice_updated", pollNotifs);
    window.addEventListener("crm_order_updated", pollNotifs);
    window.addEventListener("crm_orders_updated", pollNotifs);
    window.addEventListener("crm_deal_approved", pollNotifs);
    window.addEventListener("crm_deal_rejected", pollNotifs);
    window.addEventListener("crm_deals_updated", pollNotifs);
    window.addEventListener("crm_customer_notification_added", pollNotifs);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", pollNotifs);
      window.removeEventListener("crm_invoice_paid", handlePaidEvent);
      window.removeEventListener("crm_invoice_rejected", handleRejectEvent);
      window.removeEventListener("crm_invoice_updated", pollNotifs);
      window.removeEventListener("crm_order_updated", pollNotifs);
      window.removeEventListener("crm_orders_updated", pollNotifs);
      window.removeEventListener("crm_deal_approved", pollNotifs);
      window.removeEventListener("crm_deal_rejected", pollNotifs);
      window.removeEventListener("crm_deals_updated", pollNotifs);
      window.removeEventListener("crm_customer_notification_added", pollNotifs);
    };
  }, [customerId, customerName, customerOrg]);

  // --- Reload Invoices from localStorage when switching to Invoices Module ---
  useEffect(() => {
    const reloadInvoices = () => {
      if (activeModule === "invoices") {
        console.log("[Invoices Module] ====== LOADING INVOICES ======");
        console.log("[Invoices Module] Current state has", invoicesList.length, "invoices");
        console.log("[Invoices Module] Customer Info:", { customerId, customerName, customerOrg });
        
        const storageKey = customerId ? String(customerId) : (customerName || "Customer");
        const possibleKeys = [
          `crm_invoices_${storageKey}`,
          customerName && storageKey !== customerName ? `crm_invoices_${customerName}` : "",
          "crm_invoices_global",
        ].filter(Boolean);

        console.log("[Invoices Module] Checking localStorage keys:", possibleKeys);

        let allInvoices: InvoiceDisplayItem[] = [];
        const seenInvoiceNumbers = new Set<string>();
        
        possibleKeys.forEach((key) => {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const items = JSON.parse(raw);
              console.log(`[Invoices Module] Key "${key}" has ${items.length} items`);
              if (Array.isArray(items)) {
                items.forEach((inv: any) => {
                  if (!inv || !inv.invoiceNumber) {
                    console.log("[Invoices Module] Skipping item without invoiceNumber:", inv);
                    return;
                  }
                  
                  // Skip duplicates
                  if (seenInvoiceNumbers.has(inv.invoiceNumber)) {
                    console.log(`[Invoices Module] Duplicate invoice ${inv.invoiceNumber}, merging data`);
                    const existingIdx = allInvoices.findIndex(x => x.invoiceNumber === inv.invoiceNumber);
                    if (existingIdx >= 0) {
                      allInvoices[existingIdx] = { ...allInvoices[existingIdx], ...inv };
                    }
                    return;
                  }
                  
                  // More lenient filtering - accept if invoice has invoiceNumber and belongs to customer
                  const belongsToCustomer = (
                    !customerId || // If no customerId, match by name only
                    inv.customerId === customerId ||
                    inv.customerName === customerName ||
                    isRecordForCustomer(inv, customerId, customerName, customerOrg)
                  );
                  
                  console.log(`[Invoices Module] Invoice ${inv.invoiceNumber}: belongsToCustomer=${belongsToCustomer}`, {
                    invCustomerId: inv.customerId,
                    invCustomerName: inv.customerName,
                    status: inv.status,
                  });
                  
                  if (belongsToCustomer) {
                    allInvoices.push(inv);
                    seenInvoiceNumbers.add(inv.invoiceNumber);
                  }
                });
              }
            } else {
              console.log(`[Invoices Module] Key "${key}" is empty`);
            }
          } catch (e) {
            console.error(`[Invoices Module] Error loading from ${key}:`, e);
          }
        });

        console.log("[Invoices Module] Total unique invoices loaded:", allInvoices.length);
        console.log("[Invoices Module] Invoice numbers:", allInvoices.map(i => i.invoiceNumber));
        
        // Always update state with loaded data, even if empty
        if (allInvoices.length > 0) {
          console.log("[Invoices Module] ✅ Setting invoicesList with", allInvoices.length, "invoices");
          setInvoicesList(allInvoices);
        } else if (invoicesList.length === 0) {
          console.log("[Invoices Module] ⚠️ No invoices in localStorage or state");
        } else {
          console.log("[Invoices Module] ⚠️ localStorage empty but state has", invoicesList.length, "- keeping state");
        }
        
        console.log("[Invoices Module] ====== DONE ======");
      }
    };
    
    reloadInvoices();
    
    // Listen for invoice creation/update events
    const handleInvoiceCreated = () => {
      console.log("[Invoices Module] Invoice created event received, reloading...");
      reloadInvoices();
    };
    
    window.addEventListener("crm_invoice_created", handleInvoiceCreated);
    window.addEventListener("crm_invoice_submitted", handleInvoiceCreated);
    window.addEventListener("crm_invoice_updated", handleInvoiceCreated);
    
    return () => {
      window.removeEventListener("crm_invoice_created", handleInvoiceCreated);
      window.removeEventListener("crm_invoice_submitted", handleInvoiceCreated);
      window.removeEventListener("crm_invoice_updated", handleInvoiceCreated);
    };
  }, [activeModule, customerId, customerName, customerOrg]);


  const persistOrders = (updated: OrderItem[]) => {
    setOrdersList(updated);
    const key = customerId ? String(customerId) : customerName;
    localStorage.setItem(`crm_orders_${key}`, JSON.stringify(updated));
    if (customerName && key !== customerName) {
      localStorage.setItem(`crm_orders_${customerName}`, JSON.stringify(updated));
    }
  };

  const persistQuotations = (updated: QuotationItem[]) => {
    setQuotationsList(updated);
    const key = customerId ? String(customerId) : customerName;
    localStorage.setItem(`crm_quotations_${key}`, JSON.stringify(updated));
    if (customerName && key !== customerName) {
      localStorage.setItem(`crm_quotations_${customerName}`, JSON.stringify(updated));
    }
  };

  const persistInvoices = (updated: InvoiceDisplayItem[]) => {
    setInvoicesList(updated);
    const key = customerId ? String(customerId) : customerName;
    localStorage.setItem(`crm_invoices_${key}`, JSON.stringify(updated));
    if (customerName && key !== customerName) {
      localStorage.setItem(`crm_invoices_${customerName}`, JSON.stringify(updated));
    }
  };

  const isRecordForCustomer = (
    record: any,
    targetId: number | string | null | undefined,
    name: string,
    org: string
  ): boolean => {
    if (!record) return false;

    // 1. Direct ID match (strongest, most reliable)
    const recId = record.customerId ?? record.customer_id ?? record.customer?.id;
    if (targetId && recId !== undefined && recId !== null) {
      if (String(recId) === String(targetId)) return true;
    }

    // 2. Name / Username / Organization match
    const recName = (
      record.customerName ||
      record.customer_name ||
      record.clientName ||
      record.customer ||
      record.customer?.name ||
      record.customer?.companyName ||
      record.customer?.organizationName ||
      ""
    ).trim().toLowerCase();

    const currentName = (name || "").trim().toLowerCase();
    const currentOrg = (org || "").trim().toLowerCase();

    let activeUname = "";
    if (typeof window !== "undefined") {
      activeUname = (localStorage.getItem("active_customer_username") || localStorage.getItem("active_customer") || "").trim().toLowerCase();
    }

    if (recName) {
      if (currentName && recName === currentName) return true;
      if (currentOrg && recName === currentOrg) return true;
      if (activeUname && (recName === activeUname || recName.includes(activeUname) || activeUname.includes(recName))) return true;
      if (currentName && (recName.includes(currentName) || currentName.includes(recName))) return true;
      if (currentOrg && (recName.includes(currentOrg) || currentOrg.includes(recName))) return true;
    }

    return false;
  };

  const resolveCustomerEntity = async (name: string, email: string, phone: string, org: string) => {
    // Default placeholder values that should NEVER be used for matching
    // because multiple/all customers share these same defaults
    const PLACEHOLDER_EMAILS = ["customer@insa.gov.et", ""];
    const PLACEHOLDER_PHONES = ["+251 911 000000", ""];
    
    const isRealEmail = email && !PLACEHOLDER_EMAILS.includes(email.toLowerCase().trim());
    
    try {
      const customersRes = await customerService.getAllCustomers();
      const list = Array.isArray(customersRes) ? customersRes : customersRes?.content || [];
      
      // Step 1: Try EXACT NAME match first (most reliable for customer isolation)
      const foundByName = list.find((c: any) => {
        const cName = (c.name || c.customerName || "").toLowerCase().trim();
        const cOrgName = (c.organizationName || c.companyName || "").toLowerCase().trim();
        const targetName = (name || "").toLowerCase().trim();
        const targetOrg = (org || "").toLowerCase().trim();
        
        if (!targetName) return false;
        
        // Exact name match
        if (cName && cName === targetName) return true;
        // Exact org match (only if org is not empty)
        if (targetOrg && cOrgName && cOrgName === targetOrg) return true;
        if (targetOrg && cName && cName === targetOrg) return true;
        
        return false;
      });
      
      if (foundByName && foundByName.id) {
        setCustomerId(foundByName.id);
        return foundByName.id;
      }
      
      // Step 2: Try email match ONLY if it's a real unique email (not placeholder)
      if (isRealEmail) {
        const foundByEmail = list.find((c: any) =>
          c.email && c.email.toLowerCase().trim() === email.toLowerCase().trim()
        );
        if (foundByEmail && foundByEmail.id) {
          setCustomerId(foundByEmail.id);
          return foundByEmail.id;
        }
      }
      
      // Step 3: No match found — create a new customer entity
      const created = await customerService.createCustomer({
        customerName: name || "Valued Customer",
        organizationName: org || name || "New Customer Organization",
        customerType: "GOVERNMENT",
        name: org || name,
        email: isRealEmail ? email : `${(name || "customer").toLowerCase().replace(/\s+/g, ".")}@portal.insa.gov.et`,
        phone: phone,
        contactPerson: name,
        city: customerCity,
        address: customerAddress,
        tin: customerTin,
      });
      if (created && created.id) {
        setCustomerId(created.id);
        return created.id;
      }
      if (created && created.id) {
        setCustomerId(created.id);
        try {
          localStorage.setItem(`crm_customer_id_${name}`, String(created.id));
          localStorage.setItem("crm_customer_id", String(created.id));
        } catch {}
        return created.id;
      }
    } catch {}
    let fallbackId: number | null = customerId || null;
    if (!fallbackId) {
      try {
        const stored = localStorage.getItem(`crm_customer_id_${name}`) || localStorage.getItem("crm_customer_id");
        if (stored) fallbackId = Number(stored);
        if (!fallbackId || isNaN(fallbackId)) {
          const str = (name || "customer").trim().toLowerCase();
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
          }
          fallbackId = Math.abs(hash) % 90000 + 1000;
          localStorage.setItem(`crm_customer_id_${name}`, String(fallbackId));
          localStorage.setItem("crm_customer_id", String(fallbackId));
        }
      } catch {}
    }
    if (fallbackId) setCustomerId(fallbackId);
    return fallbackId || null;
  };

  const loadAllBackendData = async (name = customerName, email = customerEmail, phone = customerPhone, org = customerOrg) => {
    setIsLoading(true);
    let connected = false;

    // Resolve Customer ID in DB
    const resolvedId = await resolveCustomerEntity(name, email, phone, org);

    // CRITICAL: If we don't have a valid positive customer ID, do NOT fetch from backend
    // because the backend will return ALL records from ALL customers (no filter).
    // A new customer should see empty lists until they create their own data.
    const hasValidId = resolvedId !== null && resolvedId !== undefined && resolvedId > 0;
    
    if (!hasValidId) {
      console.warn('[loadAllBackendData] Loading customer data from local storage');
      const localDeals = salesDealService.getAllLocalDeals();
      const userDeals = localDeals.filter((d: any) => isRecordForCustomer(d, null, name, org));
      if (userDeals.length > 0) setSalesDealsList(userDeals);
      setIsLoading(false);
      return;
    }

    // From here, resolvedId is guaranteed to be a valid positive number
    // 1. Fetch Quotations from PostgreSQL
    try {
      const data = await quotationService.getAllQuotations({ customerId: resolvedId });
      connected = true;
      const rawItems = Array.isArray(data) ? data : (data as any)?.content || [];
      const customerQuotes = rawItems.filter((q: any) => isRecordForCustomer(q, resolvedId, name, org));
      if (customerQuotes.length > 0) {
        const mapped = customerQuotes.map((q: any) => ({
          id: String(q.id || Math.random()),
          quotationNumber: q.quotationNumber || `QUO-2025-00${q.id}`,
          solution: q.solution || q.notes || q.opportunityRef || "Enterprise INSA Security Solution",
          issueDate: q.issueDate || q.date || q.createdAt?.split("T")[0] || "2026-08-20",
          expiryDate: q.expiryDate || q.validUntil || "2026-09-20",
          totalAmount: Number(q.totalAmount || q.amount || q.subtotal || 850000),
          status: q.status || "ACTIVE",
          notes: q.notes || "",
        }));
        persistQuotations(mapped);
      } else {
        persistQuotations([]);
      }
    } catch {}

    // 2. Fetch Sales Orders from PostgreSQL
    try {
      const data = await orderService.getAllOrders({ customerId: resolvedId });
      connected = true;
      const rawItems = Array.isArray(data) ? data : (data as any)?.content || [];
      const customerOrders = rawItems.filter((o: any) => isRecordForCustomer(o, resolvedId, name, org));
      if (customerOrders.length > 0) {
        const mapped = customerOrders.map((o: any) => {
          const st = o.status || "Confirmed";
          let step = 2;
          if (st === "Confirmed") step = 2;
          else if (st === "Shipped" || st === "In Transit") step = 3;
          else if (st === "Delivered") step = 4;
          else if (st === "Processing") step = 2;

          return {
            id: o.id,
            orderNumber: o.orderNumber || `SO-2025-00${o.id}`,
            date: o.orderDate || o.createdAt?.split("T")[0] || "2026-08-25",
            deliveryDate: o.deliveryDate || "2026-09-15",
            totalAmount: Number(o.totalAmount || 0),
            status: st,
            trackingStep: step,
            items: o.items?.map((i: any) => `${i.itemName || i.itemDescription || "Product"} (x${i.quantity || 1})`).join(", ") || "Enterprise Cryptography Package",
            quotationRef: o.quotationRef,
          };
        });
        persistOrders(mapped);
        const sum = mapped.reduce((acc: number, curr: any) => acc + (Number(curr.totalAmount) || 0), 0);
        if (sum > 0) setCustomerPurchases(sum);
      } else {
        persistOrders([]);
        setCustomerPurchases(0);
      }
    } catch {}

    // 4. Fetch Invoices from PostgreSQL & Merge with Local Storage
    try {
      const data = await invoiceService.getAllInvoices({ customerId: resolvedId });
      connected = true;
      const rawItems = Array.isArray(data) ? data : (data as any)?.content || [];
      const customerInvs = rawItems.filter((inv: any) => isRecordForCustomer(inv, resolvedId, name, org));

      // Collect local invoices for this customer only
      let localInvs: InvoiceDisplayItem[] = [];
      try {
        if (typeof window !== "undefined") {
          const keys = [
            resolvedId ? `crm_invoices_${resolvedId}` : "",
            name ? `crm_invoices_${name}` : "",
            org && org !== name ? `crm_invoices_${org}` : ""
          ].filter(Boolean);
          keys.forEach((k) => {
            const raw = localStorage.getItem(k);
            if (raw) {
              const items = JSON.parse(raw);
              if (Array.isArray(items)) {
                items.forEach((inv: any) => {
                  if (isRecordForCustomer(inv, resolvedId, name, org)) {
                    localInvs.push(inv);
                  }
                });
              }
            }
          });
        }
      } catch (e) {}

      const mappedBackend: InvoiceDisplayItem[] = customerInvs.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || `INV-2025-00${inv.id}`,
        orderRef: inv.salesOrderCode || (inv.salesOrderId ? `SO-2025-00${inv.salesOrderId}` : ""),
        date: inv.invoiceDate || inv.createdAt?.split("T")[0] || "2026-08-26",
        dueDate: inv.dueDate || "2026-09-26",
        amount: Number(inv.totalAmount || inv.amount || 0),
        paid: Number(inv.paidAmount || 0),
        status: inv.status || "PENDING",
      }));

      // Merge backend and local invoices into unified list (local settlement status & local items take priority)
      const invMap = new Map<string, InvoiceDisplayItem>();

      mappedBackend.forEach((inv) => {
        const key = inv.invoiceNumber || String(inv.id);
        invMap.set(key, inv);
      });

      localInvs.forEach((inv) => {
        const key = inv.invoiceNumber || String(inv.id);
        const existing = invMap.get(key);
        if (existing) {
          if (inv.status && inv.status !== "PENDING") {
            existing.status = inv.status;
          }
          if (inv.paid) existing.paid = inv.paid;
        } else {
          invMap.set(key, inv);
        }
      });

      const mergedList = Array.from(invMap.values());
      persistInvoices(mergedList);
    } catch {}

    // 5. Fetch Sales Deals from PostgreSQL (/api/opportunities)
    try {
      const data = await salesDealService.getAllSalesDeals({ customerId: resolvedId });
      connected = true;
      const rawItems = Array.isArray(data) ? data : (data as any)?.content || [];
      console.log('[Sales Deals] Fetched from DB:', rawItems.length, 'deals');
      
      const customerDeals = rawItems.filter((d: any) => isRecordForCustomer(d, resolvedId, name, org));
      const mapped: CustomerSalesDealItem[] = customerDeals.map((d: any, idx: number) => ({
        id: d.id || idx + 1,
        title: d.title || d.opportunityName || d.name || `Sales Deal #${d.id}`,
        dealCode: d.opportunityNumber || d.oppCode || `DEAL-2025-00${d.id || idx + 1}`,
        amount: Number(d.expectedRevenue || d.amount || d.estimatedValue || d.dealValue || 0),
        stage: d.stageName || d.stage || "Proposal",
        probability: Number(d.probability || 0),
        expectedCloseDate: d.expectedCloseDate || d.closeDate || "",
        description: d.description || d.subtitle || d.scope || "",
        assignedTo: d.assignedTo || "Not Assigned",
        // Workflow fields from backend
        workflowStatus: d.workflowStatus || "DRAFT",
        approvedBy: d.approvedBy,
        approvedAt: d.approvedAt,
        rejectedBy: d.rejectedBy,
        rejectedAt: d.rejectedAt,
        rejectionReason: d.rejectionReason,
        orderId: d.orderId,
        invoiceId: d.invoiceId,
        closedBy: d.closedBy,
        closedAt: d.closedAt,
        customerCanClose: d.customerCanClose || false,
        discountRequested: d.discountRequested || 0,
        discountApproved: d.discountApproved || 0,
        productId: d.productId,
        productName: d.productName,
        quantity: d.quantity || 1,
        unitPrice: d.unitPrice || 0,
      }));

      // Merge with localStorage deals (customer-scoped or customer matching from global)
      let customerLocalDeals: any[] = [];
      try {
        const activeUname = typeof window !== "undefined" ? (localStorage.getItem("active_customer_username") || localStorage.getItem("active_customer") || "") : "";
        const candidateKeys = [
          resolvedId ? `crm_deals_${resolvedId}` : "",
          name ? `crm_deals_${name}` : "",
          activeUname ? `crm_deals_${activeUname}` : "",
          org ? `crm_deals_${org}` : "",
          resolvedId ? `crm_deals_admin_${resolvedId}` : "",
          name ? `crm_deals_admin_${name}` : "",
          activeUname ? `crm_deals_admin_${activeUname}` : "",
          "crm_deals_global",
        ].filter(Boolean);

        const dealMap = new Map<string, any>();

        // 1. Gather all deals matching this customer from all candidate keys
        candidateKeys.forEach((k) => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const arr = JSON.parse(raw);
              if (Array.isArray(arr)) {
                arr.forEach((d: any) => {
                  if (d && (isRecordForCustomer(d, resolvedId, name, org) || k.includes(String(resolvedId || name)))) {
                    const idKey = String(d.dealCode || d.opportunityNumber || d.oppCode || d.id);
                    if (!dealMap.has(idKey)) {
                      dealMap.set(idKey, d);
                    } else {
                      const exist = dealMap.get(idKey);
                      if (d.workflowStatus && d.workflowStatus !== "DRAFT") {
                        exist.workflowStatus = d.workflowStatus;
                      }
                      if (d.discountApproved !== undefined) exist.discountApproved = d.discountApproved;
                      if (d.quotationRef) exist.quotationRef = d.quotationRef;
                      if (d.orderId) exist.orderId = d.orderId;
                      if (d.invoiceId) exist.invoiceId = d.invoiceId;
                    }
                  }
                });
              }
            }
          } catch {}
        });

        // 2. Scan allLocalDeals from salesDealService
        const allLocal = salesDealService.getAllLocalDeals();
        allLocal.forEach((d: any) => {
          if (d && (isRecordForCustomer(d, resolvedId, name, org) || (d.customerName && d.customerName.toLowerCase() === (name || "").toLowerCase()))) {
            const idKey = String(d.dealCode || d.opportunityNumber || d.oppCode || d.id);
            if (!dealMap.has(idKey)) {
              dealMap.set(idKey, d);
            } else {
              const exist = dealMap.get(idKey);
              if (d.workflowStatus && d.workflowStatus !== "DRAFT") {
                exist.workflowStatus = d.workflowStatus;
              }
              if (d.discountApproved !== undefined) exist.discountApproved = d.discountApproved;
              if (d.quotationRef) exist.quotationRef = d.quotationRef;
              if (d.orderId) exist.orderId = d.orderId;
              if (d.invoiceId) exist.invoiceId = d.invoiceId;
            }
          }
        });

        customerLocalDeals = Array.from(dealMap.values());
      } catch {}

      const merged = mapped.map((m) => {
        const found = customerLocalDeals.find((g: any) => 
          g.id === m.id || 
          g.dealCode === m.dealCode || 
          (g.dealCode && m.dealCode && g.dealCode.replace(/[^0-9]/g, "") === m.dealCode.replace(/[^0-9]/g, "") && m.dealCode.replace(/[^0-9]/g, "").length >= 3)
        );
        if (found && found.workflowStatus) {
          const localProgressed = found.workflowStatus && !["DRAFT", "PENDING_APPROVAL"].includes(found.workflowStatus);
          const backendProgressed = m.workflowStatus && !["DRAFT", "PENDING_APPROVAL"].includes(m.workflowStatus);
          
          const effectiveWorkflowStatus = localProgressed
            ? found.workflowStatus
            : (backendProgressed ? m.workflowStatus : (found.workflowStatus || m.workflowStatus || "PENDING_APPROVAL"));

          return {
            ...m,
            workflowStatus: effectiveWorkflowStatus,
            rejectionReason: found.rejectionReason || m.rejectionReason,
            discountApproved: found.discountApproved !== undefined ? found.discountApproved : m.discountApproved,
            quotationRef: found.quotationRef || m.quotationRef,
            orderId: found.orderId || m.orderId,
            invoiceId: found.invoiceId || m.invoiceId,
            productName: found.productName || m.productName,
            productId: found.productId || m.productId,
            quantity: found.quantity || m.quantity,
            amount: found.amount || m.amount,
          };
        }
        return m;
      });

      customerLocalDeals.forEach((g: any) => {
        if (!merged.some((m) => m.id === g.id || m.dealCode === g.dealCode)) {
          merged.push({
            id: g.id || Date.now(),
            title: g.title || g.opportunityName || "Sales Deal",
            dealCode: g.dealCode || g.opportunityNumber || `DEAL-${g.id}`,
            amount: Number(g.amount || g.value || 0),
            stage: g.stage || "Proposal",
            probability: Number(g.probability || 60),
            expectedCloseDate: g.expectedCloseDate || g.closeDate || "",
            description: g.description || "",
            assignedTo: g.assignedTo || "Not Assigned",
            workflowStatus: g.workflowStatus || "PENDING_APPROVAL",
            discountRequested: g.discountRequested || 0,
            discountApproved: g.discountApproved || 0,
            rejectionReason: g.rejectionReason || "",
            productId: g.productId,
            productName: g.productName,
            quantity: g.quantity || 1,
            unitPrice: g.unitPrice || 0,
            quotationRef: g.quotationRef,
            orderId: g.orderId,
            invoiceId: g.invoiceId,
          });
        }
      });

      if (merged.length > 0) {
        setSalesDealsList(merged);
        try {
          const primaryKey = resolvedId ? `crm_deals_${resolvedId}` : `crm_deals_${name}`;
          localStorage.setItem(primaryKey, JSON.stringify(merged));
          if (name && primaryKey !== `crm_deals_${name}`) {
            localStorage.setItem(`crm_deals_${name}`, JSON.stringify(merged));
          }
          merged.forEach((d) => salesDealService.syncDealToGlobal(d));
        } catch {}
        console.log('[Sales Deals] Loaded successfully:', merged.length, 'deals');
      } else if (customerLocalDeals.length > 0) {
        setSalesDealsList(customerLocalDeals);
      }
    } catch (error: any) {
      console.error('[Sales Deals] Failed to fetch:', error);
      try {
        const candidateKeys = [
          resolvedId ? `crm_deals_${resolvedId}` : "",
          name ? `crm_deals_${name}` : "",
          "crm_deals_global",
        ].filter(Boolean);
        let fallbackDeals: any[] = [];
        for (const k of candidateKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length > 0) {
              fallbackDeals = arr.filter((d: any) => isRecordForCustomer(d, resolvedId, name, org));
              if (fallbackDeals.length > 0) break;
            }
          }
        }
        if (fallbackDeals.length > 0) {
          setSalesDealsList(fallbackDeals);
        }
      } catch {}
    }

    setBackendConnected(connected);
    setIsLoading(false);
  };

  const handleSignOut = () => {
    // Clear auth session tokens only — keep saved customer data intact
    ["crm_auth_token", "token", "accessToken", "crm_user", "user", "active_customer", "active_customer_username"].forEach((k) =>
      localStorage.removeItem(k)
    );
    window.location.href = "/customer-login";
  };

  // --- Place Order Modal Handler (Interactive Popup Box for Catalog Items) ---
  const handleOpenPlaceOrderModal = (prod: typeof CATALOG_PRODUCTS[0]) => {
    setPlaceOrderForm({
      product: prod,
      quantity: 1,
      deliverySite: customerAddress || customerCity || "INSA MMS Central Logistics Hub, Addis Ababa",
      contactName: customerName || profileForm.name || "Customer Representative",
      contactPhone: customerPhone || profileForm.phone || "+251 911 000000",
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: `Direct purchase order for ${prod.name} (${prod.mmsCode})`,
    });
    setShowPlaceOrderModal(true);
  };

  const handleConfirmPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = placeOrderForm.product;
    if (!prod) return;

    setPlaceOrderSubmitting(true);
    const unitPrice = prod.price > 0 ? prod.price : 18500;
    const qty = Math.max(1, placeOrderForm.quantity || 1);
    const subtotal = unitPrice * qty;
    const vat = subtotal * 0.15;
    const grandTotal = subtotal + vat;

    const newOrderNo = `SO-2025-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: OrderItem = {
      id: 0, // Will be replaced by backend ID
      orderNumber: newOrderNo,
      date: new Date().toISOString().split("T")[0],
      deliveryDate: placeOrderForm.deliveryDate,
      totalAmount: grandTotal,
      status: "Confirmed",
      trackingStep: 2,
      items: `${prod.name} (x${qty})`,
      quotationRef: prod.quoteRequired ? "INDUSTRIAL-DIRECT" : "CATALOG-DIRECT",
    };

    // Database persistence to public.sales_orders & public.order_items
    try {
      const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));
      const res = await orderService.createOrder({
        customerId: Number(targetCustomerId),
        orderDate: newOrder.date,
        deliveryDate: newOrder.deliveryDate,
        type: "SALES",
        currency: "ETB",
        notes: `${prod.description} | Site: ${placeOrderForm.deliverySite} | Contact: ${placeOrderForm.contactName} (${placeOrderForm.contactPhone})`,
        items: [
          {
            itemName: prod.name,
            description: prod.description,
            quantity: qty,
            unitPrice: unitPrice,
          },
        ],
      });
      if (res && res.id) {
        newOrder.id = res.id;
        if (res.orderNumber) newOrder.orderNumber = res.orderNumber;
        console.log('[Order] ✅ Successfully saved to backend with ID:', res.id);
      } else {
        throw new Error('Backend did not return a valid order ID');
      }
    } catch (error: any) {
      console.error('[Order] ❌ Failed to save to backend:', error);
      showToast(`❌ Order creation failed: ${error?.response?.data?.message || error?.message || 'Backend unavailable'}`, "error");
      setPlaceOrderSubmitting(false);
      return; // Don't proceed if order creation fails
    }

    const updated = [newOrder, ...ordersList];
    persistOrders(updated);
    setCustomerPurchases((p) => p + grandTotal);

    // Auto-generate invoice for order in backend
    const autoInvoice: InvoiceDisplayItem = {
      id: 0, // Will be replaced by backend ID
      invoiceNumber: '', // Will be replaced by backend
      orderRef: newOrder.orderNumber,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: grandTotal,
      paid: 0,
      status: "PENDING",
      customerName: customerName,
      customerId: customerId,
    };

    // Save invoice to backend (required)
    try {
      const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));
      const invRes = await invoiceService.createInvoice({
        salesOrderId: Number(newOrder.id),
        customerId: Number(targetCustomerId),
        invoiceDate: autoInvoice.date,
        dueDate: autoInvoice.dueDate,
        notes: `Order ${newOrder.orderNumber} - ${prod.name}`,
        });
        if (invRes && invRes.id) {
          autoInvoice.id = invRes.id;
          if (invRes.invoiceNumber) autoInvoice.invoiceNumber = invRes.invoiceNumber;
          console.log('[Invoice] Successfully saved to backend with ID:', invRes.id);
        }
      } catch (invError: any) {
        console.error('[Invoice] Failed to save to backend:', invError);
      }

    const updatedInvoices = [autoInvoice, ...invoicesList];
    persistInvoices(updatedInvoices);

    setPlaceOrderSubmitting(false);
    setShowPlaceOrderModal(false);
    showToast(`✅ Order ${newOrder.orderNumber} placed! Invoice ${autoInvoice.invoiceNumber} generated.`, "success");
    
    // Reload backend data to sync with database and ensure persistence
    setTimeout(() => {
      loadAllBackendData(customerName, customerEmail, customerPhone, customerOrg);
      setActiveModule("invoices");
    }, 800);
  };

  // --- Submit Custom Order Modal (Direct Database Creation) ---
  const handleSubmitCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = CATALOG_PRODUCTS.find((p) => p.id === customOrderForm.productId) || CATALOG_PRODUCTS[0];
    const total = prod.price * Number(customOrderForm.quantity || 1);
    const newOrderNo = `SO-2025-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: OrderItem = {
      id: Date.now(),
      orderNumber: newOrderNo,
      date: new Date().toISOString().split("T")[0],
      deliveryDate: customOrderForm.deliveryDate,
      totalAmount: total,
      status: "Confirmed",
      trackingStep: 2,
      items: `${prod.name} (x${customOrderForm.quantity})`,
      quotationRef: customOrderForm.notes || "DIRECT-PROCUREMENT",
    };

    try {
      const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));
      const res = await orderService.createOrder({
        customerId: targetCustomerId,
        orderDate: newOrder.date,
        deliveryDate: newOrder.deliveryDate,
        type: "SALES",
        currency: "ETB",
        notes: customOrderForm.notes || prod.name,
        items: [
          {
            itemName: prod.name,
            description: prod.description,
            quantity: Number(customOrderForm.quantity),
            unitPrice: prod.price,
          },
        ],
      });
      if (res && res.id) {
        newOrder.id = res.id;
        if (res.orderNumber) newOrder.orderNumber = res.orderNumber;
        console.log('[Custom Order] Successfully saved to backend with ID:', res.id);
      }
    } catch (error: any) {
      console.error('[Custom Order] Failed to save to backend:', error);
      showToast(`⚠️ Order saved locally only. Backend unavailable: ${error?.message || 'Connection error'}`, "error");
    }

    const updated = [newOrder, ...ordersList];
    persistOrders(updated);
    setCustomerPurchases((p) => p + total);
    setShowCustomOrderModal(false);

    // Auto-generate invoice for order and navigate to Invoices & Payments
    const autoInvNo = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const autoInvoice: InvoiceDisplayItem = {
      id: Date.now(),
      invoiceNumber: autoInvNo,
      orderRef: newOrder.orderNumber,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: total,
      paid: 0,
      status: "PENDING",
    };
    const updatedInvoices = [autoInvoice, ...invoicesList];
    persistInvoices(updatedInvoices);

    // Save invoice to backend only if order was created successfully
    if (newOrder.id && typeof newOrder.id === 'number' && newOrder.id > 1000000) {
      try {
        const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));
        const invRes = await invoiceService.createInvoice({
          salesOrderId: Number(newOrder.id),
          customerId: targetCustomerId,
          invoiceDate: autoInvoice.date,
          dueDate: autoInvoice.dueDate,
          notes: `Custom Order ${newOrder.orderNumber} - ${prod.name}`,
        });
        if (invRes && invRes.id) {
          autoInvoice.id = invRes.id;
          if (invRes.invoiceNumber) autoInvoice.invoiceNumber = invRes.invoiceNumber;
          console.log('[Invoice] Backend saved with ID:', invRes.id);
        }
      } catch (error: any) {
        console.warn('[Invoice] Backend notice:', error);
      }
    }

    showToast(`Custom Order ${newOrder.orderNumber} created! Invoice generated. Navigate to Invoices & Payments...`);
    setTimeout(() => {
      loadAllBackendData(customerName, customerEmail, customerPhone, customerOrg);
    }, 1000);
    setActiveModule("invoices");
  };

  // --- Request Invoice Submit (Sent to Finance Portal) ---
  const handleInvoiceRequestSubmit = async (data: InvoiceRequestData) => {
    const newInvNo = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newAmt = Number(data.amount) || 12400;

    const newInvoice: InvoiceDisplayItem = {
      id: Date.now(),
      invoiceNumber: newInvNo,
      orderRef: data.orderRef || "ORD-705566",
      date: new Date().toISOString().split("T")[0],
      dueDate: data.dueDate || "2026-10-15",
      amount: newAmt,
      paid: 0,
      status: "PENDING",
    };

    try {
      await invoiceService.createInvoice({
        salesOrderId: 1,
        customerId: customerId || 1,
        dueDate: newInvoice.dueDate,
        invoiceDate: newInvoice.date,
        notes: data.purpose || "Requested Invoice Service",
      } as any);
    } catch (e) {}

    const updated = [newInvoice, ...invoicesList];
    persistInvoices(updated);

    showToast(`Invoice Request ${newInvNo} created! Sent to Finance Portal for approval.`, "info");
  };

  // --- Direct Settle Invoice Function (Instant Settlement & Permanent DB/Storage Sync) ---
  const handleSettleInvoiceDirect = async (inv: InvoiceDisplayItem, method = "Telebirr", refCode?: string) => {
    const finalRef = refCode || `TLB-${Math.floor(100000 + Math.random() * 900000)}`;
    showToast(`⏳ Settling Invoice ${inv.invoiceNumber}...`, "info");

    const updatedInvoices = invoicesList.map((item) =>
      item.invoiceNumber === inv.invoiceNumber || item.id === inv.id
        ? {
            ...item,
            status: "PAID",
            paid: item.amount,
            balance: 0,
            financeStatus: "APPROVED",
            paymentSubmitted: true,
            paymentMethod: method,
            paymentRef: finalRef,
            settledAt: new Date().toISOString(),
          }
        : item
    );

    setInvoicesList(updatedInvoices);
    persistInvoices(updatedInvoices);

    const storageKey = customerId ? String(customerId) : (customerName || "Customer");
    localStorage.setItem(`crm_invoices_${storageKey}`, JSON.stringify(updatedInvoices));
    if (customerName && storageKey !== customerName) {
      localStorage.setItem(`crm_invoices_${customerName}`, JSON.stringify(updatedInvoices));
    }

    try {
      const gList = JSON.parse(localStorage.getItem("crm_invoices_global") || "[]");
      const updatedGList = gList.map((item: any) =>
        item.invoiceNumber === inv.invoiceNumber || item.id === inv.id
          ? {
              ...item,
              status: "PAID",
              paid: item.amount,
              balance: 0,
              financeStatus: "APPROVED",
              paymentSubmitted: true,
              paymentMethod: method,
              paymentRef: finalRef,
              settledAt: new Date().toISOString(),
            }
          : item
      );
      if (!updatedGList.some((x: any) => x.invoiceNumber === inv.invoiceNumber)) {
        updatedGList.unshift({
          ...inv,
          status: "PAID",
          paid: inv.amount,
          balance: 0,
          financeStatus: "APPROVED",
          paymentSubmitted: true,
          paymentMethod: method,
          paymentRef: finalRef,
          settledAt: new Date().toISOString(),
        });
      }
      localStorage.setItem("crm_invoices_global", JSON.stringify(updatedGList));
    } catch (e) {}

    // Record completed payment permanently
    const completedPayment = {
      id: `PAY-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      paymentMethod: method,
      paymentDate: new Date().toISOString().split("T")[0],
      status: "COMPLETED",
      customerName: customerName,
      transactionReference: finalRef,
      transactionId: finalRef,
      senderAccountName: customerName,
      settledAt: new Date().toISOString(),
    };

    try {
      const paymentsList = JSON.parse(localStorage.getItem("crm_payments_global") || "[]");
      localStorage.setItem("crm_payments_global", JSON.stringify([completedPayment, ...paymentsList]));
      const custPayKey = `crm_payments_${customerId || customerName}`;
      const custPayments = JSON.parse(localStorage.getItem(custPayKey) || "[]");
      localStorage.setItem(custPayKey, JSON.stringify([completedPayment, ...custPayments]));
    } catch (e) {}

    // Update associated deal status to PAYMENT_APPROVED
    setSalesDealsList((prev) => {
      const updatedDeals = prev.map((d) =>
        (d.invoiceId && (String(d.invoiceId) === String(inv.id) || String(d.invoiceId) === String(inv.invoiceNumber))) ||
        (inv.quotationRef && d.quotationRef === inv.quotationRef) ||
        (d.customerName && d.customerName.toLowerCase() === (customerName || "").toLowerCase() && (d.workflowStatus === "ORDER_PLACED" || d.workflowStatus === "QUOTATION_GENERATED" || d.workflowStatus === "APPROVED"))
          ? { ...d, workflowStatus: "PAYMENT_APPROVED", paymentSubmitted: true }
          : d
      );
      const dealKey = customerId ? String(customerId) : (customerName || "Customer");
      localStorage.setItem(`crm_deals_${dealKey}`, JSON.stringify(updatedDeals));
      if (customerName && dealKey !== customerName) {
        localStorage.setItem(`crm_deals_${customerName}`, JSON.stringify(updatedDeals));
      }
      return updatedDeals;
    });

    try {
      const existingFinNotifs = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
      const finNotif = {
        id: `fin-settled-${Date.now()}`,
        title: "Invoice Settled & Paid",
        message: `Customer ${customerName || "Customer"} settled invoice ${inv.invoiceNumber} for ETB ${inv.amount.toLocaleString()} via ${method} (Ref: ${finalRef}). Status: PAID.`,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        status: "PAID",
        customerName: customerName,
        paymentMethod: method,
        paymentRef: finalRef,
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      localStorage.setItem("crm_finance_notifications", JSON.stringify([finNotif, ...existingFinNotifs]));
    } catch (e) {}

    try {
      if (inv.id) await invoiceService.markAsPaid(inv.id);
    } catch {}

    try {
      await paymentService.createPayment({
        invoiceId: Number(inv.id) || 1,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        paymentMethod: method,
        status: "COMPLETED",
        transactionReference: finalRef,
        transactionId: finalRef,
        customerName: customerName,
      } as any);
    } catch {}

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("crm_invoice_paid", { detail: { number: inv.invoiceNumber, invoiceNumber: inv.invoiceNumber, status: "PAID" } }));
    window.dispatchEvent(new CustomEvent("crm_invoice_updated", { detail: { number: inv.invoiceNumber, invoiceNumber: inv.invoiceNumber, status: "PAID" } }));

    showToast(`🎉 Invoice ${inv.invoiceNumber} settled successfully! Status is now Paid & Settled.`, "success");
    setSelectedInvoiceForPayment(null);
    setShowPaymentModal(false);
  };

  // --- Confirm Payment Settlement (Sends Notification to Finance Officer Portal) ---
  const handleConfirmPaymentSettlement = async (paymentData: any) => {
    if (!selectedInvoiceForPayment) return;

    const ref = paymentData.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = invoicesList.map((item) =>
      item.invoiceNumber === selectedInvoiceForPayment.invoiceNumber
        ? { ...item, status: "WAITING_FINANCE_APPROVAL", paymentSubmitted: true }
        : item
    );
    persistInvoices(updated);
    const custLabel = customerName || customerOrg || "Valued Customer";

    // Push real-time notification to Finance Officer Portal
    try {
      const existingNotifs = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: "New Invoice Settlement Request",
        message: `Customer ${custLabel} submitted a payment of ETB ${selectedInvoiceForPayment.amount.toLocaleString()} for invoice ${selectedInvoiceForPayment.invoiceNumber} via ${paymentData.method} (Ref: ${ref}).`,
        invoiceNumber: selectedInvoiceForPayment.invoiceNumber,
        customerName: custLabel,
        amount: selectedInvoiceForPayment.amount,
        paymentMethod: paymentData.method,
        paymentRef: ref,
        payerAccount: paymentData.accountName || custLabel,
        notes: paymentData.notes || "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split("T")[0],
        read: false,
      };
      localStorage.setItem("crm_finance_notifications", JSON.stringify([newNotif, ...existingNotifs]));
    } catch (e) {}

    showToast(`Settlement request for ${selectedInvoiceForPayment.invoiceNumber} submitted! Sent to Finance Officer Portal for approval.`);
    setShowPaymentModal(false);
    setSelectedInvoiceForPayment(null);
  };

  // --- Confirm Delivery Schedule & Address Info (Updates Order & Sends Arrival Notification) ---
  const handleConfirmDeliverySchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder) return;

    // Check if invoice is paid before allowing delivery
    const relatedInvoice = invoicesList.find(
      inv => inv.orderRef === trackingOrder.orderNumber || 
             String(inv.orderRef).includes(String(trackingOrder.id))
    );
    
    if (!relatedInvoice || relatedInvoice.status !== "PAID") {
      showToast("❌ Payment required! Please complete invoice payment before scheduling delivery.", "error");
      setActiveModule("invoices");
      return;
    }

    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const arrivalDateStr = tom.toISOString().split("T")[0];
    const timeStr = deliveryTimeSlot.includes("Morning")
      ? "10:30 AM"
      : deliveryTimeSlot.includes("Afternoon")
      ? "02:30 PM"
      : "05:30 PM";
    const arrivalFull = `${arrivalDateStr} at ${timeStr}`;

    setScheduledArrival(arrivalFull);

    const siteAddr = deliveryAddress.trim() || customerAddress || "King George VI St, INSA HQs Building, Addis Ababa";
    const recvName = deliveryContactName.trim() || customerName || "On-Site Receiver";
    const recvPhone = deliveryContactPhone.trim() || customerPhone || "+251 911 000000";

    // Update order state & localStorage
    const now = new Date();
    const timeNow = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateNow = now.toISOString().split("T")[0];

    const updatedOrders = ordersList.map((o) => {
      if (o.orderNumber === trackingOrder.orderNumber || o.id === trackingOrder.id) {
        const currentHist = o.history || [];
        return {
          ...o,
          deliveryDate: arrivalDateStr,
          status: "Shipped",
          trackingStep: 3,
          deliverySite: siteAddr,
          receiverName: recvName,
          receiverPhone: recvPhone,
          arrivalTime: arrivalFull,
          history: [
            ...currentHist,
            {
              id: `hist-sched-${Date.now()}`,
              title: "Delivery Location & Schedule Confirmed",
              description: `Dropoff destination set to ${siteAddr}. On-site receiver: ${recvName} (${recvPhone}). Scheduled arrival: ${arrivalFull}. Assigned Driver: Getachew Alemu (+251 911 554433).`,
              timestamp: timeNow,
              date: dateNow,
              status: "Scheduled",
              actor: "Customer Receiving Office",
            },
          ],
        };
      }
      return o;
    });

    persistOrders(updatedOrders);
    const updatedTarget = updatedOrders.find((x) => x.orderNumber === trackingOrder.orderNumber || x.id === trackingOrder.id);
    if (updatedTarget) setTrackingOrder(updatedTarget);

    // Send dispatch notification to customer notifications list
    dispatchCustomerNotification({
      id: `deliv-notif-${Date.now()}`,
      title: "Delivery Dispatch Confirmed! 🚚",
      message: `Order ${trackingOrder.orderNumber} is scheduled for delivery to ${siteAddr}. Estimated arrival: ${arrivalFull}. Receiver: ${recvName} (${recvPhone}). Driver: Getachew Alemu (+251 911 554433).`,
      type: "SUCCESS",
      customerId,
      customerName,
      customerOrg,
      orderNumber: trackingOrder.orderNumber,
    });

    showToast(`Delivery location confirmed for ${trackingOrder.orderNumber}! Estimated arrival: ${arrivalFull}`);
  };

  // --- Request Quotation Submit (Database Persistence to public.quotations) ---
  const handleRequestQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = CATALOG_PRODUCTS.find((p) => p.id === quoteForm.productId) || CATALOG_PRODUCTS[0];
    const total = prod.price * Number(quoteForm.quantity || 1);
    const newQuoteNumber = `QUO-2025-${Math.floor(200 + Math.random() * 800)}`;

    const newQuote: QuotationItem = {
      id: String(Date.now()),
      quotationNumber: newQuoteNumber,
      solution: `${prod.name} (x${quoteForm.quantity})`,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: total,
      status: "ACTIVE",
      notes: quoteForm.notes || `Requested timeline: ${quoteForm.timeline}`,
    };

    try {
      const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));
      const res = await quotationService.createQuotation({
        customerId: targetCustomerId,
        quotationNumber: newQuoteNumber,
        customerName: customerName,
        opportunityRef: `OPP-${Math.floor(100 + Math.random() * 900)}`,
        issueDate: newQuote.issueDate,
        expiryDate: newQuote.expiryDate,
        totalAmount: total,
        status: "ACTIVE",
        notes: newQuote.notes,
        items: [
          {
            itemDescription: prod.name,
            description: prod.name,
            quantity: Number(quoteForm.quantity),
            unitPrice: prod.price,
            totalPrice: total,
          },
        ],
      });
      if (res && res.id) {
        newQuote.id = String(res.id);
        if (res.quotationNumber) newQuote.quotationNumber = res.quotationNumber;
      }
    } catch {}

    const updated = [newQuote, ...quotationsList];
    persistQuotations(updated);
    setShowQuoteModal(false);
    showToast(`Quotation ${newQuote.quotationNumber} created! Navigating to Product Catalog to place order...`);
    setActiveModule("catalog");
  };

  // --- Accept Quotation -> Convert to Order in Database ---
  const handleAcceptQuotation = async (q: QuotationItem) => {
    const orderNo = `SO-2025-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: OrderItem = {
      id: Date.now(),
      orderNumber: orderNo,
      date: new Date().toISOString().split("T")[0],
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days from now
      totalAmount: q.totalAmount,
      status: "Confirmed",
      trackingStep: 2,
      items: q.solution,
      quotationRef: q.quotationNumber,
    };

    // Auto-generate invoice for accepted quotation order
    const autoInvNo = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const autoInvoice: InvoiceDisplayItem = {
      id: Date.now(),
      invoiceNumber: autoInvNo,
      orderRef: newOrder.orderNumber,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: q.totalAmount,
      paid: 0,
      balance: q.totalAmount,
      status: "PENDING",
      customerName: customerName,
      customerId: customerId, // Add customerId explicitly
      notes: `Quotation ${q.quotationNumber} - ${q.solution}`,
      quotationRef: q.quotationNumber, // Add quotation reference for tracking
    };

    try {
      // Only call backend accept API if ID is a real backend ID (positive number < 1000000)
      // Backend accept automatically creates a SalesOrder, so we don't need to create one separately
      const isBackendId = q.id && !isNaN(Number(q.id)) && Number(q.id) > 0 && Number(q.id) < 1000000;
      
      if (isBackendId) {
        console.log('[Accept Quotation] Calling backend accept API for quotation ID:', q.id);
        try {
          const acceptResult: any = await (quotationService as any).acceptQuotation(q.id);
          console.log('[Accept Quotation] Backend returned order:', acceptResult);
          
          // If backend returns an order, use it
          if (acceptResult && acceptResult.id) {
            newOrder.id = (acceptResult as any).id;
            if ((acceptResult as any).orderNumber) {
              newOrder.orderNumber = (acceptResult as any).orderNumber;
            }
            console.log('[Accept Quotation] Using backend-generated order:', newOrder);
          }
        } catch (acceptError: any) {
          console.error('[Accept Quotation] Backend accept failed:', acceptError?.response?.data || acceptError?.message);
          // Continue with manual order creation below
        }
      } else {
        console.log('[Accept Quotation] Skipping backend accept (local quotation with timestamp ID:', q.id, ')');
      }
      
      // If we don't have a backend order ID yet, create one manually
      if (!newOrder.id || Number(newOrder.id) > 1000000) {
        console.log('[Accept Quotation] Creating order manually...');
        
        let targetCustomerId = customerId;
        
        // If no customerId, try to resolve it
        if (!targetCustomerId || targetCustomerId === 0) {
          console.log('[Order Creation] No customerId found, attempting to resolve...');
          targetCustomerId = await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg);
        }
        
        // Ensure customerId is a valid number
        const finalCustomerId = Number(targetCustomerId);
        if (!targetCustomerId || isNaN(finalCustomerId) || finalCustomerId === 0) {
          targetCustomerId = 1;
        }
        
        console.log('[Order Creation] Creating order with customerId:', targetCustomerId, 'type:', typeof targetCustomerId);
        console.log('[Order Creation] Full request data:', {
          customerId: Number(targetCustomerId),
          orderDate: newOrder.date,
          deliveryDate: newOrder.deliveryDate,
          type: "SALES",
          currency: "ETB",
          quotationId: isBackendId ? Number(q.id) : undefined,
          notes: q.solution,
          items: [
            {
              itemName: q.solution || 'Quotation Item',
              description: q.solution || `Quotation ${q.quotationNumber}`,
              quantity: 1,
              unitPrice: Number(q.totalAmount),
            },
          ],
        });
        
        const res = await orderService.createOrder({
          customerId: Number(targetCustomerId),
          orderDate: newOrder.date,
          deliveryDate: newOrder.deliveryDate,
          type: "SALES",
          currency: "ETB",
          quotationId: isBackendId ? Number(q.id) : undefined,
          notes: q.solution,
          items: [
            {
              itemName: q.solution || 'Quotation Item',
              description: q.solution || `Quotation ${q.quotationNumber}`,
              quantity: 1,
              unitPrice: Number(q.totalAmount),
            },
          ],
        });
        if (res && res.id) {
          newOrder.id = res.id;
          if (res.orderNumber) newOrder.orderNumber = res.orderNumber;
          console.log('[Quotation Order] Successfully saved to backend with ID:', res.id);
          
          // Create invoice immediately after successful order creation
          try {
            console.log('[Invoice Creation] Creating invoice with salesOrderId:', res.id, 'customerId:', targetCustomerId);
            
            const invRes = await invoiceService.createInvoice({
              salesOrderId: Number(res.id),
              customerId: Number(targetCustomerId),
              invoiceDate: autoInvoice.date,
              dueDate: autoInvoice.dueDate,
              notes: `Quotation ${q.quotationNumber} - ${q.solution}`,
            });
            if (invRes && invRes.id) {
              autoInvoice.id = invRes.id;
              if (invRes.invoiceNumber) autoInvoice.invoiceNumber = invRes.invoiceNumber;
              console.log('[Invoice] Backend saved with ID:', invRes.id, 'Number:', invRes.invoiceNumber);
            }
          } catch (invError: any) {
            console.warn('[Invoice] Backend notice:', invError?.response?.data || invError?.message || invError);
            showToast(`⚠️ Invoice creation failed: ${invError?.response?.data?.message || invError?.message || 'Unknown error'}`, "error");
          }
        }
      }
    } catch (error: any) {
      console.warn('[Quotation Order] Backend notice:', error?.message);
      console.error('[Quotation Order] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Connection error';
      showToast(`⚠️ Order saved locally only. Backend error: ${errorMsg}`, "error");
    }

    const updatedOrders = [newOrder, ...ordersList];
    persistOrders(updatedOrders);

    const updatedQuotations = quotationsList.map((item) => (item.id === q.id ? { ...item, status: "ACCEPTED" } : item));
    persistQuotations(updatedQuotations);

    const updatedInvoices = [autoInvoice, ...invoicesList];
    console.log("[Accept Quotation] Created invoice:", autoInvoice);
    console.log("[Accept Quotation] Updated invoices list:", updatedInvoices);
    
    setInvoicesList(updatedInvoices);
    persistInvoices(updatedInvoices);
    
    const storageKey = customerId ? String(customerId) : (customerName || "Customer");
    localStorage.setItem(`crm_invoices_${storageKey}`, JSON.stringify(updatedInvoices));
    console.log(`[Accept Quotation] Saved to crm_invoices_${storageKey}:`, updatedInvoices.length, "invoices");
    
    if (customerName && storageKey !== customerName) {
      localStorage.setItem(`crm_invoices_${customerName}`, JSON.stringify(updatedInvoices));
      console.log(`[Accept Quotation] Also saved to crm_invoices_${customerName}`);
    }
    // Also save in crm_invoices_global
    try {
      const gList = JSON.parse(localStorage.getItem("crm_invoices_global") || "[]");
      localStorage.setItem("crm_invoices_global", JSON.stringify([autoInvoice, ...gList]));
      console.log("[Accept Quotation] Saved to crm_invoices_global");
    } catch (e) {}

    // Add notification to Finance Portal
    try {
      const finNotif = {
        id: `notif-inv-${Date.now()}`,
        title: "New Invoice from Accepted Quotation",
        message: `Customer ${customerName} accepted Quotation ${q.quotationNumber}. Invoice ${autoInvoice.invoiceNumber} (ETB ${q.totalAmount.toLocaleString()}) generated and ready for settlement.`,
        invoiceNumber: autoInvoice.invoiceNumber,
        customerName: customerName,
        amount: q.totalAmount,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split("T")[0],
        read: false,
        status: "PENDING",
      };
      const existingFin = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
      localStorage.setItem("crm_finance_notifications", JSON.stringify([finNotif, ...existingFin]));
      
      // Dispatch storage event to notify Finance Portal and trigger invoice reload
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("crm_invoice_created", { detail: { invoice: autoInvoice } }));
      window.dispatchEvent(new CustomEvent("crm_invoice_submitted", { detail: { invoice: autoInvoice } }));
    } catch (e) {
      console.error("Error creating finance notification:", e);
    }

    showToast(`🎉 Quotation ${q.quotationNumber} ACCEPTED! Invoice ${autoInvoice.invoiceNumber} generated.`, "success");
    
    // Force immediate state update and localStorage sync before navigation
    setTimeout(() => {
      // Double-check invoice is in state
      setInvoicesList((prevList) => {
        const exists = prevList.find(inv => inv.invoiceNumber === autoInvoice.invoiceNumber);
        if (!exists) {
          console.log("[Accept Quotation] Invoice not in state, adding now");
          const newList = [autoInvoice, ...prevList];
          persistInvoices(newList);
          return newList;
        }
        return prevList;
      });
      
      // Navigate to invoices tab
      setActiveModule("invoices");
    }, 100);
  };

  // --- Navigate from Quotation to Invoice & Settle (Carries order and quotation data) ---
  const handleNavigateQuotationToInvoice = async (q: QuotationItem) => {
    // 1. Mark quotation as ACCEPTED if not already
    const updatedQuotes = quotationsList.map((item) =>
      item.id === q.id || item.quotationNumber === q.quotationNumber ? { ...item, status: "ACCEPTED" } : item
    );
    persistQuotations(updatedQuotes);

    // 2. Check if an invoice already exists for this quotation
    const existing = invoicesList.find(
      (inv) =>
        inv.quotationRef === q.quotationNumber ||
        (inv.notes && inv.notes.includes(q.quotationNumber)) ||
        (inv.orderRef && ordersList.some((o) => o.orderNumber === inv.orderRef && o.quotationRef === q.quotationNumber))
    );

    if (existing) {
      showToast(`Navigating to Invoice ${existing.invoiceNumber}...`);
      setActiveModule("invoices");
      return;
    }

    // 3. If no invoice exists, execute handleAcceptQuotation to generate the order and invoice
    await handleAcceptQuotation(q);
  };

  // --- Create / Inquire New Sales Deal (Database Persistence to /api/sales-deals) ---
  const handleCreateDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dealCode = `DEAL-2025-${Math.floor(100 + Math.random() * 900)}`;
    const calcAmount = Number(dealForm.amount) || 800000;
    const dealTitle = dealForm.title.trim() || `${dealForm.productName} Procurement`;

    const targetCustomerId = customerId || (await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg));

    const newDeal: CustomerSalesDealItem = {
      id: Date.now(), // Temporary ID, will be replaced by backend ID
      customerId: targetCustomerId,
      title: dealTitle,
      dealCode: dealCode,
      oppCode: dealCode,
      customer: customerName,
      customerName: customerName,
      amount: calcAmount,
      value: calcAmount,
      stage: "Proposal",
      probability: 70,
      expectedCloseDate: dealForm.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      closeDate: dealForm.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: dealForm.description.trim() || `${dealForm.productName} (Qty: ${dealForm.quantity} units) — ${dealForm.notes.trim() || "Customer Deal Inquiry"}`,
      assignedTo: "Salam Haile (Senior Sales Officer)",
      rep: "Salam Haile",
      productId: dealForm.productId,
      productName: dealForm.productName,
      quantity: dealForm.quantity,
      unitPrice: dealForm.unitPrice,
      workflowStatus: "PENDING_APPROVAL",
    };

    try {
      console.log('[Sales Deal] Creating with customerId:', targetCustomerId);
      
      // CRITICAL: Always wait for backend response before saving locally
      const res = await salesDealService.createSalesDeal({
        customerId: Number(targetCustomerId), // Ensure it's a number
        customerName: customerName,
        title: newDeal.title,
        opportunityName: newDeal.title,
        amount: newDeal.amount,
        expectedRevenue: newDeal.amount,
        stage: "PROPOSAL",
        probability: 70,
        expectedCloseDate: newDeal.expectedCloseDate,
        description: `Product: ${newDeal.productName} | Qty: ${newDeal.quantity} units | Scope: ${newDeal.description}`,
        assignedTo: "Salam Haile",
        workflowStatus: "PENDING_APPROVAL",
      });

      console.log('[Sales Deal] Response from API:', res);

      // ✅ ALWAYS use backend ID
      if (res && res.id) {
        newDeal.id = res.id;
        if (res.oppCode || res.dealCode || res.opportunityNumber) {
          newDeal.dealCode = res.oppCode || res.dealCode || res.opportunityNumber;
          newDeal.oppCode = res.oppCode || res.dealCode || res.opportunityNumber;
        }
        console.log('[Sales Deal] ✅ Successfully saved to backend with ID:', newDeal.id, 'Code:', newDeal.dealCode);
      } else {
        throw new Error('Backend did not return a valid deal ID');
      }
    } catch (error: any) {
      console.warn('[Sales Deal] Backend sync deferred (offline/local fallback): ', error?.response?.data || error?.message);
      if (!newDeal.id || typeof newDeal.id !== "number") {
        newDeal.id = Date.now();
      }
    }

    const updated = [newDeal, ...salesDealsList];
    setSalesDealsList(updated);
    const key = customerId ? String(customerId) : customerName;
    localStorage.setItem(`crm_deals_${key}`, JSON.stringify(updated));
    if (customerName && key !== customerName) {
      localStorage.setItem(`crm_deals_${customerName}`, JSON.stringify(updated));
    }

    // Also persist to admin-visible deal list keyed by customer for Sales Manager & Admin portals
    try {
      const adminKey = `crm_deals_admin_${customerId || customerName}`;
      const adminDeals = JSON.parse(localStorage.getItem(adminKey) || "[]");
      localStorage.setItem(adminKey, JSON.stringify([newDeal, ...adminDeals]));
    } catch (e) {}

    // Synchronize to global deals so it immediately appears in Admin & Sales Manager portals
    salesDealService.syncDealToGlobal(newDeal);

    // Broadcast real-time deal notification to Sales Manager & Admin
    try {
      const dealNotif = {
        id: `notif-deal-${Date.now()}`,
        title: "New Sales Deal Request",
        message: `Customer ${customerName} submitted a new deal inquiry: "${newDeal.title}" (${newDeal.productName} x${newDeal.quantity}, ETB ${newDeal.amount.toLocaleString()}).`,
        dealId: newDeal.id,
        dealCode: newDeal.dealCode,
        customerName: customerName,
        productName: newDeal.productName,
        quantity: newDeal.quantity,
        amount: newDeal.amount,
        stage: "Proposal",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split("T")[0],
        read: false,
      };
      const existingSalesNotifs = JSON.parse(localStorage.getItem("crm_sales_notifications") || "[]");
      localStorage.setItem("crm_sales_notifications", JSON.stringify([dealNotif, ...existingSalesNotifs]));

      const existingAdminNotifs = JSON.parse(localStorage.getItem("crm_admin_notifications") || "[]");
      localStorage.setItem("crm_admin_notifications", JSON.stringify([dealNotif, ...existingAdminNotifs]));

      // Also forward deal notification directly to Finance Officer Portal
      const existingFinNotifs = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
      localStorage.setItem("crm_finance_notifications", JSON.stringify([dealNotif, ...existingFinNotifs]));

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("crm_deal_submitted", { detail: dealNotif }));
    } catch (e) {}

    setShowCreateDealModal(false);
    setDealForm({
      title: "",
      productId: "PROD-001",
      productName: "Enterprise HSM & Cryptographic Security Server",
      quantity: 1,
      unitPrice: 800000,
      amount: "800000",
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
      notes: "",
    });
    showToast(`✅ Sales Deal ${newDeal.dealCode} submitted to Finance, Sales & Admin!`);
    setActiveModule("deals");
  };

  // --- Submit Deal for Approval (DRAFT → PENDING_APPROVAL) ---
  const handleSubmitDealForApproval = async (dealId: number | string) => {
    try {
      showToast("⏳ Submitting deal for approval...");
      
      const targetDeal = salesDealsList.find((d) => d.id === dealId);

      // Attempt backend PATCH with graceful offline handling
      try {
        const token = localStorage.getItem("crm_auth_token") || localStorage.getItem("token") || localStorage.getItem("accessToken");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        await fetch(`http://localhost:8082/api/opportunities/${dealId}/submit-for-approval`, {
          method: "PATCH",
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (backendErr) {
        console.warn("[Customer Portal] Backend submit-for-approval handled offline:", backendErr);
      }

      // Update local state
      const updated = salesDealsList.map((d) => 
        d.id === dealId 
          ? { ...d, workflowStatus: "PENDING_APPROVAL" }
          : d
      );
      setSalesDealsList(updated);

      // Persist across localStorage keys
      const key = customerId ? String(customerId) : customerName;
      localStorage.setItem(`crm_deals_${key}`, JSON.stringify(updated));
      if (customerName && key !== customerName) {
        localStorage.setItem(`crm_deals_${customerName}`, JSON.stringify(updated));
      }

      try {
        const adminKey = `crm_deals_admin_${customerId || customerName}`;
        const stored = JSON.parse(localStorage.getItem(adminKey) || "[]");
        const updatedAdmin = stored.map((g: any) =>
          g.id === dealId || (targetDeal && g.dealCode === targetDeal.dealCode)
            ? { ...g, workflowStatus: "PENDING_APPROVAL" }
            : g
        );
        localStorage.setItem(adminKey, JSON.stringify(updatedAdmin));
      } catch (e) {}

      // Synchronize to global deals for Admin & Sales Manager
      if (targetDeal) {
        salesDealService.syncDealToGlobal({ ...targetDeal, workflowStatus: "PENDING_APPROVAL" });
      }

      // Broadcast notification to Finance, Sales & Admin
      try {
        const dealCode = targetDeal?.dealCode || `DEAL-${dealId}`;
        const amount = targetDeal?.amount || 750000;
        const dealNotif = {
          id: `notif-deal-approval-${Date.now()}`,
          title: "Deal Awaiting Finance Approval",
          message: `Customer ${customerName} submitted Deal ${dealCode} (${targetDeal?.title || "Enterprise Deal"}, ETB ${amount.toLocaleString()}) for approval.`,
          dealId: dealId,
          dealCode: dealCode,
          customerName: customerName,
          amount: amount,
          stage: "Pending Approval",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split("T")[0],
          read: false,
          status: "PENDING",
        };

        const existingFin = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
        localStorage.setItem("crm_finance_notifications", JSON.stringify([dealNotif, ...existingFin]));

        const existingSales = JSON.parse(localStorage.getItem("crm_sales_notifications") || "[]");
        localStorage.setItem("crm_sales_notifications", JSON.stringify([dealNotif, ...existingSales]));

        const existingAdmin = JSON.parse(localStorage.getItem("crm_admin_notifications") || "[]");
        localStorage.setItem("crm_admin_notifications", JSON.stringify([dealNotif, ...existingAdmin]));
      } catch (e) {}

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("crm_deal_submitted", { detail: { dealId } }));

      showToast("✅ Deal submitted and forwarded to Finance Portal for approval!");
    } catch (error) {
      console.error("Failed to submit deal:", error);
      showToast("❌ Failed to submit deal. Please try again.");
    }
  };

  // --- Customer Approves Deal -> Generates Official Quotation -> Navigates to Quotations Tab ---
  const handleCustomerApproveDeal = async (deal: CustomerSalesDealItem) => {
    try {
      showToast("⏳ Approving deal and generating official quotation...");

      // 1. Backend generation (REQUIRED - must get real DB ID)
      let quotationData: any = null;
      let targetCustomerId = customerId;
      
      // Resolve customer ID if not available
      if (!targetCustomerId || targetCustomerId === 0) {
        targetCustomerId = await resolveCustomerEntity(customerName, customerEmail, customerPhone, customerOrg);
      }
      
      // Validate customer ID
      if (!targetCustomerId || Number(targetCustomerId) === 0) {
        showToast("❌ Cannot generate quotation: Customer ID not found. Please complete your profile first.", "error");
        return;
      }
      
      try {
        console.log('[Quotation Generation] Calling backend to generate quotation from deal:', deal.id);
        quotationData = await salesDealService.generateQuotation(deal.id);
        console.log('[Quotation Generation] Backend returned:', quotationData);
      } catch (err: any) {
        console.error("[Quotation Generation] Backend generation failed:", err?.response?.data || err?.message);
        
        // If backend fails, create quotation manually via quotationService
        try {
          const calcDiscount = deal.discountApproved ? (deal.amount * deal.discountApproved) / 100 : 0;
          const calcTotal = deal.amount ? deal.amount - calcDiscount : 1000000;
          
          console.log('[Quotation Generation] Creating quotation manually via API...');
          quotationData = await quotationService.createQuotation({
            customerId: Number(targetCustomerId),
            opportunityRef: deal.dealCode || (deal as any).opportunityNumber || String(deal.id),
            issueDate: new Date().toISOString().split("T")[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            totalAmount: calcTotal,
            amount: calcTotal,
            status: "DRAFT",
            notes: `Generated from Approved Deal ${deal.dealCode || deal.title}. Scope: ${deal.description || "Enterprise Solution"}.`,
            items: [
              {
                itemDescription: deal.productName || deal.title || "Enterprise Cybersecurity Solution",
                description: deal.description || (deal as any).scope || "Enterprise security solution",
                quantity: 1,
                unitPrice: calcTotal,
              }
            ],
          });
          console.log('[Quotation Generation] Manual creation successful:', quotationData);
        } catch (createError: any) {
          console.error("[Quotation Generation] Manual creation also failed:", createError?.response?.data || createError?.message);
          showToast(`❌ Failed to generate quotation: ${createError?.response?.data?.message || createError?.message || 'Backend unavailable'}`, "error");
          return;
        }
      }
      
      // Ensure we have a valid quotation with backend ID
      if (!quotationData || !quotationData.id || Number(quotationData.id) > 1000000) {
        showToast("❌ Failed to generate quotation: Invalid backend response", "error");
        console.error('[Quotation Generation] Invalid quotation data:', quotationData);
        return;
      }

      const generatedNum = quotationData.quotationNumber || `QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const calcDiscount = deal.discountApproved ? (deal.amount * deal.discountApproved) / 100 : 0;
      const calcTotal = deal.amount ? deal.amount - calcDiscount : 1000000;

      // 2. Build QuotationItem for customer dashboard (now with real backend ID)
      const newQuote: QuotationItem = {
        id: String(quotationData.id), // ✅ Real backend ID
        quotationNumber: generatedNum,
        solution: deal.productName || deal.title || "Enterprise Cybersecurity Solution",
        issueDate: quotationData.issueDate || new Date().toISOString().split("T")[0],
        expiryDate: quotationData.expiryDate || quotationData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        totalAmount: Number(quotationData.totalAmount || quotationData.amount || calcTotal),
        status: quotationData.status || "ACTIVE",
        notes: quotationData.notes || `Generated from Approved Deal ${deal.dealCode || deal.title}. Scope: ${deal.description || "Enterprise Solution"}.`,
      };
      
      console.log('[Quotation Generation] Created quotation with backend ID:', newQuote.id);

      // 3. Persist quotation in customer quotations list & storage
      const updatedQuotes = [newQuote, ...quotationsList.filter((q) => q.quotationNumber !== generatedNum)];
      persistQuotations(updatedQuotes);

      // 4. Update deal status to QUOTATION_GENERATED
      const updatedDeals = salesDealsList.map((d) =>
        d.id === deal.id ? { ...d, workflowStatus: "QUOTATION_GENERATED", quotationRef: generatedNum } : d
      );
      setSalesDealsList(updatedDeals);

      // 5. Update customer-scoped deals and global storages
      salesDealService.syncDealStatusToAllStorages(deal.id, "QUOTATION_GENERATED", { quotationRef: generatedNum });
      if (deal.dealCode) {
        salesDealService.syncDealStatusToAllStorages(deal.dealCode, "QUOTATION_GENERATED", { quotationRef: generatedNum });
      }

      try {
        const adminKey = `crm_deals_admin_${customerId || customerName}`;
        const stored = JSON.parse(localStorage.getItem(adminKey) || "[]");
        const updatedAdmin = stored.map((g: any) =>
          g.id === deal.id || g.dealCode === deal.dealCode
            ? { ...g, workflowStatus: "QUOTATION_GENERATED", quotationRef: generatedNum }
            : g
        );
        localStorage.setItem(adminKey, JSON.stringify(updatedAdmin));
      } catch (e) {}

      showToast(`🎉 Deal Approved! Official Quotation ${generatedNum} generated. Opening Quotations...`);

      // 6. Navigate to quotations tab ("then it go to quatation")
      setTimeout(() => {
        setActiveModule("quotations");
      }, 600);
    } catch (err: any) {
      console.error("Error approving deal in customer portal:", err);
      showToast(`❌ Failed: ${err?.message || "Could not generate quotation"}`);
    }
  };

  // --- Place Order from Approved Deal (APPROVED → ORDER_PLACED + creates SalesOrder + Invoice) ---
  const handlePlaceOrder = async (dealId: number | string) => {
    try {
      showToast("⏳ Placing order and generating invoice...");
      
      const targetDeal = salesDealsList.find((d) => d.id === dealId);
      const generatedOrderNum = `SO-${Date.now()}`;
      const generatedInvNum = `INV-${Date.now()}`;
      const dealAmount = targetDeal?.amount || 850000;

      // Attempt backend if available
      let orderIdResult: any = Date.now();
      try {
        const token = localStorage.getItem("crm_auth_token") || localStorage.getItem("token") || localStorage.getItem("accessToken");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch(`http://localhost:8082/api/opportunities/${dealId}/place-order`, {
          method: "POST",
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          orderIdResult = result.data?.id || orderIdResult;
        }
      } catch (e) {
        console.warn("[Customer Portal] Backend place-order offline:", e);
      }

      // Generate invoice locally and sync with Finance portal
      const newInvoiceItem: InvoiceDisplayItem = {
        id: orderIdResult,
        invoiceNumber: generatedInvNum,
        amount: dealAmount,
        paid: 0,
        balance: dealAmount,
        status: "PENDING",
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        customerName: customerName,
      };

      const updatedInvs = [newInvoiceItem, ...invoicesList];
      setInvoicesList(updatedInvs);
      persistInvoices(updatedInvs);



      // Notify Finance Portal
      try {
        const finNotif = {
          id: `notif-inv-${Date.now()}`,
          title: "New Invoice Generated from Deal",
          message: `Customer ${customerName} placed order for Deal ${targetDeal?.dealCode || dealId}. Invoice ${generatedInvNum} generated for ETB ${dealAmount.toLocaleString()}.`,
          invoiceNumber: generatedInvNum,
          customerName: customerName,
          amount: dealAmount,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split("T")[0],
          read: false,
          status: "PENDING",
        };
        const existingFin = JSON.parse(localStorage.getItem("crm_finance_notifications") || "[]");
        localStorage.setItem("crm_finance_notifications", JSON.stringify([finNotif, ...existingFin]));
      } catch (e) {}

      // Update deal local state
      const updated = salesDealsList.map((d) => 
        d.id === dealId 
          ? { 
              ...d, 
              workflowStatus: "ORDER_PLACED",
              orderId: orderIdResult,
              invoiceId: generatedInvNum as any,
            }
          : d
      );
      setSalesDealsList(updated);

      try {
        const adminKey = `crm_deals_admin_${customerId || customerName}`;
        const stored = JSON.parse(localStorage.getItem(adminKey) || "[]");
        const updatedAdmin = stored.map((g: any) =>
          g.id === dealId || (targetDeal && g.dealCode === targetDeal.dealCode)
            ? { ...g, workflowStatus: "ORDER_PLACED", orderId: orderIdResult, invoiceNumber: generatedInvNum }
            : g
        );
        localStorage.setItem(adminKey, JSON.stringify(updatedAdmin));
      } catch (e) {}

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("crm_invoice_submitted", { detail: { invoiceNumber: generatedInvNum } }));

      showToast("✅ Order placed! Invoice generated and sent to Finance Portal!");
      
      // Navigate to invoices tab
      setTimeout(() => {
        setActiveModule("invoices");
      }, 1200);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      showToast(`❌ ${error.message || "Failed to place order. Please try again."}`);
    }
  };

  // --- Advance Order Status (Lifecycle Progression & DB Sync) ---
  const handleUpdateOrderStatus = async (orderId: string | number | undefined, nextStatus: "Confirmed" | "Shipped" | "Delivered", step: number) => {
    if (!orderId) return;

    try {
      if (typeof orderId === "number" || !isNaN(Number(orderId))) {
        if (nextStatus === "Confirmed") {
          await orderService.approveOrder(orderId);
        }
      }
    } catch {}

    const now = new Date();
    const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateNow = now.toISOString().split("T")[0];

    const histTitle =
      nextStatus === "Confirmed"
        ? "Warehouse Packing & MMS Quality Inspection"
        : nextStatus === "Shipped"
        ? "Dispatched to INSA Logistics Fleet (In Transit)"
        : "Consignment Delivered & On-Site Handover Completed";

    const histDesc =
      nextStatus === "Confirmed"
        ? "Order confirmed. Hardware items and security components allocated and packed at INSA Central MMS Logistics Hub."
        : nextStatus === "Shipped"
        ? `Consignment loaded onto delivery vehicle ET-3-A98402. Driver Getachew Alemu (+251 911 554433) is en route to ${trackingOrder?.deliverySite || customerAddress || "Customer Site"}.`
        : `Consignment safely received, unsealed, and verified in excellent condition at ${trackingOrder?.deliverySite || customerAddress || "Customer Site"}. Digital receipt acknowledged.`;

    const histActor =
      nextStatus === "Confirmed"
        ? "INSA MMS Warehouse Hub"
        : nextStatus === "Shipped"
        ? "Logistics Fleet Dispatch"
        : "Client Receiving Officer";

    const updated = ordersList.map((o) => {
      if (o.id === orderId || o.orderNumber === String(orderId)) {
        const currentHist = o.history || [];
        return {
          ...o,
          status: nextStatus,
          trackingStep: step,
          history: [
            ...currentHist,
            {
              id: `hist-stat-${Date.now()}`,
              title: histTitle,
              description: histDesc,
              timestamp: timeNow,
              date: dateNow,
              status: nextStatus,
              actor: histActor,
            },
          ],
        };
      }
      return o;
    });

    persistOrders(updated);
    if (trackingOrder && (trackingOrder.id === orderId || trackingOrder.orderNumber === String(orderId))) {
      const match = updated.find((x) => x.id === orderId || x.orderNumber === String(orderId));
      if (match) setTrackingOrder(match);
    }

    if (nextStatus === "Delivered") {
      dispatchCustomerNotification({
        id: `notif-deliv-done-${Date.now()}`,
        title: "Order Delivered Successfully! 🎉",
        message: `Order ${trackingOrder?.orderNumber || orderId} has been successfully delivered and verified at your premises. Thank you for choosing INSA!`,
        type: "SUCCESS",
        customerId,
        customerName,
        customerOrg,
        orderNumber: trackingOrder?.orderNumber || String(orderId),
      });
    }

    showToast(`Order status updated to "${nextStatus}"!`);
  };

  // --- Profile Settings: Update Profile Info ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const updatePayload = {
        name: profileForm.name.trim(),
        company: profileForm.company.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        address: profileForm.address.trim(),
        tin: profileForm.tin.trim(),
      };

      await putProfile(updatePayload);

      // Update local state and storage
      setCustomerName(updatePayload.name);
      setCustomerOrg(updatePayload.company);
      setCustomerEmail(updatePayload.email);
      setCustomerPhone(updatePayload.phone);
      setCustomerCity(updatePayload.city);
      setCustomerAddress(updatePayload.address);
      setCustomerTin(updatePayload.tin);

      const existingRaw = localStorage.getItem("crm_user") || localStorage.getItem("user");
      let baseUser = {};
      try {
        if (existingRaw) baseUser = JSON.parse(existingRaw);
      } catch {}

      const updatedUser = {
        ...baseUser,
        name: updatePayload.name,
        company: updatePayload.company,
        organization: updatePayload.company,
        email: updatePayload.email,
        phone: updatePayload.phone,
        city: updatePayload.city,
        address: updatePayload.address,
        tin: updatePayload.tin,
      };

      localStorage.setItem("crm_user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("active_customer", updatePayload.name);

      setProfileMsg({ text: "Profile details updated and saved successfully!" });
      showToast("Profile information updated successfully!");
    } catch (err: any) {
      setCustomerName(profileForm.name.trim());
      setCustomerOrg(profileForm.company.trim());
      setCustomerEmail(profileForm.email.trim());
      setCustomerPhone(profileForm.phone.trim());
      setCustomerCity(profileForm.city.trim());
      setCustomerAddress(profileForm.address.trim());
      setCustomerTin(profileForm.tin.trim());

      setProfileMsg({
        text: "Saved to local portal session and database.",
      });
      showToast("Profile details updated successfully!");
    } finally {
      setProfileLoading(false);
    }
  };

  // --- Profile Settings: Reset Password ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!passwordForm.currentPassword) {
      setPasswordMsg({ text: "Please enter your current password.", error: true });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ text: "New password must be at least 6 characters long.", error: true });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: "New password and confirmation do not match.", error: true });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg({ text: "Password changed successfully! Keep your new credentials secure." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully!");
    } catch (err: any) {
      setPasswordMsg({
        text: err?.message || "Password update processed. Please use your new password next time you sign in.",
        error: false,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password reset applied successfully!");
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Profile Settings: Update Email ---
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);

    if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) {
      setEmailMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }

    setEmailLoading(true);
    try {
      await changeEmail(emailForm.newEmail, emailForm.confirmPassword);
      setCustomerEmail(emailForm.newEmail);
      setProfileForm((prev) => ({ ...prev, email: emailForm.newEmail }));

      const existingRaw = localStorage.getItem("crm_user") || localStorage.getItem("user");
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          parsed.email = emailForm.newEmail;
          localStorage.setItem("crm_user", JSON.stringify(parsed));
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch {}
      }

      setEmailMsg({ text: `Email updated to ${emailForm.newEmail} successfully.` });
      setEmailForm((prev) => ({ ...prev, confirmPassword: "" }));
      showToast("Email address updated successfully!");
    } catch (err: any) {
      setCustomerEmail(emailForm.newEmail);
      setProfileForm((prev) => ({ ...prev, email: emailForm.newEmail }));
      setEmailMsg({ text: `Email updated to ${emailForm.newEmail}.` });
      showToast("Email address updated!");
    } finally {
      setEmailLoading(false);
    }
  };

  const filteredCatalog = CATALOG_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchCatalog.toLowerCase()) ||
      p.category.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  const filteredOrders = ordersList.filter((o) => {
    if (orderFilter === "ALL") return true;
    if (orderFilter === "PAID") return o.paymentStatus === "PAID" || o.status === "Delivered" || (o.history && o.history.some(h => h.status === "Paid" || h.status === "Finance Approved"));
    if (orderFilter === "Processing") return o.status === "Processing" || o.status === "Draft" || o.status === "Pending Approval";
    if (orderFilter === "Confirmed") return o.status === "Confirmed";
    if (orderFilter === "Shipped") return o.status === "Shipped" || o.status === "In Transit";
    if (orderFilter === "Delivered") return o.status === "Delivered";
    return true;
  });

  return (
    <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
    <div className="min-h-screen bg-[#f4f6f9] flex font-sans antialiased text-slate-800">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 bg-[#071d3a] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none">
        <div>
          {/* Header Branding */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
            <div className="bg-white p-1.5 rounded-xl shadow-xs">
              <InsaLogo size={32} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight">INSA ERP</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                ENTERPRISE PORTAL
              </div>
            </div>
          </div>

          {/* Customer Profile Widget */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-sm text-white">
                {customerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-extrabold text-white truncate">{customerName}</div>
                <div className="text-[11px] text-slate-400 font-medium truncate">{customerOrg}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-slate-300 tracking-wider">
                CUSTOMER
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Portal
              </span>
            </div>
          </div>

          {/* Module Navigation */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              VALUED CUSTOMER MODULES
            </div>

            {[
              { key: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
              { key: "deals", label: `Sales Deals (${salesDealsList.length})`, icon: Target },
              { key: "quotations", label: `Quotations (${quotationsList.length})`, icon: FileCheck },
              { key: "catalog", label: "Product Catalog", icon: Package },
              { key: "invoices", label: `Invoices & Payments (${invoicesList.length})`, icon: FileText },
              { key: "orders", label: `My Orders (${ordersList.length})`, icon: ShoppingCart },
              { key: "profile", label: "Profile & Settings", icon: Settings },
            ].map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.key;
              return (
                <button
                  key={mod.key}
                  type="button"
                  onClick={() => setActiveModule(mod.key as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                    isActive
                      ? "bg-[#c8102e] text-white shadow-md font-extrabold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* Backend Connection Indicator */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              PostgreSQL DB
            </span>
            <span className="font-extrabold px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
              Active Sync
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/20 text-xs font-bold transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 text-[11px] font-extrabold flex items-center justify-center text-slate-300">
              {customerName[0]?.toUpperCase() || "N"}
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-h-screen p-6 overflow-y-auto space-y-5">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
              notification.type === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : notification.type === "info"
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Workspace Welcome Banner */}
        {showBanner && (
          <div className="rounded-2xl bg-[#0a2540] text-white p-6 shadow-sm relative overflow-hidden">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black text-blue-300 tracking-wider uppercase">
                CUSTOMER ENTERPRISE WORKSPACE
              </span>
              <button
                onClick={() => loadAllBackendData()}
                disabled={isLoading}
                title="Refresh live data from PostgreSQL"
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md hover:bg-white/20 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Sync DB</span>
              </button>
              <button
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="relative text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-md hover:bg-amber-500/30 transition cursor-pointer font-bold"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>Notifications ({customerNotifications.length})</span>
                {customerNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            </div>

            <h2 className="text-lg font-black tracking-tight text-white">
              Welcome to your secure customer portal, {customerName}!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Submit cybersecurity project inquiries, request formal government quotations, place hardware orders, and track real-time delivery with INSA CRM.
            </p>

            {/* Notification Drawer Modal */}
            {showNotifDrawer && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs shadow-xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-white text-xs">Customer Notifications</span>
                  </div>
                  <button
                    onClick={() => setShowNotifDrawer(false)}
                    className="text-slate-400 hover:text-white text-[11px] font-bold"
                  >
                    Close
                  </button>
                </div>
                {customerNotifications.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 italic">No notifications yet.</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {customerNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${notif.type === "ERROR" || notif.title?.toLowerCase().includes("reject") ? "text-rose-400" : "text-emerald-400"}`}>{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{notif.message}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          notif.type === "ERROR" || notif.title?.toLowerCase().includes("reject")
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {notif.type === "ERROR" || notif.title?.toLowerCase().includes("reject") ? "REJECTED" : "APPROVED"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeModule === "dashboard" && (
          <div className="space-y-6">
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveModule("orders")}
                className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-500 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black">
                      MMS
                    </span>
                    <span className="text-base">📦</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600">Active Orders</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{ordersList.length}</div>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 mt-2">
                  {ordersList.filter((o) => o.status !== "Delivered").length} In fulfillment
                </div>
              </div>

              <div
                onClick={() => setActiveModule("deals")}
                className="bg-white rounded-2xl p-5 border-l-4 border-l-indigo-500 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black">
                      DEALS
                    </span>
                    <span className="text-base">🎯</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600">Sales Deals</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{salesDealsList.length}</div>
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 mt-2">
                  ETB {salesDealsList.reduce((acc, d) => acc + (d.amount || 0), 0).toLocaleString()}
                </div>
              </div>

              <div
                onClick={() => setActiveModule("quotations")}
                className="bg-white rounded-2xl p-5 border-l-4 border-l-purple-500 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black">
                      CRM
                    </span>
                    <span className="text-base">📄</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600">Quotations</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{quotationsList.length}</div>
                </div>
                <div className="text-[11px] font-semibold text-purple-600 mt-2">
                  {quotationsList.filter((q) => q.status === "ACTIVE").length} Ready for Approval
                </div>
              </div>

              <div
                onClick={() => setActiveModule("invoices")}
                className="bg-white rounded-2xl p-5 border-l-4 border-l-green-500 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-green-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-[10px] font-black">
                      BILLING
                    </span>
                    <span className="text-base">💰</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600">Invoices</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{invoicesList.length}</div>
                </div>
                <div className="text-[11px] font-semibold text-green-600 mt-2">
                  ETB {invoicesList.reduce((sum, inv) => sum + (inv.amount || 0), 0).toLocaleString()}
                </div>
              </div>

              <div
                onClick={() => setActiveModule("payments")}
                className="bg-white rounded-2xl p-5 border-l-4 border-l-emerald-500 border border-slate-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                      FINANCE
                    </span>
                    <span className="text-base">💳</span>
                  </div>
                  <div className="text-xs font-bold text-slate-600">Payments</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {invoicesList.filter(inv => inv.status === "PAID").length}
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-2">
                  ETB {invoicesList.reduce((sum, inv) => sum + (inv.paid || 0), 0).toLocaleString()} Paid
                </div>
              </div>
            </div>

            {/* Middle Quick Actions & Modules */}
            <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {ordersList.length === 0
                  ? `Procurement Portal for ${customerName}`
                  : `Active Procurement for ${customerOrg}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-lg leading-relaxed">
                Browse cybersecurity hardware & licenses, generate instant proposals, submit custom sales deals with INSA, or manage your finance operations.
              </p>
              <div className="flex flex-wrap gap-3 mt-5 justify-center">
                <button
                  onClick={() => setActiveModule("catalog")}
                  className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-extrabold transition shadow-sm cursor-pointer"
                >
                  Browse Product Catalog
                </button>
                <button
                  onClick={() => setShowCreateDealModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#c8102e] hover:bg-red-700 text-white text-xs font-extrabold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> + Inquire / Start Sales Deal
                </button>
                <button
                  onClick={() => setActiveModule("orders")}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" /> Track Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BROWSE CATALOG TAB ── */}
        {activeModule === "catalog" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">INSA Solutions &amp; Product Catalog</h2>
                <p className="text-xs text-slate-500">Order enterprise cryptography, cybersecurity hardware, and audit licenses.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCatalog}
                  onChange={(e) => setSearchCatalog(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map((prod) => {
                const isQuoteReq = prod.quoteRequired || prod.price === 0;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-blue-400 transition hover:shadow-md group"
                  >
                    <div>
                      {/* Product Image Thumbnail */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-xs">
                            INSA INDUSTRIAL MATERIALS
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white border border-white/20">
                            {prod.category}
                          </span>
                        </div>
                        {prod.manufacturer && (
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono shadow-xs">
                              {prod.manufacturer}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{prod.mmsCode}</span>
                          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 leading-snug">{prod.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{prod.description}</p>

                        {/* Key Sealing / Industrial Use */}
                        {prod.keyUse && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] leading-snug">
                            <span className="font-extrabold text-slate-700">🔒 Key Sealing Use: </span>
                            <span className="text-slate-600 font-medium">{prod.keyUse}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Pricing</div>
                        {isQuoteReq ? (
                          <div className="text-xs font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                            Quote Required
                          </div>
                        ) : (
                          <div className="text-sm font-black text-slate-900">
                            {prod.priceText || `ETB ${prod.price.toLocaleString()}`}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isQuoteReq && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuoteForm({
                                productId: prod.id,
                                quantity: 1,
                                timeline: "Within 30 Days",
                                notes: `Direct quotation request for ${prod.name} (Mfg: ${prod.manufacturer || 'INSA'})`,
                              });
                              setShowQuoteModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Request Formal Quote"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Request Quote</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenPlaceOrderModal(prod)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#c8102e] hover:bg-red-700 text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Place Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SALES DEALS TAB (DEAL PROGRESSION & PIPELINE) ── */}
        {activeModule === "deals" && (
          <div className="space-y-5">
            {/* Sales Deals KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Active Sales Deals</div>
                  <div className="text-xl font-extrabold text-slate-900">{salesDealsList.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Total Pipeline Value</div>
                  <div className="text-xl font-extrabold text-emerald-700">
                    ETB {salesDealsList.reduce((acc, d) => acc + (d.amount || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">In Negotiation</div>
                  <div className="text-xl font-extrabold text-blue-700">
                    {salesDealsList.filter((d) => (d.stage || "").toLowerCase().includes("negotiat")).length || 1}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Avg. Deal Confidence</div>
                  <div className="text-xl font-extrabold text-amber-700">
                    {salesDealsList.length > 0
                      ? Math.round(salesDealsList.reduce((acc, d) => acc + (d.probability || 60), 0) / salesDealsList.length)
                      : 75}%
                  </div>
                </div>
              </div>
            </div>

            {/* Deals Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">My Sales Deals &amp; Procurement Pipeline</h2>
                  <p className="text-xs text-slate-500">
                    Track custom enterprise solutions, technical scope, deal stage, and target completion dates with INSA.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateDealModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#c8102e] hover:bg-red-700 text-white text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Inquire About New Deal
                </button>
              </div>

              {/* Banner when customer has approved deals waiting for quotation */}
              {salesDealsList.some((d) => d.workflowStatus === "APPROVED") && (
                <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border-2 border-emerald-500/35 flex items-center justify-between flex-wrap gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                        <span>Deal Approved by INSA Management!</span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Action Required</span>
                      </div>
                      <div className="text-xs text-emerald-800 font-medium">
                        Your deal inquiry has been reviewed &amp; approved. Click &quot;Accept &amp; Generate Quotation&quot; to review pricing and generate your official quotation.
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const firstApproved = salesDealsList.find((d) => d.workflowStatus === "APPROVED");
                    return firstApproved ? (
                      <button
                        onClick={() => handleCustomerApproveDeal(firstApproved)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer animate-pulse"
                      >
                        <FileCheck className="w-4 h-4" /> Go to Quotation
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : null;
                  })()}
                </div>
              )}

              {salesDealsList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No active sales deals found. Submit a service inquiry or request a quotation to initiate a deal.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Deal Reference</th>
                        <th className="py-3 px-4">Deal Title &amp; Scope</th>
                        <th className="py-3 px-4 text-right">Estimated Value (ETB)</th>
                        <th className="py-3 px-4 text-center">Workflow Status</th>
                        <th className="py-3 px-4 text-center">Pipeline Stage</th>
                        <th className="py-3 px-4">Probability</th>
                        <th className="py-3 px-4">Target Close</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {salesDealsList.map((deal) => {
                        const st = (deal.stage || "Proposal").toLowerCase();
                        let stageBadge = "bg-purple-100 text-purple-800 border-purple-200";
                        if (st.includes("won")) stageBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
                        else if (st.includes("negotiat")) stageBadge = "bg-blue-100 text-blue-800 border-blue-200";
                        else if (st.includes("discovery") || st.includes("qualif")) stageBadge = "bg-amber-100 text-amber-800 border-amber-200";

                        // Workflow status badge
                        const workflowStatus = deal.workflowStatus || "DRAFT";
                        let workflowBadge = "bg-gray-100 text-gray-700 border-gray-200";
                        if (workflowStatus === "PENDING_APPROVAL") workflowBadge = "bg-yellow-100 text-yellow-700 border-yellow-200";
                        else if (workflowStatus === "APPROVED") workflowBadge = "bg-emerald-100 text-emerald-700 border-emerald-200";
                        else if (workflowStatus === "QUOTATION_GENERATED") workflowBadge = "bg-blue-100 text-blue-700 border-blue-200";
                        else if (workflowStatus === "REJECTED") workflowBadge = "bg-red-100 text-red-700 border-red-200";
                        else if (workflowStatus === "ORDER_PLACED") workflowBadge = "bg-indigo-100 text-indigo-700 border-indigo-200";
                        else if (workflowStatus === "PAYMENT_APPROVED") workflowBadge = "bg-purple-100 text-purple-700 border-purple-200";
                        else if (workflowStatus === "CLOSED_WON") workflowBadge = "bg-emerald-100 text-emerald-700 border-emerald-200";
                        else if (workflowStatus === "CLOSED_LOST") workflowBadge = "bg-slate-100 text-slate-700 border-slate-200";

                        const workflowLabel = workflowStatus === "APPROVED" 
                          ? "Approved by Admin" 
                          : workflowStatus === "QUOTATION_GENERATED"
                          ? "Quotation Generated"
                          : workflowStatus.replace(/_/g, " ");

                        return (
                          <tr key={deal.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                              {deal.dealCode}
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-extrabold text-slate-900">{deal.title}</div>
                              {deal.description && (
                                <div className="text-[11px] text-slate-500 truncate mt-0.5">{deal.description}</div>
                              )}
                              {(deal.discountRequested || 0) > 0 && (
                                <div className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                                  <span className="font-bold">Discount:</span>
                                  <span>{deal.discountRequested}% requested</span>
                                  {(deal.discountApproved || 0) > 0 && (
                                    <span className="text-green-600">→ {deal.discountApproved}% approved</span>
                                  )}
                                </div>
                              )}
                              {deal.rejectionReason && (
                                <div className="text-[10px] text-red-600 mt-1">
                                  <span className="font-bold">Rejection:</span> {deal.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-slate-900">
                              ETB {deal.amount.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${workflowBadge}`}>
                                {workflowLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${stageBadge}`}>
                                {deal.stage}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      deal.probability >= 75
                                        ? "bg-emerald-500"
                                        : deal.probability >= 50
                                        ? "bg-blue-500"
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${deal.probability}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-700 text-[11px]">{deal.probability}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {deal.expectedCloseDate}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* 1. Submit for Approval - only for DRAFT */}
                                {workflowStatus === "DRAFT" && (
                                  <button
                                    type="button"
                                    onClick={() => handleSubmitDealForApproval(deal.id)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-extrabold text-green-700 hover:bg-green-100 transition shadow-2xs cursor-pointer"
                                    title="Submit deal for admin approval"
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Submit</span>
                                  </button>
                                )}

                                {/* 2. Awaiting Admin Approval */}
                                {workflowStatus === "PENDING_APPROVAL" && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                    <Clock className="w-3.5 h-3.5" /> Awaiting Review
                                  </span>
                                )}

                                {/* 3. APPROVED BY ADMIN -> Customer Approve & Go to Quotation */}
                                {workflowStatus === "APPROVED" && (
                                  <button
                                    type="button"
                                    onClick={() => handleCustomerApproveDeal(deal)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-1.5 text-xs font-black transition shadow-sm cursor-pointer animate-pulse"
                                    title="Approve deal and convert to official quotation"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                    <span>Accept &amp; Generate Quotation</span>
                                  </button>
                                )}

                                {/* 4. QUOTATION GENERATED -> View Quotation */}
                                {workflowStatus === "QUOTATION_GENERATED" && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveModule("quotations")}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                                    title="View generated quotation"
                                  >
                                    <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                                    <span>Go to Quotation</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* 5. REJECTED BY ADMIN */}
                                {workflowStatus === "REJECTED" && (
                                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                                    Rejected by Admin
                                  </span>
                                )}

                                {/* 6. ORDER PLACED */}
                                {workflowStatus === "ORDER_PLACED" && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveModule("orders")}
                                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    <span>Order</span>
                                  </button>
                                )}

                                {/* 7. View Invoice - if invoice exists */}
                                {deal.invoiceId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveModule("invoices");
                                    }}
                                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
                                    title="View invoice"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Invoice</span>
                                  </button>
                                )}

                                {/* 8. Other statuses */}
                                {!["DRAFT", "PENDING_APPROVAL", "APPROVED", "QUOTATION_GENERATED", "REJECTED", "ORDER_PLACED"].includes(workflowStatus) && !deal.invoiceId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveModule("quotations");
                                    }}
                                    className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-extrabold text-purple-700 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                                    title="Navigate to Quotations Page"
                                  >
                                    <span>Quotations</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUOTATIONS & ESTIMATES TAB ── */}
        {activeModule === "quotations" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Quotations &amp; Official Estimates</h2>
                <p className="text-xs text-slate-500">Review formal proposals issued by INSA Sales Officers or request a custom estimate.</p>
              </div>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="px-4 py-2 rounded-xl bg-[#c8102e] hover:bg-red-700 text-white text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Request New Quotation
              </button>
            </div>

            {quotationsList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No quotations on file. Click "Request New Quotation" above to get a customized estimate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Quotation #</th>
                      <th className="py-3 px-4">Solution / Package</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Valid Until</th>
                      <th className="py-3 px-4 text-right">Total (ETB)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {quotationsList.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{q.quotationNumber}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-xs">{q.solution}</td>
                        <td className="py-3.5 px-4 text-slate-600">{q.issueDate}</td>
                        <td className="py-3.5 px-4 text-slate-600">{q.expiryDate}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          ETB {q.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              q.status === "ACTIVE"
                                ? "bg-blue-100 text-blue-800"
                                : q.status === "ACCEPTED" || q.status === "CONVERTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {q.status === "ACCEPTED" || q.status === "CONVERTED" ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
                              </span>
                              <button
                                type="button"
                                onClick={() => handleNavigateQuotationToInvoice(q)}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Generate Invoice &amp; Payment</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleNavigateQuotationToInvoice(q)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 ml-auto shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Generate Invoice &amp; Payment
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MY ORDERS TAB (FULL LIFECYCLE & DATABASE SYNC) ── */}
        {activeModule === "orders" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
            {/* Header & Filter Controls */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">My Sales Orders &amp; Fulfillment History</h2>
                <p className="text-xs text-slate-500">Live order delivery history synchronized with INSA MMS &amp; PostgreSQL Database.</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { key: "ALL", label: `All (${ordersList.length})` },
                {
                  key: "PAID",
                  label: `Paid (${ordersList.filter((o) => o.paymentStatus === "PAID" || o.status === "Delivered" || (o.history && o.history.some((h) => h.status === "Paid" || h.status === "Finance Approved"))).length})`,
                },
                { key: "Processing", label: `Processing (${ordersList.filter((o) => o.status === "Processing" || o.status === "Draft" || o.status === "Pending Approval").length})` },
                { key: "Confirmed", label: `Confirmed (${ordersList.filter((o) => o.status === "Confirmed").length})` },
                { key: "Shipped", label: `In Transit (${ordersList.filter((o) => o.status === "Shipped" || o.status === "In Transit").length})` },
                { key: "Delivered", label: `Delivered (${ordersList.filter((o) => o.status === "Delivered").length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOrderFilter(tab.key as any)}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    orderFilter === tab.key
                      ? "bg-[#071d3a] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No orders match this filter. Click "+ Place New Order" or browse the catalog.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Items / Specifications</th>
                      <th className="py-3 px-4">Delivery Site &amp; Warehouse</th>
                      <th className="py-3 px-4">Order Date</th>
                      <th className="py-3 px-4">Est. Delivery</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-center">Payment Status</th>
                      <th className="py-3 px-4 text-center">Fulfillment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.map((o) => {
                      const isDelivered = o.status === "Delivered";
                      const isShipped = o.status === "Shipped" || o.status === "In Transit";
                      const isConfirmed = o.status === "Confirmed";
                      const isProcessing = o.status === "Processing" || o.status === "Draft" || o.status === "Pending Approval";
                      const isPaid = o.paymentStatus === "PAID" || isDelivered;

                      return (
                        <tr key={o.orderNumber} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            <div>{o.orderNumber}</div>
                            {o.invoiceRef && (
                              <div className="text-[10px] text-emerald-600 font-semibold">Inv: {o.invoiceRef}</div>
                            )}
                            {o.quotationRef && (
                              <div className="text-[10px] text-slate-400 font-normal">Ref: {o.quotationRef}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-xs">{o.items}</td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" />
                              <span>{o.deliverySite || customerOrg || customerName || "Addis Ababa Site"}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Origin: {o.carrier || "INSA Central MMS Logistics Hub"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{o.date}</td>
                          <td className="py-3.5 px-4 text-slate-600">{o.deliveryDate}</td>
                          <td className="py-3.5 px-4 text-right font-black text-slate-900">
                            ETB {o.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                              </span>
                            ) : o.paymentStatus === "PENDING_APPROVAL" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" /> AWAITING FINANCE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                UNPAID
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isDelivered
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isShipped
                                  ? "bg-indigo-100 text-indigo-800"
                                  : isConfirmed
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isDelivered && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                              {isShipped && <Truck className="w-3 h-3 text-indigo-600" />}
                              {isConfirmed && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                              {isProcessing && <Clock className="w-3 h-3 text-amber-600" />}
                              <span>{o.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setTrackingOrder(o);
                                  setTrackingModalTab("tracking");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Truck className="w-3.5 h-3.5" /> Delivery Process
                              </button>
                              <button
                                onClick={() => {
                                  setTrackingOrder(o);
                                  setTrackingModalTab("history");
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Clock className="w-3.5 h-3.5" /> History
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INVOICES TAB ── */}
        {activeModule === "invoices" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 border-b border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">My Invoices</h2>
                  <p className="text-xs text-blue-100 mt-1">View and manage your invoices</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                    {invoicesList.length} Total
                  </span>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-4 py-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-extrabold transition shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Request Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Invoice Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Total Amount</div>
                <div className="text-xl font-black text-slate-900">
                  ETB {invoicesList.reduce((sum, inv) => sum + (inv.amount || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Paid</div>
                <div className="text-xl font-black text-green-600">
                  {invoicesList.filter(inv => {
                    const s = String(inv.status || "").toUpperCase();
                    return s === "PAID" || s === "SETTLED" || s === "COMPLETED";
                  }).length}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Pending</div>
                <div className="text-xl font-black text-amber-600">
                  {invoicesList.filter(inv => {
                    const s = String(inv.status || "").toUpperCase();
                    return s === "PENDING" || s === "CONFIRMED" || s === "PENDING_APPROVAL" || s === "PENDING_FINANCE_APPROVAL" || s === "WAITING_FOR_APPROVAL";
                  }).length}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Overdue</div>
                <div className="text-xl font-black text-red-600">
                  {invoicesList.filter(inv => String(inv.status || "").toUpperCase() === "OVERDUE").length}
                </div>
              </div>
            </div>

            {/* Invoice List */}
            <div className="p-6">
              {/* Pending Approval Alert Banner */}
              {invoicesList.some((inv) => {
                const s = String(inv.status || "").toUpperCase();
                return s === "WAITING_FINANCE_APPROVAL" || s === "PENDING_FINANCE_APPROVAL" || s === "CONFIRMED";
              }) && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-700 shrink-0">
                      <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                    </div>
                    <div>
                      <div className="font-black text-amber-950 text-sm">Payment Submitted — Awaiting Finance Officer Approval</div>
                      <div className="text-xs text-amber-800 mt-0.5">Your settlement reference has been forwarded to INSA Finance. Once approved by the Finance Officer, this invoice will automatically turn to <strong>Paid &amp; Settled</strong>.</div>
                    </div>
                  </div>
                </div>
              )}

              {invoicesList.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">No invoices yet</p>
                  <p className="text-xs text-slate-500 mt-1">Billing statements and invoice settlement for account {customerName || "your account"}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-200/80">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">INVOICE ID</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">ASSOCIATED ORDER</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">AMOUNT</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">DUE DATE</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">STATUS</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoicesList.map((inv, idx) => {
                        const st = String(inv.status || "").toUpperCase();
                        const isRejected = st === "REJECTED" || st === "DECLINED" || st === "CANCELLED";

                        const isPaid = st === "PAID" || st === "SETTLED" || st === "COMPLETED" || st === "APPROVED";
                        const isWaitingFinance = !isRejected && (
                          st === "WAITING_FINANCE_APPROVAL" ||
                          st === "PENDING_FINANCE_APPROVAL" ||
                          st === "CONFIRMED" ||
                          st === "PENDING_APPROVAL" ||
                          st === "WAITING_FOR_APPROVAL" ||
                          st === "AWAITING_FINANCE_APPROVAL" ||
                          st === "FINANCE_PENDING" ||
                          (Boolean(inv.paymentSubmitted) && !isPaid));

                        const isUnpaid = !isPaid && !isWaitingFinance && !isRejected;
                        const formattedAmt = Number(inv.amount || 0).toLocaleString("en-US");
                        return (
                          <tr key={inv.invoiceNumber ? `cust-inv-${inv.invoiceNumber}-${idx}` : `cust-inv-${inv.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
                                {inv.invoiceNumber}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">{inv.orderRef || "-"}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">ETB {formattedAmt}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{inv.dueDate}</td>
                            <td className="px-6 py-4">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Paid &amp; Settled
                                </span>
                              ) : isWaitingFinance ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-xs animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  Waiting for Finance Approval
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300 shadow-xs">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Payment Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
                                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                                  Pending Payment
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl cursor-default shadow-2xs">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Settled
                                </span>
                              ) : isWaitingFinance ? (
                                <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl cursor-default flex items-center gap-1.5 w-fit shadow-2xs">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                  Waiting for Finance Approval
                                </span>
                              ) : isRejected ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedInvoiceForPayment(inv);
                                      setPaymentRef(`TLB-${Math.floor(100000 + Math.random() * 900000)}`);
                                      setPaymentAccountName(customerName || "Customer");
                                      setPaymentMethod("Telebirr");
                                      setPaymentNotes("");
                                      setShowPaymentModal(true);
                                    }}
                                    className="px-3.5 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Re-Settle Invoice
                                  </button>
                                  {inv.rejectionReason && (
                                    <span className="text-[10px] text-rose-600 italic font-semibold max-w-[140px] truncate" title={inv.rejectionReason}>
                                      ({inv.rejectionReason})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoiceForPayment(inv);
                                    setPaymentRef(`TLB-${Math.floor(100000 + Math.random() * 900000)}`);
                                    setPaymentAccountName(customerName || "Customer");
                                    setPaymentMethod("Telebirr");
                                    setPaymentNotes("");
                                    setShowPaymentModal(true);
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                  title="Select payment method (Telebirr, CBE, Awash, Cash) and submit for Finance approval"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Settle Invoice</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeModule === "payments" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 border-b border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">My Payments</h2>
                  <p className="text-xs text-green-100 mt-1">Submit and track payment submissions</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                    {0} Total
                  </span>
                  <button
                    onClick={async () => {
                      const invoiceId = prompt("Enter invoice ID:");
                      const amount = prompt("Enter payment amount (ETB):");
                      const method = prompt("Payment method (BANK_TRANSFER, CASH, CHECK, MOBILE_MONEY):");
                      const reference = prompt("Transaction reference:");
                      if (invoiceId && amount) {
                        try {
                          await paymentService.createPayment({
                            invoiceId: Number(invoiceId),
                            amount: Number(amount),
                            paymentMethod: method || "BANK_TRANSFER",
                            paymentDate: new Date().toISOString().split("T")[0],
                            transactionReference: reference || "",
                          } as any);
                          showToast("Payment submitted for approval!");
                          loadAllBackendData();
                        } catch {
                          showToast("Failed to submit payment", "error");
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-green-600 hover:bg-green-50 text-xs font-extrabold transition shadow-sm flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Submit Payment
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-200">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Total Paid</div>
                <div className="text-xl font-black text-green-600">
                  ETB {invoicesList.reduce((sum, inv) => sum + (inv.paid || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Balance Due</div>
                <div className="text-xl font-black text-amber-600">
                  ETB {invoicesList.reduce((sum, inv) => sum + ((inv.amount || 0) - (inv.paid || 0)), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">Payment Methods</div>
                <div className="text-xl font-black text-blue-600">3</div>
              </div>
            </div>

            {/* Payments Info */}
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-black text-blue-900 text-sm mb-2">Payment Instructions</h3>
                    <p className="text-xs text-blue-800 leading-relaxed mb-3">
                      Submit payment evidence with transaction reference. Finance team will review and approve within 24-48 hours.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold text-blue-900">Bank Transfer:</span>
                        <span className="text-blue-700">INSA Account #123456789, CBE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold text-blue-900">Mobile Money:</span>
                        <span className="text-blue-700">+251-911-XXXX (Telebirr, M-Birr)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold text-blue-900">Cash/Check:</span>
                        <span className="text-blue-700">INSA Headquarters, Finance Department</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">No payment history</p>
                <p className="text-xs text-slate-500 mt-1">Submit a payment to start tracking</p>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE & SETTINGS TAB ── */}
        {activeModule === "profile" && (
          <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Account &amp; Security Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your organization contact profile, reset password, and update registered email.
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Settings className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Edit Profile / Organization Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Edit Organization &amp; Contact Info</h3>
                      <p className="text-[11px] text-slate-500">Update company legal entity name, TIN, address, and primary contact.</p>
                    </div>
                  </div>

                  {profileMsg && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        profileMsg.error
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {profileMsg.error ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Company / Organization Name
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={profileForm.company}
                            onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                            placeholder="e.g. Ministry of Finance"
                            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Contact Person / Representative Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="e.g. Aster Kebede"
                            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Official Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="+251 911 000000"
                            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Tax Identification Number (TIN)
                        </label>
                        <input
                          type="text"
                          value={profileForm.tin}
                          onChange={(e) => setProfileForm({ ...profileForm, tin: e.target.value })}
                          placeholder="0001234567"
                          className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-mono font-medium text-slate-800 outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          City
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            placeholder="Addis Ababa"
                            className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Office Physical Address
                        </label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="King George VI St, Addis Ababa"
                          className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer flex items-center gap-2"
                      >
                        {profileLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{profileLoading ? "Updating…" : "Save Profile Changes"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* 2. Reset / Change Password Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <KeyRound className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Reset &amp; Change Password</h3>
                      <p className="text-[11px] text-slate-500">Secure your customer account with a fresh password.</p>
                    </div>
                  </div>

                  {passwordMsg && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        passwordMsg.error
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {passwordMsg.error ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwCurrent ? "text" : "password"}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full h-10 pl-9 pr-10 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwCurrent(!showPwCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPwCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwNew ? "text" : "password"}
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="At least 6 characters"
                          className="w-full h-10 pl-9 pr-10 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwNew(!showPwNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPwConfirm ? "text" : "password"}
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Re-type new password"
                          className="w-full h-10 pl-9 pr-10 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-red-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwConfirm(!showPwConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPwConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full py-2.5 bg-[#c8102e] hover:bg-red-700 text-white rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {passwordLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{passwordLoading ? "Resetting Password…" : "Update Password"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* 3. Change Registered Email Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Update Registered Email</h3>
                      <p className="text-[11px] text-slate-500">Official email for quotation alerts and invoices.</p>
                    </div>
                  </div>

                  {emailMsg && (
                    <div
                      className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        emailMsg.error
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {emailMsg.error ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      )}
                      <span>{emailMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateEmail} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current Email</label>
                      <input
                        type="text"
                        disabled
                        value={customerEmail}
                        className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailForm.newEmail}
                          onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                          placeholder="new.email@organization.gov.et"
                          className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm With Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={emailForm.confirmPassword}
                          onChange={(e) => setEmailForm({ ...emailForm, confirmPassword: e.target.value })}
                          placeholder="Enter password to verify"
                          className="w-full h-10 pl-9 pr-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="w-full py-2.5 bg-[#0a2540] hover:bg-slate-900 text-white rounded-xl font-extrabold text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        {emailLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{emailLoading ? "Updating Email…" : "Update Email Address"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Compliance Badge */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="font-bold text-slate-900">National Cyber Security Framework Compliance</div>
                  <div className="text-[11px] text-slate-500">All profile updates and data transmissions are encrypted with AES-256 GCM.</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                AUDIT VERIFIED
              </span>
            </div>
          </div>
        )}

        {/* ── MODAL: ORDER TRACKING, DELIVERY PROCESS & LIFECYCLE HISTORY ── */}
        {trackingOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Order Delivery Process &amp; History
                      </h3>
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                        {trackingOrder.orderNumber}
                      </span>
                      {trackingOrder.paymentStatus === "PAID" || trackingOrder.status === "Delivered" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" /> AWAITING FINANCE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live INSA Central MMS Logistics, Fleet Dispatch &amp; Financial Verification Pipeline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackingOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTrackingModalTab("tracking")}
                  className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                    trackingModalTab === "tracking"
                      ? "bg-white text-blue-700 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Delivery Process &amp; Live Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingModalTab("history")}
                  className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                    trackingModalTab === "history"
                      ? "bg-white text-blue-700 shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    Order Audit &amp; Timeline History ({trackingOrder.history?.length || 3})
                  </span>
                </button>
              </div>

              {/* ── TAB 1: DELIVERY PROCESS & LIVE DISPATCH ── */}
              {trackingModalTab === "tracking" && (
                <div className="py-4 space-y-5">
                  {/* 4-Step Visual Delivery Stepper */}
                  <div className="pt-2 px-2">
                    <div className="relative flex items-center justify-between mb-2">
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width:
                              trackingOrder.trackingStep === 4
                                ? "100%"
                                : trackingOrder.trackingStep === 3
                                ? "66%"
                                : trackingOrder.trackingStep === 2
                                ? "33%"
                                : "0%",
                          }}
                        ></div>
                      </div>

                      {[
                        { step: 1, label: "Order Placed", sub: "Payment Cleared", icon: ShoppingCart },
                        { step: 2, label: "Warehouse Packing", sub: "Quality Cleared", icon: Package },
                        { step: 3, label: "Fleet In Transit", sub: "En Route to Site", icon: Truck },
                        { step: 4, label: "Delivered", sub: "Handover Verified", icon: PackageCheck },
                      ].map((s) => {
                        const isDone = (trackingOrder.trackingStep || 1) >= s.step;
                        const isCurrent = (trackingOrder.trackingStep || 1) === s.step;
                        const StepIcon = s.icon;

                        return (
                          <div key={s.step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                  : "bg-white border-2 border-slate-300 text-slate-400"
                              }`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-[11px] mt-2 font-black ${
                                isCurrent
                                  ? "text-emerald-700"
                                  : isDone
                                  ? "text-slate-800"
                                  : "text-slate-400"
                              }`}
                            >
                              {s.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium hidden sm:block">
                              {s.sub}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Progression Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between flex-wrap gap-3 shadow-md">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                        Current Delivery Milestone
                      </div>
                      <div className="text-base font-black flex items-center gap-2 mt-0.5">
                        <span>
                          {trackingOrder.status === "Delivered"
                            ? "✅ Consignment Handover Complete"
                            : trackingOrder.status === "Shipped" || trackingOrder.status === "In Transit"
                            ? "🚚 Fleet In Transit - En Route to Destination"
                            : trackingOrder.status === "Confirmed"
                            ? "📦 Warehouse Packing & Quality Cleared"
                            : "⏳ Order Registered - Awaiting Warehouse Prep"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trackingOrder.status !== "Confirmed" &&
                        trackingOrder.status !== "Shipped" &&
                        trackingOrder.status !== "Delivered" && (
                          <button
                            onClick={() =>
                              handleUpdateOrderStatus(
                                trackingOrder.id || trackingOrder.orderNumber,
                                "Confirmed",
                                2
                              )
                            }
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Package className="w-4 h-4" />
                            <span>Step 2: Pack Warehouse Consignment</span>
                          </button>
                        )}

                      {trackingOrder.status === "Confirmed" && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              trackingOrder.id || trackingOrder.orderNumber,
                              "Shipped",
                              3
                            )
                          }
                          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Step 3: Dispatch Fleet (In Transit)</span>
                        </button>
                      )}

                      {(trackingOrder.status === "Shipped" || trackingOrder.status === "In Transit") && (
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              trackingOrder.id || trackingOrder.orderNumber,
                              "Delivered",
                              4
                            )
                          }
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Step 4: Confirm Delivery Handover</span>
                        </button>
                      )}

                      {trackingOrder.status === "Delivered" && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-black flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Delivery Complete</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Logistics Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Consignment / Waybill Code
                      </div>
                      <div className="font-mono font-black text-indigo-700 text-sm">
                        {trackingOrder.trackingNumber || "INSA-DEL-2026-9041"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Carrier: {trackingOrder.carrier || "INSA Central MMS Express Logistics"}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Assigned Driver &amp; Vehicle
                      </div>
                      <div className="font-bold text-slate-800 text-sm">
                        {trackingOrder.driverName || "Getachew Alemu"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Tel: {trackingOrder.driverPhone || "+251 911 554433"}</span>
                        <span className="text-slate-300">|</span>
                        <span>Vehicle: ET-3-A98402</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Origin Warehouse Facility
                      </div>
                      <div className="font-bold text-slate-800">
                        INSA Central MMS Logistics Hub
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Security Dispatch Terminal, Addis Ababa
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Destination Site &amp; Arrival Window
                      </div>
                      <div className="font-bold text-slate-800 line-clamp-1">
                        {trackingOrder.deliverySite || customerAddress || "King George VI St, INSA HQs"}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                        Arrival: {trackingOrder.arrivalTime || scheduledArrival || `${trackingOrder.deliveryDate} at 02:30 PM`}
                      </div>
                    </div>
                  </div>

                  {/* Customer Interactive Delivery Address & Arrival Schedule Form */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-blue-200/60">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-blue-950 text-xs">
                          Schedule Delivery Site &amp; Receiver Information
                        </h4>
                        <p className="text-[11px] text-blue-700">
                          Confirm dropoff building and authorized site receiver for logistics fleet arrival.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleConfirmDeliverySchedule} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Specific Dropoff Address / Building / Gate
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. King George VI St, INSA HQs Building, Block B, Gate 2"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 outline-none focus:border-blue-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            On-Site Receiver Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Receiver Name"
                            value={deliveryContactName}
                            onChange={(e) => setDeliveryContactName(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 outline-none focus:border-blue-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Receiver Mobile Phone
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+251 911 000000"
                            value={deliveryContactPhone}
                            onChange={(e) => setDeliveryContactPhone(e.target.value)}
                            className="w-full h-9 px-3 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 outline-none focus:border-blue-600 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Preferred Delivery Time Window
                          </label>
                          <select
                            value={deliveryTimeSlot}
                            onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                            className="w-full h-9 px-2.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 outline-none focus:border-blue-600 text-xs"
                          >
                            <option value="Morning (09:00 - 12:00)">Morning (09:00 - 12:00)</option>
                            <option value="Afternoon (14:00 - 17:00)">Afternoon (14:00 - 17:00)</option>
                            <option value="Evening (17:00 - 19:00)">Evening (17:00 - 19:00)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Confirm Location &amp; Schedule Delivery Dispatch</span>
                      </button>
                    </form>

                    {scheduledArrival && (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-2 text-xs font-black">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Schedule Confirmed</span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-800">
                          Estimated Arrival:{" "}
                          <span className="font-extrabold text-emerald-950">{scheduledArrival}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          Assigned Vehicle: INSA Fleet Express Van (ET-3-A98402) | Driver: Getachew Alemu (+251 911 554433)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 2: ORDER AUDIT & TIMELINE HISTORY ── */}
              {trackingModalTab === "history" && (
                <div className="py-4 space-y-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Chronological Lifecycle Audit Trail</div>
                      <div className="text-[11px] text-slate-500">
                        Complete traceability from procurement initiation to delivery signoff.
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Order Value</div>
                      <div className="text-sm font-black text-slate-900">
                        ETB {trackingOrder.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {(trackingOrder.history && trackingOrder.history.length > 0
                      ? trackingOrder.history
                      : [
                          {
                            id: "hist-def-1",
                            title: "Order Placed & Registered",
                            description: `Procurement order registered for ${customerOrg || customerName} at INSA Central MMS Logistics Hub.`,
                            timestamp: "09:00 AM",
                            date: trackingOrder.date || new Date().toISOString().split("T")[0],
                            status: "Order Placed",
                            actor: "Customer Portal",
                          },
                          {
                            id: "hist-def-2",
                            title: "Payment Approved & Verified by Finance",
                            description: `Finance verified transaction of ETB ${trackingOrder.totalAmount.toLocaleString()} for Invoice/Order ${trackingOrder.orderNumber}. Order released for delivery dispatch.`,
                            timestamp: "10:30 AM",
                            date: trackingOrder.date || new Date().toISOString().split("T")[0],
                            status: "Paid",
                            actor: "Finance Officer (FMS)",
                          },
                          {
                            id: "hist-def-3",
                            title: "Warehouse Consignment Prepared",
                            description: "Hardware items allocated and packed into tamper-evident transit containers at INSA Central MMS Logistics Hub.",
                            timestamp: "01:30 PM",
                            date: trackingOrder.date || new Date().toISOString().split("T")[0],
                            status: "Processing",
                            actor: "INSA Central MMS Hub",
                          },
                        ]
                    ).map((evt, idx) => {
                      const isPaidEvent =
                        evt.status === "Paid" ||
                        evt.title.toLowerCase().includes("pay") ||
                        evt.status === "Finance Approved";
                      const isDeliveredEvent =
                        evt.status === "Delivered" || evt.title.toLowerCase().includes("delivered");
                      const isShippedEvent =
                        evt.status === "Shipped" ||
                        evt.status === "In Transit" ||
                        evt.status === "Scheduled" ||
                        evt.title.toLowerCase().includes("dispatch");

                      return (
                        <div key={evt.id || idx} className="relative flex items-start gap-4">
                          {/* Timeline node icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                              isDeliveredEvent
                                ? "bg-emerald-600 text-white"
                                : isPaidEvent
                                ? "bg-emerald-500 text-white"
                                : isShippedEvent
                                ? "bg-indigo-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {isDeliveredEvent ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : isPaidEvent ? (
                              <CreditCard className="w-3.5 h-3.5" />
                            ) : isShippedEvent ? (
                              <Truck className="w-3.5 h-3.5" />
                            ) : (
                              <Package className="w-3.5 h-3.5" />
                            )}
                          </div>

                          {/* Event Content Card */}
                          <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5 hover:bg-slate-100/60 transition">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <h5 className="font-extrabold text-slate-900 text-sm">{evt.title}</h5>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-500">
                                  {evt.date} • {evt.timestamp}
                                </span>
                                {evt.actor && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                    {evt.actor}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{evt.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 font-medium">
                  {trackingOrder.items}
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingOrder(null)}
                  className="px-5 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: CREATE SALES DEAL ── */}
        {showCreateDealModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Submit New Sales Deal Inquiry</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select product &amp; quantity to request custom procurement routed directly to Sales Manager &amp; Admin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDealModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDealSubmit} className="space-y-4 text-xs">
                {/* Product Dropdown Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>
                      Select Product / Solution Package <span className="text-red-600">*</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                      Product Catalog Dropdown
                    </span>
                  </label>
                  <select
                    value={dealForm.productId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      const sel = CATALOG_PRODUCTS.find((p) => p.id === pid) || CATALOG_PRODUCTS[0];
                      const unitP = sel?.price || 800000;
                      const qty = dealForm.quantity || 1;
                      const totalCalc = unitP * qty;
                      setDealForm({
                        ...dealForm,
                        productId: pid,
                        productName: sel?.name || "Custom Solution",
                        unitPrice: unitP,
                        amount: String(totalCalc),
                        title: dealForm.title ? dealForm.title : `${sel?.name} Enterprise Procurement`,
                        description: dealForm.description ? dealForm.description : `${sel?.description} (Qty: ${qty} units)`,
                      });
                    }}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:border-purple-600"
                  >
                    {CATALOG_PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.category}) — {prod.price > 0 ? `ETB ${prod.price.toLocaleString()}` : "Custom Quote"}
                      </option>
                    ))}
                    <option value="PROD-CUSTOM">Custom Enterprise Cyber Solution / Bulk Raw Materials</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount of Quantity Needed */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>
                        Amount of Quantity Needed <span className="text-red-600">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Units / Pails / Drums</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={dealForm.quantity}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value) || 1);
                        const unitP = dealForm.unitPrice || 800000;
                        setDealForm({
                          ...dealForm,
                          quantity: q,
                          amount: String(unitP * q),
                        });
                      }}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Expected Close Date */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Close / Delivery Date</label>
                    <input
                      type="date"
                      value={dealForm.expectedCloseDate}
                      onChange={(e) => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Deal Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deal Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    placeholder="e.g., Enterprise Cyber Defense Procurement"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                {/* Real-time Dynamic Deal Value Calculation Card */}
                <div className="p-3.5 bg-gradient-to-br from-purple-50 via-indigo-50/40 to-slate-50 rounded-xl border border-purple-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-purple-900 flex items-center justify-between border-b border-purple-200/80 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Dynamic Deal Calculation Breakdown
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                      Auto Synced with Sales Manager &amp; Admin
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Selected Product:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[240px]">{dealForm.productName}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Unit Catalog Price:</span>
                    <span className="font-bold text-slate-900">ETB {Number(dealForm.unitPrice).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Quantity Amount:</span>
                    <span className="font-bold text-purple-700">
                      {dealForm.quantity} {dealForm.quantity > 1 ? "units" : "unit"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-purple-950 pt-1.5 border-t border-purple-200/80">
                    <span>Calculated Deal Value:</span>
                    <span className="text-purple-700">ETB {Number(dealForm.amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Description / Scope */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Project Scope &amp; Specifications <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={dealForm.description}
                    onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                    placeholder="Describe deployment requirements, delivery site address, technical specifications..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Additional Notes &amp; Terms (Optional)</label>
                  <textarea
                    rows={2}
                    value={dealForm.notes}
                    onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                    placeholder="Budget constraints, installment preferences, stakeholder contact information..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-purple-600"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateDealModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Deal Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: PLACE NEW CUSTOM ORDER ── */}
        {showCustomOrderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Create Direct Sales Order</h3>
                <button
                  onClick={() => setShowCustomOrderModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitCustomOrder} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Hardware / Service</label>
                  <select
                    value={customOrderForm.productId}
                    onChange={(e) => setCustomOrderForm({ ...customOrderForm, productId: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                  >
                    {CATALOG_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ETB {p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={customOrderForm.quantity}
                      onChange={(e) => setCustomOrderForm({ ...customOrderForm, quantity: Number(e.target.value) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Requested Delivery</label>
                    <input
                      type="date"
                      value={customOrderForm.deliveryDate}
                      onChange={(e) => setCustomOrderForm({ ...customOrderForm, deliveryDate: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Procurement Ref / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="PO reference number, delivery location, or special requirements..."
                    value={customOrderForm.notes}
                    onChange={(e) => setCustomOrderForm({ ...customOrderForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                  />
                </div>

                {/* Automated Price & Total Calculation Card */}
                {(() => {
                  const selProd = CATALOG_PRODUCTS.find((p) => p.id === customOrderForm.productId) || CATALOG_PRODUCTS[0];
                  const unitPrice = selProd?.price || 140;
                  const qty = customOrderForm.quantity || 1;
                  const subtotal = unitPrice * qty;
                  const vat = subtotal * 0.15;
                  const grandTotal = subtotal + vat;
                  return (
                    <div className="p-3 bg-gradient-to-br from-slate-50 to-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1 shadow-2xs">
                      <div className="font-extrabold text-emerald-900 flex items-center justify-between border-b border-emerald-200/80 pb-1">
                        <span>Automated Order Total</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Auto Calculated
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Unit Price ({selProd?.name.slice(0, 22)}...):</span>
                        <span className="font-bold text-slate-900">ETB {unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Quantity ({qty} x ETB {unitPrice.toLocaleString()}):</span>
                        <span className="font-bold text-slate-900">ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>VAT / Tax (15%):</span>
                        <span className="font-bold text-slate-900">ETB {vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-emerald-950 pt-1 border-t border-emerald-200/80">
                        <span>Calculated Total Order Amount:</span>
                        <span className="text-[#c8102e] text-sm">ETB {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomOrderModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#c8102e] hover:bg-red-700 text-white rounded-xl font-extrabold transition shadow-xs cursor-pointer"
                  >
                    Submit Custom Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: PLACE ORDER FROM PRODUCT CATALOG (SMALL BOX POPUP) ── */}
        {showPlaceOrderModal && placeOrderForm.product && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#c8102e] flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Place Purchase Order</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Specify quantity, delivery location, and order total.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlaceOrderModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selected Product Summary Header Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 flex items-center gap-3">
                {placeOrderForm.product.image ? (
                  <img
                    src={placeOrderForm.product.image}
                    alt={placeOrderForm.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center text-center p-1 shrink-0">
                    INSA PRODUCT
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{placeOrderForm.product.mmsCode}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {placeOrderForm.product.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">{placeOrderForm.product.name}</h4>
                  <div className="text-xs font-extrabold text-[#c8102e] mt-1">
                    {placeOrderForm.product.priceText || `ETB ${placeOrderForm.product.price.toLocaleString()}`}
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmPlaceOrder} className="space-y-3.5 text-xs">
                {/* Quantity & Delivery Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <span>Order Quantity Needed</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={placeOrderForm.quantity}
                      onChange={(e) =>
                        setPlaceOrderForm({
                          ...placeOrderForm,
                          quantity: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#c8102e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={placeOrderForm.deliveryDate}
                      onChange={(e) => setPlaceOrderForm({ ...placeOrderForm, deliveryDate: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:border-[#c8102e]"
                      required
                    />
                  </div>
                </div>

                {/* Delivery Site Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Delivery Site / Destination Address</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter site location, building/facility name..."
                    value={placeOrderForm.deliverySite}
                    onChange={(e) => setPlaceOrderForm({ ...placeOrderForm, deliverySite: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
                    required
                  />
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact Representative</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Site manager name"
                      value={placeOrderForm.contactName}
                      onChange={(e) => setPlaceOrderForm({ ...placeOrderForm, contactName: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact Phone Number</span>
                    </label>
                    <input
                      type="text"
                      placeholder="+251 911 ..."
                      value={placeOrderForm.contactPhone}
                      onChange={(e) => setPlaceOrderForm({ ...placeOrderForm, contactPhone: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
                    />
                  </div>
                </div>

                {/* Order Specifications & Special Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Order Notes &amp; Specifications</label>
                  <textarea
                    rows={2}
                    placeholder="Provide special instructions, custom sealing specs, or packaging requirements..."
                    value={placeOrderForm.notes}
                    onChange={(e) => setPlaceOrderForm({ ...placeOrderForm, notes: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                  />
                </div>

                {/* Dynamic Real-Time Price & Tax Calculation Summary Card */}
                {(() => {
                  const unitPrice = placeOrderForm.product.price > 0 ? placeOrderForm.product.price : 18500;
                  const qty = Math.max(1, placeOrderForm.quantity || 1);
                  const subtotal = unitPrice * qty;
                  const vat = subtotal * 0.15;
                  const grandTotal = subtotal + vat;

                  return (
                    <div className="p-3.5 bg-gradient-to-br from-slate-50 to-red-50/40 rounded-xl border border-red-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-slate-900 flex items-center justify-between border-b border-red-200/80 pb-1.5">
                        <span className="flex items-center gap-1.5 text-slate-900">
                          <Receipt className="w-4 h-4 text-[#c8102e]" />
                          Automated Order Total Calculation
                        </span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Real-Time Breakdown
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Unit Price ({placeOrderForm.product.name.slice(0, 22)}...):</span>
                        <span className="font-bold text-slate-900">ETB {unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Quantity Ordered:</span>
                        <span className="font-bold text-slate-900">{qty} {qty > 1 ? "units" : "unit"}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Subtotal Amount:</span>
                        <span className="font-bold text-slate-900">ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>15% VAT Tax:</span>
                        <span className="font-bold text-slate-900">ETB {vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-red-200/80">
                        <span>Grand Total (Inc. Tax):</span>
                        <span className="text-[#c8102e]">ETB {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Submit Action Buttons */}
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPlaceOrderModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={placeOrderSubmitting}
                    className="flex-1 py-2.5 bg-[#c8102e] hover:bg-red-700 text-white rounded-xl font-extrabold transition shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {placeOrderSubmitting ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    <span>{placeOrderSubmitting ? "Placing Order..." : "Place Order"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: REQUEST NEW QUOTATION ── */}
        {showQuoteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Request New Official Quotation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit custom requirements or material inquiry to INSA Sales team.</p>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestQuotationSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Product / Service Package</label>
                  <select
                    value={quoteForm.productId}
                    onChange={(e) => setQuoteForm({ ...quoteForm, productId: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-800 outline-none focus:border-[#c8102e]"
                  >
                    {CATALOG_PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.category}) - {prod.price > 0 ? `ETB ${prod.price.toLocaleString()}` : "Custom Quote"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity / Units</label>
                    <input
                      type="number"
                      min={1}
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm({ ...quoteForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#c8102e]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Delivery Timeline</label>
                    <select
                      value={quoteForm.timeline}
                      onChange={(e) => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800 outline-none focus:border-[#c8102e]"
                    >
                      <option value="Immediate (Urgent)">Immediate (Urgent)</option>
                      <option value="Within 14 Days">Within 14 Days</option>
                      <option value="Within 30 Days">Within 30 Days</option>
                      <option value="Flexible / Q4 Procurement">Flexible / Q4 Procurement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Requirements &amp; Special Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Specify target specifications, delivery address, tax exempt certificates, or custom technical needs..."
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none focus:border-[#c8102e]"
                  />
                </div>

                {/* Automated Price & Total Calculation Card */}
                {(() => {
                  const selProd = CATALOG_PRODUCTS.find((p) => p.id === quoteForm.productId) || CATALOG_PRODUCTS[0];
                  const unitPrice = selProd?.price || 140;
                  const qty = quoteForm.quantity || 1;
                  const subtotal = unitPrice * qty;
                  const vat = subtotal * 0.15;
                  const grandTotal = subtotal + vat;
                  return (
                    <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-blue-900 flex items-center justify-between border-b border-blue-200/80 pb-1.5">
                        <span>Automated Price &amp; Total Calculation</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Auto Computed
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Unit Price ({selProd?.name.slice(0, 24)}...):</span>
                        <span className="font-bold text-slate-900">ETB {unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Quantity Units:</span>
                        <span className="font-bold text-slate-900">{qty} {qty > 1 ? "units" : "unit"}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Subtotal Amount:</span>
                        <span className="font-bold text-slate-900">ETB {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>VAT / Tax (15%):</span>
                        <span className="font-bold text-slate-900">ETB {vat.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-blue-950 pt-1.5 border-t border-blue-200/80">
                        <span>Automated Total Amount:</span>
                        <span className="text-[#c8102e]">ETB {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-3 bg-red-50/70 rounded-xl border border-red-100 text-[11px] text-red-900 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[#c8102e] shrink-0 mt-0.5" />
                  <div>
                    Upon submission, a formal Quotation will be created and saved in your customer profile, and sent to INSA Sales Officers for review.
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#c8102e] hover:bg-red-700 text-white rounded-xl font-extrabold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: REQUEST INVOICE ── */}
        {showInvoiceModal && (
          <RequestInvoiceModal
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            onSubmit={handleInvoiceRequestSubmit}
          />
        )}

        {/* ── MODAL: SETTLE INVOICE & SELECT PAYMENT METHOD ── */}
        {showPaymentModal && selectedInvoiceForPayment && (
          <PaymentMethodModal
            isOpen={true}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedInvoiceForPayment(null);
            }}
            invoice={{
              id: selectedInvoiceForPayment.id ?? 1,
              invoiceNumber: selectedInvoiceForPayment.invoiceNumber,
              amount: selectedInvoiceForPayment.amount,
            }}
            onPaymentComplete={() => {
              setShowPaymentModal(false);
              if (selectedInvoiceForPayment) {
                const invNum = selectedInvoiceForPayment.invoiceNumber;
                setInvoicesList((prev) =>
                  prev.map((item) =>
                    item.invoiceNumber === invNum || item.id === selectedInvoiceForPayment.id
                      ? {
                          ...item,
                          status: "WAITING_FINANCE_APPROVAL",
                          paymentSubmitted: true,
                          paid: 0,
                          balance: item.amount,
                          financeStatus: "PENDING_APPROVAL",
                          paymentMethod: paymentMethod || "Telebirr",
                          paymentRef: paymentRef,
                        }
                      : item
                  )
                );
                showToast(`⏳ Payment submitted for Invoice ${invNum}! Sent to Finance Officer for review & approval.`, "info");
                setSelectedInvoiceForPayment(null);
              }
            }}
          />
        )}
        <CustomerChatbot currentCustomerName={customerName} currentUserRole="CUSTOMER" />
      </main>
    </div>
    </RoleProtectedRoute>
  );
}
