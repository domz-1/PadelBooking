import api from './api'
import { type AxiosResponse } from 'axios'
// Define common types
interface MultilingualText {
    en: string;
    ar: string;
  }
  
interface SubcategoryCreateData {
  name: MultilingualText
}
  
export const SubcategoriesAPI = {
  createSubcategory: async (
    categoryId: string,
    data: SubcategoryCreateData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.post(`/categories/${categoryId}/subcategories/`, data)
  },
  getAllSubcategories: async (categoryId: string): Promise<AxiosResponse> => {
    return api.get(`/categories/${categoryId}/subcategories/`)
  },
  updateSubcategory: async (
    categoryId: string,
    id: string,
    data: SubcategoryCreateData,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.put(`/categories/${categoryId}/subcategories/${id}`, data)
  },
  deleteSubcategory: async (
    categoryId: string,
    id: string,
    token: string,
  ): Promise<AxiosResponse> => {
    return api.delete(`/categories/${categoryId}/subcategories/${id}`)
  },
}
