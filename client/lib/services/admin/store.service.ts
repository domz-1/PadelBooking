import { adminApi, api } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryId: number;
  isPriceless: boolean;
  stock: number;
  isActive: boolean;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  User?: { name: string; email: string; phone: string };
  OrderItems?: Array<{ name: string; price: number; Product?: { name: string; image: string } }>;
}

export const adminStoreService = {
  // Products (Using Client API mostly for listing)
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => {
    // Use admin API to fetch products list (includes inactive)
    const response = await adminApi.get("/store/products", { params });
    return response.data;
  },

  getOrders: async (params?: { page?: number; limit?: number; userId?: number }) => {
    const response = await adminApi.get<{
      success: boolean;
      data: Order[];
      count: number;
    }>("/store/orders", { params });
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await adminApi.put<{ success: boolean; data: Order }>(
      `/store/orders/${id}`,
      { status },
    );
    return response.data;
  },

  // Product Management
  createProduct: async (data: FormData) => {
    const response = await adminApi.post<{ success: boolean; data: Product }>(
      "/store/products",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateProduct: async (id: number, data: FormData | Partial<Product>) => {
    const response = await adminApi.put<{ success: boolean; data: Product }>(
      `/store/products/${id}`,
      data,
      data instanceof FormData ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      } : undefined
    );
    return response.data;
  },

  deleteProduct: async (id: number) => {
    const response = await adminApi.delete(`/store/products/${id}`);
    return response.data;
  },

  importProducts: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await adminApi.post("/store/products/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await adminApi.get("/store/categories");
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await adminApi.post("/store/categories", data);
    return response.data;
  },

  updateCategory: async (id: number, data: { name?: string; description?: string }) => {
    const response = await adminApi.put(`/store/categories/${id}`, data);
    return response.data;
  },
};
