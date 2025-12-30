import api from './api'
import { type AxiosResponse } from 'axios'

export interface VideoHomeInfo {
  id: string
  filename: string
  sectionName: 'hero' | 'second'
  originalName: string
  mimetype: string
  mediaType: 'video' | 'image'
  size: number
  duration: number
  resolution: {
    width: number
    height: number
  }
  description: string
  uploadDate: string
  isActive: boolean
}

export interface VideoHomeUploadResponse {
  status: string
  message: string
  data: {
    filename: string
    sectionName: 'hero' | 'second'
    id: string
    gridFSFileId: string
    size: number
    mimetype: string
    mediaType: 'video' | 'image'
    originalName: string
    description: string
    uploadDate: string
  }
}

export interface VideoHomeInfoResponse {
  status: string
  data: VideoHomeInfo
}

export interface VideoHomeListResponse {
  status: string
  results: number
  data: VideoHomeInfo[]
}

export interface AllHomeVideosResponse {
  status: string
  data: {
    hero: VideoHomeInfo | null
    second: VideoHomeInfo | null
  }
}

export type SectionName = 'hero' | 'second'

export const VideoHomeAPI = {
  // Upload or replace home video by section
  uploadHomeVideo: async (sectionName: SectionName, video: File, description?: string): Promise<AxiosResponse<VideoHomeUploadResponse>> => {
    const formData = new FormData()
    formData.append('video', video)
    if (description) {
      formData.append('description', description)
    }
    return api.post(`/video-home/upload/${sectionName}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Get home video stream by section (for viewing)
  getHomeVideo: async (sectionName: SectionName): Promise<AxiosResponse> => {
    return api.get(`/video-home/${sectionName}`, { responseType: 'blob' })
  },

  // Get home video metadata by section
  getHomeVideoInfo: async (sectionName: SectionName): Promise<AxiosResponse<VideoHomeInfoResponse>> => {
    return api.get(`/video-home/info/${sectionName}`)
  },

  // Update home video metadata by section
  updateHomeVideoInfo: async (sectionName: SectionName, description?: string, isActive?: boolean): Promise<AxiosResponse<VideoHomeInfoResponse>> => {
    const data: any = {}
    if (description !== undefined) data.description = description
    if (isActive !== undefined) data.isActive = isActive
    
    return api.put(`/video-home/info/${sectionName}`, data)
  },

  // Delete home video by section
  deleteHomeVideo: async (sectionName: SectionName): Promise<AxiosResponse> => {
    return api.delete(`/video-home/${sectionName}`)
  },

  // Get all videos (admin only)
  getAllVideos: async (): Promise<AxiosResponse<VideoHomeListResponse>> => {
    return api.get(`/video-home/all`)
  },

  // Get all home videos (both hero and second sections)
  getAllHomeVideos: async (): Promise<AxiosResponse<AllHomeVideosResponse>> => {
    console.log('VideoHomeAPI: Making request to /video-home/home-videos')
    console.log('API base URL:', api.defaults.baseURL)
    try {
      const response = await api.get(`/video-home/home-videos`, {
        timeout: 10000 // 10 second timeout
      })
      console.log('VideoHomeAPI: Success response status:', response.status)
      console.log('VideoHomeAPI: Success response data:', response.data)
      return response
    } catch (error: any) {
      console.error('VideoHomeAPI: Error response:', error)
      console.error('VideoHomeAPI: Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      })
      throw error
    }
  },

  // Get video URL for display
  getVideoUrl: (sectionName: SectionName): string => {
    console.log('VideoHomeAPI: Making request to /video-home/home-videos')
    console.log('API base URL:', api.defaults.baseURL)
    console.log('Section name:', sectionName)
    console.log('Video URL:', `${api.defaults.baseURL}video-home/${sectionName}`)
    return `${api.defaults.baseURL}/video-home/${sectionName}`
  },
}
