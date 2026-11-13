import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export type OpportunityStage =
  | "NEW"
  | "NEEDS_ANALYSIS"
  | "QUALIFICATION"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type OpportunityType = "NEW_BUSINESS" | "EXISTING_BUSINESS" | "RENEWAL";
export type WorkflowStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "ORDER_PLACED"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export interface OpportunityRequest {
  opportunityName: string;
  description?: string;
  leadId?: number;
  customerId?: number;
  stage: OpportunityStage;
  type?: OpportunityType;
  expectedRevenue?: number;
  probability?: number;
  expectedCloseDate?: string;
  assignedTo?: string;
  nextStep?: string;
  notes?: string;
}

export interface OpportunityResponse {
  id: number;
  opportunityNumber: string;
  opportunityName: string;
  description?: string;
  leadId?: number;
  customerId?: number;
  stage: OpportunityStage;
  type?: OpportunityType;
  expectedRevenue?: number;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo?: string;
  nextStep?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  workflowStatus?: WorkflowStatus;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  orderId?: number;
  invoiceId?: number;
  closedBy?: number;
  closedAt?: string;
  closeNotes?: string;
  discountRequested?: number;
  discountApproved?: number;
}

export interface OpportunityStats {
  totalOpportunities: number;
  totalValue: number;
  byStage: {
    stage: OpportunityStage;
    count: number;
    value: number;
  }[];
  winRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
}

export const opportunityService = {
  // Get all opportunities with optional filtering
  async getAllOpportunities(
    customerId?: number,
    page = 0,
    size = 50
  ): Promise<PageResponse<OpportunityResponse>> {
    try {
      const params: any = { page, size };
      if (customerId) params.customerId = customerId;

      const response = await apiClient.get<ApiResponse<PageResponse<OpportunityResponse>>>(
        "/api/opportunities",
        { params }
      );
      return response.data.data;
    } catch {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
      };
    }
  },

  // Get single opportunity
  async getOpportunityById(id: number): Promise<OpportunityResponse> {
    const response = await apiClient.get<ApiResponse<OpportunityResponse>>(
      `/api/opportunities/${id}`
    );
    return response.data.data;
  },

  // Create new opportunity
  async createOpportunity(data: OpportunityRequest): Promise<OpportunityResponse> {
    const response = await apiClient.post<ApiResponse<OpportunityResponse>>(
      "/api/opportunities",
      data
    );
    return response.data.data;
  },

  // Update opportunity
  async updateOpportunity(
    id: number,
    data: Partial<OpportunityRequest>
  ): Promise<OpportunityResponse> {
    const response = await apiClient.put<ApiResponse<OpportunityResponse>>(
      `/api/opportunities/${id}`,
      data
    );
    return response.data.data;
  },

  // Update opportunity stage (for Kanban drag-and-drop)
  async updateStage(id: number, stage: OpportunityStage): Promise<OpportunityResponse> {
    const response = await apiClient.patch<ApiResponse<OpportunityResponse>>(
      `/api/opportunities/${id}/stage`,
      null,
      { params: { stage } }
    );
    return response.data.data;
  },

  // Close deal (won or lost)
  async closeDeal(
    id: number,
    status: "CLOSED_WON" | "CLOSED_LOST",
    notes?: string
  ): Promise<OpportunityResponse> {
    const response = await apiClient.patch<ApiResponse<OpportunityResponse>>(
      `/api/opportunities/${id}/close`,
      null,
      { params: { status, notes } }
    );
    return response.data.data;
  },

  // Delete opportunity
  async deleteOpportunity(id: number): Promise<void> {
    await apiClient.delete(`/api/opportunities/${id}`);
  },

  // Generate quotation from opportunity
  async generateQuotation(id: number): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/opportunities/${id}/generate-quotation`
    );
    return response.data.data;
  },

  // Submit for approval
  async submitForApproval(id: number): Promise<OpportunityResponse> {
    const response = await apiClient.patch<ApiResponse<OpportunityResponse>>(
      `/api/opportunities/${id}/submit-for-approval`
    );
    return response.data.data;
  },

  // Get statistics (mock implementation, can be implemented on backend)
  async getOpportunityStats(): Promise<OpportunityStats> {
    try {
      const response = await apiClient.get<ApiResponse<OpportunityStats>>(
        "/api/opportunities/stats"
      );
      return response.data.data;
    } catch {
      // Return mock stats if endpoint doesn't exist
      return {
        totalOpportunities: 0,
        totalValue: 0,
        byStage: [
          { stage: "NEW", count: 0, value: 0 },
          { stage: "NEEDS_ANALYSIS", count: 0, value: 0 },
          { stage: "QUALIFICATION", count: 0, value: 0 },
          { stage: "PROPOSAL", count: 0, value: 0 },
          { stage: "NEGOTIATION", count: 0, value: 0 },
          { stage: "CLOSED_WON", count: 0, value: 0 },
          { stage: "CLOSED_LOST", count: 0, value: 0 },
        ],
        winRate: 0,
        averageDealSize: 0,
        averageSalesCycle: 0,
      };
    }
  },
};

export default opportunityService;
