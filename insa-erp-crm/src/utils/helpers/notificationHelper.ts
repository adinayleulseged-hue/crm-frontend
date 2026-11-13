export interface CustomerNotificationPayload {
  id?: string | number;
  title: string;
  message: string;
  type?: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
  customerId?: number | string | null;
  customerName?: string | null;
  customerOrg?: string | null;
  recipient?: string | null;
  dealCode?: string | null;
  invoiceNumber?: string | null;
  orderNumber?: string | null;
  timestamp?: string;
  date?: string;
  read?: boolean;
  [key: string]: any;
}

/**
 * Checks whether a given notification belongs to the active customer.
 * Enforces strict multi-tenant customer isolation.
 */
export function isNotificationForCustomer(
  notif: any,
  customerId?: number | string | null,
  customerName?: string | null,
  customerOrg?: string | null
): boolean {
  if (!notif) return false;

  // 1. Direct Customer ID Match
  if (customerId && notif.customerId !== undefined && notif.customerId !== null) {
    if (String(notif.customerId) === String(customerId)) {
      return true;
    }
    // If notif has a customerId and it doesn't match, strictly reject
    return false;
  }

  // 2. Customer Name / Org / Recipient Matching
  const notifTarget = (
    notif.customerName ||
    notif.customer ||
    notif.customerOrg ||
    notif.organization ||
    notif.recipient ||
    ""
  ).trim().toLowerCase();

  const myName = (customerName || "").trim().toLowerCase();
  const myOrg = (customerOrg || "").trim().toLowerCase();

  if (notifTarget) {
    if (myName && (notifTarget === myName || notifTarget.includes(myName) || myName.includes(notifTarget))) {
      return true;
    }
    const isGenericOrg = ["enterprise client", "valued customer", "unknown customer"].includes(myOrg);
    if (myOrg && !isGenericOrg && (notifTarget === myOrg || notifTarget.includes(myOrg) || myOrg.includes(notifTarget))) {
      return true;
    }
    // If notif specifies a target customer that does not match this customer, reject
    return false;
  }

  // 3. Unscoped notifications (no customerId or customerName)
  // For safety and privacy, do NOT expose unscoped notifications to customer portal
  return false;
}

/**
 * Filters a list of notifications to only those belonging to the active customer.
 */
export function filterCustomerNotifications(
  notifications: any[],
  customerId?: number | string | null,
  customerName?: string | null,
  customerOrg?: string | null
): any[] {
  if (!Array.isArray(notifications)) return [];
  return notifications.filter((n) => isNotificationForCustomer(n, customerId, customerName, customerOrg));
}

/**
 * Dispatches a customer-scoped notification.
 * Saves to both customer-scoped keys and global list (with metadata),
 * and triggers storage and custom events for instant cross-tab sync.
 */
export function dispatchCustomerNotification(payload: CustomerNotificationPayload): any {
  if (typeof window === "undefined") return null;

  const now = new Date();
  const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateNow = now.toISOString().split("T")[0];

  const fullNotif = {
    id: payload.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: payload.title,
    message: payload.message,
    type: payload.type || "INFO",
    customerId: payload.customerId || undefined,
    customerName: payload.customerName || undefined,
    customerOrg: payload.customerOrg || payload.customerName || undefined,
    recipient: payload.recipient || payload.customerName || undefined,
    dealCode: payload.dealCode || undefined,
    invoiceNumber: payload.invoiceNumber || undefined,
    orderNumber: payload.orderNumber || undefined,
    timestamp: payload.timestamp || timeNow,
    date: payload.date || dateNow,
    read: payload.read || false,
  };

  try {
    // 1. Save to global list with tenant metadata
    const existing = JSON.parse(localStorage.getItem("crm_customer_notifications") || "[]");
    const updatedGlobal = [fullNotif, ...(Array.isArray(existing) ? existing.filter((x: any) => x.id !== fullNotif.id) : [])];
    localStorage.setItem("crm_customer_notifications", JSON.stringify(updatedGlobal));

    // 2. Save to customerId key if present
    if (payload.customerId) {
      const idKey = `crm_customer_notifications_${payload.customerId}`;
      const existingId = JSON.parse(localStorage.getItem(idKey) || "[]");
      const updatedId = [fullNotif, ...(Array.isArray(existingId) ? existingId.filter((x: any) => x.id !== fullNotif.id) : [])];
      localStorage.setItem(idKey, JSON.stringify(updatedId));
    }

    // 3. Save to customerName key if present
    if (payload.customerName) {
      const nameKey = `crm_customer_notifications_${payload.customerName}`;
      const existingName = JSON.parse(localStorage.getItem(nameKey) || "[]");
      const updatedName = [fullNotif, ...(Array.isArray(existingName) ? existingName.filter((x: any) => x.id !== fullNotif.id) : [])];
      localStorage.setItem(nameKey, JSON.stringify(updatedName));
    }

    // 4. Dispatch events for real-time reactivity
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("crm_customer_notification_added", { detail: fullNotif }));
  } catch (err) {
    console.warn("[NotificationHelper] Failed to store notification:", err);
  }

  return fullNotif;
}
