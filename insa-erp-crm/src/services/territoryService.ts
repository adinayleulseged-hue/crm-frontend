import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export interface TerritoryRequest {
  code: string;
  name: string;
  region?: string;
  description?: string;
  managerUsername?: string;
  active?: boolean;
}

export interface TerritoryResponse {
  id: number;
  code: string;
  name: string;
  region?: string;
  description?: string;
  managerUsername?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TerritoryStats {
  territoryId: number;
  territoryName: string;
  totalCustomers: number;
  totalRevenue: number;
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  conversionRate: number;
}

export const territoryService = {
  async getAllTerritories(page = 0, size = 20): Promise<PageResponse<TerritoryResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<TerritoryResponse>>>(
        "/api/territories",
        { params: { page, size } }
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

  async getActiveTerritories(): Promise<TerritoryResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<TerritoryResponse[]>>(
        "/api/territories/active"
      );
      return response.data.data;
    } catch {
      return [];
    }
  },

  async getTerritoryById(id: number): Promise<TerritoryResponse> {
    const response = await apiClient.get<ApiResponse<TerritoryResponse>>(
      `/api/territories/${id}`
    );
    return response.data.data;
  },

  async createTerritory(data: TerritoryRequest): Promise<TerritoryResponse> {
    const response = await apiClient.post<ApiResponse<TerritoryResponse>>(
      "/api/territories",
      data
    );
    return response.data.data;
  },

  async updateTerritory(id: number, data: TerritoryRequest): Promise<TerritoryResponse> {
    const response = await apiClient.put<ApiResponse<TerritoryResponse>>(
      `/api/territories/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteTerritory(id: number): Promise<void> {
    await apiClient.delete(`/api/territories/${id}`);
  },

  // Analytics/Stats - will be implemented when backend endpoint is ready
  async getTerritoryStats(territoryId: number): Promise<TerritoryStats> {
    try {
      const response = await apiClient.get<ApiResponse<TerritoryStats>>(
        `/api/territories/${territoryId}/stats`
      );
      return response.data.data;
    } catch {
      // Return mock data if endpoint not ready
      return {
        territoryId,
        territoryName: "Territory",
        totalCustomers: 0,
        totalRevenue: 0,
        activeDeals: 0,
        wonDeals: 0,
        lostDeals: 0,
        conversionRate: 0,
      };
    }
  },
};

export default territoryService;
