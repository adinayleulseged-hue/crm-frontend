import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";

export interface Segment {
  id: number;
  name: string;
  description?: string;
  criteria?: string;
}

export interface SegmentRequest {
  name: string;
  description?: string;
  criteria?: string;
}

export const segmentService = {
  async getAllSegments(
    params?: { search?: string; page?: number; size?: number }
  ): Promise<PageResponse<Segment>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Segment>>>(
      "/api/segments",
      { params }
    );
    return response.data.data;
  },

  async createSegment(data: SegmentRequest): Promise<Segment> {
    const response = await apiClient.post<ApiResponse<Segment>>(
      "/api/segments",
      data
    );
    return response.data.data;
  },
};

export default segmentService;
