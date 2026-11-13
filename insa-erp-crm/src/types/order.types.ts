export interface SalesOrderItem {
  id?: number;
  itemName?: string;
  itemDescription?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  total?: number;
}

export interface SalesOrder {
  id: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  opportunityId?: number;
  quotationRef?: string;
  orderDate?: string;
  deliveryDate?: string;
  status?: string;
  totalAmount?: number;
  items: SalesOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderItemRequest {
  itemName?: string;
  itemDescription?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface SalesOrderRequest {
  customerId: number;
  opportunityId?: number;
  quotationRef?: string;
  orderNumber?: string;
  orderDate?: string;
  deliveryDate?: string;
  status?: string;
  totalAmount?: number;
  items: SalesOrderItemRequest[];
}

export interface SalesOrderResponse extends SalesOrder {}

export interface SalesOrderFilterParams {
  search?: string;
  status?: string;
  customerId?: number;
  page?: number;
  size?: number;
}
