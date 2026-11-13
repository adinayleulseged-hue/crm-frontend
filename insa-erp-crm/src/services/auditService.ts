import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  username: string;
  details?: string;
  timestamp: string;
}

export const auditService = {
  async getAllAuditLogs(
    params?: { search?: string; entityType?: string; page?: number; size?: number }
  ): Promise<PageResponse<AuditLog>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AuditLog>>>(
      "/api/audit-trails",
      { params }
    );
    return response.data.data;
  },
};

export default auditService;
