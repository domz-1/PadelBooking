import api from './api'
import { type AxiosResponse } from 'axios'

interface SystemInfoData {
  phone?: string
  email?: string
  address?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  whatsapp?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  snapchat?: string
  telegram?: string
  businessName?: string
  businessDescription?: string
  workingHours?: string
  website?: string
  secondaryPhone?: string
  fax?: string
  googleMapsLink?: string
  latitude?: number
  longitude?: number
  isActive?: boolean
}

interface SystemInfoCreateData extends SystemInfoData {
  phone?: string
  email?: string
}

export const SystemInfoAPI = {
  // Get system information (admin only)
  getSystemInfo: async (): Promise<AxiosResponse> => {
    return api.get('/system-info/')
  },

  // Get public system information (no auth required)
  getPublicSystemInfo: async (): Promise<AxiosResponse> => {
    return api.get('/system-info/public')
  },

  // Create system information (admin only)
  createSystemInfo: async (data: SystemInfoCreateData): Promise<AxiosResponse> => {
    return api.post('/system-info/', data)
  },

  // Update system information (admin only)
  updateSystemInfo: async (data: SystemInfoData): Promise<AxiosResponse> => {
    return api.put('/system-info/', data)
  },

  // Delete system information (admin only)
  deleteSystemInfo: async (): Promise<AxiosResponse> => {
    return api.delete('/system-info/')
  },
}
