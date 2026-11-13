export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "REJECTED";

export interface InvoiceResponseDTO {
  id: number;
  invoiceNumber: string;
  salesOrderId: number;
  customerId: number;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceCreateDTO {
  salesOrderId: number;
  customerId: number;
  invoiceDate?: string;
  dueDate?: string;
  taxAmount?: number;
  discountAmount?: number;
  currency?: string;
  notes?: string;
}

export interface InvoiceUpdateDTO {
  status?: InvoiceStatus;
  dueDate?: string;
  paidAmount?: number;
  notes?: string;
}

export interface InvoiceItem extends InvoiceResponseDTO {
  customerName?: string;
  salesOrderCode?: string;
}

export interface InvoiceFilterParams {
  q?: string;
  status?: InvoiceStatus;
  customerId?: number;
  salesOrderId?: number;
  dueFrom?: string;
  dueTo?: string;
  invoiceFrom?: string;
  invoiceTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}
