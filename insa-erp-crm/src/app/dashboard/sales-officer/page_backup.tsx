"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import InsaLogo from "@/components/ui/InsaLogo";
import {
  TrendingUp,
  Users,
  Target,
  Plus,
  Briefcase,
  FileText,
  Receipt,
  LogOut,
  DollarSign,
  MapPin,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send,
  Download,
  TrendingDown,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  ShoppingCart,
  Package,
  Layers,
  Video,
  MessageSquare,
} from "lucide-react";
import commissionService, { Commission, CommissionSummary } from "@/services/commissionService";
import territoryService, { TerritoryResponse } from "@/services/territoryService";
import customerService from "@/services/customerService";
import quotationService, { QuotationResponse } from "@/services/quotationService";
import orderService from "@/services/orderService";
import opportunityService, { OpportunityResponse, OpportunityStage } from "@/services/opportunityService";
import activityService, { InteractionResponse, InteractionType } from "@/services/activityService";
import quotaService, { PerformanceMetrics, LeaderboardEntry } from "@/services/quotaService";

interface LeadItem {
  id: string;
  name: string;
  org: string;
  status: "Hot" | "Warm" | "Cold";
  stage: string;
  value: string;
  due: string;
}

interface Customer360Data {
  id: number;
  customerNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: string;
  accountHealth: "EXCELLENT" | "GOOD" | "AT_RISK" | "CHURNED";
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
}

export default function SalesOfficerPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  // Main navigation state
  const [activeModule, setActiveModule] = useState<
    "dashboard" | "commissions" | "proposals" | "territory" | "customer360" | "leads" | "pipeline" | "activities" | "quota"
  >("dashboard");
  
  const [actionNotice, setActionNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Commission Module State
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionFilter, setCommissionFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "PAID">("ALL");

  // Territory Module State
  const [territories, setTerritories] = useState<TerritoryResponse[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryResponse | null>(null);

  // Proposal/Quote Builder State
  const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerName: "",
    customerId: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    notes: "",
    validityDays: 30,
  });

  // Customer 360 State
  const [customer360, setCustomer360] = useState<Customer360Data | null>(null);
  const [customersList, setCustomersList] = useState<any[]>([]);

  // Deal Pipeline State (NEW - Phase 3A)
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<OpportunityResponse | null>(null);
  const [showCloseDealModal, setShowCloseDealModal] = useState(false);
  const [closeDealForm, setCloseDealForm] = useState({ status: "CLOSED_WON" as "CLOSED_WON" | "CLOSED_LOST", notes: "" });

  // Activity Logging State (NEW - Phase 3A)
  const [activities, setActivities] = useState<InteractionResponse[]>([]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "PHONE_CALL",
    customerId: 0,
    notes: "",
    duration: 0,
    outcome: "POSITIVE",
  });

  // Quota Tracker State (NEW - Phase 3A)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Leads State
  const [leadsList, setLeadsList] = useState<LeadItem[]>([
    { id: "LD-2025-081", name: "Dr. Aster Kebede", org: "Zemen Bank S.C.", status: "Hot", stage: "Proposal & Quotation", value: "ETB 420,000", due: "Today" },
    { id: "LD-2025-080", name: "Ato Mulatu Teshome", org: "Awash Insurance", status: "Warm", stage: "Contract Negotiation", value: "ETB 185,000", due: "Tomorrow" },
    { id: "LD-2025-079", name: "W/ro Hanna Girma", org: "Ethio Telecom Core", status: "Hot", stage: "Demo & Solution Review", value: "ETB 750,000", due: "3 days" },
  ]);

  // Auth check
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      window.location.href = "/login?from=/dashboard/sales-officer";
      return;
    }
    const role = (user.role || "").toLowerCase();
    if (role.includes("customer") || role.includes("client")) {
      window.location.href = "/customer/dashboard";
      return;
    }
    if (!role.includes("officer") && !role.includes("rep") && !role.includes("sales") && !role.includes("admin")) {
      window.location.href = "/role-login";
    }
  }, [ready, user]);

  // Load Commission Data
  useEffect(() => {
    if (activeModule === "commissions" && user) {
      loadCommissionData();
    }
  }, [activeModule, user]);

  // Load Territory Data
  useEffect(() => {
    if (activeModule === "territory") {
      loadTerritoryData();
    }
  }, [activeModule]);

  // Load Proposals/Quotations
  useEffect(() => {
    if (activeModule === "proposals") {
      loadQuotations();
    }
  }, [activeModule]);

  // Load Customers for 360 view
  useEffect(() => {
    if (activeModule === "customer360") {
      loadCustomers();
    }
  }, [activeModule]);

  // Load Pipeline (NEW - Phase 3A)
  useEffect(() => {
    if (activeModule === "pipeline") {
      loadOpportunities();
    }
  }, [activeModule]);

  // Load Activities (NEW - Phase 3A)
  useEffect(() => {
    if (activeModule === "activities") {
      loadActivities();
    }
  }, [activeModule]);

  // Load Quota Data (NEW - Phase 3A)
  useEffect(() => {
    if (activeModule === "quota") {
      loadQuotaData();
    }
  }, [activeModule, user]);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      // Use a default ID or extract from user
      const salesOfficerId = (user as any)?.id || 1;
      
      const [summary, commissionsList] = await Promise.all([
        commissionService.getCommissionSummary(salesOfficerId),
        commissionService.getSalesOfficerCommissions(salesOfficerId),
      ]);
      
      setCommissionSummary(summary);
      setCommissions(commissionsList);
    } catch (error) {
      console.error("Failed to load commission data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTerritoryData = async () => {
    setLoading(true);
    try {
      const territoriesList = await territoryService.getActiveTerritories();
      setTerritories(territoriesList);
    } catch (error) {
      console.error("Failed to load territories:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const result = await quotationService.getAllQuotations();
      const quotesList = Array.isArray(result) ? result : result.content || [];
      setQuotations(quotesList);
    } catch (error) {
      console.error("Failed to load quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await customerService.getAllCustomers();
      const customers = Array.isArray(result) ? result : result.content || [];
      setCustomersList(customers);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load Pipeline/Opportunities (NEW - Phase 3A)
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const result = await opportunityService.getAllOpportunities();
      const opps = Array.isArray(result) ? result : result.content || [];
      setOpportunities(opps);
    } catch (error) {
      console.error("Failed to load opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load Activities (NEW - Phase 3A)
  const loadActivities = async () => {
    setLoading(true);
    try {
      const result = await activityService.getAllInteractions();
      const acts = Array.isArray(result) ? result : result.content || [];
      setActivities(acts);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load Quota/Performance (NEW - Phase 3A)
  const loadQuotaData = async () => {
    setLoading(true);
    try {
      const salesOfficerId = (user as any)?.id || 1;
      const [metrics, leaderboardData] = await Promise.all([
        quotaService.getPerformanceMetrics(salesOfficerId),
        quotaService.getLeaderboard("MONTHLY"),
      ]);
      setPerformanceMetrics(metrics);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Failed to load quota data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalAmount = quoteForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + quoteForm.validityDays);

      const newQuotation = await quotationService.createQuotation({
        customerName: quoteForm.customerName,
        customerId: quoteForm.customerId || undefined,
        totalAmount,
        expiryDate: expiryDate.toISOString().split("T")[0],
        issueDate: new Date().toISOString().split("T")[0],
        status: "DRAFT",
        notes: quoteForm.notes,
        items: quoteForm.items,
      });

      setQuotations([newQuotation, ...quotations]);
      setShowQuoteBuilder(false);
      setQuoteForm({
        customerName: "",
        customerId: "",
        items: [{ description: "", quantity: 1, unitPrice: 0 }],
        notes: "",
        validityDays: 30,
      });
      setActionNotice("✅ Quotation created successfully!");
      setTimeout(() => setActionNotice(""), 3000);
    } catch (error) {
      console.error("Failed to create quotation:", error);
      setActionNotice("❌ Failed to create quotation");
      setTimeout(() => setActionNotice(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer360 = async (customerId: number) => {
    setLoading(true);
    try {
      const customer = await customerService.getCustomerById(customerId);
      
      // Mock 360 data - in production, this would come from aggregated backend APIs
      const customer360Data: Customer360Data = {
        id: customer.id,
        customerNumber: customer.customerNumber || "",
        companyName: customer.companyName || customer.name || "",
        contactName: customer.contactName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        status: customer.status || "ACTIVE",
        totalOrders: 12,
        totalRevenue: 2450000,
        lastOrderDate: "2026-10-15",
        accountHealth: "GOOD",
        recentActivity: [
          { type: "Order", description: "Placed order SO-2025-234", date: "2026-10-15" },
          { type: "Payment", description: "Paid invoice INV-2025-456", date: "2026-10-10" },
          { type: "Call", description: "Follow-up call completed", date: "2026-10-05" },
        ],
      };
      
      setCustomer360(customer360Data);
    } catch (error) {
      console.error("Failed to load customer 360:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(c => 
    commissionFilter === "ALL" || c.status === commissionFilter
  );

  // NEW HANDLER FUNCTIONS - Phase 3A

  // Handle stage change in Kanban (drag and drop)
  const handleStageChange = async (dealId: number, newStage: OpportunityStage) => {
    try {
      const updated = await opportunityService.updateStage(dealId, newStage);
      setOpportunities(opportunities.map(opp => opp.id === dealId ? updated : opp));
      setActionNotice(`Deal moved to ${newStage.replace("_", " ")}`);
      setTimeout(() => setActionNotice(""), 3000);
    } catch (error) {
      console.error("Failed to update stage:", error);
      setActionNotice("❌ Failed to update deal stage");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Handle close deal
  const handleCloseDeal = async () => {
    if (!selectedDeal) return;
    setLoading(true);
    try {
      await opportunityService.closeDeal(
        selectedDeal.id,
        closeDealForm.status,
        closeDealForm.notes
      );
      await loadOpportunities();
      setShowCloseDealModal(false);
      setSelectedDeal(null);
      setActionNotice(`✅ Deal closed as ${closeDealForm.status === "CLOSED_WON" ? "Won" : "Lost"}`);
      setTimeout(() => setActionNotice(""), 3000);
    } catch (error) {
      console.error("Failed to close deal:", error);
      setActionNotice("❌ Failed to close deal");
      setTimeout(() => setActionNotice(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle log activity
  const handleLogActivity = async () => {
    setLoading(true);
    try {
      await activityService.createInteraction({
        interactionType: activityForm.type as InteractionType,
        subject: `${activityForm.type} with Customer`,
        description: activityForm.notes,
        customerId: activityForm.customerId || undefined,
        interactionDate: new Date().toISOString(),
        completed: true,
      });
      await loadActivities();
      setActivityForm({
        type: "PHONE_CALL",
        customerId: 0,
        notes: "",
        duration: 0,
        outcome: "POSITIVE",
      });
      setActionNotice("✅ Activity logged successfully!");
      setTimeout(() => setActionNotice(""), 3000);
    } catch (error) {
      console.error("Failed to log activity:", error);
      setActionNotice("❌ Failed to log activity");
      setTimeout(() => setActionNotice(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Helper: get next stage in pipeline
  const getNextStage = (currentStage: string): string => {
    const stages = ["NEW", "NEEDS_ANALYSIS", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return currentStage;
    return stages[currentIndex + 1];
  };

  const statusColor: Record<string, { bg: string; text: string }> = {
    Hot: { bg: "rgba(200,16,46,0.2)", text: "#f87171" },
    Warm: { bg: "rgba(245,158,11,0.2)", text: "#fbbf24" },
    Cold: { bg: "rgba(59,130,246,0.2)", text: "#60a5fa" },
  };

  if (!ready || !user) {
    return (
      <main style={{ minHeight: "100vh", background: "#071d3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Loading Sales Officer Dashboard…</div>
      </main>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={["SALES_OFFICER", "SALES", "ADMIN"]}>
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #071d3a 0%, #0b254a 45%, #103366 100%)", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
              <InsaLogo size={34} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.4px" }}>
                  Sales Officer Portal
                </h1>
                <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: "rgba(200,16,46,0.25)", color: "#fca5a5", border: "1px solid rgba(200,16,46,0.4)", textTransform: "uppercase" }}>
                  SALES OFFICER · BUSINESS GENERATION
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "3px 0 0" }}>
                Welcome back, <span style={{ color: "white", fontWeight: 700 }}>{user.name}</span> · Commission Tracking · Territory Management · Customer 360°
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* ── Action Notice Banner ── */}
        {actionNotice && (
          <div style={{ marginBottom: 20, padding: "12px 18px", borderRadius: 12, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 style={{ width: 18, height: 18 }} /> {actionNotice}
          </div>
        )}

        {/* ── KPI Dashboard Cards ── */}
        {activeModule === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 26 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Commission Earned (MTD)</span>
                  <DollarSign style={{ width: 18, height: 18, color: "#34d399" }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#34d399", marginBottom: 4 }}>
                  ETB {commissionSummary?.totalCommissionEarned.toLocaleString() || "125,000"}
                </div>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>
                  Pending: <strong>ETB {commissionSummary?.totalCommissionPending.toLocaleString() || "45,000"}</strong>
                </span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Active Pipeline</span>
                  <Briefcase style={{ width: 18, height: 18, color: "#60a5fa" }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa", marginBottom: 4 }}>
                  ETB 1.85M
                </div>
                <span style={{ fontSize: 11.5, color: "#f87171", fontWeight: 700 }}>
                  {leadsList.filter(l => l.status === "Hot").length} Hot Leads
                </span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Quota Attainment</span>
                  <Target style={{ width: 18, height: 18, color: "#fbbf24" }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fbbf24", marginBottom: 4 }}>
                  87.5%
                </div>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>
                  Target: ETB 1.2M
                </span>
              </div>

              <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>My Customers</span>
                  <Users style={{ width: 18, height: 18, color: "#a78bfa" }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 4 }}>
                  {customersList.length || 12}
                </div>
                <span style={{ fontSize: 11.5, color: "#34d399", fontWeight: 700 }}>
                  {territories.length || 2} Territories
                </span>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                All Sales Officer Features
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { title: "Deal Pipeline", icon: <Layers style={{ width: 16, height: 16 }} />, desc: "Kanban board view", module: "pipeline", badge: "Phase 3A" },
                  { title: "Activity Logger", icon: <Activity style={{ width: 16, height: 16 }} />, desc: "Log calls & meetings", module: "activities", badge: "Phase 3A" },
                  { title: "Quota Tracker", icon: <Target style={{ width: 16, height: 16 }} />, desc: "Track performance", module: "quota", badge: "Phase 3A" },
                  { title: "Commission Tracker", icon: <DollarSign style={{ width: 16, height: 16 }} />, desc: "Track earnings & forecast", module: "commissions" },
                  { title: "Proposal Builder", icon: <FileText style={{ width: 16, height: 16 }} />, desc: "Create quotations", module: "proposals" },
                  { title: "Territory Management", icon: <MapPin style={{ width: 16, height: 16 }} />, desc: "Manage accounts", module: "territory" },
                  { title: "Customer 360°", icon: <Building2 style={{ width: 16, height: 16 }} />, desc: "Complete customer view", module: "customer360" },
                  { title: "My Leads", icon: <Briefcase style={{ width: 16, height: 16 }} />, desc: "Lead pipeline", module: "leads" },
                ].map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveModule(m.module as any)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: activeModule === m.module ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${activeModule === m.module ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)"}`,
                      color: "white",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      textAlign: "left",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#60a5fa" }}>{m.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{m.title}</span>
                      {m.badge && (
                        <span style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 900,
                          background: "rgba(16,185,129,0.3)",
                          color: "#34d399",
                          textTransform: "uppercase",
                        }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── COMMISSION MODULE ── */}
        {activeModule === "commissions" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  💰 Commission Calculator & Tracker
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Track your commission earnings, forecast future income, and view payment status
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back to Dashboard
              </button>
            </div>

            {/* Commission Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
              <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 6 }}>Total Earned</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#34d399" }}>
                  ETB {commissionSummary?.totalCommissionEarned.toLocaleString() || "125,000"}
                </div>
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 6 }}>Pending</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>
                  ETB {commissionSummary?.totalCommissionPending.toLocaleString() || "45,000"}
                </div>
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.1))", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 6 }}>Paid Out</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#60a5fa" }}>
                  ETB {commissionSummary?.totalCommissionPaid.toLocaleString() || "80,000"}
                </div>
              </div>
              <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(126,34,206,0.1))", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", marginBottom: 6 }}>Avg Rate</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#c084fc" }}>
                  {commissionSummary?.averageCommissionRate.toFixed(1) || "6.5"}%
                </div>
              </div>
            </div>

            {/* Commission Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {(["ALL", "PENDING", "APPROVED", "PAID"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setCommissionFilter(status)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: commissionFilter === status ? "#2563eb" : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Commissions Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Order Ref</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Customer</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Order Amount</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Commission</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Rate</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                        {loading ? "Loading commissions..." : "No commissions found. Close deals to earn commissions!"}
                      </td>
                    </tr>
                  )}
                  {filteredCommissions.map((comm) => (
                    <tr key={comm.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "14px", fontSize: 13, fontWeight: 800, color: "#60a5fa" }}>{comm.orderNumber}</td>
                      <td style={{ padding: "14px", fontSize: 13, color: "white" }}>{comm.customerName}</td>
                      <td style={{ padding: "14px", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>ETB {comm.orderAmount.toLocaleString()}</td>
                      <td style={{ padding: "14px", fontSize: 14, fontWeight: 900, color: "#34d399" }}>ETB {comm.commissionAmount.toLocaleString()}</td>
                      <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{comm.commissionRate}%</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: 800,
                          background: comm.status === "PAID" ? "rgba(16,185,129,0.2)" : comm.status === "APPROVED" ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                          color: comm.status === "PAID" ? "#34d399" : comm.status === "APPROVED" ? "#60a5fa" : "#fbbf24",
                        }}>
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROPOSAL BUILDER MODULE ── */}
        {activeModule === "proposals" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  📝 Proposal & Quote Builder
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Create professional quotations with dynamic pricing and send to customers
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowQuoteBuilder(!showQuoteBuilder)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "#2563eb",
                    border: "none",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> New Quotation
                </button>
                <button
                  onClick={() => setActiveModule("dashboard")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Quote Builder Form */}
            {showQuoteBuilder && (
              <form onSubmit={handleCreateQuotation} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Create New Quotation</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Customer Name *</label>
                    <input
                      type="text"
                      value={quoteForm.customerName}
                      onChange={(e) => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Validity (Days)</label>
                    <input
                      type="number"
                      value={quoteForm.validityDays}
                      onChange={(e) => setQuoteForm({ ...quoteForm, validityDays: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Items</label>
                  {quoteForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 10 }}>
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...quoteForm.items];
                          newItems[idx].description = e.target.value;
                          setQuoteForm({ ...quoteForm, items: newItems });
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "white",
                          fontSize: 12,
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...quoteForm.items];
                          newItems[idx].quantity = Number(e.target.value);
                          setQuoteForm({ ...quoteForm, items: newItems });
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "white",
                          fontSize: 12,
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...quoteForm.items];
                          newItems[idx].unitPrice = Number(e.target.value);
                          setQuoteForm({ ...quoteForm, items: newItems });
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "white",
                          fontSize: 12,
                        }}
                      />
                      {quoteForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = quoteForm.items.filter((_, i) => i !== idx);
                            setQuoteForm({ ...quoteForm, items: newItems });
                          }}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "rgba(239,68,68,0.2)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#f87171",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuoteForm({ ...quoteForm, items: [...quoteForm.items, { description: "", quantity: 1, unitPrice: 0 }] })}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "rgba(59,130,246,0.2)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "#60a5fa",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Plus style={{ width: 12, height: 12 }} /> Add Item
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Notes</label>
                  <textarea
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 13,
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Total */}
                <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 4 }}>Total Amount:</div>
                  <div style={{ color: "#34d399", fontSize: 20, fontWeight: 900 }}>
                    ETB {quoteForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      background: "#2563eb",
                      border: "none",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? "Creating..." : "Create Quotation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuoteBuilder(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Quotations List */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Quote #</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Customer</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Amount</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                        {loading ? "Loading quotations..." : "No quotations yet. Create your first quotation above!"}
                      </td>
                    </tr>
                  )}
                  {quotations.map((quote) => (
                    <tr key={quote.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "14px", fontSize: 13, fontWeight: 800, color: "#60a5fa" }}>{quote.quotationNumber}</td>
                      <td style={{ padding: "14px", fontSize: 13, color: "white" }}>{quote.customerName || quote.customer}</td>
                      <td style={{ padding: "14px", fontSize: 14, fontWeight: 900, color: "#34d399" }}>ETB {(quote.totalAmount || quote.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{quote.issueDate || quote.date || "-"}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: 800,
                          background: quote.status === "ACCEPTED" ? "rgba(16,185,129,0.2)" : quote.status === "SENT" ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                          color: quote.status === "ACCEPTED" ? "#34d399" : quote.status === "SENT" ? "#60a5fa" : "#fbbf24",
                        }}>
                          {quote.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "rgba(59,130,246,0.2)",
                              border: "1px solid rgba(59,130,246,0.3)",
                              color: "#60a5fa",
                              cursor: "pointer",
                              fontSize: 11,
                            }}
                          >
                            <Eye style={{ width: 13, height: 13 }} />
                          </button>
                          <button
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "rgba(16,185,129,0.2)",
                              border: "1px solid rgba(16,185,129,0.3)",
                              color: "#34d399",
                              cursor: "pointer",
                              fontSize: 11,
                            }}
                          >
                            <Send style={{ width: 13, height: 13 }} />
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

        {/* ── TERRITORY MODULE ── */}
        {activeModule === "territory" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  📍 Territory Management
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Manage your assigned territories and view account distribution
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: territories.length > 0 ? "300px 1fr" : "1fr", gap: 20 }}>
              {/* Territory List */}
              {territories.length > 0 && (
                <div>
                  <h3 style={{ color: "white", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>My Territories</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {territories.map((territory) => (
                      <button
                        key={territory.id}
                        onClick={() => setSelectedTerritory(territory)}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: selectedTerritory?.id === territory.id ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${selectedTerritory?.id === territory.id ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)"}`,
                          color: "white",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <MapPin style={{ width: 16, height: 16, color: "#60a5fa" }} />
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{territory.name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{territory.region || "No region"}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Code: {territory.code}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Territory Details */}
              <div>
                {territories.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
                    <MapPin style={{ width: 48, height: 48, margin: "0 auto 16px", opacity: 0.3 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No territories assigned yet</div>
                    <div style={{ fontSize: 13 }}>Contact your sales manager to get territory assignments</div>
                  </div>
                )}
                {loading && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.6)" }}>
                    Loading territories...
                  </div>
                )}
                {selectedTerritory && (
                  <div>
                    <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                      <h3 style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{selectedTerritory.name}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Code</div>
                          <div style={{ fontSize: 13, color: "white", fontWeight: 700 }}>{selectedTerritory.code}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Region</div>
                          <div style={{ fontSize: 13, color: "white", fontWeight: 700 }}>{selectedTerritory.region || "N/A"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Manager</div>
                          <div style={{ fontSize: 13, color: "white", fontWeight: 700 }}>{selectedTerritory.managerUsername || "Unassigned"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Status</div>
                          <div>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 800,
                              background: selectedTerritory.active ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                              color: selectedTerritory.active ? "#34d399" : "#f87171",
                            }}>
                              {selectedTerritory.active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedTerritory.description && (
                        <div style={{ marginTop: 12, padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Description</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{selectedTerritory.description}</div>
                        </div>
                      )}
                    </div>

                    {/* Territory Stats - Placeholder */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                      <div style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Accounts</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#60a5fa" }}>24</div>
                      </div>
                      <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Revenue (YTD)</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#34d399" }}>ETB 3.2M</div>
                      </div>
                      <div style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Active Deals</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#fbbf24" }}>8</div>
                      </div>
                      <div style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Win Rate</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#c084fc" }}>68%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMER 360 MODULE ── */}
        {activeModule === "customer360" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  🏢 Customer 360° View
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Complete customer profile with relationship history and health metrics
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: customer360 ? "1fr 2fr" : "1fr", gap: 20 }}>
              {/* Customer List */}
              <div>
                <h3 style={{ color: "white", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>My Customers</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "600px", overflowY: "auto" }}>
                  {customersList.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      No customers found
                    </div>
                  )}
                  {loading && (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                      Loading customers...
                    </div>
                  )}
                  {customersList.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleViewCustomer360(customer.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: customer360?.id === customer.id ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${customer360?.id === customer.id ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)"}`,
                        color: "white",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{customer.companyName || customer.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{customer.email}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                        {customer.customerNumber || customer.phone || "No contact"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer 360 Details */}
              {customer360 && (
                <div>
                  {/* Customer Header Card */}
                  <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(29,78,216,0.1))", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                      <div>
                        <h3 style={{ color: "white", fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{customer360.companyName}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                          {customer360.contactName} · {customer360.customerNumber}
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Mail style={{ width: 14, height: 14 }} /> {customer360.email}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Phone style={{ width: 14, height: 14 }} /> {customer360.phone}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 800,
                        background: customer360.accountHealth === "EXCELLENT" ? "rgba(16,185,129,0.3)" : customer360.accountHealth === "GOOD" ? "rgba(59,130,246,0.3)" : customer360.accountHealth === "AT_RISK" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)",
                        color: customer360.accountHealth === "EXCELLENT" ? "#34d399" : customer360.accountHealth === "GOOD" ? "#60a5fa" : customer360.accountHealth === "AT_RISK" ? "#fbbf24" : "#f87171",
                      }}>
                        {customer360.accountHealth.replace("_", " ")}
                      </span>
                    </div>

                    {/* Key Metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Total Orders</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#60a5fa" }}>{customer360.totalOrders}</div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Lifetime Value</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#34d399" }}>ETB {customer360.totalRevenue.toLocaleString()}</div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Last Order</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fbbf24" }}>{customer360.lastOrderDate || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Timeline */}
                  <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: 20 }}>
                    <h4 style={{ color: "white", fontSize: 15, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <Activity style={{ width: 16, height: 16 }} /> Recent Activity
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {customer360.recentActivity.map((activity, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: activity.type === "Order" ? "#60a5fa" : activity.type === "Payment" ? "#34d399" : "#fbbf24",
                            marginTop: 6,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "white", fontWeight: 700, marginBottom: 2 }}>{activity.description}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                              <Clock style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
                              {activity.date}
                            </div>
                          </div>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 800,
                            background: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.7)",
                            height: "fit-content",
                          }}>
                            {activity.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LEADS MODULE (Original) ── */}
        {activeModule === "leads" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  💼 My Leads & Pipeline
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Track leads, qualify prospects, and convert to opportunities
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Lead / Contact</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Enterprise Account</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Priority</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Deal Stage</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Estimated Value</th>
                    <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", textAlign: "right" }}>Officer Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsList.map((l) => {
                    const sc = statusColor[l.status] || statusColor.Cold;
                    return (
                      <tr key={l.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{l.id}</div>
                        </td>
                        <td style={{ padding: "14px", fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                          {l.org}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 800, background: sc.bg, color: sc.text }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px", fontSize: 12.5, color: "#60a5fa", fontWeight: 700 }}>
                          {l.stage}
                        </td>
                        <td style={{ padding: "14px", fontSize: 13, fontWeight: 800, color: "#34d399" }}>
                          {l.value}
                        </td>
                        <td style={{ padding: "14px", textAlign: "right" }}>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "#2563eb",
                              color: "white",
                              border: "none",
                              fontSize: 11,
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Sparkles style={{ width: 12, height: 12 }} /> Convert
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DEAL PIPELINE MODULE (Kanban Board) ── */}
        {activeModule === "pipeline" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  📊 Deal Pipeline (Kanban)
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Visualize and manage opportunities through sales stages
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            {/* Kanban Board */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20, overflowX: "auto" }}>
              {["NEW", "NEEDS_ANALYSIS", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"].map((stage) => {
                const stageOpps = opportunities.filter((o) => o.stage === stage);
                const stageColors: Record<string, { bg: string; text: string }> = {
                  NEW: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa" },
                  NEEDS_ANALYSIS: { bg: "rgba(168, 85, 247, 0.15)", text: "#a78bfa" },
                  QUALIFICATION: { bg: "rgba(236, 72, 153, 0.15)", text: "#f472b6" },
                  PROPOSAL: { bg: "rgba(251, 146, 60, 0.15)", text: "#fb923c" },
                  NEGOTIATION: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
                  CLOSED_WON: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
                };
                const color = stageColors[stage] || stageColors.NEW;
                
                return (
                  <div
                    key={stage}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: 16,
                      minHeight: 400,
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ color: "white", fontSize: 13, fontWeight: 800, margin: 0 }}>
                          {stage.replace(/_/g, " ")}
                        </h3>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                          background: color.bg,
                          color: color.text,
                        }}>
                          {stageOpps.length}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 600, overflowY: "auto" }}>
                      {stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            padding: 12,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6 }}>
                            {opp.name || opp.opportunityName}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                            Customer #{opp.customerId}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#4ade80" }}>
                              ${(opp.expectedRevenue || 0).toLocaleString()}
                            </span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                              {opp.probability}%
                            </span>
                          </div>
                          
                          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            {stage !== "CLOSED_WON" && (
                              <>
                                <button
                                  onClick={() => handleStageChange(opp.id, getNextStage(stage))}
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    background: "rgba(59, 130, 246, 0.2)",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    color: "#60a5fa",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Move →
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOpportunity(opp);
                                    setShowCloseDealModal(true);
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    background: "rgba(34, 197, 94, 0.2)",
                                    border: "1px solid rgba(34, 197, 94, 0.3)",
                                    color: "#4ade80",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Close
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {stageOpps.length === 0 && (
                        <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                          No deals in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Deal Modal */}
            {showCloseDealModal && selectedOpportunity && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}>
                <div style={{
                  background: "rgba(17,24,39,0.98)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 16,
                  padding: 24,
                  maxWidth: 500,
                  width: "90%",
                }}>
                  <h3 style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
                    Close Deal: {selectedOpportunity.name || selectedOpportunity.opportunityName}
                  </h3>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Outcome
                    </label>
                    <select
                      value={closeDealForm.outcome}
                      onChange={(e) => setCloseDealForm({ ...closeDealForm, outcome: e.target.value as "WON" | "LOST" })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 13,
                      }}
                    >
                      <option value="WON">Won</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Actual Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={closeDealForm.actualRevenue}
                      onChange={(e) => setCloseDealForm({ ...closeDealForm, actualRevenue: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Notes
                    </label>
                    <textarea
                      value={closeDealForm.notes}
                      onChange={(e) => setCloseDealForm({ ...closeDealForm, notes: e.target.value })}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 13,
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => {
                        handleCloseDeal(selectedOpportunity.id, closeDealForm.outcome, closeDealForm.actualRevenue, closeDealForm.notes);
                        setShowCloseDealModal(false);
                        setSelectedOpportunity(null);
                        setCloseDealForm({ outcome: "WON", actualRevenue: 0, notes: "" });
                      }}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 8,
                        background: "#2563eb",
                        border: "none",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setShowCloseDealModal(false);
                        setSelectedOpportunity(null);
                        setCloseDealForm({ outcome: "WON", actualRevenue: 0, notes: "" });
                      }}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY LOGGING MODULE ── */}
        {activeModule === "activities" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  📞 Activity Logging
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Log and track all customer interactions
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            {/* Quick Log Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { type: "PHONE_CALL", icon: "📞", label: "Log Call" },
                { type: "EMAIL", icon: "✉️", label: "Log Email" },
                { type: "MEETING", icon: "👥", label: "Log Meeting" },
                { type: "VIDEO_CALL", icon: "🎥", label: "Video Call" },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setActivityForm({ ...activityForm, type: item.type })}
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    background: activityForm.type === item.type ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${activityForm.type === item.type ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Activity Form */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                Log New Activity
              </h3>
              
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Customer ID
                  </label>
                  <input
                    type="number"
                    value={activityForm.customerId}
                    onChange={(e) => setActivityForm({ ...activityForm, customerId: parseInt(e.target.value) || 0 })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Notes
                  </label>
                  <textarea
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    rows={3}
                    placeholder="What did you discuss?"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 13,
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={activityForm.duration}
                      onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      Outcome
                    </label>
                    <select
                      value={activityForm.outcome}
                      onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 13,
                      }}
                    >
                      <option value="POSITIVE">Positive</option>
                      <option value="NEUTRAL">Neutral</option>
                      <option value="NEGATIVE">Negative</option>
                      <option value="FOLLOW_UP_REQUIRED">Follow-up Required</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleLogActivity}
                  style={{
                    padding: "12px",
                    borderRadius: 8,
                    background: "#2563eb",
                    border: "none",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log Activity
                </button>
              </div>
            </div>

            {/* Activities Timeline */}
            <div>
              <h3 style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                Recent Activities ({activities.length})
              </h3>
              {activities.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)" }}>
                  No activities logged yet. Start by logging your first activity above!
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Date/Time</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Type</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Customer</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Notes</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.slice(0, 15).map((activity) => {
                        return (
                          <tr key={activity.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                              {new Date(activity.interactionDate).toLocaleString()}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span style={{
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontSize: 10.5,
                                fontWeight: 800,
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#60a5fa",
                              }}>
                                {activity.type}
                              </span>
                            </td>
                            <td style={{ padding: "14px", fontSize: 13, color: "white", fontWeight: 600 }}>
                              Customer #{activity.customerId}
                            </td>
                            <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.7)", maxWidth: 250 }}>
                              {activity.description || activity.subject || "—"}
                            </td>
                            <td style={{ padding: "14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                              {activity.duration ? `${activity.duration}m` : "—"}
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

        {/* ── QUOTA TRACKER MODULE ── */}
        {activeModule === "quota" && (
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
                  🎯 Quota Tracker
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
                  Track your sales performance and targets
                </p>
              </div>
              <button
                onClick={() => setActiveModule("dashboard")}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
            </div>

            {/* Quota Attainment Gauge */}
            {performanceMetrics && performanceMetrics.attainmentPercentage !== undefined && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  borderRadius: 16, 
                  padding: 32,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 64, fontWeight: 900, color: performanceMetrics.attainmentPercentage >= 100 ? "#4ade80" : performanceMetrics.attainmentPercentage >= 80 ? "#fbbf24" : "#f87171", marginBottom: 8 }}>
                    {performanceMetrics.attainmentPercentage?.toFixed(0) || 0}%
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                    Quota Attainment
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Current</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>
                        ${(performanceMetrics.currentRevenue || 0).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, color: "rgba(255,255,255,0.3)" }}>/</div>
                    <div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Target</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>
                        ${(performanceMetrics.targetRevenue || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginTop: 24, height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(performanceMetrics.attainmentPercentage || 0, 100)}%`,
                      background: (performanceMetrics.attainmentPercentage || 0) >= 100 ? "#4ade80" : (performanceMetrics.attainmentPercentage || 0) >= 80 ? "#fbbf24" : "#60a5fa",
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics Grid */}
            {performanceMetrics && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Deals Closed</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#4ade80" }}>
                    {performanceMetrics.dealsClosed || 0}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    Target: {performanceMetrics.dealsTarget || 0}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Avg Deal Size</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#60a5fa" }}>
                    ${(performanceMetrics.averageDealSize || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    Per closed deal
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Pipeline Value</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#a78bfa" }}>
                    ${(performanceMetrics.pipelineValue || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    Active opportunities
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Win Rate</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24" }}>
                    {(performanceMetrics.winRate || 0).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    Close rate
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div>
                <h3 style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                  🏆 Team Leaderboard
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Rank</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Sales Officer</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Revenue</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Target</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Attainment</th>
                        <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Deals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((officer, index) => {
                        const rankIcons = ["🥇", "🥈", "🥉"];
                        const attainmentColor = (officer.attainmentPercentage || 0) >= 100 ? "#4ade80" : (officer.attainmentPercentage || 0) >= 80 ? "#fbbf24" : "#f87171";
                        
                        return (
                          <tr key={`officer-${officer.officerId || index}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: officer.officerId === 1 ? "rgba(59, 130, 246, 0.05)" : "transparent" }}>
                            <td style={{ padding: "14px", fontSize: 18 }}>
                              {index < 3 ? rankIcons[index] : `#${index + 1}`}
                            </td>
                            <td style={{ padding: "14px", fontSize: 13, color: "white", fontWeight: 600 }}>
                              {officer.officerName}
                              {officer.officerId === 1 && (
                                <span style={{ marginLeft: 8, fontSize: 11, color: "#60a5fa" }}>(You)</span>
                              )}
                            </td>
                            <td style={{ padding: "14px", fontSize: 14, fontWeight: 800, color: "#60a5fa" }}>
                              ${(officer.currentRevenue || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: "14px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                              ${(officer.targetRevenue || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 800,
                                background: `${attainmentColor}22`,
                                color: attainmentColor,
                              }}>
                                {(officer.attainmentPercentage || 0).toFixed(0)}%
                              </span>
                            </td>
                            <td style={{ padding: "14px", fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                              {officer.dealsClosed || 0} closed
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
    </RoleProtectedRoute>
  );
}
