import api from './api'
import { type AxiosResponse } from 'axios'

export interface TelegramUser {
  _id: string
  name: string
  chatId: string
  isActivated: boolean
  username?: string
  firstName?: string
  lastName?: string
  languageCode?: string
  lastMessageAt?: Date
  messageCount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface TelegramUserCreateData {
  name: string
  chatId: string
  isActivated?: boolean
  username?: string
  firstName?: string
  lastName?: string
  languageCode?: string
  notes?: string
}

export interface TelegramUserUpdateData {
  name?: string
  chatId?: string
  isActivated?: boolean
  username?: string
  firstName?: string
  lastName?: string
  languageCode?: string
  notes?: string
}

export interface TelegramUserStats {
  totalUsers: number
  activatedUsers: number
  deactivatedUsers: number
  recentUsers: number
  activationRate: string
}

export interface BulkUpdateData {
  userIds: string[]
  isActivated: boolean
}

export interface TestMessageData {
  message: string
  sendToAll?: boolean
  userIds?: string[]
}

export interface SyncUserData {
  chatId: string
  firstName?: string
  lastName?: string
  username?: string
  languageCode?: string
}

export interface PaginationResponse<T> {
  status: string
  message: string
  data: {
    telegramUsers: T[]
    pagination: {
      currentPage: number
      totalPages: number
      totalDocuments: number
      hasNextPage: boolean
      hasPrevPage: boolean
      limit: number
    }
  }
}

export interface SingleResponse<T> {
  status: string
  data: T
}

export interface StatsResponse {
  status: string
  data: {
    statistics: TelegramUserStats
    mostActiveUsers: TelegramUser[]
  }
}

export const TelegramUsersAPI = {
  // Get all telegram users with pagination and filtering
  getAllUsers: async (params: { 
    page?: number
    limit?: number
    search?: string
    isActivated?: boolean
    sort?: string
  } = {}): Promise<AxiosResponse<PaginationResponse<TelegramUser>>> => {
    return api.get('/telegram-users', { params })
  },

  // Get activated users only
  getActivatedUsers: async (): Promise<AxiosResponse<SingleResponse<TelegramUser[]>>> => {
    return api.get('/telegram-users/activated')
  },

  // Get user statistics
  getStats: async (): Promise<AxiosResponse<StatsResponse>> => {
    return api.get('/telegram-users/stats')
  },

  // Get user by ID
  getUser: async (id: string): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    return api.get(`/telegram-users/${id}`)
  },

  // Get user by chat ID
  getUserByChatId: async (chatId: string): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    return api.get(`/telegram-users/chat/${chatId}`)
  },

  // Create new telegram user
  createUser: async (data: TelegramUserCreateData): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    return api.post('/telegram-users', data)
  },

  // Update telegram user
  updateUser: async (id: string, data: TelegramUserUpdateData): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    // Final safety check - ensure no unwanted fields
    const cleanData: TelegramUserUpdateData = {}
    if (data.name !== undefined) cleanData.name = data.name
    if (data.chatId !== undefined) cleanData.chatId = data.chatId
    if (data.isActivated !== undefined) cleanData.isActivated = data.isActivated
    if (data.username !== undefined) cleanData.username = data.username
    if (data.firstName !== undefined) cleanData.firstName = data.firstName
    if (data.lastName !== undefined) cleanData.lastName = data.lastName
    if (data.languageCode !== undefined) cleanData.languageCode = data.languageCode
    if (data.notes !== undefined) cleanData.notes = data.notes
    
    console.log('🔧 API: Clean data being sent to server:', cleanData)
    console.log('🔧 API: Data keys:', Object.keys(cleanData))
    console.log('🔧 API: Request URL:', `/telegram-users/${id}`)
    
    // Add request interceptor for this specific call to debug
    const response = await api.patch(`/telegram-users/${id}`, cleanData)
    return response
  },

  // Toggle user activation
  toggleActivation: async (id: string): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    return api.patch(`/telegram-users/${id}/toggle`)
  },

  // Bulk update users
  bulkUpdate: async (data: BulkUpdateData): Promise<AxiosResponse<SingleResponse<{ modifiedCount: number }>>> => {
    return api.patch('/telegram-users/bulk-update', data)
  },

  // Delete telegram user
  deleteUser: async (id: string): Promise<AxiosResponse<SingleResponse<null>>> => {
    return api.delete(`/telegram-users/${id}`)
  },

  // Send test message
  sendTestMessage: async (data: TestMessageData): Promise<AxiosResponse<SingleResponse<{ 
    successCount: number
    failureCount: number
    results: Array<{ chatId: string; success: boolean; error?: string }>
  }>>> => {
    return api.post('/telegram-users/send-test-message', data)
  },

  // Sync user from Telegram
  syncUser: async (data: SyncUserData): Promise<AxiosResponse<SingleResponse<TelegramUser>>> => {
    return api.post('/telegram-users/sync', data)
  }
}
