import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";
import {
  CustomerResponse,
  CustomerRequest,
  CustomerFilterParams,
} from "@/types/customer.types";

export const customerService = {
  async getAllCustomers(
    params?: CustomerFilterParams
  ): Promise<PageResponse<CustomerResponse>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CustomerResponse>>>(
      "/api/customers",
      { params }
    );
    return response.data.data;
  },

  async getCustomerById(id: number | string): Promise<CustomerResponse> {
    const response = await apiClient.get<ApiResponse<CustomerResponse>>(
      `/api/customers/${id}`
    );
    return response.data.data;
  },

  async createCustomer(data: CustomerRequest): Promise<CustomerResponse> {
    const response = await apiClient.post<ApiResponse<CustomerResponse>>(
      "/api/customers",
      data
    );
    return response.data.data;
  },

  async updateCustomer(
    id: number | string,
    data: CustomerRequest
  ): Promise<CustomerResponse> {
    const response = await apiClient.put<ApiResponse<CustomerResponse>>(
      `/api/customers/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteCustomer(id: number | string): Promise<void> {
    await apiClient.delete(`/api/customers/${id}`);
  },
};

export default customerService;
