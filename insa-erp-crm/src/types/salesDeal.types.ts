export interface SalesDeal {
  id: number;
  oppCode?: string; // Backend still uses oppCode
  title: string;
  description?: string;
  customerId: number;
  customerName?: string;
  stage?: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  assignedTo?: string | number;
}

export interface SalesDealRequest {
  title: string;
  description?: string;
  customerId: number;
  stage?: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  assignedTo?: string | number;
}

export interface SalesDealResponse extends SalesDeal {}

export interface SalesDealFilterParams {
  search?: string;
  stage?: string;
  customerId?: number;
  page?: number;
  size?: number;
}

