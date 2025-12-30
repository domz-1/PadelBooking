import api from './api'
import { getAuthHeader } from './helpers'
import { type AxiosResponse } from 'axios'

interface OrderCreateCashData {
  shippingAddress: any // Adjust based on actual structure
  phone: string
}

interface OrderCreateCheckoutData {
  shippingAddress: any // Adjust based on actual structure
  phone: string
}


export const OrdersAPI = {
  // User orders
  getUserOrders: (params: { page?: number; limit?: number } = {}): Promise<AxiosResponse> => 
    api.get('/orders/my-orders', { params }),
  
  getOrderById: (orderId: string): Promise<AxiosResponse> => api.get(`/orders/${orderId}`),

  // Admin orders
  getAllOrders: (params: { page?: number; limit?: number } = {}): Promise<AxiosResponse> => 
    api.get('/orders/all', { params }),
  
  createOrder: (data: any): Promise<AxiosResponse> => api.post('/orders', data),
  
  updateOrder: (orderId: string, data: any): Promise<AxiosResponse> => api.put(`/orders/${orderId}`, data),
  
  updateOrderStatus: (orderId: string, status: string): Promise<AxiosResponse> => 
    api.patch(`/orders/update-status/${orderId}`, { status }),
  
  deleteOrder: (orderId: string): Promise<AxiosResponse> => api.delete(`/orders/${orderId}`),

  // Legacy methods (keeping for backward compatibility)
  createCashOrder: async (
    id: string,
    data: OrderCreateCashData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.post(`/orders/${id}`, data, getAuthHeader(token))
  },
  getOrder: async (token: string): Promise<AxiosResponse> => {
    return api.get(`/orders/`, getAuthHeader(token))
  },
  createCheckoutSession: async (
    id: string,
    data: OrderCreateCheckoutData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.post(`/orders/checkOut/${id}`, data, getAuthHeader(token))
  },
  webhookOnlineOrder: async (data: any): Promise<AxiosResponse> => {
    return api.post(`/orders/online`, data)
  },
}