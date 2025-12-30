import api from './api'
import { getAuthHeader } from './helpers'
import { type AxiosResponse } from 'axios'
interface CouponCreateData {
  code: string
  discount: number
  expires: string // YYYY-MM-DD
}
export const CouponsAPI = {
  createCoupon: async (data: CouponCreateData, token: string): Promise<AxiosResponse> => {
    return api.post(`/coupons/`, data, getAuthHeader(token))
  },
  getAllCoupons: async (token: string, params?: any): Promise<AxiosResponse> => {
    return api.get(`/coupons/`, { ...getAuthHeader(token), params })
  },
  updateCoupon: async (
    id: string,
    data: CouponCreateData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.put(`/coupons/${id}`, data, getAuthHeader(token))
  },
  deleteCoupon: async (id: string, token: string): Promise<AxiosResponse> => {
    return api.delete(`/coupons/${id}`, getAuthHeader(token))
  },
  getCoupon: async (id: string, token: string): Promise<AxiosResponse> => {
    return api.get(`/coupons/${id}`, getAuthHeader(token))
  },
}
  
  
  