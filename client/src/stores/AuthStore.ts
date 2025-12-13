import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthAPI } from '@/api/AuthAPI'
import type { AxiosResponse } from 'axios'

interface User {
  id: string | number
  name: string
  email: string
  phone: string
  role: string
}

interface AuthResponse {
  success: boolean
  token: string
  user: {
    id: number
    name: string
    email: string
    role: string
    phone?: string
    isActive?: boolean
    verified?: boolean
    blocked?: boolean
    verificationMethod?: string
    wishlist?: any[]
    addresses?: any[]
    createdAt?: string
    updatedAt?: string
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('loxan-admin-token'))

  // Load user data from localStorage on initialization
  const storedUserData = localStorage.getItem('loxan-admin-user')
  if (storedUserData) {
    try {
      const parsedData = JSON.parse(storedUserData)
      // Handle legacy data where id might be stored as _id
      if (!parsedData.id && parsedData._id) {
        parsedData.id = parsedData._id
      }
      user.value = parsedData as User
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      localStorage.removeItem('loxan-admin-user')
    }
  }
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('loxan-admin-token', newToken)
      // Set token in API headers
      AuthAPI.setAuthToken(newToken)
    } else {
      localStorage.removeItem('loxan-admin-token')
      AuthAPI.setAuthToken(null)
      // Also clear user data when token is cleared
      setUser(null)
    }
  }

  const setUser = (userData: User | null) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('loxan-admin-user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('loxan-admin-user')
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const decodeToken = (token: string): User | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as User
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response: AxiosResponse<AuthResponse> = await AuthAPI.signin({
        email,
        password,
      })

      if (response.data.success) {
        const { token: authToken, user: userData } = response.data

        // Map the user data from the response to our User interface
        const mappedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role
        }

        setToken(authToken)
        setUser(mappedUser)
        return { success: true }
      } else {
        throw new Error('Login failed')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await AuthAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local state
      setToken(null)
      setUser(null)
      setError(null)
    }
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('loxan-admin-token')
    const storedUserData = localStorage.getItem('loxan-admin-user')

    if (storedToken && storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData) as User
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setToken(null)
        setUser(null)
      }
    } else if (storedToken) {
      // Fallback: if only token exists but no user data, clear the token
      setToken(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    userName,
    userEmail,

    // Actions
    login,
    logout,
    initializeAuth,
    clearError,
    setLoading,
    setError,
  }
})