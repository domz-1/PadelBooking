import api from './api'
import { type AxiosResponse } from 'axios'

interface MultilingualText {
  en: string;
  ar: string;
}

interface ProductCreateData {
  title: MultilingualText
  price: number
  priceBeforeOffer?: number
  description: MultilingualText
  category: string
  subcategory: string
  quantity: number
  sold?: number
  timesSold?: number
  productCode?: string
  tags?: MultilingualText
  notes?: MultilingualText
  isActive?: boolean
  isFeatured?: boolean
  isInStock?: boolean
  priority?: boolean
  ratingAvg?: number
  ratingCount?: number
  // imgCover and images handled via FormData
}

interface ProductUpdateData extends Partial<ProductCreateData> {
  // images and imgCover handled separately via FormData
}

interface ProductRateData {
  rating: number
  review: string
}

export const ProductsAPI = {
  createProduct: async (
    data: ProductCreateData,
    imgCover: File,
    images: File[],
  ): Promise<AxiosResponse> => {
    const formData = new FormData()
    formData.append('title', JSON.stringify(data.title))
    formData.append('price', data.price.toString())
    if (data.priceBeforeOffer !== undefined) formData.append('priceBeforeOffer', data.priceBeforeOffer.toString())
    formData.append('description', JSON.stringify(data.description))
    formData.append('category', data.category)
    formData.append('subcategory', data.subcategory)
    formData.append('quantity', data.quantity.toString())
    if (data.sold !== undefined) formData.append('sold', data.sold.toString())
    if (data.timesSold !== undefined) formData.append('timesSold', data.timesSold.toString())
    if (data.productCode !== undefined) formData.append('productCode', data.productCode)
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags))
    if (data.notes !== undefined) formData.append('notes', JSON.stringify(data.notes))
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured.toString())
    if (data.isInStock !== undefined) formData.append('isInStock', data.isInStock.toString())
    if (data.priority !== undefined) formData.append('priority', data.priority.toString())
    if (data.ratingAvg !== undefined) formData.append('ratingAvg', data.ratingAvg.toString())
    if (data.ratingCount !== undefined) formData.append('ratingCount', data.ratingCount.toString())
    formData.append('imgCover', imgCover)
    images.forEach((image) => formData.append('images', image))
    return api.post(`/products/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getAllProducts: async (
    params: { page?: number; limit?: number; sort?: string; fields?: string; search?: string; keyword?: string } = {},
  ): Promise<AxiosResponse> => {
    return api.get(`/products/`, { params })
  },

  updateProduct: async (
    id: string,
    data: Partial<ProductUpdateData>,
    imgCover?: File,
    images?: File[],
  ): Promise<AxiosResponse> => {
    const formData = new FormData()
    if (data.title) formData.append('title', JSON.stringify(data.title))
    if (data.price !== undefined) formData.append('price', data.price.toString())
    if (data.priceBeforeOffer !== undefined) formData.append('priceBeforeOffer', data.priceBeforeOffer.toString())
    if (data.description) formData.append('description', JSON.stringify(data.description))
    if (data.category) formData.append('category', data.category)
    if (data.subcategory) formData.append('subcategory', data.subcategory)
    if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString())
    if (data.sold !== undefined) formData.append('sold', data.sold.toString())
    if (data.timesSold !== undefined) formData.append('timesSold', data.timesSold.toString())
    if (data.productCode !== undefined) formData.append('productCode', data.productCode)
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags))
    if (data.notes !== undefined) formData.append('notes', JSON.stringify(data.notes))
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString())
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured.toString())
    if (data.isInStock !== undefined) formData.append('isInStock', data.isInStock.toString())
    if (data.priority !== undefined) formData.append('priority', data.priority.toString())
    if (data.ratingAvg !== undefined) formData.append('ratingAvg', data.ratingAvg.toString())
    if (data.ratingCount !== undefined) formData.append('ratingCount', data.ratingCount.toString())
    if (imgCover) formData.append('imgCover', imgCover)
    if (images) images.forEach((image) => formData.append('images', image))
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteProduct: async (id: string): Promise<AxiosResponse> => {
    return api.delete(`/products/${id}`)
  },

  getProductById: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/products/${id}`)
  },

  getProductsByTag: async (tag: string, lang: 'en' | 'ar' = 'en'): Promise<AxiosResponse> => {
    return api.get(`/products/tag/${tag}`, { params: { lang } })
  },

  searchProducts: async (params: {
    q?: string
    category?: string
    tag?: string
    lang?: 'en' | 'ar'
  }): Promise<AxiosResponse> => {
    return api.get(`/products/search`, { params })
  },

  getProductsWithRatings: async (
    params: { page?: number; sort?: string; fields?: string } = {},
  ): Promise<AxiosResponse> => {
    return api.get(`/products/with-ratings`, { params })
  },

  getProductsWithoutRatings: async (
    params: { page?: number; sort?: string; fields?: string } = {},
  ): Promise<AxiosResponse> => {
    return api.get(`/products/without-ratings`, { params })
  },

  getProductAllData: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/products/${id}/all-data`)
  },

  rateProduct: async (id: string, data: ProductRateData): Promise<AxiosResponse> => {
    return api.post(`/products/${id}/rate`, data)
  },

  removeRating: async (id: string): Promise<AxiosResponse> => {
    return api.delete(`/products/${id}/rate`)
  },

  getProductRatings: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/products/${id}/ratings`)
  },
}
