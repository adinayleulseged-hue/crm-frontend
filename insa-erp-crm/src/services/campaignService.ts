import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";
import {
  CampaignResponse,
  CampaignRequest,
  CampaignFilterParams,
} from "@/types/campaign.types";

export const campaignService = {
  async getAllCampaigns(
    params?: CampaignFilterParams
  ): Promise<PageResponse<CampaignResponse>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CampaignResponse>>>(
      "/api/campaigns",
      { params }
    );
    return response.data.data;
  },

  async getCampaignById(id: number | string): Promise<CampaignResponse> {
    const response = await apiClient.get<ApiResponse<CampaignResponse>>(
      `/api/campaigns/${id}`
    );
    return response.data.data;
  },

  async createCampaign(data: CampaignRequest): Promise<CampaignResponse> {
    const response = await apiClient.post<ApiResponse<CampaignResponse>>(
      "/api/campaigns",
      data
    );
    return response.data.data;
  },

  async updateCampaign(
    id: number | string,
    data: CampaignRequest
  ): Promise<CampaignResponse> {
    const response = await apiClient.put<ApiResponse<CampaignResponse>>(
      `/api/campaigns/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteCampaign(id: number | string): Promise<void> {
    await apiClient.delete(`/api/campaigns/${id}`);
  },

  async activateCampaign(id: number | string): Promise<CampaignResponse> {
    const response = await apiClient.patch<ApiResponse<CampaignResponse>>(
      `/api/campaigns/${id}/activate`
    );
    return response.data.data;
  },

  async completeCampaign(id: number | string): Promise<CampaignResponse> {
    const response = await apiClient.patch<ApiResponse<CampaignResponse>>(
      `/api/campaigns/${id}/complete`
    );
    return response.data.data;
  },

  async cancelCampaign(id: number | string): Promise<CampaignResponse> {
    const response = await apiClient.patch<ApiResponse<CampaignResponse>>(
      `/api/campaigns/${id}/cancel`
    );
    return response.data.data;
  },

  async getCampaignMetrics(id: number | string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/campaigns/${id}/metrics`
    );
    return response.data.data;
  },

  async saveCampaignMetricsSnapshot(id: number | string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/api/campaigns/${id}/metrics/snapshot`
    );
    return response.data.data;
  },
};

export default campaignService;
