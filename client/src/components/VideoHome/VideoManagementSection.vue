<template>
  <div class="space-y-6">
    <!-- Video Display Section -->
    <div v-if="videoData" class="space-y-4">
      <!-- Video/Image Preview -->
      <div class="text-center">
        <div class="max-w-2xl mx-auto mb-4">
          <video 
            v-if="videoData.mediaType === 'video'"
            :src="getVideoUrl()" 
            controls 
            class="w-full max-h-96 rounded-lg shadow-sm bg-black"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          <img 
            v-else
            :src="getVideoUrl()"
            :alt="videoData.description || 'Home media'"
            class="w-full max-h-96 rounded-lg shadow-sm object-cover"
          />
        </div>
        
        <!-- Video Info -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 text-left">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">File Name:</span>
              <p class="text-gray-600 dark:text-gray-400">{{ videoData.originalName }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <p class="text-gray-600 dark:text-gray-400">{{ formatFileSize(videoData.size) }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Format:</span>
              <p class="text-gray-600 dark:text-gray-400">{{ videoData.mimetype }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <p class="text-gray-600 dark:text-gray-400 capitalize">{{ videoData.mediaType }}</p>
            </div>
            <div v-if="videoData.mediaType === 'video' && videoData.resolution">
              <span class="font-medium text-gray-700 dark:text-gray-300">Resolution:</span>
              <p class="text-gray-600 dark:text-gray-400">
                {{ videoData.resolution.width || 0 }}x{{ videoData.resolution.height || 0 }}
              </p>
            </div>
            <div v-if="videoData.mediaType === 'video'">
              <span class="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
              <p class="text-gray-600 dark:text-gray-400">{{ formatDuration(videoData.duration) }}</p>
            </div>
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Status:</span>
              <p class="text-gray-600 dark:text-gray-400">
                <span :class="videoData.isActive ? 'text-green-600' : 'text-red-600'">
                  {{ videoData.isActive ? 'Active' : 'Inactive' }}
                </span>
              </p>
            </div>
          </div>
          <div v-if="videoData.description" class="mt-4">
            <span class="font-medium text-gray-700 dark:text-gray-300">Description:</span>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ videoData.description }}</p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-center gap-2">
          <button 
            @click="openEditModal" 
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
          >
            Edit Info
          </button>
          <button 
            @click="handleDeleteClick" 
            :disabled="isDeleting"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            <span v-if="!isDeleting">Delete {{ videoData.mediaType }}</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- No Video State -->
    <div v-else class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <p>No {{ sectionName }} media uploaded yet</p>
    </div>

    <!-- Upload Section -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 class="text-md font-medium text-gray-800 dark:text-white mb-4">
        Upload New {{ sectionName === 'hero' ? 'Hero' : 'Second' }} Media
      </h4>
      
      <!-- Disabled Upload Message -->
      <div v-if="videoData" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h5 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Upload Disabled</h5>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Please delete the existing {{ videoData.mediaType }} before uploading a new one.
            </p>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleUploadSubmit" class="space-y-4" :class="{ 'opacity-50 pointer-events-none': videoData }">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Media File
          </label>
          <input
            ref="fileInput"
            type="file"
            accept="video/*,image/*"
            @change="handleFileChange"
            :disabled="videoData"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            Supported formats: Videos (MP4, AVI, MOV, WebM, MKV) or Images (JPEG, PNG, GIF, WebP). Max size: 500MB.
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            v-model="uploadForm.description"
            rows="3"
            maxlength="500"
            :disabled="videoData"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter media description..."
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ uploadForm.description?.length || 0 }}/500 characters</p>
        </div>
        
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="!uploadForm.file || isUploading || videoData"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            <span v-if="!isUploading">Upload Media</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          </button>
          <button
            type="button"
            @click="resetUploadForm"
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Edit {{ sectionName === 'hero' ? 'Hero' : 'Second' }} Media Information
        </h3>
        
        <form @submit.prevent="handleUpdateSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                v-model="editForm.description"
                rows="3"
                maxlength="500"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter media description..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ editForm.description?.length || 0 }}/500 characters</p>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="editForm.isActive"
                type="checkbox"
                id="isActive"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="isActive" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Media is active
              </label>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VideoHomeAPI } from '@/api/VideoHomeAPI'

const props = defineProps({
  sectionName: {
    type: String,
    required: true,
    validator: (value) => ['hero', 'second'].includes(value)
  },
  videoData: {
    type: Object,
    default: null
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['upload', 'delete', 'update-info'])

// Refs
const fileInput = ref(null)
const showEditModal = ref(false)

// Form data
const uploadForm = ref({
  file: null,
  description: ''
})

const editForm = ref({
  description: '',
  isActive: true
})

// Get video URL for display
const getVideoUrl = () => {
  return VideoHomeAPI.getVideoUrl(props.sectionName)
}

// Methods
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadForm.value.file = file
  }
}

const handleUploadSubmit = () => {
  if (!uploadForm.value.file) return

  emit('upload', {
    sectionName: props.sectionName,
    file: uploadForm.value.file,
    description: uploadForm.value.description
  })
  
  resetUploadForm()
}

const handleDeleteClick = () => {
  emit('delete', props.sectionName)
}

const handleUpdateSubmit = () => {
  emit('update-info', {
    sectionName: props.sectionName,
    description: editForm.value.description,
    isActive: editForm.value.isActive
  })
  
  showEditModal.value = false
}

const openEditModal = () => {
  if (props.videoData) {
    editForm.value = {
      description: props.videoData.description || '',
      isActive: props.videoData.isActive
    }
  }
  showEditModal.value = true
}

const resetUploadForm = () => {
  uploadForm.value = {
    file: null,
    description: ''
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return 'Unknown'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}
</script>
