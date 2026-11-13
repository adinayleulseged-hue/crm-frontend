import apiClient from "./apiClient";
import { ApiResponse } from "@/types/api.types";

export interface QuotaResponse {
  id: number;
  salesOfficerId: number;
  salesOfficerName: string;
  period: "MONTHLY" | "QUARTERLY" | "YEARLY";
  year: number;
  month?: number;
  quarter?: number;
  targetRevenue: number;
  actualRevenue: number;
  targetDeals: number;
  actualDeals: number;
  attainmentPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetrics {
  salesOfficerId: number;
  salesOfficerName: string;
  currentQuota: number;
  actualRevenue: number;
  attainment: number;
  dealsWon: number;
  dealsLost: number;
  winRate: number;
  averageDealSize: number;
  pipelineValue: number;
  forecastedRevenue: number;
  rank: number;
  totalSalesOfficers: number;
  dailyTarget: number;
  daysRemaining: number;
  monthlyTrend: {
    month: string;
    revenue: number;
    quota: number;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  salesOfficerId: number;
  salesOfficerName: string;
  revenue: number;
  attainment: number;
  dealsWon: number;
}

export const quotaService = {
  // Get current quota for sales officer
  async getCurrentQuota(salesOfficerId: number): Promise<QuotaResponse> {
    try {
      const response = await apiClient.get<ApiResponse<QuotaResponse>>(
        `/api/quotas/sales-officer/${salesOfficerId}/current`
      );
      return response.data.data;
    } catch {
      // Return mock quota
      const now = new Date();
      return {
        id: 1,
        salesOfficerId,
        salesOfficerName: "Sales Officer",
        period: "MONTHLY",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        targetRevenue: 1200000,
        actualRevenue: 1050000,
        targetDeals: 10,
        actualDeals: 8,
        attainmentPercentage: 87.5,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }
  },

  // Get performance metrics
  async getPerformanceMetrics(salesOfficerId: number): Promise<PerformanceMetrics> {
    try {
      const response = await apiClient.get<ApiResponse<PerformanceMetrics>>(
        `/api/quotas/sales-officer/${salesOfficerId}/performance`
      );
      return response.data.data;
    } catch {
      // Return mock performance metrics
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayOfMonth = now.getDate();
      const daysRemaining = daysInMonth - dayOfMonth;

      return {
        salesOfficerId,
        salesOfficerName: "Sales Officer",
        currentQuota: 1200000,
        actualRevenue: 1050000,
        attainment: 87.5,
        dealsWon: 8,
        dealsLost: 3,
        winRate: 72.7,
        averageDealSize: 131250,
        pipelineValue: 1850000,
        forecastedRevenue: 1320000,
        rank: 3,
        totalSalesOfficers: 12,
        dailyTarget: Math.round((1200000 - 1050000) / daysRemaining),
        daysRemaining,
        monthlyTrend: [
          { month: "Jan", revenue: 950000, quota: 1200000 },
          { month: "Feb", revenue: 1100000, quota: 1200000 },
          { month: "Mar", revenue: 1250000, quota: 1200000 },
          { month: "Apr", revenue: 1050000, quota: 1200000 },
        ],
      };
    }
  },

  // Get leaderboard
  async getLeaderboard(period: "MONTHLY" | "QUARTERLY" | "YEARLY" = "MONTHLY"): Promise<LeaderboardEntry[]> {
    try {
      const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
        "/api/quotas/leaderboard",
        { params: { period } }
      );
      return response.data.data;
    } catch {
      // Return mock leaderboard
      return [
        { rank: 1, salesOfficerId: 5, salesOfficerName: "Sarah Tekle", revenue: 1450000, attainment: 120.8, dealsWon: 12 },
        { rank: 2, salesOfficerId: 3, salesOfficerName: "Michael Assefa", revenue: 1280000, attainment: 106.7, dealsWon: 10 },
        { rank: 3, salesOfficerId: 1, salesOfficerName: "You", revenue: 1050000, attainment: 87.5, dealsWon: 8 },
        { rank: 4, salesOfficerId: 7, salesOfficerName: "Hanna Bekele", revenue: 980000, attainment: 81.7, dealsWon: 7 },
        { rank: 5, salesOfficerId: 2, salesOfficerName: "Daniel Yohannes", revenue: 850000, attainment: 70.8, dealsWon: 6 },
      ];
    }
  },

  // Update quota (admin only)
  async updateQuota(
    salesOfficerId: number,
    targetRevenue: number,
    targetDeals: number,
    period: "MONTHLY" | "QUARTERLY" | "YEARLY"
  ): Promise<QuotaResponse> {
    const response = await apiClient.put<ApiResponse<QuotaResponse>>(
      `/api/quotas/sales-officer/${salesOfficerId}`,
      { targetRevenue, targetDeals, period }
    );
    return response.data.data;
  },
};

export default quotaService;
