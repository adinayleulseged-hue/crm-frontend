export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "LEAD_CREATED"
  | "ORDER_APPROVAL"
  | "INVOICE_PAID"
  | "SYSTEM_ALERT";

export interface SystemNotification {
  id: number | string;
  recipientUsername?: string;
  title: string;
  message: string;
  type: NotificationType | string;
  readStatus: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt?: string;
}

export interface NotificationRequest {
  recipientUsername?: string;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntityType?: string;
  relatedEntityId?: number;
}
