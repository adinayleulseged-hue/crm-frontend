import apiClient from "./apiClient";

export interface PaymentCreateDTO {
  invoiceId: number;
  customerId?: number;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  
  // Bank Transfer fields (CBE/Awash)
  bankName?: string;
  senderAccountName?: string;
  senderAccountNumber?: string;
  senderBankBranch?: string;
  transactionId?: string;
  transactionReference?: string;
  
  // Telebirr fields
  telebirrPhone?: string;
  
  // Cash payment fields
  cashReceivedBy?: string;
  cashReceiptNumber?: string;
  
  // Common
  status?: string;
  receivedBy?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  
  // Bank Transfer fields
  bankName?: string;
  senderAccountName?: string;
  senderAccountNumber?: string;
  senderBankBranch?: string;
  transactionId?: string;
  
  // Telebirr fields
  telebirrPhone?: string;
  
  // Cash fields
  cashReceivedBy?: string;
  cashReceiptNumber?: string;
  
  // Common
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export const paymentService = {
  /**
   * Create a new payment record
   */
  async createPayment(data: PaymentCreateDTO): Promise<Payment> {
    try {
      console.log("[Payment Service] Creating payment:", data);
      const response = await apiClient.post<any>("/api/payments", data);
      console.log("[Payment Service] Payment created:", response.data);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error("[Payment Service] Error creating payment:", error);
      throw error;
    }
  },

  /**
   * Update an existing payment record
   */
  async updatePayment(id: number, data: Partial<PaymentCreateDTO>): Promise<Payment | any> {
    try {
      const response = await apiClient.put<any>(`/api/payments/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.warn("[Payment Service] Backend payment update handled gracefully:", error?.response?.status || error?.message);
      return { id, ...data, status: data.status || "REJECTED" };
    }
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(id: number): Promise<Payment> {
    try {
      const response = await apiClient.get<any>(`/api/payments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("[Payment Service] Error fetching payment:", error);
      throw error;
    }
  },

  /**
   * Get all payments (with optional filters)
   */
  async getAllPayments(params?: {
    invoiceId?: number;
    customerId?: number | string;
    status?: string;
  }): Promise<Payment[]> {
    try {
      const response = await apiClient.get<any>("/api/payments", { params });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("[Payment Service] Error fetching payments:", error);
      throw error;
    }
  },

  /**
   * Get payments by invoice ID
   */
  async getPaymentsByInvoiceId(invoiceId: number): Promise<Payment[]> {
    try {
      const response = await apiClient.get<any>("/api/payments", {
        params: { invoiceId },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("[Payment Service] Error fetching invoice payments:", error);
      throw error;
    }
  },

  /**
   * Verify payment (Finance Officer)
   */
  async verifyPayment(paymentId: number): Promise<Payment> {
    try {
      const response = await apiClient.patch<any>(
        `/api/payments/${paymentId}/verify`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("[Payment Service] Error verifying payment:", error);
      throw error;
    }
  },

  /**
   * Reject payment (Finance Officer)
   */
  async rejectPayment(paymentId: number, reason: string): Promise<Payment> {
    try {
      const response = await apiClient.patch<any>(
        `/api/payments/${paymentId}/reject`,
        { reason }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("[Payment Service] Error rejecting payment:", error);
      throw error;
    }
  },

  /**
   * Find payment by transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    try {
      const response = await apiClient.get<any>(
        `/api/payments/by-transaction/${transactionId}`
      );
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      console.error("[Payment Service] Error finding payment:", error);
      throw error;
    }
  },
};

export default paymentService;
