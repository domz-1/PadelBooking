import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { VideoHomeAPI, type VideoHomeInfo, type SectionName } from '@/api/VideoHomeAPI'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useVideoHomeStore = defineStore('videoHome', () => {
  const queryClient = useQueryClient()
  
  // Alternative manual state management
  const manualHomeVideos = ref<{ hero: VideoHomeInfo | null; second: VideoHomeInfo | null } | null>(null)
  const manualIsLoading = ref(false)
  const manualError = ref<any>(null)
  
  // Manual fetch function as fallback
  const manualFetchVideos = async () => {
    manualIsLoading.value = true
    manualError.value = null
    
    try {
      console.log('Manual fetch: Starting...')
      const response = await VideoHomeAPI.getAllHomeVideos()
      console.log('Manual fetch: Success', response.data)
      manualHomeVideos.value = response.data.data
      manualIsLoading.value = false
      return response.data.data
    } catch (error) {
      console.error('Manual fetch: Error', error)
      manualError.value = error
      manualIsLoading.value = false
      throw error
    }
  }

  // Query for all home videos
  const {
    data: homeVideos,
    isLoading: isLoadingVideos,
    error: videosError,
    refetch: refetchVideos,
    isSuccess: isVideosSuccess
  } = useQuery({
    queryKey: ['homeVideos'],
    queryFn: async () => {
      try {
        console.log('Fetching home videos...')
        const response = await VideoHomeAPI.getAllHomeVideos()
        console.log('Home videos response:', response.data)
        console.log('Query completed successfully')
        return response.data.data
      } catch (error) {
        console.error('Error fetching home videos:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduce retry attempts
    retryDelay: 1000, // Fixed delay
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true
  })

  // Computed getters for individual sections
  const heroVideo = computed(() => homeVideos.value?.hero || null)
  const secondVideo = computed(() => homeVideos.value?.second || null)

  // Get video URL for display
  const getVideoUrl = (sectionName: SectionName): string => {
    return VideoHomeAPI.getVideoUrl(sectionName)
  }

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async ({ sectionName, video, description }: { 
      sectionName: SectionName
      video: File
      description?: string 
    }) => {
      const response = await VideoHomeAPI.uploadHomeVideo(sectionName, video, description)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch home videos
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] })
    },
  })

  // Update video info mutation
  const updateVideoInfoMutation = useMutation({
    mutationFn: async ({ 
      sectionName, 
      description, 
      isActive 
    }: { 
      sectionName: SectionName
      description?: string
      isActive?: boolean 
    }) => {
      const response = await VideoHomeAPI.updateHomeVideoInfo(sectionName, description, isActive)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch home videos
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] })
    },
  })

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (sectionName: SectionName) => {
      const response = await VideoHomeAPI.deleteHomeVideo(sectionName)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch home videos
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] })
    },
  })

  // Actions
  const uploadVideo = async (sectionName: SectionName, video: File, description?: string) => {
    return uploadVideoMutation.mutateAsync({ sectionName, video, description })
  }

  const updateVideoInfo = async (sectionName: SectionName, description?: string, isActive?: boolean) => {
    return updateVideoInfoMutation.mutateAsync({ sectionName, description, isActive })
  }

  const deleteVideo = async (sectionName: SectionName) => {
    return deleteVideoMutation.mutateAsync(sectionName)
  }

  // Check if video exists for section
  const hasVideo = (sectionName: SectionName): boolean => {
    if (sectionName === 'hero') {
      return !!heroVideo.value
    } else {
      return !!secondVideo.value
    }
  }

  // Get video info for section
  const getVideoInfo = (sectionName: SectionName): VideoHomeInfo | null => {
    if (sectionName === 'hero') {
      return heroVideo.value
    } else {
      return secondVideo.value
    }
  }

  return {
    // State
    homeVideos,
    heroVideo,
    secondVideo,
    
    // Loading states
    isLoadingVideos,
    isVideosSuccess,
    isUploadingVideo: computed(() => uploadVideoMutation.isPending),
    isUpdatingVideo: computed(() => updateVideoInfoMutation.isPending),
    isDeletingVideo: computed(() => deleteVideoMutation.isPending),
    
    // Errors
    videosError,
    uploadError: computed(() => uploadVideoMutation.error),
    updateError: computed(() => updateVideoInfoMutation.error),
    deleteError: computed(() => deleteVideoMutation.error),
    
    // Actions
    uploadVideo,
    updateVideoInfo,
    deleteVideo,
    refetchVideos,
    getVideoUrl,
    hasVideo,
    getVideoInfo,
    
    // Manual fallback methods
    manualFetchVideos,
    manualHomeVideos,
    manualIsLoading,
    manualError,
  }
})
