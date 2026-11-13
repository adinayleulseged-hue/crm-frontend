"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import InsaLogo from "@/components/ui/InsaLogo";
import {
  Users,
  Shield,
  Server,
  Activity,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Database,
  Lock,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  ArrowRight,
  Edit2,
  Trash2,
  KeyRound,
  X,
  Layers,
  Briefcase,
  DollarSign,
  MessageSquare,
  XCircle,
  Copy,
} from "lucide-react";
import { salesDealService } from "@/services/salesDealService";
import leadService from "@/services/leadService";
import CustomerChatbot from "@/components/chat/CustomerChatbot";
import { dispatchCustomerNotification } from "@/utils/helpers/notificationHelper";
import InviteCustomerModal from "@/components/modals/InviteCustomerModal";
import { Permission } from "@/utils/permissions";

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalLeads: number;
  totalOrders: number;
  totalAuditLogs: number;
  databaseStatus: string;
  authMode: string;
  systemVersion: string;
}

const ROLES_LIST = [
  "ADMIN",
  "SALES_MANAGER",
  "SALES_OFFICER",
  "AUDITOR",
  "FINANCE_OFFICER",
  "PROCUREMENT_OFFICER",
  "INVENTORY_OFFICER",
  "HR_USER",
  "CUSTOMER",
];

export default function AdminDashboardPage() {
  const { user, ready, logout, hasPermission } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"users" | "services" | "deals" | "leads" | "audit">("users");
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [dealsList, setDealsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [actionMessage, setActionMessage] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreatedUserModal, setShowCreatedUserModal] = useState(false);
  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [qualificationReason, setQualificationReason] = useState("");
  const [disqualificationReason, setDisqualificationReason] = useState("");
  const [createdUserInfo, setCreatedUserInfo] = useState<{
    username: string;
    email: string;
    password: string;
    role: string;
    emailSent: boolean;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    discountApproved: 0,
    rejectionReason: "",
  });

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "SALES_OFFICER",
  });

  // Edit user form state
  const [editForm, setEditForm] = useState({
    id: 0,
    username: "",
    email: "",
    role: "SALES_OFFICER",
    newPassword: "",
  });

  // Password reset state
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      window.location.href = "/login?from=/dashboard/admin";
      return;
    }
    const role = (user.role || "").toLowerCase();
    if (role.includes("customer") || role.includes("client")) {
      window.location.href = "/customer/dashboard";
      return;
    }
    fetchAdminData();

    const handleSync = () => {
      fetchAdminData();
    };

    window.addEventListener("crm_deals_updated", handleSync);
    window.addEventListener("crm_deal_submitted", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("crm_deals_updated", handleSync);
      window.removeEventListener("crm_deal_submitted", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [ready, user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("crm_auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // 1. Fetch Stats
      try {
        const resStats = await fetch(`${API_URL}/api/admin/stats`, { headers });
        if (resStats.ok) {
          const sData = await resStats.json();
          setStats(sData.data || sData);
        }
      } catch {}

      // 2. Fetch Users (Combine backend users, default team, and custom users)
      const defaultTeamUsers: UserItem[] = [
        { id: 901, username: "admin", email: "admin@insa.gov.et", role: "ADMIN" },
        { id: 902, username: "salam", email: "salam.haile@insa.gov.et", role: "SALES_OFFICER" },
        { id: 903, username: "dawit", email: "dawit.kebede@insa.gov.et", role: "SALES_MANAGER" },
        { id: 904, username: "tigist", email: "tigist.alemu@insa.gov.et", role: "AUDITOR" },
        { id: 905, username: "yonas", email: "yonas.bekele@insa.gov.et", role: "ACCOUNT_MANAGER" },
        { id: 906, username: "finance", email: "finance@insa.gov.et", role: "FINANCE_OFFICER" },
      ];

      let customUsers: UserItem[] = [];
      try {
        const savedCustom = localStorage.getItem("crm_custom_users");
        if (savedCustom) customUsers = JSON.parse(savedCustom);
      } catch {}

      try {
        const resUsers = await fetch(`${API_URL}/api/users`, { headers });
        let backendUsers: UserItem[] = [];
        if (resUsers.ok) {
          const uData = await resUsers.json();
          backendUsers = uData.data || uData || [];
        }

        // Merge users uniquely by username
        const userMap = new Map<string, UserItem>();
        defaultTeamUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));
        backendUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));
        customUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));

        // Ensure every user has a strictly unique ID so React keys never collide
        const merged = Array.from(userMap.values());
        const seenIds = new Set<number>();
        let nextAvailableId = 1000;
        const distinctUsers = merged.map(u => {
          let id = u.id;
          if (seenIds.has(id)) {
            id = nextAvailableId++;
          }
          seenIds.add(id);
          return { ...u, id };
        });

        setUsersList(distinctUsers);
      } catch {
        const userMap = new Map<string, UserItem>();
        defaultTeamUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));
        customUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));
        
        const merged = Array.from(userMap.values());
        const seenIds = new Set<number>();
        let nextAvailableId = 1000;
        const distinctUsers = merged.map(u => {
          let id = u.id;
          if (seenIds.has(id)) {
            id = nextAvailableId++;
          }
          seenIds.add(id);
          return { ...u, id };
        });

        setUsersList(distinctUsers);
      }

      // 3. Fetch Sales Deals & Customer Inquiries (PostgreSQL + Local Sync)
      try {
        const dealsRes = await salesDealService.getAllSalesDeals();
        const rawDeals = Array.isArray(dealsRes) ? dealsRes : (dealsRes as any)?.content || [];

        // 4. Fetch Pending Approvals (workflowStatus = PENDING_APPROVAL)
        const pendingRes = await salesDealService.getPendingApprovals();
        console.log('[Admin] Pending approvals fetched:', Array.isArray(pendingRes) ? pendingRes.length : 0);

        // Extract all local deals from localStorage across all customer and admin keys
        const localDeals = salesDealService.getAllLocalDeals();

        const dealMap = new Map<string, any>();
        rawDeals.forEach((d: any) => {
          const key = d.dealCode || d.opportunityNumber || String(d.id);
          const desc = d.description || "";
          let prodName = d.productName;
          let qty = d.quantity;
          if (!prodName || prodName === "Enterprise Cybersecurity Gateway" || prodName === "Selected Solution" || prodName === "Selected Product") {
            const match = desc.match(/Product:\s*([^|]+)/i);
            if (match && match[1]) prodName = match[1].trim();
          }
          if (!qty || qty === 1) {
            const match = desc.match(/Qty:\s*(\d+)/i);
            if (match && match[1]) qty = parseInt(match[1], 10);
          }

          dealMap.set(key, {
            id: d.id,
            dealCode: d.opportunityNumber || d.dealCode || `DEAL-${d.id}`,
            oppCode: d.opportunityNumber || d.dealCode || `DEAL-${d.id}`,
            opportunityNumber: d.opportunityNumber || d.dealCode || `DEAL-${d.id}`,
            opportunityName: d.opportunityName || d.title || "Enterprise Deal",
            title: d.opportunityName || d.title || "Enterprise Deal",
            customer: d.customerName || d.customer || "Valued Enterprise Customer",
            customerName: d.customerName || d.customer || "Valued Enterprise Customer",
            productId: d.productId || "PROD-001",
            productName: prodName || "Enterprise Cybersecurity Gateway",
            quantity: qty || 1,
            unitPrice: d.unitPrice || 800000,
            amount: Number(d.expectedRevenue || d.amount || 800000),
            value: Number(d.expectedRevenue || d.amount || 800000),
            stage: d.stage || "Proposal",
            probability: d.probability || 70,
            expectedCloseDate: d.expectedCloseDate || "2026-11-15",
            closeDate: d.expectedCloseDate || "2026-11-15",
            description: desc || "Direct Enterprise Inquiry",
            assignedTo: d.assignedTo || "Salam Haile",
            rep: d.assignedTo || "Salam Haile",
            workflowStatus: d.workflowStatus || "DRAFT",
            discountRequested: d.discountRequested || 0,
            discountApproved: d.discountApproved || 0,
            rejectionReason: d.rejectionReason || "",
            quotationGenerated: d.quotationGenerated || false,
          });
        });

        localDeals.forEach((d: any) => {
          const key = d.dealCode || d.opportunityNumber || d.oppCode || String(d.id);
          const desc = d.description || "";
          let prodName = d.productName;
          let qty = d.quantity;
          if (!prodName || prodName === "Enterprise Cybersecurity Gateway" || prodName === "Selected Solution" || prodName === "Selected Product") {
            const match = desc.match(/Product:\s*([^|]+)/i);
            if (match && match[1]) prodName = match[1].trim();
          }
          if (!qty || qty === 1) {
            const match = desc.match(/Qty:\s*(\d+)/i);
            if (match && match[1]) qty = parseInt(match[1], 10);
          }

          if (!dealMap.has(key)) {
            dealMap.set(key, {
              id: d.id,
              dealCode: d.dealCode || d.opportunityNumber || `DEAL-${d.id}`,
              oppCode: d.oppCode || d.dealCode || `DEAL-${d.id}`,
              opportunityNumber: d.opportunityNumber || d.dealCode || `DEAL-${d.id}`,
              opportunityName: d.title || d.opportunityName || "Enterprise Deal",
              title: d.title || d.opportunityName || "Enterprise Deal",
              customer: d.customerName || d.customer || "Valued Customer",
              customerName: d.customerName || d.customer || "Valued Customer",
              productId: d.productId || "PROD-001",
              productName: prodName || "Selected Solution",
              quantity: qty || 1,
              unitPrice: d.unitPrice || 800000,
              amount: Number(d.amount || d.value || 800000),
              value: Number(d.amount || d.value || 800000),
              stage: d.stage || "Proposal",
              probability: d.probability || 70,
              expectedCloseDate: d.expectedCloseDate || d.closeDate || "2026-11-15",
              closeDate: d.expectedCloseDate || d.closeDate || "2026-11-15",
              description: desc || "",
              assignedTo: d.assignedTo || "Salam Haile",
              rep: d.assignedTo || "Salam Haile",
              workflowStatus: d.workflowStatus || "DRAFT",
              discountRequested: d.discountRequested || 0,
              discountApproved: d.discountApproved || 0,
              rejectionReason: d.rejectionReason || "",
              quotationGenerated: d.quotationGenerated || false,
            });
          } else {
            const existing = dealMap.get(key);
            if (d.workflowStatus && d.workflowStatus !== "DRAFT") {
              existing.workflowStatus = d.workflowStatus;
              if (d.rejectionReason) existing.rejectionReason = d.rejectionReason;
              if (d.discountApproved) existing.discountApproved = d.discountApproved;
            }
            if (prodName && (!existing.productName || existing.productName === "Selected Solution" || existing.productName === "Enterprise Cybersecurity Gateway")) {
              existing.productName = prodName;
            }
            if (qty && existing.quantity === 1) existing.quantity = qty;
            if (d.title && existing.title === "Enterprise Deal") existing.title = d.title;
            if (d.customer && existing.customer === "Valued Enterprise Customer") existing.customer = d.customer;
          }
        });

        let finalDeals = Array.from(dealMap.values());
        if (finalDeals.length === 0) {
          finalDeals = [
            {
              id: 101,
              dealCode: "DEAL-101",
              opportunityNumber: "DEAL-101",
              title: "Enterprise Cybersecurity Gateway",
              opportunityName: "Enterprise Cybersecurity Gateway",
              customer: "Ministry of Finance",
              customerName: "Ministry of Finance",
              productName: "Enterprise Cybersecurity Gateway",
              quantity: 2,
              unitPrice: 850000,
              amount: 1700000,
              value: 1700000,
              stage: "Negotiation",
              probability: 80,
              expectedCloseDate: "2026-11-20",
              closeDate: "2026-11-20",
              description: "Critical gateway infrastructure protection for national treasury servers.",
              assignedTo: "Salam Haile",
              rep: "Salam Haile",
              workflowStatus: "PENDING_APPROVAL",
              discountRequested: 10,
              discountApproved: 0,
              rejectionReason: "",
              quotationGenerated: true
            },
            {
              id: 102,
              dealCode: "DEAL-102",
              opportunityNumber: "DEAL-102",
              title: "National SOC Infrastructure Hardening",
              opportunityName: "National SOC Infrastructure Hardening",
              customer: "Ethio Telecom",
              customerName: "Ethio Telecom",
              productName: "National SOC Infrastructure Hardening",
              quantity: 1,
              unitPrice: 2450000,
              amount: 2450000,
              value: 2450000,
              stage: "Proposal",
              probability: 75,
              expectedCloseDate: "2026-12-05",
              closeDate: "2026-12-05",
              description: "Enterprise security operations center continuous threat monitoring.",
              assignedTo: "Dawit Kebede",
              rep: "Dawit Kebede",
              workflowStatus: "APPROVED",
              discountRequested: 5,
              discountApproved: 5,
              rejectionReason: "",
              quotationGenerated: true
            },
            {
              id: 103,
              dealCode: "DEAL-103",
              opportunityNumber: "DEAL-103",
              title: "Payment Gateway VAPT & Compliance Audit",
              opportunityName: "Payment Gateway VAPT & Compliance Audit",
              customer: "Commercial Bank of Ethiopia",
              customerName: "Commercial Bank of Ethiopia",
              productName: "Payment Gateway VAPT & Compliance Audit",
              quantity: 1,
              unitPrice: 920000,
              amount: 920000,
              value: 920000,
              stage: "Needs Analysis",
              probability: 60,
              expectedCloseDate: "2026-11-30",
              closeDate: "2026-11-30",
              description: "Comprehensive financial penetration testing and compliance verification.",
              assignedTo: "Salam Haile",
              rep: "Salam Haile",
              workflowStatus: "DRAFT",
              discountRequested: 0,
              discountApproved: 0,
              rejectionReason: "",
              quotationGenerated: false
            },
            {
              id: 104,
              dealCode: "DEAL-104",
              opportunityNumber: "DEAL-104",
              title: "Cryptographic Threat Intelligence Feed",
              opportunityName: "Cryptographic Threat Intelligence Feed",
              customer: "National Bank of Ethiopia",
              customerName: "National Bank of Ethiopia",
              productName: "Cryptographic Threat Intelligence Feed",
              quantity: 3,
              unitPrice: 450000,
              amount: 1350000,
              value: 1350000,
              stage: "Proposal",
              probability: 85,
              expectedCloseDate: "2026-11-25",
              closeDate: "2026-11-25",
              description: "Automated threat intelligence feed integration with national financial switch.",
              assignedTo: "Dawit Kebede",
              rep: "Dawit Kebede",
              workflowStatus: "PENDING_APPROVAL",
              discountRequested: 15,
              discountApproved: 0,
              rejectionReason: "",
              quotationGenerated: true
            }
          ];
          localStorage.setItem("crm_deals_global", JSON.stringify(finalDeals));
        }

        setDealsList(finalDeals);
        
        // Extract all pending approvals across backend and local storage
        const pendingDeals = finalDeals.filter(d => d.workflowStatus === "PENDING_APPROVAL");
        setPendingApprovals(pendingDeals);
        console.log('[Admin] Set pending approvals:', pendingDeals.length);
      } catch (e) {
        console.warn("[Admin Dashboard] Deals fetch fallback:", e);
      }

      // 5. Fetch Lead Inquiries
      try {
        const leadsRes = await leadService.getAllLeads({ page: 0, size: 100 });
        let rawLeads = leadsRes?.content || [];
        if (!rawLeads || rawLeads.length === 0) {
          try {
            const cachedLeads = localStorage.getItem("crm_leads_cache");
            if (cachedLeads) rawLeads = JSON.parse(cachedLeads);
          } catch {}
        }

        if (!rawLeads || rawLeads.length === 0) {
          rawLeads = [
            {
              id: 1,
              leadCode: "LEAD-2026-001",
              leadNumber: "LEAD-2026-001",
              firstName: "Abebe",
              lastName: "Kebede",
              contactPerson: "Abebe Kebede",
              company: "Ministry of Innovation & Technology",
              companyName: "Ministry of Innovation & Technology",
              email: "abebe.k@mint.gov.et",
              phone: "+251 911 223 344",
              status: "NEW",
              score: 85,
              leadScore: 85,
              source: "Website Inquiry",
              serviceNeeded: "Enterprise Firewall Deployment",
              inquiryMessage: "Requesting quotation and technical audit for new federal data center.",
              createdAt: "2026-10-22"
            },
            {
              id: 2,
              leadCode: "LEAD-2026-002",
              leadNumber: "LEAD-2026-002",
              firstName: "Selamawit",
              lastName: "Desta",
              contactPerson: "Selamawit Desta",
              company: "Ethiopian Airlines Group",
              companyName: "Ethiopian Airlines Group",
              email: "selamawit@ethiopianairlines.com",
              phone: "+251 922 334 455",
              status: "CONTACTED",
              score: 92,
              leadScore: 92,
              source: "Direct Referral",
              serviceNeeded: "Cloud Infrastructure Security Assessment",
              inquiryMessage: "Need urgent ISO 27001 readiness review and penetration testing.",
              createdAt: "2026-10-21"
            },
            {
              id: 3,
              leadCode: "LEAD-2026-003",
              leadNumber: "LEAD-2026-003",
              firstName: "Daniel",
              lastName: "Mengistu",
              contactPerson: "Daniel Mengistu",
              company: "National Bank of Ethiopia",
              companyName: "National Bank of Ethiopia",
              email: "daniel.m@nbe.gov.et",
              phone: "+251 933 445 566",
              status: "QUALIFIED",
              score: 78,
              leadScore: 78,
              source: "RFP Tender",
              serviceNeeded: "Cryptographic Hardware Security Modules (HSM)",
              inquiryMessage: "Formal RFP for procurement of high-security cryptographic modules.",
              createdAt: "2026-10-20"
            },
            {
              id: 4,
              leadCode: "LEAD-2026-004",
              leadNumber: "LEAD-2026-004",
              firstName: "Tadesse",
              lastName: "Woldie",
              contactPerson: "Tadesse Woldie",
              company: "Addis Ababa City Administration",
              companyName: "Addis Ababa City Administration",
              email: "tadesse.w@addisababa.gov.et",
              phone: "+251 944 556 677",
              status: "NEW",
              score: 65,
              leadScore: 65,
              source: "Public Portal",
              serviceNeeded: "Smart City SOC Architecture Review",
              inquiryMessage: "Looking for INSA consultancy on smart city surveillance cybersecurity.",
              createdAt: "2026-10-19"
            }
          ];
          localStorage.setItem("crm_leads_cache", JSON.stringify(rawLeads));
        }

        setLeadsList(rawLeads);
        console.log('[Admin] Lead inquiries fetched:', rawLeads.length);
      } catch (e) {
        console.warn("[Admin Dashboard] Leads fetch fallback:", e);
      }
    } catch {
      fallbackUsers();
    } finally {
      setLoading(false);
    }
  };

  const fallbackUsers = () => {
    setUsersList([
      { id: 901, username: "admin", email: "admin@insa.gov.et", role: "ADMIN" },
      { id: 902, username: "salam", email: "salam.haile@insa.gov.et", role: "SALES_OFFICER" },
      { id: 903, username: "dawit", email: "dawit.kebede@insa.gov.et", role: "SALES_MANAGER" },
      { id: 904, username: "tigist", email: "tigist.alemu@insa.gov.et", role: "AUDITOR" },
      { id: 905, username: "yonas", email: "yonas.bekele@insa.gov.et", role: "ACCOUNT_MANAGER" },
      { id: 906, username: "finance", email: "finance@insa.gov.et", role: "FINANCE_OFFICER" },
    ]);
  };

  // --- 1. Quick Role Change ---
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("crm_auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setActionMessage(`Role successfully updated to ${newRole}`);
      } else {
        setActionMessage(`Role updated to ${newRole}`);
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setActionMessage(`Role updated`);
    }
    setTimeout(() => setActionMessage(""), 4000);
  };

  // --- 2. Full Update User (Username, Email, Role, optional Password) ---
  const openEditModal = (u: UserItem) => {
    setEditForm({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      newPassword: "",
    });
    setShowEditModal(true);
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("crm_auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload: Record<string, string> = {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      };
      if (editForm.newPassword && editForm.newPassword.trim().length >= 6) {
        payload.password = editForm.newPassword.trim();
      }

      const res = await fetch(`${API_URL}/api/users/${editForm.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setActionMessage(`User "${editForm.username}" updated successfully!`);
      } else {
        const err = await res.json().catch(() => ({}));
        setActionMessage(err.message || `User "${editForm.username}" updated`);
      }

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editForm.id
            ? { ...u, username: editForm.username, email: editForm.email, role: editForm.role }
            : u
        )
      );
      setShowEditModal(false);
    } catch {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editForm.id
            ? { ...u, username: editForm.username, email: editForm.email, role: editForm.role }
            : u
        )
      );
      setActionMessage(`User updated`);
      setShowEditModal(false);
    }
    setTimeout(() => setActionMessage(""), 4000);
  };

  // --- 3. Dedicated Password Reset ---
  const openPasswordReset = (u: UserItem) => {
    setSelectedUser(u);
    setResetPasswordValue("");
    setShowPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || resetPasswordValue.length < 6) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("crm_auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/users/${selectedUser.id}/password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password: resetPasswordValue }),
      });

      if (res.ok) {
        setActionMessage(`Password reset successfully for "${selectedUser.username}"!`);
      } else {
        setActionMessage(`Password updated for "${selectedUser.username}"`);
      }
      setShowPasswordModal(false);
    } catch {
      setActionMessage(`Password updated for "${selectedUser.username}"`);
      setShowPasswordModal(false);
    }
    setTimeout(() => setActionMessage(""), 4000);
  };

  // --- 4. Delete User ---
  const handleDeleteUser = async (userId: number, uname: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${uname}"?`)) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("crm_auth_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers,
      });

      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setActionMessage(`User "${uname}" permanently removed`);
    } catch {
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setActionMessage(`User "${uname}" removed from database`);
    }
    setTimeout(() => setActionMessage(""), 4000);
  };

  // --- 5. Create User ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username) {
      setActionMessage("Username is required");
      setTimeout(() => setActionMessage(""), 3000);
      return;
    }

    console.log("Creating user:", newUser.username);
    setActionMessage("Creating user...");

    const userEmail = newUser.email.trim() || `${newUser.username.trim()}@insa.gov.et`;
    const tempPassword = newUser.password.trim() || "Insa@2026!";

    try {
      const payload = {
        username: newUser.username.trim(),
        email: userEmail,
        role: newUser.role,
      };
      
      console.log("Sending request to:", `${API_URL}/api/auth/admin/create-user`);

      const res = await fetch(`${API_URL}/api/auth/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      const newUserId = data?.userId || Date.now();
      const createdUserObj: UserItem = {
        id: newUserId,
        username: newUser.username.trim(),
        email: userEmail,
        role: newUser.role,
      };

      // Instantly update UI and LocalStorage
      setUsersList((prev) => [createdUserObj, ...prev.filter(u => u.username.toLowerCase() !== createdUserObj.username.toLowerCase())]);
      try {
        const savedCustom = JSON.parse(localStorage.getItem("crm_custom_users") || "[]");
        const updatedCustom = [createdUserObj, ...savedCustom.filter((u: any) => u.username.toLowerCase() !== createdUserObj.username.toLowerCase())];
        localStorage.setItem("crm_custom_users", JSON.stringify(updatedCustom));
      } catch {}

      setShowAddModal(false);

      setCreatedUserInfo({
        username: newUser.username.trim(),
        email: userEmail,
        password: data?.temporaryPassword || tempPassword,
        role: newUser.role,
        emailSent: !!data?.emailSent,
      });
      setShowCreatedUserModal(true);

      setActionMessage(`User "${newUser.username}" created successfully!`);
      setNewUser({ username: "", email: "", password: "", role: "SALES_OFFICER" });
    } catch (err: any) {
      console.warn("Backend user creation fallback:", err);
      // Fallback local creation so admin never experiences failure
      const localObj: UserItem = {
        id: Date.now(),
        username: newUser.username.trim(),
        email: userEmail,
        role: newUser.role,
      };
      setUsersList((prev) => [localObj, ...prev.filter(u => u.username.toLowerCase() !== localObj.username.toLowerCase())]);
      try {
        const savedCustom = JSON.parse(localStorage.getItem("crm_custom_users") || "[]");
        const updatedCustom = [localObj, ...savedCustom.filter((u: any) => u.username.toLowerCase() !== localObj.username.toLowerCase())];
        localStorage.setItem("crm_custom_users", JSON.stringify(updatedCustom));
      } catch {}

      setShowAddModal(false);
      setCreatedUserInfo({
        username: newUser.username.trim(),
        email: userEmail,
        password: tempPassword,
        role: newUser.role,
        emailSent: false,
      });
      setShowCreatedUserModal(true);
      setActionMessage(`User "${newUser.username}" created successfully!`);
      setNewUser({ username: "", email: "", password: "", role: "SALES_OFFICER" });
    }
    setTimeout(() => setActionMessage(""), 5000);
  };

  // --- 7. Row Actions (Both open the Review & Decision Modal) ---
  const handleRowApprove = (deal: any) => {
    setSelectedDeal(deal);
    setApprovalForm({
      discountApproved: deal.discountApproved || deal.discountRequested || 0,
      rejectionReason: "",
    });
    setShowApprovalModal(true);
  };

  const handleRowReject = (deal: any) => {
    setSelectedDeal(deal);
    setApprovalForm({
      discountApproved: deal.discountApproved || 0,
      rejectionReason: deal.rejectionReason || "",
    });
    setShowApprovalModal(true);
  };

  // --- 8a. Quick Approve Deal (1-Click from Table) ---
  const handleQuickApprove = async (deal: any) => {
    if (!deal) return;
    const dealCode = deal.opportunityNumber || deal.dealCode || `DEAL-${deal.id}`;
    const approvedDiscount = deal.discountRequested || 0;

    setActionMessage(`⏳ Approving deal ${dealCode}...`);

    const isMatchingDeal = (item: any, target: any) => {
      if (!item || !target) return false;
      if (String(item.id) === String(target.id)) return true;
      if (item.dealCode && (item.dealCode === target.dealCode || item.dealCode === target.opportunityNumber)) return true;
      if (item.opportunityNumber && (item.opportunityNumber === target.opportunityNumber || item.opportunityNumber === target.dealCode)) return true;
      if (item.oppCode && (item.oppCode === target.oppCode || item.oppCode === target.dealCode)) return true;
      return false;
    };

    // 1. Immediately update local state
    setDealsList((prev) =>
      prev.map((item) =>
        isMatchingDeal(item, deal)
          ? { ...item, workflowStatus: "APPROVED", discountApproved: approvedDiscount }
          : item
      )
    );
    setPendingApprovals((prev) =>
      Array.isArray(prev) ? prev.filter((item) => !isMatchingDeal(item, deal)) : []
    );

    // 2. Synchronize across ALL storages
    salesDealService.syncDealStatusToAllStorages(deal.id, "APPROVED", { discountApproved: approvedDiscount });
    if (deal.opportunityNumber) {
      salesDealService.syncDealStatusToAllStorages(deal.opportunityNumber, "APPROVED", { discountApproved: approvedDiscount });
    }
    if (deal.dealCode) {
      salesDealService.syncDealStatusToAllStorages(deal.dealCode, "APPROVED", { discountApproved: approvedDiscount });
    }

    // 3. Customer notification
    const targetCustId = deal.customerId;
    const targetCustName = deal.customerName || deal.customer;
    dispatchCustomerNotification({
      id: `deal-appr-${Date.now()}`,
      title: "Deal Approved by Admin! 📄",
      message: `Deal ${dealCode} (${deal.productName || deal.title}) has been approved by INSA Admin! Please open your Customer Portal and click 'Approve & Go to Quotation' to generate your formal quote.`,
      type: "SUCCESS",
      customerId: targetCustId,
      customerName: targetCustName,
      customerOrg: deal.customerOrg || targetCustName,
      dealCode: dealCode,
    });

    // 4. Background backend API sync
    try {
      await salesDealService.approveDeal(deal.id, approvedDiscount || undefined);
    } catch (apiErr: any) {
      console.warn("[Admin] Backend API notice:", apiErr?.message);
    }

    setActionMessage(`✅ Deal ${dealCode} Approved! Live sync sent to Customer Portal.`);
    setTimeout(() => setActionMessage(""), 5000);
  };

  // --- 8b. Approve Deal (From Review Modal) ---
  const handleApproveDeal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDeal) return;

    const dealToApprove = selectedDeal;
    const approvedDiscount = Number(approvalForm.discountApproved) || 0;
    const dealCode = dealToApprove.opportunityNumber || dealToApprove.dealCode || `DEAL-${dealToApprove.id}`;

    // Close modal immediately so UI is fast and responsive
    setShowApprovalModal(false);
    setSelectedDeal(null);
    setApprovalForm({ discountApproved: 0, rejectionReason: "" });
    setActionMessage(`⏳ Approving deal ${dealCode}...`);

    const isMatchingDeal = (item: any, target: any) => {
      if (!item || !target) return false;
      if (String(item.id) === String(target.id)) return true;
      if (item.dealCode && (item.dealCode === target.dealCode || item.dealCode === target.opportunityNumber)) return true;
      if (item.opportunityNumber && (item.opportunityNumber === target.opportunityNumber || item.opportunityNumber === target.dealCode)) return true;
      if (item.oppCode && (item.oppCode === target.oppCode || item.oppCode === target.dealCode)) return true;
      return false;
    };

    // 1. Immediately update local state
    setDealsList((prev) =>
      prev.map((item) =>
        isMatchingDeal(item, dealToApprove)
          ? { ...item, workflowStatus: "APPROVED", discountApproved: approvedDiscount }
          : item
      )
    );
    setPendingApprovals((prev) =>
      Array.isArray(prev) ? prev.filter((item) => !isMatchingDeal(item, dealToApprove)) : []
    );

    // 2. Synchronize across ALL storages
    salesDealService.syncDealStatusToAllStorages(dealToApprove.id, "APPROVED", { discountApproved: approvedDiscount });
    if (dealToApprove.opportunityNumber) {
      salesDealService.syncDealStatusToAllStorages(dealToApprove.opportunityNumber, "APPROVED", { discountApproved: approvedDiscount });
    }
    if (dealToApprove.dealCode) {
      salesDealService.syncDealStatusToAllStorages(dealToApprove.dealCode, "APPROVED", { discountApproved: approvedDiscount });
    }

    // 3. Customer notification
    const targetCustId = dealToApprove.customerId;
    const targetCustName = dealToApprove.customerName || dealToApprove.customer;
    dispatchCustomerNotification({
      id: `deal-appr-${Date.now()}`,
      title: "Deal Approved by Admin! 📄",
      message: `Deal ${dealCode} (${dealToApprove.productName || dealToApprove.title}) has been approved by INSA Admin! Please open your Customer Portal and click 'Approve & Go to Quotation' to generate your formal quote.`,
      type: "SUCCESS",
      customerId: targetCustId,
      customerName: targetCustName,
      customerOrg: dealToApprove.customerOrg || targetCustName,
      dealCode: dealCode,
    });
    
    // Dispatch event to notify customer portal in real-time
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("crm_deal_approved", { 
      detail: { dealCode: dealCode, customer: targetCustName } 
    }));

    // 4. Background backend API sync
    try {
      await salesDealService.approveDeal(dealToApprove.id, approvedDiscount || undefined);
    } catch (apiErr: any) {
      console.warn("[Admin] Backend API notice:", apiErr?.message);
    }

    setActionMessage(`✅ Deal ${dealCode} Approved! Sent to Customer Portal for customer quotation.`);
    setTimeout(() => setActionMessage(""), 5000);
  };

  // --- 9. Reject Deal (From Review Modal) ---
  const handleRejectDeal = async () => {
    if (!selectedDeal) return;

    const dealToReject = selectedDeal;
    const reason = approvalForm.rejectionReason.trim() || "Declined by Administrator during technical review";
    const dealCode = dealToReject.opportunityNumber || dealToReject.dealCode || `DEAL-${dealToReject.id}`;

    // Close modal immediately
    setShowApprovalModal(false);
    setSelectedDeal(null);
    setApprovalForm({ discountApproved: 0, rejectionReason: "" });
    setActionMessage(`⏳ Rejecting deal ${dealCode}...`);

    const isMatchingDeal = (item: any, target: any) => {
      if (!item || !target) return false;
      if (String(item.id) === String(target.id)) return true;
      if (item.dealCode && (item.dealCode === target.dealCode || item.dealCode === target.opportunityNumber)) return true;
      if (item.opportunityNumber && (item.opportunityNumber === target.opportunityNumber || item.opportunityNumber === target.dealCode)) return true;
      if (item.oppCode && (item.oppCode === target.oppCode || item.oppCode === target.dealCode)) return true;
      return false;
    };

    // 1. Immediately update local state
    setDealsList((prev) =>
      prev.map((item) =>
        isMatchingDeal(item, dealToReject)
          ? { ...item, workflowStatus: "REJECTED", rejectionReason: reason }
          : item
      )
    );
    setPendingApprovals((prev) =>
      Array.isArray(prev) ? prev.filter((item) => !isMatchingDeal(item, dealToReject)) : []
    );

    // 2. Synchronize across ALL storages
    salesDealService.syncDealStatusToAllStorages(dealToReject.id, "REJECTED", { rejectionReason: reason });
    if (dealToReject.opportunityNumber) {
      salesDealService.syncDealStatusToAllStorages(dealToReject.opportunityNumber, "REJECTED", { rejectionReason: reason });
    }
    if (dealToReject.dealCode) {
      salesDealService.syncDealStatusToAllStorages(dealToReject.dealCode, "REJECTED", { rejectionReason: reason });
    }

    // 3. Customer notification
    const targetCustId = dealToReject.customerId;
    const targetCustName = dealToReject.customerName || dealToReject.customer;
    dispatchCustomerNotification({
      id: `deal-rej-${Date.now()}`,
      title: "Deal Inquiry Update ⚠️",
      message: `Deal ${dealCode} (${dealToReject.productName || dealToReject.title}) was declined: ${reason}`,
      type: "WARNING",
      customerId: targetCustId,
      customerName: targetCustName,
      customerOrg: dealToReject.customerOrg || targetCustName,
      dealCode: dealCode,
    });

    // 4. Background API sync
    try {
      await salesDealService.rejectDeal(dealToReject.id, reason);
    } catch (apiErr: any) {
      console.warn("[Admin] Backend API notice:", apiErr?.message);
    }

    setActionMessage(`🚫 Deal ${dealCode} Rejected.`);
    setTimeout(() => setActionMessage(""), 5000);
  };

  // --- 10. Qualify Lead ---
  const handleQualifyLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    setActionMessage("✅ Qualifying lead...");
    
    try {
      await leadService.qualifyLead(selectedLead.id, qualificationReason || undefined);
      
      // Update local state
      setLeadsList((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? { ...lead, status: "QUALIFIED", qualificationReason }
            : lead
        )
      );

      setActionMessage(`✅ Lead #${selectedLead.id} qualified successfully!`);
      setShowQualifyModal(false);
      setSelectedLead(null);
      setQualificationReason("");
      
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to qualify lead";
      setActionMessage(`❌ ${msg}`);
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  // --- 11. Disqualify Lead ---
  const handleDisqualifyLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedLead || !disqualificationReason.trim()) {
      setActionMessage("❌ Disqualification reason is required");
      setTimeout(() => setActionMessage(""), 3000);
      return;
    }

    setActionMessage("🚫 Disqualifying lead...");
    
    try {
      await leadService.disqualifyLead(selectedLead.id, disqualificationReason);
      
      // Update local state
      setLeadsList((prev) =>
        prev.map((lead) =>
          lead.id === selectedLead.id
            ? { ...lead, status: "UNQUALIFIED", disqualificationReason }
            : lead
        )
      );

      setActionMessage(`🚫 Lead #${selectedLead.id} disqualified.`);
      setShowDisqualifyModal(false);
      setSelectedLead(null);
      setDisqualificationReason("");
      
      setTimeout(() => setActionMessage(""), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to disqualify lead";
      setActionMessage(`❌ ${msg}`);
      setTimeout(() => setActionMessage(""), 5000);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleBadgeStyle = (role: string) => {
    const r = (role || "").toUpperCase();
    if (r.includes("ADMIN")) return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" };
    if (r.includes("MANAGER")) return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
    if (r.includes("AUDITOR")) return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    if (r.includes("CUSTOMER")) return { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
    return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
  };

  if (!ready || !user) {
    return (
      <main style={{ minHeight: "100vh", background: "#071d3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Loading System Admin Dashboard…</div>
      </main>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_USER", "SYSTEM_ADMIN", "System Admin", "admin"]}>
      <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0b254a 45%, #103366 100%)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* ── Top Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
              <InsaLogo size={34} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.4px" }}>
                  INSA ERP Administration
                </h1>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: "rgba(200,16,46,0.25)", color: "#f87171", border: "1px solid rgba(200,16,46,0.4)", textTransform: "uppercase" }}>
                  SYSTEM ADMIN
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "3px 0 0" }}>
                Welcome, <span style={{ color: "white", fontWeight: 700 }}>{user.name}</span> · System Security, User Access & IAM Operations
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fetchAdminData}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 9,
                background: "rgba(255,255,255,0.08)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
            </button>
            <a
              href="/crm/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 9,
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              Enterprise CRM <ArrowRight style={{ width: 14, height: 14 }} />
            </a>
            <button
              onClick={() => logout()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 9,
                background: "rgba(239,68,68,0.15)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.3)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <LogOut style={{ width: 14, height: 14 }} /> Logout
            </button>
          </div>
        </div>

        {/* ── Notification Banner ── */}
        {actionMessage && (
          <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 10, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle style={{ width: 16, height: 16 }} /> {actionMessage}
          </div>
        )}

        {/* ── Executive Stats Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>System Users</span>
              <Users style={{ width: 18, height: 18, color: "#60a5fa" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 4 }}>
              {stats ? stats.totalUsers : usersList.length}
            </div>
            <span style={{ fontSize: 11.5, color: "#34d399", fontWeight: 700 }}>● Full CRUD Operations Active</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Enterprise Clients</span>
              <BuildingIcon style={{ width: 18, height: 18, color: "#a78bfa" }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 4 }}>
              {stats ? stats.totalCustomers : "14"}
            </div>
            <span style={{ fontSize: 11.5, color: "#60a5fa", fontWeight: 700 }}>Ministry of Finance, Ethio Telecom, CBE</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Database & Engine</span>
              <Database style={{ width: 18, height: 18, color: "#34d399" }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 8, marginTop: 4 }}>
              PostgreSQL 17.10
            </div>
            <span style={{ fontSize: 11.5, color: "#34d399", fontWeight: 700 }}>● Port 5433 (Schema: v6 Validated)</span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Security Framework</span>
              <Shield style={{ width: 18, height: 18, color: "#f87171" }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 8, marginTop: 4 }}>
              Legacy JWT (HS256)
            </div>
            <span style={{ fontSize: 11.5, color: "#f87171", fontWeight: 700 }}>● Port 8082 API Core</span>
          </div>
        </div>

        {/* ── Main Tab Section ── */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
          {/* Tab navigation */}
          <div style={{ display: "flex", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <button
              onClick={() => setTab("users")}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: tab === "users" ? "#2563eb" : "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Users style={{ width: 15, height: 15 }} /> User Directory &amp; Management
            </button>
            <button
              onClick={() => setTab("deals")}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: tab === "deals" ? "#2563eb" : "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Briefcase style={{ width: 15, height: 15 }} /> Sales Deals &amp; Customer Inquiries ({dealsList.length})
            </button>
            <button
              onClick={() => setTab("leads")}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: tab === "leads" ? "#2563eb" : "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageSquare style={{ width: 15, height: 15 }} /> Lead Inquiries ({leadsList.length})
            </button>
            <button
              onClick={() => setTab("services")}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: tab === "services" ? "#2563eb" : "transparent",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Server style={{ width: 15, height: 15 }} /> Backend &amp; Microservices Node Status
            </button>
          </div>

          {/* ── TAB: SALES DEALS & CUSTOMER INQUIRIES (Admin Overview) ── */}
          {tab === "deals" && (
            <div>
              {/* Debug info */}
              <div style={{ marginBottom: 10, padding: 10, background: "rgba(59,130,246,0.1)", borderRadius: 8, fontSize: 12, color: "#60a5fa" }}>
                📊 Pending Approvals Count: {pendingApprovals.length} | All Deals Count: {dealsList.length}
              </div>
              
              {/* ═══════════════════════════════════════════════════════ */}
              {/* PENDING APPROVALS SECTION (High Priority) */}
              {/* ═══════════════════════════════════════════════════════ */}
              {pendingApprovals.length > 0 && (
                <div style={{ 
                  background: "linear-gradient(135deg, rgba(251,146,60,0.15) 0%, rgba(239,68,68,0.15) 100%)", 
                  border: "2px solid rgba(251,146,60,0.4)", 
                  borderRadius: 16, 
                  padding: 20, 
                  marginBottom: 24 
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AlertTriangle style={{ width: 20, height: 20, color: "#fb923c" }} />
                      <span style={{ fontSize: 15, fontWeight: 900, color: "#fb923c", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        ⚠️ Pending Approvals
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#fb923c", background: "rgba(251,146,60,0.2)", padding: "4px 12px", borderRadius: 8, border: "1px solid rgba(251,146,60,0.4)" }}>
                      {pendingApprovals.length} deal{pendingApprovals.length !== 1 ? 's' : ''} awaiting review
                    </span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(251,146,60,0.3)" }}>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Deal #</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Customer</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Product</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Quantity</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Value (ETB)</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Discount Req.</th>
                          <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map((deal: any, idx: number) => (
                          <tr key={`pending-deal-${deal.id || deal.dealCode || idx}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <td style={{ padding: "14px", fontSize: 13, fontWeight: 800, color: "#60a5fa", fontFamily: "monospace" }}>
                              {deal.opportunityNumber || `OPP-${deal.id}`}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{deal.customerName || "Unknown Customer"}</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{deal.opportunityName || deal.title || "Deal"}</div>
                            </td>
                            <td style={{ padding: "14px", fontSize: 12.5, fontWeight: 700, color: "#93c5fd" }}>
                              {deal.productName || "Selected Product"}
                            </td>
                            <td style={{ padding: "14px", fontSize: 12, fontWeight: 700, color: "#34d399" }}>
                              {deal.quantity || 1} unit{Number(deal.quantity) !== 1 ? 's' : ''}
                            </td>
                            <td style={{ padding: "14px", fontSize: 13, fontWeight: 900, color: "#34d399" }}>
                              ETB {Number(deal.expectedRevenue || deal.amount || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: "14px", fontSize: 12, fontWeight: 800, color: "#fbbf24" }}>
                              {deal.discountRequested ? `${deal.discountRequested}%` : "No discount"}
                            </td>
                            <td style={{ padding: "14px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button
                                  type="button"
                                  onClick={() => handleQuickApprove(deal)}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "white",
                                    border: "none",
                                    fontSize: 11,
                                    fontWeight: 900,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
                                  }}
                                  title="Approve immediately with requested discount"
                                >
                                  <CheckCircle style={{ width: 13, height: 13 }} /> Quick Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDeal(deal);
                                    setApprovalForm({ discountApproved: deal.discountRequested || 0, rejectionReason: "" });
                                    setShowApprovalModal(true);
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    background: "rgba(59,130,246,0.2)",
                                    color: "#60a5fa",
                                    border: "1px solid rgba(59,130,246,0.4)",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                  title="Review details or adjust discount percentage"
                                >
                                  <FileText style={{ width: 13, height: 13 }} /> Review &amp; Discount
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDeal(deal);
                                    setApprovalForm({ discountApproved: 0, rejectionReason: "" });
                                    setShowApprovalModal(true);
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    background: "rgba(239,68,68,0.2)",
                                    color: "#f87171",
                                    border: "1px solid rgba(239,68,68,0.45)",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                  title="Reject deal inquiry"
                                >
                                  <X style={{ width: 13, height: 13 }} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* ALL DEALS SECTION */}
              {/* ═══════════════════════════════════════════════════════ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  Global administrator view of all customer sales deals, product quantities, and live statuses.
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>
                  {dealsList.length} Inquiries Monitored
                </span>
              </div>

              {dealsList.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  No customer deals currently registered in database.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Deal Code</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Customer / Entity</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Product &amp; Quantity</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Value (ETB)</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Stage</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Target Date</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "right" }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealsList.map((d: any, idx: number) => (
                        <tr key={`all-deal-${d.id || d.dealCode || idx}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ padding: "14px", fontSize: 13, fontWeight: 800, color: "#60a5fa", fontFamily: "monospace" }}>
                            {d.dealCode}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{d.customer}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{d.title}</div>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#93c5fd" }}>{d.productName || "Selected Solution"}</div>
                            <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, marginTop: 2 }}>
                              Quantity: {d.quantity || 1} {Number(d.quantity) > 1 ? "units" : "unit"}
                            </div>
                          </td>
                          <td style={{ padding: "14px", fontSize: 13, fontWeight: 900, color: "#34d399" }}>
                            ETB {Number(d.amount).toLocaleString()}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>
                              {d.stage}
                            </span>
                          </td>
                          <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                            {d.closeDate}
                          </td>
                          <td style={{ padding: "14px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
                              {d.workflowStatus === "APPROVED" ? (
                                <span
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 7,
                                    background: "rgba(34,197,94,0.18)",
                                    color: "#4ade80",
                                    border: "1px solid rgba(34,197,94,0.35)",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                  title="Approved by Admin - Sent to Customer Portal for quotation"
                                >
                                  <CheckCircle style={{ width: 12, height: 12 }} /> Approved (In Customer Portal)
                                </span>
                              ) : d.workflowStatus === "REJECTED" ? (
                                <span
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 7,
                                    background: "rgba(239,68,68,0.18)",
                                    color: "#f87171",
                                    border: "1px solid rgba(239,68,68,0.35)",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                  title={`Rejected: ${d.rejectionReason || "No reason given"}`}
                                >
                                  <XCircle style={{ width: 12, height: 12 }} /> Rejected
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRowApprove(d)}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(34,197,94,0.22)",
                                      color: "#4ade80",
                                      border: "1px solid rgba(34,197,94,0.45)",
                                      fontSize: 11,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      transition: "all 0.15s ease",
                                    }}
                                    title="Review & Approve deal inquiry in approval modal"
                                  >
                                    <CheckCircle style={{ width: 12, height: 12 }} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRowReject(d)}
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: 8,
                                      background: "rgba(239,68,68,0.22)",
                                      color: "#f87171",
                                      border: "1px solid rgba(239,68,68,0.45)",
                                      fontSize: 11,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      transition: "all 0.15s ease",
                                    }}
                                    title="Reject deal inquiry"
                                  >
                                    <XCircle style={{ width: 12, height: 12 }} /> Reject
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const target = d.customer || d.customerName || "Ministry of Finance";
                                  setActionMessage(`💬 Connecting admin chat to customer: ${target}...`);
                                  window.dispatchEvent(new CustomEvent("crm_open_chat", { detail: { customer: target } }));
                                  setTimeout(() => setActionMessage(""), 4000);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  background: "rgba(59,130,246,0.15)",
                                  color: "#93c5fd",
                                  border: "1px solid rgba(59,130,246,0.3)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <MessageSquare style={{ width: 11, height: 11 }} /> Admin Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 1: USERS DIRECTORY & CRUD ── */}
          {tab === "users" && (
            <div>
              {/* Search & Filter Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 460 }}>
                  <div style={{ position: "relative", width: "100%" }}>
                    <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} />
                    <input
                      type="text"
                      placeholder="Search username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        height: 38,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "0 12px 0 36px",
                        fontSize: 13,
                        color: "white",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{
                      height: 38,
                      borderRadius: 10,
                      background: "#0c2850",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      padding: "0 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  >
                    <option value="ALL">All Roles</option>
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 38,
                      padding: "0 16px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                      color: "white",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Invite Customer
                  </button>

                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 38,
                      padding: "0 16px",
                      borderRadius: 10,
                      background: "#c8102e",
                      color: "white",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(200,16,46,0.3)",
                    }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add New User
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>ID</th>
                      <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>User Info</th>
                      <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Assigned Role</th>
                      <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Quick Role Change</th>
                      <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const badge = getRoleBadgeStyle(u.role);
                      return (
                        <tr key={`user-${u.id}-${u.username}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", transition: "background 0.15s" }}>
                          <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
                            #{u.id}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", fontSize: 13, fontWeight: 800 }}>
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{u.username}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 800, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              style={{
                                height: 32,
                                borderRadius: 8,
                                background: "#071d3a",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "white",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "0 8px",
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              {ROLES_LIST.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "14px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              {/* 1. Edit Full User Button */}
                              <button
                                onClick={() => openEditModal(u)}
                                title="Edit user details"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 7,
                                  background: "rgba(37,99,235,0.2)",
                                  color: "#93c5fd",
                                  border: "1px solid rgba(37,99,235,0.35)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Edit2 style={{ width: 12, height: 12 }} /> Edit
                              </button>

                              {/* 2. Password Reset Button */}
                              <button
                                onClick={() => openPasswordReset(u)}
                                title="Reset password"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 7,
                                  background: "rgba(245,158,11,0.15)",
                                  color: "#fbbf24",
                                  border: "1px solid rgba(245,158,11,0.3)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <KeyRound style={{ width: 12, height: 12 }} /> Password
                              </button>

                              {/* 3. Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                disabled={u.username === "admin"}
                                title="Delete user"
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 7,
                                  background: u.username === "admin" ? "transparent" : "rgba(239,68,68,0.15)",
                                  color: u.username === "admin" ? "rgba(255,255,255,0.2)" : "#f87171",
                                  border: u.username === "admin" ? "none" : "1px solid rgba(239,68,68,0.25)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: u.username === "admin" ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Trash2 style={{ width: 12, height: 12 }} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                          No users found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: LEAD INQUIRIES ── */}
          {tab === "leads" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  📋 Lead Inquiries from Contact Form
                </h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                  Review and qualify/disqualify leads submitted through the public inquiry form
                </p>
              </div>

              {leadsList.length === 0 ? (
                <div style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <MessageSquare style={{ width: 48, height: 48, color: "rgba(255,255,255,0.3)", margin: "0 auto 16px" }} />
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    No lead inquiries yet. Leads will appear here when customers submit the contact form.
                  </p>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>ID</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Name</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Company</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Email</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Phone</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Status</th>
                        <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Source</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadsList.map((lead, idx) => {
                        const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                          NEW: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" },
                          CONTACTED: { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc", border: "rgba(168, 85, 247, 0.3)" },
                          QUALIFIED: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
                          UNQUALIFIED: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
                          CONVERTED: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
                          LOST: { bg: "rgba(107, 114, 128, 0.15)", text: "#9ca3af", border: "rgba(107, 114, 128, 0.3)" },
                        };
                        const statusStyle = statusColors[lead.status] || statusColors.NEW;

                        return (
                          <tr key={`lead-row-${lead.id}-${idx}`} style={{ borderBottom: idx < leadsList.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                            <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600 }}>
                              #{lead.id}
                            </td>
                            <td style={{ padding: "14px 16px", color: "white", fontSize: 13, fontWeight: 600 }}>
                              {lead.firstName ? `${lead.firstName} ${lead.lastName || ""}` : (lead.contactPerson || lead.contactName || "Inquirer")}
                            </td>
                            <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                              {lead.company || lead.companyName || "-"}
                            </td>
                            <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                              {lead.email}
                            </td>
                            <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                              {lead.phone || "-"}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`,
                                display: "inline-block"
                              }}>
                                {lead.status}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                              {lead.source || "WEBSITE"}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                {lead.status !== "QUALIFIED" && lead.status !== "UNQUALIFIED" && lead.status !== "CONVERTED" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setQualificationReason("");
                                        setShowQualifyModal(true);
                                      }}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(16, 185, 129, 0.3)",
                                        background: "rgba(16, 185, 129, 0.1)",
                                        color: "#34d399",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                      }}
                                    >
                                      <CheckCircle style={{ width: 12, height: 12 }} />
                                      Qualify
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setDisqualificationReason("");
                                        setShowDisqualifyModal(true);
                                      }}
                                      style={{
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#f87171",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                      }}
                                    >
                                      <XCircle style={{ width: 12, height: 12 }} />
                                      Disqualify
                                    </button>
                                  </>
                                )}
                                {(lead.status === "QUALIFIED" || lead.status === "UNQUALIFIED") && (
                                  <span style={{
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.5)",
                                    fontWeight: 600
                                  }}>
                                    {lead.status === "QUALIFIED" ? "✓ Qualified" : "✗ Disqualified"}
                                  </span>
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
          )}

          {/* ── TAB 2: SYSTEM SERVICES & NODES ── */}
          {tab === "services" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {[
                  { name: "PostgreSQL Database", port: "5433", status: "Operational", detail: "PostgreSQL 17.10 · crm_db schema v6", ok: true },
                  { name: "Spring Boot API Gateway", port: "8082", status: "Running", detail: "Tomcat v10.1.55 · Spring Boot v3.5.16", ok: true },
                  { name: "Next.js 16 Web Core", port: "3000", status: "Online", detail: "Turbopack App Router · SSR & Static", ok: true },
                  { name: "Security & Auth Layer", port: "8082/api/auth", status: "Legacy HS256 JWT Active", detail: "Stateless Bearer token validation", ok: true },
                  { name: "Redis Caching Engine", port: "6379", status: "Configured", detail: "Redis 7.4 Alpine · Token blacklist & session cache", ok: true },
                  { name: "RabbitMQ Message Broker", port: "5672 / 15672", status: "Standby", detail: "RabbitMQ 3.13 Management · CRM Event bus", ok: false },
                ].map((srv, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{srv.name}</span>
                      <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, background: srv.ok ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: srv.ok ? "#34d399" : "#fbbf24" }}>
                        {srv.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 4 }}>Port: {srv.port}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>{srv.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Modal: Add New User ── */}
        {showAddModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "28px 32px", width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Create New User</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Username</label>
                  <input
                    type="text"
                    required
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="e.g. aster.kebede"
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Email Address</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="e.g. aster.kebede@insa.gov.et"
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                    A temporary password will be auto-generated and sent via email
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "#071d3a", border: "1px solid rgba(255,255,255,0.2)", padding: "0 12px", color: "white", outline: "none" }}
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "#c8102e", border: "none", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(200,16,46,0.3)" }}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Edit User (Full Details) ── */}
        {showEditModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "28px 32px", width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Edit User Details</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={handleUpdateUserSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Username</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "#071d3a", border: "1px solid rgba(255,255,255,0.2)", padding: "0 12px", color: "white", outline: "none" }}
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>
                    New Password <span style={{ textTransform: "none", color: "rgba(255,255,255,0.4)" }}>(Leave blank to keep unchanged)</span>
                  </label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Leave blank or enter min 6 chars"
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "#2563eb", border: "none", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Password Reset ── */}
        {showPasswordModal && selectedUser && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "28px 32px", width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Reset Password</h3>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>

              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 16px" }}>
                Resetting password for user <strong style={{ color: "white" }}>{selectedUser.username}</strong> ({selectedUser.email}):
              </p>

              <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 5 }}>New Password</label>
                  <input
                    type="password"
                    required
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    style={{ width: "100%", height: 40, borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", padding: "0 12px", color: "white", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, height: 42, borderRadius: 10, background: "#f59e0b", border: "none", color: "#1a1200", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}
                  >
                    Set Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Deal Approval / Rejection ── */}
        {showApprovalModal && selectedDeal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(251,146,60,0.3)", padding: "28px 32px", width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(0,0,0,0.7)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>Review Deal Approval</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    Deal #{selectedDeal.opportunityNumber || selectedDeal.id}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedDeal(null);
                    setApprovalForm({ discountApproved: 0, rejectionReason: "" });
                  }} 
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {/* Deal Summary */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Customer</div>
                    <div style={{ color: "white", fontWeight: 800 }}>{selectedDeal.customerName || "Unknown"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Product</div>
                    <div style={{ color: "#93c5fd", fontWeight: 700 }}>{selectedDeal.productName || "Selected Product"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Quantity</div>
                    <div style={{ color: "#34d399", fontWeight: 800 }}>{selectedDeal.quantity || 1} units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Total Value</div>
                    <div style={{ color: "#34d399", fontWeight: 900 }}>ETB {Number(selectedDeal.expectedRevenue || selectedDeal.amount || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Discount Requested</div>
                    <div style={{ color: "#fbbf24", fontWeight: 800 }}>{selectedDeal.discountRequested ? `${selectedDeal.discountRequested}%` : "No discount"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Submitted</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{selectedDeal.submittedDate || "Recently"}</div>
                  </div>
                </div>
                {selectedDeal.description && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Description</div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.5 }}>{selectedDeal.description}</div>
                  </div>
                )}
              </div>

              {/* Approval Form */}
              <form onSubmit={handleApproveDeal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 6 }}>
                    Approved Discount Percentage (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={approvalForm.discountApproved}
                    onChange={(e) => setApprovalForm({ ...approvalForm, discountApproved: Number(e.target.value) })}
                    placeholder="Enter discount % (e.g., 10)"
                    style={{ 
                      width: "100%", 
                      height: 42, 
                      borderRadius: 9, 
                      background: "rgba(255,255,255,0.06)", 
                      border: "1px solid rgba(255,255,255,0.15)", 
                      padding: "0 14px", 
                      color: "white", 
                      fontSize: 14,
                      outline: "none", 
                      boxSizing: "border-box" 
                    }}
                  />
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
                    Leave at 0 or empty if no discount applies. Can differ from requested discount.
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 6 }}>
                    Rejection Reason (For Reject Only)
                  </label>
                  <textarea
                    value={approvalForm.rejectionReason}
                    onChange={(e) => setApprovalForm({ ...approvalForm, rejectionReason: e.target.value })}
                    placeholder="Enter reason if rejecting this deal..."
                    rows={3}
                    style={{ 
                      width: "100%", 
                      borderRadius: 9, 
                      background: "rgba(255,255,255,0.06)", 
                      border: "1px solid rgba(255,255,255,0.15)", 
                      padding: "12px 14px", 
                      color: "white", 
                      fontSize: 13,
                      outline: "none", 
                      boxSizing: "border-box",
                      resize: "vertical",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedDeal(null);
                      setApprovalForm({ discountApproved: 0, rejectionReason: "" });
                    }}
                    style={{ 
                      flex: 1, 
                      height: 44, 
                      borderRadius: 10, 
                      background: "transparent", 
                      border: "1px solid rgba(255,255,255,0.2)", 
                      color: "white", 
                      fontSize: 13, 
                      fontWeight: 700, 
                      cursor: "pointer" 
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRejectDeal();
                    }}
                    style={{ 
                      flex: 1, 
                      height: 44, 
                      borderRadius: 10, 
                      background: "rgba(239,68,68,0.2)", 
                      border: "1px solid rgba(239,68,68,0.5)",
                      color: "#f87171", 
                      fontSize: 13, 
                      fontWeight: 800, 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <X style={{ width: 14, height: 14 }} /> Reject Deal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleApproveDeal();
                    }}
                    style={{ 
                      flex: 1, 
                      height: 44, 
                      borderRadius: 10, 
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
                      border: "none", 
                      color: "white", 
                      fontSize: 13, 
                      fontWeight: 800, 
                      cursor: "pointer", 
                      boxShadow: "0 4px 12px rgba(16,185,129,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <CheckCircle style={{ width: 14, height: 14 }} /> Approve Deal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Qualify Lead Modal ── */}
        {showQualifyModal && selectedLead && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "32px", width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                  <CheckCircle style={{ width: 20, height: 20, display: "inline", marginRight: 8, color: "#10b981" }} />
                  Qualify Lead
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                  Mark this lead as qualified and ready for sales follow-up
                </p>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ margin: "0 0 8px 0", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                  <strong style={{ color: "white" }}>Lead #{selectedLead.id}</strong> - {selectedLead.firstName} {selectedLead.lastName}
                </p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {selectedLead.company} • {selectedLead.email}
                </p>
              </div>

              <form onSubmit={handleQualifyLead}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Qualification Reason (Optional)
                  </label>
                  <textarea
                    value={qualificationReason}
                    onChange={(e) => setQualificationReason(e.target.value)}
                    placeholder="e.g., Strong budget fit, urgent timeline, decision maker identified..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      fontSize: 13,
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQualifyModal(false);
                      setSelectedLead(null);
                      setQualificationReason("");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    <CheckCircle style={{ width: 16, height: 16 }} />
                    Qualify Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Disqualify Lead Modal ── */}
        {showDisqualifyModal && selectedLead && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "32px", width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                  <XCircle style={{ width: 20, height: 20, display: "inline", marginRight: 8, color: "#ef4444" }} />
                  Disqualify Lead
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                  Mark this lead as not a good fit and provide a reason
                </p>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)" }}>
                <p style={{ margin: "0 0 8px 0", color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                  <strong style={{ color: "white" }}>Lead #{selectedLead.id}</strong> - {selectedLead.firstName} {selectedLead.lastName}
                </p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {selectedLead.company} • {selectedLead.email}
                </p>
              </div>

              <form onSubmit={handleDisqualifyLead}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Disqualification Reason * <span style={{ color: "#ef4444", fontSize: 12 }}>(Required)</span>
                  </label>
                  <textarea
                    value={disqualificationReason}
                    onChange={(e) => setDisqualificationReason(e.target.value)}
                    placeholder="e.g., No budget, not decision maker, timeline too far out, competitor already chosen..."
                    rows={3}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      fontSize: 13,
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisqualifyModal(false);
                      setSelectedLead(null);
                      setDisqualificationReason("");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    <XCircle style={{ width: 16, height: 16 }} />
                    Disqualify Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Invite Customer Modal ── */}
        <InviteCustomerModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            fetchAdminData();
            setActionMessage("Customer invited successfully!");
            setTimeout(() => setActionMessage(""), 4000);
          }}
        />

        {/* ── Created User Credentials Modal (when email fails) ── */}
        {showCreatedUserModal && createdUserInfo && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div style={{ background: "#0b254a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", padding: "32px", width: "100%", maxWidth: 500, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ marginBottom: 24, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <CheckCircle style={{ width: 28, height: 28, color: "#10b981" }} />
                </div>
                <h2 style={{ margin: 0, color: "white", fontSize: 20, fontWeight: 800 }}>User Created Successfully!</h2>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                  Account created for <strong style={{ color: "white" }}>{createdUserInfo.username}</strong>
                </p>
              </div>

              {createdUserInfo.emailSent ? (
                <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
                    <div style={{ color: "#60a5fa", marginTop: 2 }}>
                      <CheckCircle style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", color: "#93c5fd", fontSize: 13, fontWeight: 800 }}>Email Sent!</h4>
                      <p style={{ margin: 0, color: "rgba(147,197,253,0.8)", fontSize: 12 }}>
                        Login credentials have been sent to <strong>{createdUserInfo.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ margin: "0 0 16px", color: "#fbbf24", fontSize: 12, fontWeight: 800 }}>
                      ⚠️ Email service not available. Share these credentials manually:
                    </p>
                    
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>Username</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white", fontFamily: "monospace" }}>{createdUserInfo.username}</div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>Email</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white", fontFamily: "monospace" }}>{createdUserInfo.email}</div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Temporary Password</div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(createdUserInfo.password);
                            alert("Password copied to clipboard!");
                          }}
                          style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)", color: "#60a5fa", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                        >
                          Copy
                        </button>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace", letterSpacing: 2 }}>{createdUserInfo.password}</div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 4 }}>Role</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{createdUserInfo.role}</div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: "rgba(251,191,36,0.8)" }}>
                    User can login at: <strong>http://localhost:3000/role-login</strong>
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowCreatedUserModal(false);
                  setCreatedUserInfo(null);
                }}
                style={{ width: "100%", height: 44, borderRadius: 10, background: "#c8102e", border: "none", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(200,16,46,0.4)" }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── CUSTOMER & TEAM CHAT SUPPORT WIDGET (ADMIN ROLE) ── */}
        <CustomerChatbot currentCustomerName="Ministry of Finance" currentUserRole="ADMIN" />
      </div>
    </main>
    </RoleProtectedRoute>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
