import api from './api'
import { type AxiosResponse } from 'axios'

interface MultilingualText {
  en: string;
  ar: string;
}

interface HomeContentItem {
  type: 'product' | 'coming_soon';
  productId?: string;
  comingSoonData?: {
    title: MultilingualText;
    image: string;
  };
}

interface HomeContentSection {
  title: MultilingualText;
  description: MultilingualText;
  items: HomeContentItem[];
  isActive: boolean;
}

interface HomeContentData {
  sections: HomeContentSection[];
  isActive: boolean;
}

interface AddItemToSectionData {
  sectionIndex: number;
  item: HomeContentItem;
}

interface RemoveItemFromSectionData {
  sectionIndex: number;
  itemId: string;
}

interface UpdateSectionData {
  sectionIndex: number;
  section: HomeContentSection;
}

export const HomeContentAPI = {
  // Create home content (Admin only)
  createHomeContent: async (data: HomeContentData): Promise<AxiosResponse> => {
    return api.post('/home-content', data)
  },

  // Get all home content (Admin only)
  getAllHomeContent: async (): Promise<AxiosResponse> => {
    return api.get('/home-content')
  },

  // Get active home content (Public)
  getActiveHomeContent: async (): Promise<AxiosResponse> => {
    return api.get('/home-content/active')
  },

  // Get home content by ID (Admin only)
  getHomeContentById: async (id: string): Promise<AxiosResponse> => {
    return api.get(`/home-content/${id}`)
  },

  // Update home content (Admin only)
  updateHomeContent: async (id: string, data: Partial<HomeContentData>): Promise<AxiosResponse> => {
    return api.put(`/home-content/${id}`, data)
  },

  // Delete home content (Admin only)
  deleteHomeContent: async (id: string): Promise<AxiosResponse> => {
    return api.delete(`/home-content/${id}`)
  },

  // Add item to section (Admin only)
  addItemToSection: async (id: string, data: AddItemToSectionData): Promise<AxiosResponse> => {
    return api.post(`/home-content/${id}/sections/add-item`, data)
  },

  // Remove item from section (Admin only)
  removeItemFromSection: async (id: string, data: RemoveItemFromSectionData): Promise<AxiosResponse> => {
    return api.delete(`/home-content/${id}/sections/remove-item`, { data })
  },

  // Update section (Admin only)
  updateSection: async (id: string, data: UpdateSectionData): Promise<AxiosResponse> => {
    return api.put(`/home-content/${id}/sections/update`, data)
  }
}
