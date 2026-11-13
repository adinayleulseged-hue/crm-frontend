export interface DashboardKpiResponse {
  totalLeads: number;
  pipelineValue: number;
  winRate: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  overdueInvoices: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueReportResponse {
  data: MonthlyRevenue[];
}
