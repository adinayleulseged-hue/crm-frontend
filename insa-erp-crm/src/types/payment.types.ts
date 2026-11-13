export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "MOBILE_MONEY"
  | "ONLINE_PAYMENT";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentResponseDTO {
  id: number;
  paymentNumber: string;
  invoiceId: number;
  customerId: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paymentDate: string;
  transactionReference?: string;
  receivedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentCreateDTO {
  invoiceId: number;
  customerId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate?: string;
  transactionReference?: string;
  receivedBy?: string;
  status?: string;
  notes?: string;
}

export interface PaymentUpdateDTO {
  status?: PaymentStatus;
  transactionReference?: string;
  receivedBy?: string;
  notes?: string;
}

export interface PaymentItem extends PaymentResponseDTO {
  customerName?: string;
  invoiceNumber?: string;
}

export interface PaymentFilterParams {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  customerId?: number;
  invoiceId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
