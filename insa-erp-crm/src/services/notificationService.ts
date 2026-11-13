import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";
import { SystemNotification, NotificationRequest } from "@/types/notification.types";

export const initialSampleNotifications: SystemNotification[] = [
  {
    id: 1,
    title: "New Lead Contact Inquiry",
    message: "National Bank of Ethiopia submitted a service inquiry via public contact form.",
    type: "LEAD_CREATED",
    readStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Invoice Payment Received",
    message: "Ethiopian Airlines paid Invoice #INV-2023-002 (ETB 138,000).",
    type: "INVOICE_PAID",
    readStatus: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 3,
    title: "Sales Order Approval Pending",
    message: "Sales Order #SO-2023-001 requires management sign-off.",
    type: "ORDER_APPROVAL",
    readStatus: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const notificationService = {
  async getNotifications(): Promise<SystemNotification[]> {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<SystemNotification> | SystemNotification[]>>("/api/notifications");
      const data = res.data?.data;
      const items = Array.isArray(data) ? data : (data as any)?.content || [];
      if (items.length > 0) return items;
    } catch {
      console.warn("[Notification Service] API offline, using cached notifications.");
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("crm_custom_notifications");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }

    return initialSampleNotifications;
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>("/api/notifications/unread-count");
      if (res.data?.data?.unreadCount !== undefined) {
        return res.data.data.unreadCount;
      }
    } catch {}

    const all = await this.getNotifications();
    return all.filter((n) => !n.readStatus).length;
  },

  async markAsRead(id: number | string): Promise<void> {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
    } catch {}

    const current = await this.getNotifications();
    const updated = current.map((n) => (String(n.id) === String(id) ? { ...n, readStatus: true } : n));
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_custom_notifications", JSON.stringify(updated));
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch("/api/notifications/read-all");
    } catch {}

    const current = await this.getNotifications();
    const updated = current.map((n) => ({ ...n, readStatus: true }));
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_custom_notifications", JSON.stringify(updated));
    }
  },

  async createNotification(data: NotificationRequest): Promise<SystemNotification> {
    try {
      const res = await apiClient.post<ApiResponse<SystemNotification>>("/api/notifications", data);
      return res.data.data;
    } catch {
      const newNotif: SystemNotification = {
        id: Date.now(),
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        readStatus: false,
        createdAt: new Date().toISOString(),
      };
      const current = await this.getNotifications();
      const updated = [newNotif, ...current];
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_custom_notifications", JSON.stringify(updated));
      }
      return newNotif;
    }
  },
};

export default notificationService;
