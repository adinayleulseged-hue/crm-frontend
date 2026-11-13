import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export type InteractionType =
  | "PHONE_CALL"
  | "EMAIL"
  | "MEETING"
  | "VIDEO_CALL"
  | "SMS"
  | "WHATSAPP"
  | "FOLLOW_UP"
  | "SUPPORT"
  | "DEMO"
  | "OTHER";

export interface InteractionRequest {
  customerId?: number;
  leadId?: number;
  opportunityId?: number;
  interactionType: InteractionType;
  subject: string;
  description?: string;
  conductedBy?: string;
  contactPerson?: string;
  interactionDate?: string;
  nextFollowUpDate?: string;
  outcome?: string;
  completed?: boolean;
}

export interface InteractionResponse {
  id: number;
  interactionNumber: string;
  customerId?: number;
  leadId?: number;
  opportunityId?: number;
  interactionType: InteractionType;
  subject: string;
  description?: string;
  conductedBy?: string;
  contactPerson?: string;
  interactionDate: string;
  nextFollowUpDate?: string;
  outcome?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySummary {
  totalInteractions: number;
  byType: {
    type: InteractionType;
    count: number;
  }[];
  thisWeek: number;
  thisMonth: number;
  pendingFollowUps: number;
}

export const activityService = {
  // Get all interactions with pagination
  async getAllInteractions(
    page = 0,
    size = 20,
    customerId?: number,
    opportunityId?: number
  ): Promise<PageResponse<InteractionResponse>> {
    try {
      const params: any = { page, size };
      if (customerId) params.customerId = customerId;
      if (opportunityId) params.opportunityId = opportunityId;

      const response = await apiClient.get<ApiResponse<PageResponse<InteractionResponse>>>(
        "/api/interactions",
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

  // Get single interaction
  async getInteractionById(id: number): Promise<InteractionResponse> {
    const response = await apiClient.get<ApiResponse<InteractionResponse>>(
      `/api/interactions/${id}`
    );
    return response.data.data;
  },

  // Create new interaction (log activity)
  async createInteraction(data: InteractionRequest): Promise<InteractionResponse> {
    const response = await apiClient.post<ApiResponse<InteractionResponse>>(
      "/api/interactions",
      data
    );
    return response.data.data;
  },

  // Update interaction
  async updateInteraction(
    id: number,
    data: Partial<InteractionRequest>
  ): Promise<InteractionResponse> {
    const response = await apiClient.put<ApiResponse<InteractionResponse>>(
      `/api/interactions/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete interaction
  async deleteInteraction(id: number): Promise<void> {
    await apiClient.delete(`/api/interactions/${id}`);
  },

  // Get activity summary (mock implementation)
  async getActivitySummary(): Promise<ActivitySummary> {
    try {
      const response = await apiClient.get<ApiResponse<ActivitySummary>>(
        "/api/interactions/summary"
      );
      return response.data.data;
    } catch {
      // Return mock summary
      return {
        totalInteractions: 0,
        byType: [
          { type: "PHONE_CALL", count: 0 },
          { type: "EMAIL", count: 0 },
          { type: "MEETING", count: 0 },
          { type: "VIDEO_CALL", count: 0 },
          { type: "FOLLOW_UP", count: 0 },
        ],
        thisWeek: 0,
        thisMonth: 0,
        pendingFollowUps: 0,
      };
    }
  },

  // Get upcoming follow-ups
  async getUpcomingFollowUps(days = 7): Promise<InteractionResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<InteractionResponse[]>>(
        "/api/interactions/follow-ups",
        { params: { days } }
      );
      return response.data.data;
    } catch {
      return [];
    }
  },

  // Quick log helpers
  async logCall(
    customerId: number,
    subject: string,
    notes?: string,
    outcome?: string
  ): Promise<InteractionResponse> {
    return this.createInteraction({
      customerId,
      interactionType: "PHONE_CALL",
      subject,
      description: notes,
      outcome,
      interactionDate: new Date().toISOString(),
      completed: true,
    });
  },

  async logMeeting(
    customerId: number,
    subject: string,
    notes?: string,
    nextFollowUpDate?: string
  ): Promise<InteractionResponse> {
    return this.createInteraction({
      customerId,
      interactionType: "MEETING",
      subject,
      description: notes,
      interactionDate: new Date().toISOString(),
      nextFollowUpDate,
      completed: true,
    });
  },

  async logEmail(
    customerId: number,
    subject: string,
    body?: string
  ): Promise<InteractionResponse> {
    return this.createInteraction({
      customerId,
      interactionType: "EMAIL",
      subject,
      description: body,
      interactionDate: new Date().toISOString(),
      completed: true,
    });
  },
};

export default activityService;
