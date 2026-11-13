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
  customerId?: number | null;
  leadId?: number | null;
  opportunityId?: number | null;
  interactionType: InteractionType;
  subject: string;
  description?: string;
  conductedBy?: string;
  contactPerson?: string;
  interactionDate?: string;
  nextFollowUpDate?: string;
  outcome?: string;
}

export interface InteractionResponse {
  id: number;
  interactionNumber?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface InteractionFilterParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const interactionService = {
  async getAllInteractions(
    params?: InteractionFilterParams
  ): Promise<PageResponse<InteractionResponse>> {
    const response = await apiClient.get<
      ApiResponse<PageResponse<InteractionResponse>>
    >("/api/interactions", { params });
    return response.data.data;
  },

  async getInteractionById(id: number | string): Promise<InteractionResponse> {
    const response = await apiClient.get<ApiResponse<InteractionResponse>>(
      `/api/interactions/${id}`
    );
    return response.data.data;
  },

  async createInteraction(
    data: InteractionRequest
  ): Promise<InteractionResponse> {
    const response = await apiClient.post<ApiResponse<InteractionResponse>>(
      "/api/interactions",
      data
    );
    return response.data.data;
  },

  async updateInteraction(
    id: number | string,
    data: Partial<InteractionRequest>
  ): Promise<InteractionResponse> {
    const response = await apiClient.put<ApiResponse<InteractionResponse>>(
      `/api/interactions/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteInteraction(id: number | string): Promise<void> {
    await apiClient.delete(`/api/interactions/${id}`);
  },
};

export default interactionService;
