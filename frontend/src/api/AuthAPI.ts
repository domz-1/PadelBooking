import api from './api'
import { getAuthHeader } from './helpers'
import { type AxiosResponse } from 'axios'

interface AuthSignupData {
  name: string
  email: string
  phone: string
  password: string
}

interface AuthSigninData {
  email: string
  password: string
}

interface AuthSendOtpData {
  email: string
}

interface AuthVerifyOtpData {
  email: string
  otp: string
}

interface AuthForgetPasswordData {
  email: string
}

interface AuthResetPasswordData {
  email: string
  otp: string
  newPassword: string
}
export const AuthAPI = {
  signup: async (data: AuthSignupData): Promise<AxiosResponse> => {
    return api.post(`/auth/signup`, data)
  },
  signin: async (data: AuthSigninData): Promise<AxiosResponse> => {
    return api.post(`/auth/signin`, data)
  },
  sendOtp: async (data: AuthSendOtpData): Promise<AxiosResponse> => {
    return api.post(`/auth/send-otp`, data)
  },
  verifyOtp: async (data: AuthVerifyOtpData): Promise<AxiosResponse> => {
    return api.post(`/auth/verify-otp`, data)
  },
  forgetPassword: async (data: AuthForgetPasswordData): Promise<AxiosResponse> => {
    return api.post(`/auth/forget-password`, data)
  },
  resetPassword: async (data: AuthResetPasswordData): Promise<AxiosResponse> => {
    return api.post(`/auth/reset-password`, data)
  },
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  },
  logout: async (): Promise<AxiosResponse> => {
    return api.post(`/auth/logout`)
  },
}