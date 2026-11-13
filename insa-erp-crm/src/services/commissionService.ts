import apiClient from "./apiClient";
import { ApiResponse } from "@/types/api.types";

export interface CommissionRule {
  id: number;
  ruleName: string;
  productCategory?: string;
  minAmount?: number;
  maxAmount?: number;
  commissionRate: number; // percentage
  fixedAmount?: number;
  active: boolean;
}

export interface Commission {
  id: number;
  salesOfficerId: number;
  salesOfficerName: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  orderAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: "PENDING" | "APPROVED" | "PAID";
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CommissionSummary {
  salesOfficerId: number;
  salesOfficerName: string;
  totalCommissionEarned: number;
  totalCommissionPending: number;
  totalCommissionPaid: number;
  totalOrders: number;
  averageCommissionRate: number;
  monthlyEarnings: {
    month: string;
    amount: number;
  }[];
}

export interface CommissionForecast {
  pipelineValue: number;
  estimatedCommission: number;
  projectedMonthlyEarning: number;
  targetVsActual: {
    target: number;
    actual: number;
    percentage: number;
  };
}

export const commissionService = {
  // Get all commission rules
  async getCommissionRules(): Promise<CommissionRule[]> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionRule[]>>(
        "/api/commissions/rules"
      );
      return response.data.data;
    } catch {
      // Return mock rules if backend not ready
      return [
        {
          id: 1,
          ruleName: "Standard Commission",
          commissionRate: 5,
          active: true,
        },
        {
          id: 2,
          ruleName: "High-Value Commission",
          minAmount: 100000,
          commissionRate: 7,
          active: true,
        },
        {
          id: 3,
          ruleName: "Enterprise Commission",
          minAmount: 500000,
          commissionRate: 10,
          active: true,
        },
      ];
    }
  },

  // Get commissions for a sales officer
  async getSalesOfficerCommissions(
    salesOfficerId?: number,
    status?: string
  ): Promise<Commission[]> {
    try {
      const params: any = {};
      if (salesOfficerId) params.salesOfficerId = salesOfficerId;
      if (status) params.status = status;

      const response = await apiClient.get<ApiResponse<Commission[]>>(
        "/api/commissions",
        { params }
      );
      return response.data.data;
    } catch {
      return [];
    }
  },

  // Get commission summary for sales officer
  async getCommissionSummary(salesOfficerId: number): Promise<CommissionSummary> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionSummary>>(
        `/api/commissions/summary/${salesOfficerId}`
      );
      return response.data.data;
    } catch {
      // Return mock summary
      return {
        salesOfficerId,
        salesOfficerName: "Sales Officer",
        totalCommissionEarned: 125000,
        totalCommissionPending: 45000,
        totalCommissionPaid: 80000,
        totalOrders: 24,
        averageCommissionRate: 6.5,
        monthlyEarnings: [
          { month: "Jan", amount: 25000 },
          { month: "Feb", amount: 30000 },
          { month: "Mar", amount: 35000 },
          { month: "Apr", amount: 35000 },
        ],
      };
    }
  },

  // Calculate commission for an order
  async calculateCommission(orderAmount: number, productCategory?: string): Promise<number> {
    try {
      const response = await apiClient.post<ApiResponse<{ commission: number }>>(
        "/api/commissions/calculate",
        { orderAmount, productCategory }
      );
      return response.data.data.commission;
    } catch {
      // Fallback calculation
      if (orderAmount >= 500000) return orderAmount * 0.1; // 10%
      if (orderAmount >= 100000) return orderAmount * 0.07; // 7%
      return orderAmount * 0.05; // 5%
    }
  },

  // Get commission forecast based on pipeline
  async getCommissionForecast(salesOfficerId: number): Promise<CommissionForecast> {
    try {
      const response = await apiClient.get<ApiResponse<CommissionForecast>>(
        `/api/commissions/forecast/${salesOfficerId}`
      );
      return response.data.data;
    } catch {
      // Return mock forecast
      return {
        pipelineValue: 1850000,
        estimatedCommission: 125000,
        projectedMonthlyEarning: 62500,
        targetVsActual: {
          target: 1200000,
          actual: 1050000,
          percentage: 87.5,
        },
      };
    }
  },
};

export default commissionService;
