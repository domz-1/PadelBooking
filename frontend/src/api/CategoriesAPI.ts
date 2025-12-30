import api from './api'
import { type AxiosResponse } from 'axios'

// Define common types
interface MultilingualText {
    en: string;
    ar: string;
  }
  
interface CategoryCreateData {
  name: MultilingualText
  // Image handled via FormData
}


export const CategoriesAPI = {
  createCategory: async (
    name: MultilingualText,
    image: File,
    token: string,
  ): Promise<AxiosResponse> => {
    const formData = new FormData()
    formData.append('name', JSON.stringify(name))
    formData.append('Image', image)
    return api.post(`/categories/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAllCategories: async (): Promise<AxiosResponse> => {
    return api.get(`/categories/`)
  },
  updateCategory: async (
    id: string,
    name: MultilingualText,
    token: string,
    image?: File,
  ): Promise<AxiosResponse> => {
    const formData = new FormData()
    if (name) formData.append('name', JSON.stringify(name))
    if (image) formData.append('Image', image)
    return api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteCategory: async (id: string, token: string): Promise<AxiosResponse> => {
    return api.delete(`/categories/${id}`)
  },
}
