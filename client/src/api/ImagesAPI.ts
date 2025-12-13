import api from './api'
import { type AxiosResponse } from 'axios'

export const ImagesAPI = {
  uploadLogo: async (logo: File ): Promise<AxiosResponse> => {
    const formData = new FormData()
    formData.append('logo', logo)
    return api.post(`/logo/upload`, formData, {
      headers: {  'Content-Type': 'multipart/form-data' },
    })
  },
  getLogo: async (): Promise<AxiosResponse> => {
    return api.get(`/logo`, { responseType: 'blob' })
  },
  deleteLogo: async (): Promise<AxiosResponse> => {
    return api.delete(`/logo`)
  },

  // Single image upload
  uploadSingleImage: async (image: File, ): Promise<AxiosResponse> => {
    const formData = new FormData()
    formData.append('image', image)
    return api.post(`/images/upload/single`, formData, {
      headers: {'Content-Type': 'multipart/form-data' },
    })
  },

  // Multiple images upload (max 5)
  uploadMultipleImages: async (images: File[], ): Promise<AxiosResponse> => {
    const formData = new FormData()
    images.forEach((img) => formData.append('images', img))
    return api.post(`/images/upload/multiple`, formData, {
      headers: {  'Content-Type': 'multipart/form-data' },
    })
  },

  // Get image by ID (binary)
  getImageById: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/images/image/${id}`, { responseType: 'blob' })
  },

  // Delete image by ID
  deleteImageById: async (id: string, ): Promise<AxiosResponse> => {
    return api.delete(`/images/image/${id}`)
  },

  // Get image metadata (no binary)
  getImageMetadata: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/images/metadata/${id}`)
  },

  // List all images metadata
  listImages: async (): Promise<AxiosResponse> => {
    return api.get(`/images/list`)
  },
}
