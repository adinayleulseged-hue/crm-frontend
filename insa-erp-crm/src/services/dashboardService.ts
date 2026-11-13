import apiClient from "./apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  DashboardKpiResponse,
  RevenueReportResponse,
} from "@/types/dashboard.types";

export const dashboardService = {
  async getDashboardKpis(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>("/api/dashboard");
      return response.data.data;
    } catch {
      const fallback = await apiClient.get<ApiResponse<any>>("/api/dashboard/kpis");
      return fallback.data.data;
    }
  },

  async getRevenueReport(): Promise<RevenueReportResponse> {
    const response = await apiClient.get<ApiResponse<RevenueReportResponse>>(
      "/api/reports"
    );
    return response.data.data;
  },
};

export default dashboardService;
