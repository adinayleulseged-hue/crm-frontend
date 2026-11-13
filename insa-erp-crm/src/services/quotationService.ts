import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export interface QuotationItemRequest {
  id?: string | number;
  itemDescription?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface QuotationRequest {
  customerId?: number | string;
  customerName?: string;
  quotationNumber?: string;
  opportunityRef?: string;
  issueDate?: string;
  expiryDate?: string;
  validUntil?: string;
  totalAmount?: number;
  status?: string;
  notes?: string;
  items?: QuotationItemRequest[];
  [key: string]: any;
}

export interface QuotationResponse {
  id: number | string;
  quotationNumber?: string;
  customerId?: number | string;
  customerName?: string;
  customer?: string;
  opportunityRef?: string;
  issueDate?: string;
  date?: string;
  expiryDate?: string;
  validUntil?: string;
  totalAmount?: number;
  amount?: number;
  status?: string;
  notes?: string;
  solution?: string;
  items?: QuotationItemRequest[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationFilterParams {
  search?: string;
  status?: string;
  customerId?: number | string;
  page?: number;
  size?: number;
}

export const quotationService = {
  async getAllQuotations(
    params?: QuotationFilterParams
  ): Promise<PageResponse<QuotationResponse> | QuotationResponse[]> {
    try {
      const response = await apiClient.get<
        ApiResponse<PageResponse<QuotationResponse> | QuotationResponse[]>
      >("/api/quotations", { params });
      return response.data.data;
    } catch {
      return [];
    }
  },

  async getQuotationById(id: number | string): Promise<QuotationResponse> {
    try {
      const response = await apiClient.get<ApiResponse<QuotationResponse>>(
        `/api/quotations/${id}`
      );
      return response.data.data;
    } catch {
      return { id } as QuotationResponse;
    }
  },

  async createQuotation(data: QuotationRequest): Promise<QuotationResponse> {
    try {
      const response = await apiClient.post<ApiResponse<QuotationResponse>>(
        "/api/quotations",
        data
      );
      return response.data.data;
    } catch (err: any) {
      console.warn('[Quotations] Backend API unavailable, creating local quotation object:', err?.message || err);
      const newId = Date.now();
      return {
        id: newId,
        quotationNumber: `QUO-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: data.customerName || data.customer,
        totalAmount: data.totalAmount || data.amount || 0,
        status: "DRAFT",
        ...data,
      } as QuotationResponse;
    }
  },

  async updateQuotation(
    id: number | string,
    data: QuotationRequest
  ): Promise<QuotationResponse> {
    const response = await apiClient.put<ApiResponse<QuotationResponse>>(
      `/api/quotations/${id}`,
      data
    );
    return response.data.data;
  },

  async acceptQuotation(id: number | string): Promise<void> {
    await apiClient.patch(`/api/quotations/${id}/accept`);
  },

  async deleteQuotation(id: number | string): Promise<void> {
    await apiClient.delete(`/api/quotations/${id}`);
  },
};

export default quotationService;
