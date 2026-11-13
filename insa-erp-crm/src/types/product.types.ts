export type ProductCategory =
  | "SECURITY_HARDWARE"
  | "SOFTWARE_LICENSE"
  | "CYBERSECURITY_AUDIT"
  | "ENTERPRISE_ERP"
  | "TRAINING_AND_CERTIFICATION"
  | "MAINTENANCE_AND_SUPPORT"
  | "OTHER";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface ProductItem {
  id: number | string;
  productCode: string;
  name: string;
  category: ProductCategory | string;
  description?: string;
  unitPrice: number;
  sku?: string;
  stockQuantity: number;
  status: ProductStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  category: ProductCategory | string;
  description?: string;
  unitPrice: number;
  sku?: string;
  stockQuantity?: number;
  status?: ProductStatus | string;
}
