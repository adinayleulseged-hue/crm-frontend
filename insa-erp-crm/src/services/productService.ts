import apiClient from "./apiClient";
import { ApiResponse, PageResponse } from "@/types/api.types";
import { ProductItem, ProductRequest } from "@/types/product.types";

// Mock sample products removed - system now fetches products from API only
export const initialSampleProducts: ProductItem[] = [];

export const productService = {
  async getAllProducts(params?: { search?: string; category?: string; status?: string }): Promise<ProductItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<ProductItem>>>("/api/products", { params });
      const items = res.data?.data?.content || (res.data?.data as any) || [];
      if (Array.isArray(items) && items.length > 0) return items;
    } catch (err) {
      console.warn("[Product Service] API offline, using cached/sample product catalog.");
    }

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("crm_custom_products");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }

    return initialSampleProducts;
  },

  async getProductById(id: number | string): Promise<ProductItem> {
    try {
      const res = await apiClient.get<ApiResponse<ProductItem>>(`/api/products/${id}`);
      return res.data.data;
    } catch {
      const all = await this.getAllProducts();
      return all.find((p) => String(p.id) === String(id)) || initialSampleProducts[0];
    }
  },

  async createProduct(data: ProductRequest): Promise<ProductItem> {
    try {
      const res = await apiClient.post<ApiResponse<ProductItem>>("/api/products", data);
      return res.data.data;
    } catch (err) {
      console.warn("[Product Service] API offline, creating product locally:", err);
      const newProduct: ProductItem = {
        id: Date.now(),
        productCode: `PRD-2025-${Math.floor(100 + Math.random() * 900)}`,
        name: data.name,
        category: data.category,
        description: data.description,
        unitPrice: Number(data.unitPrice) || 0,
        sku: data.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        stockQuantity: data.stockQuantity || 0,
        status: data.status || "ACTIVE",
      };

      if (typeof window !== "undefined") {
        try {
          const current = await this.getAllProducts();
          const updated = [newProduct, ...current];
          localStorage.setItem("crm_custom_products", JSON.stringify(updated));
        } catch (e) {}
      }

      return newProduct;
    }
  },

  async updateProduct(id: number | string, data: ProductRequest): Promise<ProductItem> {
    try {
      const res = await apiClient.put<ApiResponse<ProductItem>>(`/api/products/${id}`, data);
      return res.data.data;
    } catch {
      const current = await this.getAllProducts();
      const updated = current.map((p) =>
        String(p.id) === String(id) ? { ...p, ...data, unitPrice: Number(data.unitPrice) } : p
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_custom_products", JSON.stringify(updated));
      }
      return updated.find((p) => String(p.id) === String(id)) as ProductItem;
    }
  },

  async updateStock(id: number | string, delta: number): Promise<ProductItem> {
    try {
      const res = await apiClient.patch<ApiResponse<ProductItem>>(`/api/products/${id}/stock`, null, {
        params: { delta },
      });
      return res.data.data;
    } catch {
      const current = await this.getAllProducts();
      const updated = current.map((p) => {
        if (String(p.id) === String(id)) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return {
            ...p,
            stockQuantity: newQty,
            status: newQty === 0 ? "OUT_OF_STOCK" : "ACTIVE",
          };
        }
        return p;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_custom_products", JSON.stringify(updated));
      }
      return updated.find((p) => String(p.id) === String(id)) as ProductItem;
    }
  },

  async deleteProduct(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/api/products/${id}`);
    } catch {}
    if (typeof window !== "undefined") {
      const current = await this.getAllProducts();
      const filtered = current.filter((p) => String(p.id) !== String(id));
      localStorage.setItem("crm_custom_products", JSON.stringify(filtered));
    }
  },
};

export default productService;
