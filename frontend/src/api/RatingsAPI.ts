import api from './api'
import { type AxiosResponse } from 'axios'

interface RatingData {
  productId: string
  rating: number
  review?: string
}

interface UserRating {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  productId: string
  rating: number
  review?: string
  isVerifiedPurchase?: boolean
  helpfulVotes?: number
  reportedBy?: string[]
  isHidden?: boolean
  createdAt?: string
  updatedAt?: string
}

interface RatingStats {
  avgRating: number
  totalRatings: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

interface RatingsResponse {
  status: string
  data: {
    ratings: UserRating[]
    stats: RatingStats
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export const RatingsAPI = {
  // Add or update a rating
  addRating: async (data: RatingData): Promise<AxiosResponse> => {
    return api.post('/ratings', data)
  },

  // Get ratings for a product
  getProductRatings: async (
    productId: string,
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
  ): Promise<AxiosResponse<RatingsResponse>> => {
    return api.get(`/ratings/product/${productId}`, { params })
  },

  // Get user's rating for a product
  getUserRating: async (productId: string): Promise<AxiosResponse> => {
    return api.get(`/ratings/user/${productId}`)
  },

  // Delete a rating
  deleteRating: async (ratingId: string): Promise<AxiosResponse> => {
    return api.delete(`/ratings/${ratingId}`)
  },

  // Report a rating
  reportRating: async (ratingId: string): Promise<AxiosResponse> => {
    return api.post(`/ratings/${ratingId}/report`)
  },

  // Mark rating as helpful
  markHelpful: async (ratingId: string): Promise<AxiosResponse> => {
    return api.post(`/ratings/${ratingId}/helpful`)
  },

  // Get rating statistics for a product
  getRatingStats: async (productId: string): Promise<AxiosResponse> => {
    return api.get(`/ratings/stats/${productId}`)
  },

  // Admin: Hide/unhide a rating
  toggleRatingVisibility: async (ratingId: string, isHidden: boolean): Promise<AxiosResponse> => {
    return api.patch(`/ratings/${ratingId}/visibility`, { isHidden })
  }
}

export type { UserRating, RatingStats, RatingData, RatingsResponse }
