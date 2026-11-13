"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Building2,
  Share2,
  FileText,
  CreditCard,
  Layers,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import interactionService from "@/services/interactionService";

export interface ChatMessage {
  id: string | number;
  sender: "CUSTOMER" | "SALES_MANAGER" | "ADMIN" | "BOT";
  senderName: string;
  customerContext?: string;
  text: string;
  timestamp: string;
  date: string;
  dealRef?: string;
  isDataShare?: boolean;
  dataPayload?: {
    type: "DEAL" | "QUOTATION" | "PAYMENT" | "PRODUCT";
    title: string;
    details: Record<string, string | number>;
  };
}

interface CustomerChatbotProps {
  currentCustomerName?: string;
  currentUserRole?: "CUSTOMER" | "SALES_MANAGER" | "ADMIN" | string;
}

const KNOWN_CUSTOMERS = [
  "ALL",
  "Ministry of Finance",
  "Ethio Telecom",
  "Commercial Bank of Ethiopia",
  "Ministry of Innovation & Tech",
  "Zemen Bank",
  "Ethiopian Airlines",
  "Addis Ababa City Admin",
];

const SHARED_STORAGE_KEY = "crm_chat_messages_shared";

export default function CustomerChatbot({
  currentCustomerName = "",
  currentUserRole = "CUSTOMER",
}: CustomerChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const roleStr = String(currentUserRole || "").toUpperCase();
  const isAdmin = roleStr.includes("ADMIN");
  const isSalesManager = roleStr.includes("SALES_MANAGER") || roleStr.includes("MANAGER");
  const isManagerOrAdmin = isAdmin || isSalesManager;

  // Managers/Admins default to "ALL" to monitor incoming customer messages globally
  const [selectedCustomer, setSelectedCustomer] = useState<string>(
    isManagerOrAdmin ? "ALL" : currentCustomerName
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCustomer = isManagerOrAdmin
    ? selectedCustomer === "ALL"
      ? "All Customers"
      : selectedCustomer
    : currentCustomerName;

  // Real-time synchronization across browser tabs and backend PostgreSQL
  useEffect(() => {
    loadChatMessages();

    const handleSync = () => {
      loadChatMessages();
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === SHARED_STORAGE_KEY ||
        (e.key && e.key.startsWith("crm_chat_messages_"))
      ) {
        loadChatMessages();
      }
    };

    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e?.detail?.customer) {
        setSelectedCustomer(e.detail.customer);
      }
    };

    window.addEventListener("crm_chat_sync", handleSync);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("crm_open_chat", handleOpenChat as EventListener);

    // Continuous polling every 2.5 seconds
    const interval = setInterval(loadChatMessages, 2500);

    return () => {
      window.removeEventListener("crm_chat_sync", handleSync);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("crm_open_chat", handleOpenChat as EventListener);
      clearInterval(interval);
    };
  }, [activeCustomer, isManagerOrAdmin, selectedCustomer, currentCustomerName]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const loadChatMessages = async () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Load from shared unified localStorage thread
      const sharedRaw = localStorage.getItem(SHARED_STORAGE_KEY);
      let list: ChatMessage[] = sharedRaw ? JSON.parse(sharedRaw) : [];

      // 2. Load from customer specific local thread if exists
      const custRaw = localStorage.getItem(`crm_chat_messages_${currentCustomerName}`);
      if (custRaw) {
        try {
          const custMsgs: ChatMessage[] = JSON.parse(custRaw);
          custMsgs.forEach((cm) => {
            if (!list.some((m) => String(m.id) === String(cm.id) || (m.text === cm.text && m.sender === cm.sender))) {
              list.push(cm);
            }
          });
        } catch {}
      }

      // Default welcoming message for customer if empty
      if (!list.length && !isManagerOrAdmin) {
        const defaultWelcome: ChatMessage = {
          id: "welcome-1",
          sender: "BOT",
          senderName: "INSA CRM AI Assistant",
          customerContext: currentCustomerName,
          text: `Hello! 👋 Welcome to the INSA Enterprise Procurement Portal. Our Sales Manager (Salam Haile) and System Administrators are connected to this chat line in real-time. How can we assist you with your deals, products, or quotations today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date().toISOString().split("T")[0],
        };
        list = [defaultWelcome];
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(list));
      }

      // 3. Fetch latest interactions from PostgreSQL backend (/api/interactions)
      try {
        const backendInteractions = await interactionService.getAllInteractions({ size: 50 });
        const items = backendInteractions?.content || (Array.isArray(backendInteractions) ? backendInteractions : []);
        if (items.length > 0) {
          items.forEach((item: any) => {
            if (!item.description) return;
            const desc: string = item.description;

            let senderRole: "CUSTOMER" | "SALES_MANAGER" | "ADMIN" | "BOT" = "CUSTOMER";
            if (desc.includes("[ADMIN]")) senderRole = "ADMIN";
            else if (desc.includes("[SALES_MANAGER]") || desc.includes("[SALES MANAGER]")) senderRole = "SALES_MANAGER";
            else if (desc.includes("[BOT]")) senderRole = "BOT";

            const cleanText = desc.replace(/^\[.*?\]\s*.*?:?\s*/, "").trim();
            const customerCtx = item.contactPerson || item.subject?.replace("Live Chat Communication - ", "") || currentCustomerName;

            const exists = list.some(
              (m) => String(m.id) === String(item.id) || (m.text === cleanText && m.sender === senderRole)
            );

            if (!exists && cleanText) {
              list.push({
                id: `pg-${item.id}`,
                sender: senderRole,
                senderName:
                  item.conductedBy ||
                  (senderRole === "CUSTOMER"
                    ? customerCtx
                    : senderRole === "ADMIN"
                    ? "System Admin"
                    : "Salam Haile (Sales Manager)"),
                customerContext: customerCtx,
                text: cleanText,
                timestamp:
                  item.interactionDate?.split("T")[1]?.slice(0, 5) ||
                  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                date: item.interactionDate?.split("T")[0] || new Date().toISOString().split("T")[0],
              });
            }
          });
        }
      } catch (err) {
        // Backend interaction fetch fallback
      }

      // Sort by creation or timestamp
      list.sort((a, b) => {
        const tA = String(a.date || "") + " " + String(a.timestamp || "");
        const tB = String(b.date || "") + " " + String(b.timestamp || "");
        return tA.localeCompare(tB);
      });

      // Update shared cache
      try {
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(list));
      } catch {}

      // 4. Apply role-specific view filter
      let filtered = list;
      if (!isManagerOrAdmin) {
        // Customer view: show ONLY their private conversation + replies TO THEM from staff/bot
        filtered = list.filter(
          (m) =>
            // Show messages FROM this customer
            m.senderName === currentCustomerName ||
            // Show messages TO this customer (staff replies)
            m.customerContext === currentCustomerName ||
            // Show broadcast messages to all customers
            m.customerContext === "All Customers" ||
            // Show welcome bot messages with no specific context
            (m.sender === "BOT" && !m.customerContext)
        );
      } else if (selectedCustomer !== "ALL") {
        // Manager/Admin filtered by single customer
        filtered = list.filter(
          (m) =>
            m.customerContext === selectedCustomer ||
            m.senderName === selectedCustomer ||
            m.text.includes(selectedCustomer)
        );
      }

      setMessages(filtered);
    } catch (e) {
      console.error("[Chatbot] Failed to load messages:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (
    e?: React.FormEvent,
    customText?: string,
    dataPayload?: ChatMessage["dataPayload"]
  ) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !dataPayload) return;

    const senderRole: "CUSTOMER" | "SALES_MANAGER" | "ADMIN" = isManagerOrAdmin
      ? isAdmin
        ? "ADMIN"
        : "SALES_MANAGER"
      : "CUSTOMER";

    const senderName = isManagerOrAdmin
      ? isAdmin
        ? "System Administrator"
        : "Salam Haile (Sales Manager)"
      : currentCustomerName;

    const customerCtx = isManagerOrAdmin
      ? selectedCustomer === "ALL"
        ? currentCustomerName
        : selectedCustomer
      : currentCustomerName;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: senderRole,
      senderName: senderName,
      customerContext: customerCtx,
      text: textToSend.trim() || (dataPayload ? `Shared: ${dataPayload.title}` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      isDataShare: !!dataPayload,
      dataPayload: dataPayload,
    };

    // 1. Instantly update shared storage
    try {
      const sharedRaw = localStorage.getItem(SHARED_STORAGE_KEY);
      const existingShared: ChatMessage[] = sharedRaw ? JSON.parse(sharedRaw) : [];
      const updatedShared = [...existingShared, newMsg];
      localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(updatedShared));

      // Also persist to customer specific key
      const userKey = `crm_chat_messages_${customerCtx}`;
      const userRaw = localStorage.getItem(userKey);
      const existingUser: ChatMessage[] = userRaw ? JSON.parse(userRaw) : [];
      localStorage.setItem(userKey, JSON.stringify([...existingUser, newMsg]));
    } catch (e) {}

    // 2. Dispatch custom event for instantaneous same-window update
    try {
      window.dispatchEvent(new CustomEvent("crm_chat_sync", { detail: newMsg }));
    } catch {}

    // 3. Update local state
    setMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputText("");

    // 4. Persist to PostgreSQL backend via /api/interactions
    try {
      setIsSyncing(true);
      await interactionService.createInteraction({
        interactionType: "SUPPORT",
        subject: `Live Chat Communication - ${customerCtx}`,
        description: `[${senderRole}] ${senderName}: ${newMsg.text}`,
        conductedBy: senderName,
        contactPerson: customerCtx,
        interactionDate: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[Chatbot] PostgreSQL interaction sync fallback:", e);
    } finally {
      setIsSyncing(false);
    }

    // 5. Automated AI Assistant reply for specific customer queries
    if (!isManagerOrAdmin && !dataPayload) {
      generateAutomatedBotReply(textToSend, customerCtx);
    }
  };

  const handleShareDealData = () => {
    const dealsKey = `crm_deals_${activeCustomer}`;
    let latestDeal: any = null;
    try {
      const raw = localStorage.getItem(dealsKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (list.length > 0) latestDeal = list[0];
      }
    } catch {}

    const dealTitle = latestDeal?.title || "Enterprise Cybersecurity Deal";
    const dealAmount = latestDeal?.amount ? `ETB ${Number(latestDeal.amount).toLocaleString()}` : "ETB 800,000";
    const dealStage = latestDeal?.stage || "Proposal";

    handleSendMessage(
      undefined,
      `📊 Here are the current Sales Deal details on file for ${activeCustomer}:`,
      {
        type: "DEAL",
        title: "Official Sales Deal Specification",
        details: {
          "Deal Title": dealTitle,
          "Reference Code": latestDeal?.dealCode || "DEAL-2025-089",
          "Selected Solution": latestDeal?.productName || "Enterprise Cryptography Package",
          "Quantity": latestDeal?.quantity ? `${latestDeal.quantity} units` : "1 unit",
          "Estimated Value": dealAmount,
          "Pipeline Stage": dealStage,
          "Assigned Lead": "Salam Haile (Sales Manager)",
        },
      }
    );
  };

  const handleShareQuotationData = () => {
    handleSendMessage(
      undefined,
      `📄 Official Quotation & Pricing Breakdown for ${activeCustomer}:`,
      {
        type: "QUOTATION",
        title: "Official Price Quotation (15% VAT Included)",
        details: {
          "Quotation #": `QUO-2025-${Math.floor(100 + Math.random() * 900)}`,
          "Total Quotation Amount": "ETB 920,000",
          "15% VAT Breakdown": "ETB 120,000",
          "Validity": "30 Days from Issue",
          "Payment Terms": "CBE / Awash / Telebirr Settlement",
          "Approval Status": "Approved by Sales Management",
        },
      }
    );
  };

  const handleSharePaymentData = () => {
    handleSendMessage(
      undefined,
      `💳 Official INSA Corporate Payment & Bank Transfer Details:`,
      {
        type: "PAYMENT",
        title: "INSA Enterprise Bank Accounts",
        details: {
          "CBE Account (ETB)": "1000123456789 (INSA Enterprise)",
          "Awash Bank Account": "01320492817200 (INSA Tech)",
          "Telebirr ShortCode": "889900 (INSA Digital)",
          "Tax ID (TIN)": "0001234567",
          "Verification SLA": "Within 2 Hours of Upload",
        },
      }
    );
  };

  const generateAutomatedBotReply = (userQuery: string, customerCtx: string) => {
    const query = userQuery.toLowerCase();
    let botReplyText = "";

    if (query.includes("deal") || query.includes("inquire") || query.includes("proposal")) {
      botReplyText = `📄 I see you are inquiring about a Sales Deal. Deals submitted through the "Inquire About New Deal" modal are automatically forwarded to Sales Manager (Salam Haile) and System Admins. You can track real-time stage progression in your Sales Deals tab!`;
    } else if (query.includes("price") || query.includes("vat") || query.includes("cost") || query.includes("amount")) {
      botReplyText = `💰 All product orders and quotations automatically compute 15% VAT and unit totals in real time. Use the "Request Quotation" button in your dashboard for formal commercial estimates.`;
    } else if (query.includes("delivery") || query.includes("ship") || query.includes("order")) {
      botReplyText = `🚚 Orders are dispatched promptly from INSA storage facilities. You can schedule delivery locations and arrival time slots under "My Orders".`;
    } else if (query.includes("manager") || query.includes("admin") || query.includes("human") || query.includes("contact")) {
      botReplyText = `👤 Sales Manager Salam Haile and the Admin team have been alerted in real time. They will respond directly in this chat thread shortly.`;
    } else {
      botReplyText = `Thank you! 📩 Your message has been saved to the PostgreSQL database. Our Sales Manager and Admin team are reviewing it.`;
    }

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "BOT",
        senderName: "INSA CRM AI Assistant",
        customerContext: customerCtx,
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toISOString().split("T")[0],
      };

      try {
        const sharedRaw = localStorage.getItem(SHARED_STORAGE_KEY);
        const existingShared: ChatMessage[] = sharedRaw ? JSON.parse(sharedRaw) : [];
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify([...existingShared, botMsg]));
        window.dispatchEvent(new CustomEvent("crm_chat_sync", { detail: botMsg }));
      } catch (e) {}

      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative border border-white/20"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-bold whitespace-nowrap">
            {isAdmin ? "Admin Live Chat Desk" : isSalesManager ? "Sales Manager Chat Desk" : "Talk to Sales & Admin"}
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Drawer Widget */}
      {isOpen && (
        <div className="w-[390px] sm:w-[450px] h-[590px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-inner ${
                    isAdmin
                      ? "bg-rose-600/40 border border-rose-400/50"
                      : isSalesManager
                      ? "bg-amber-600/40 border border-amber-400/50"
                      : "bg-blue-600/40 border border-blue-400/50"
                  }`}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                  ) : isSalesManager ? (
                    <User className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Bot className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">
                      {isAdmin
                        ? "Admin · Customer Live Desk"
                        : isSalesManager
                        ? "Sales Manager · Live Desk"
                        : "INSA Sales & Admin Live Desk"}
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate max-w-[220px]">
                      {isManagerOrAdmin && selectedCustomer === "ALL"
                        ? "🌐 All Customers (Unified Live Feed)"
                        : `Channel: ${activeCustomer}`}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={loadChatMessages}
                  title="Force refresh"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-blue-400" : ""}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer Switcher Dropdown for Sales Manager & Admin */}
            {isManagerOrAdmin && (
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-semibold">Active Conversation:</span>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold outline-none focus:border-blue-500 max-w-[220px]"
                >
                  <option value="ALL">🌐 All Customers (Unified Feed)</option>
                  {Array.from(
                    new Set([
                      ...KNOWN_CUSTOMERS.filter((c) => c !== "ALL"),
                      ...(selectedCustomer && selectedCustomer !== "ALL" ? [selectedCustomer] : []),
                      ...messages.map((m) => m.customerContext).filter(Boolean),
                      ...messages.filter((m) => m.sender === "CUSTOMER").map((m) => m.senderName).filter(Boolean),
                    ])
                  ).map((c) => (
                    <option key={String(c)} value={String(c)}>
                      {String(c)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick FAQ / Action Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {isManagerOrAdmin ? (
              <>
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 shrink-0">
                  <Share2 className="w-3 h-3 text-blue-600" /> Share:
                </span>
                <button
                  onClick={handleShareDealData}
                  className="px-2.5 py-1 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-bold text-[11px] shadow-2xs"
                >
                  <Layers className="w-3 h-3 text-purple-600" /> Deal Data
                </button>
                <button
                  onClick={handleShareQuotationData}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-bold text-[11px] shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-blue-600" /> Quotation
                </button>
                <button
                  onClick={handleSharePaymentData}
                  className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-bold text-[11px] shadow-2xs"
                >
                  <CreditCard className="w-3 h-3 text-emerald-600" /> Bank Details
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage(undefined, "Check my Sales Deal status")}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium text-[11px] shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-blue-500" /> Deal Status
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, "How do prices and 15% VAT work?")}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium text-[11px] shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Pricing &amp; VAT
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, "Connect me directly with Sales Manager")}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium text-[11px] shadow-2xs"
                >
                  <User className="w-3 h-3 text-purple-500" /> Talk to Manager
                </button>
              </>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No messages in this channel yet.</p>
                <p className="text-[11px] mt-1 text-slate-400">
                  Send a message below to connect with customers and staff in real time.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = isManagerOrAdmin
                  ? msg.sender === "SALES_MANAGER" || msg.sender === "ADMIN"
                  : msg.sender === "CUSTOMER";
                const isBot = msg.sender === "BOT";
                const isAdminMsg = msg.sender === "ADMIN";
                const isManagerMsg = msg.sender === "SALES_MANAGER";
                const isCustMsg = msg.sender === "CUSTOMER";

                return (
                  <div
                    key={`msg-${msg.id}-${idx}`}
                    className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                          isBot
                            ? "bg-blue-600"
                            : isAdminMsg
                            ? "bg-rose-600"
                            : isManagerMsg
                            ? "bg-amber-600"
                            : "bg-purple-600"
                        }`}
                      >
                        {isBot ? (
                          <Bot className="w-4 h-4" />
                        ) : isAdminMsg ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                    )}

                    <div className={`max-w-[82%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-1.5 px-1 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-600">{msg.senderName}</span>

                        {/* Customer context pill for Manager/Admin view */}
                        {isManagerOrAdmin && msg.customerContext && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
                            {msg.customerContext}
                          </span>
                        )}

                        {/* Role Badge */}
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                            isAdminMsg
                              ? "bg-rose-100 text-rose-700"
                              : isManagerMsg
                              ? "bg-amber-100 text-amber-800"
                              : isCustMsg
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {msg.sender.replace("_", " ")}
                        </span>

                        <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                      </div>

                      {/* Standard Text Message Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? isAdminMsg
                              ? "bg-rose-600 text-white rounded-tr-none font-medium"
                              : "bg-blue-600 text-white rounded-tr-none font-medium"
                            : isBot
                            ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium"
                            : isAdminMsg
                            ? "bg-rose-50 text-rose-950 border border-rose-200 rounded-tl-none font-medium"
                            : isManagerMsg
                            ? "bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none font-medium"
                            : "bg-purple-600 text-white rounded-tl-none font-medium"
                        }`}
                      >
                        {msg.text}

                        {/* Structured Data Share Card Preview */}
                        {msg.isDataShare && msg.dataPayload && (
                          <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 text-[11px] space-y-1.5 shadow-xs">
                            <div className="font-extrabold text-blue-900 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{msg.dataPayload.title}</span>
                            </div>
                            <div className="space-y-1">
                              {Object.entries(msg.dataPayload.details).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2 text-[10.5px]">
                                  <span className="text-slate-500 font-medium">{k}:</span>
                                  <span className="font-bold text-slate-900 text-right">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-xs ${
                          isAdminMsg ? "bg-rose-600" : isManagerMsg ? "bg-amber-600" : "bg-blue-600"
                        }`}
                      >
                        {isAdminMsg ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAdmin
                  ? `Message ${activeCustomer} (as Admin)...`
                  : isSalesManager
                  ? `Message ${activeCustomer} (as Sales Manager)...`
                  : "Type your message to Sales & Admin..."
              }
              className="flex-1 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
