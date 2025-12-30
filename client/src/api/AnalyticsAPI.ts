import api from "./api";

export interface EcommerceMetrics {
  metrics: {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    activeCoupons: number;
    todayRevenue: number;
  };
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
}

export interface MonthlySalesData {
  _id: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface CustomerDemographics {
  registrationTrend: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface RecentOrder {
  _id: string;
  userId: {
    name: string;
    email?: string;
    phone?: string;
  };
  totalOrderPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  paidAt: string;
  status: string;
}

export interface TopSellingProduct {
  _id: string;
  title: {
    en: string;
    ar: string;
  };
  price: number;
  sold: number;
  timesSold: number;
  ratingAvg: number;
}

export interface SalesByCategory {
  _id: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
  orderCount: number;
}

export const AnalyticsAPI = {
  // Get overall e-commerce metrics
  getEcommerceMetrics: async (token: string): Promise<{ data: EcommerceMetrics }> => {
    const response = await api.get('/analytics/metrics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get monthly sales data
  getMonthlySales: async (token: string): Promise<{ data: MonthlySalesData[] }> => {
    const response = await api.get('/analytics/monthly-sales', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get customer demographics
  getCustomerDemographics: async (token: string): Promise<{ data: CustomerDemographics }> => {
    const response = await api.get('/analytics/customer-demographics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get recent orders
  getRecentOrders: async (token: string, limit: number = 10): Promise<{ data: RecentOrder[] }> => {
    const response = await api.get('/analytics/recent-orders', {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get top selling products
  getTopSellingProducts: async (token: string, limit: number = 10): Promise<{ data: TopSellingProduct[] }> => {
    const response = await api.get('/analytics/top-products', {
      params: { limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get sales by category
  getSalesByCategory: async (token: string): Promise<{ data: SalesByCategory[] }> => {
    const response = await api.get('/analytics/sales-by-category', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};