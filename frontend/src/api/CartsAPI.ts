import api from './api';
import { type AxiosResponse } from 'axios';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CreateCartData {
  userId: string;
  cartItem: CartItem[];
}

interface UpdateCartData {
  cartItem: CartItem[];
}

interface CreatePaymentSessionData {
  paymentMethod: 'cash' | 'knet' | 'mastercard';
}

interface ValidatePaymentSessionData {
  sessionId: string;
}

interface SubmitOrderData {
  paymentMethod: 'cash' | 'knet' | 'mastercard';
  sessionId?: string;
  userAddressId?: string;
}

interface AdminSubmitOrderData {
  paymentMethod: 'cash' | 'knet' | 'mastercard';
  userAddressId?: string;
  forceSubmit?: boolean;
}

export const CartsAPI = {
  // Admin: Get all carts
  getAllCarts: (params?: any): Promise<AxiosResponse<any>> => api.get('/carts/admin/all', { params }),

  // Admin: Get cart by ID
  getCartById: (id: string): Promise<AxiosResponse<any>> => api.get(`/carts/admin/${id}`),

  // Admin: Get cart owner data for checkout
  getCartOwnerData: (cartId: string): Promise<AxiosResponse<any>> => api.get(`/carts/admin/owner/${cartId}`),

  // Admin: Create cart for user
  createCart: (data: CreateCartData): Promise<AxiosResponse<any>> => api.post('/carts/admin', data),

  // Admin: Update cart
  updateCart: (id: string, data: UpdateCartData): Promise<AxiosResponse<any>> => api.put(`/carts/admin/${id}`, data),

  // Admin: Delete cart
  deleteCart: (id: string): Promise<AxiosResponse<any>> => api.delete(`/carts/admin/${id}`),

  // User cart operations
  getUserCart: (): Promise<AxiosResponse<any>> => api.get('/carts'),

  addProductToCart: (productId: string, quantity: number): Promise<AxiosResponse<any>> => 
    api.post('/carts', { productId, quantity }),

  removeProductFromCart: (itemId: string): Promise<AxiosResponse<any>> => 
    api.delete(`/carts/${itemId}`),

  updateProductQuantity: (productId: string, quantity: number): Promise<AxiosResponse<any>> => 
    api.put(`/carts/${productId}`, { quantity }),

  applyCoupon: (code: string): Promise<AxiosResponse<any>> => 
    api.post('/carts/apply-coupon', { code }),

  // Payment operations
  createPaymentSession: (data: CreatePaymentSessionData): Promise<AxiosResponse<any>> => 
    api.post('/carts/create-payment-session', data),

  validatePaymentSession: (data: ValidatePaymentSessionData): Promise<AxiosResponse<any>> => 
    api.post('/carts/validate-payment-session', data),

  checkPaymentStatus: (sessionId: string): Promise<AxiosResponse<any>> => 
    api.get(`/carts/payment-status/${sessionId}`),

  getPaymentMethods: (): Promise<AxiosResponse<any>> => 
    api.get('/carts/payment-methods'),

  // Order submission
  submitOrder: (data: SubmitOrderData): Promise<AxiosResponse<any>> => 
    api.post('/carts/submit-order', data),

  // Admin: Create payment session for any cart
  createAdminPaymentSession: (cartId: string, data: CreatePaymentSessionData): Promise<AxiosResponse<any>> => 
    api.post(`/carts/admin/create-payment-session/${cartId}`, data),

  // Admin: Submit order for any cart
  submitAdminOrder: (cartId: string, data: AdminSubmitOrderData): Promise<AxiosResponse<any>> => 
    api.post(`/carts/admin/submit-order/${cartId}`, data),
};
