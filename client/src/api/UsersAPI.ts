import api from './api'

import { type AxiosResponse } from 'axios'

interface UserCreateData {
  name: string
  email: string
  password: string
  phone: string
  role?: 'user' | 'admin'
  isActive?: boolean
  verified?: boolean
  blocked?: boolean
  verificationMethod?: 'email' | 'phone'
  wishlist?: string[]
  addresses?: Array<{
    city: string
    street: string
    phone: string
  }>
}

interface UserUpdateData {
  name?: string
  email?: string
  phone?: string
  role?: 'user' | 'admin'
  isActive?: boolean
  verified?: boolean
  blocked?: boolean
  verificationMethod?: 'email' | 'phone'
  wishlist?: string[]
  addresses?: Array<{
    city: string
    street: string
    phone: string
  }>
}

interface UserChangePasswordData {
  password: string
}

interface SendOTPData {
  email?: string
  phone?: string
}

interface VerifyOTPData {
  email?: string
  phone?: string
  otp: string
}

interface ForgetPasswordData {
  email?: string
  phone?: string
}

interface ResetPasswordData {
  email?: string
  phone?: string
  otp: string
  newPassword: string
}

export const UsersAPI = {
  createUser: async (data: UserCreateData): Promise<AxiosResponse> => {
    return api.post(`/users/`, data)
  },
  getAllUsers: async (params: { page?: number; limit?: number; search?: string; sort?: string } = {}): Promise<AxiosResponse> => {
    return api.get(`/users/`, { params })
  },
  getMe: async (): Promise<AxiosResponse> => {
    return api.get(`/users/me`)
  },
  getUser: async (id: string,): Promise<AxiosResponse> => {
    return api.get(`/users/${id}`)
  },
  updateUser: async (id: string, data: UserUpdateData): Promise<AxiosResponse> => {
    return api.put(`/users/${id}`, data)
  },
  deleteUser: async (id: string,): Promise<AxiosResponse> => {
    return api.delete(`/users/${id}`)
  },
  changeUserPassword: async (
    id: string,
    data: UserChangePasswordData,
  ): Promise<AxiosResponse> => {
    return api.patch(`/users/${id}`, data)
  },
}
